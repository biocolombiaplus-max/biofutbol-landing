// Protege una página: si no hay sesión, redirige al login.
// Devuelve una promesa que resuelve con el usuario autenticado.
function requireAuth() {
  return new Promise(function (resolve) {
    auth.onAuthStateChanged(function (user) {
      if (!user) {
        window.location.href = "login.html";
      } else {
        resolve(user);
      }
    });
  });
}

// Protege las páginas exclusivas del súper-administrador de BioFutbol.
// Si hay sesión pero la cuenta NO es súper-admin (por ejemplo, es el login
// de un club), la saca de aquí y la manda a su propio panel de club. Si algo
// falla (típicamente: las reglas de Firestore no están publicadas todavía),
// en vez de dejar la página cargando para siempre, muestra una pantalla que
// explica exactamente qué falta.
function requireSuperAdmin() {
  return requireAuth().then(function (user) {
    return db.collection("admins").doc(user.uid).get().then(function (doc) {
      if (doc.exists) return user;
      // No es súper-admin: puede que sea la cuenta de un club que entró por
      // la página equivocada (login.html en vez de club-login.html). Si
      // tiene un club a su nombre, lo mandamos derecho a su panel en vez de
      // dejarlo en un callejón sin salida.
      return db.collection("clientes").where("authUid", "==", user.uid).limit(1).get().then(function (snap) {
        if (!snap.empty) {
          window.location.href = "club-panel.html";
          return Promise.reject(new Error("bloqueado"));
        }
        mostrarBloqueoAcceso(
          "Tu cuenta todavía no es súper-administrador",
          "Para entrar aquí, tu cuenta debe estar registrada en la colección <b>admins</b> de Firestore. Ve a <b>Firebase Console → Firestore Database → Datos</b>, crea (o abre) la colección <b>admins</b>, y agrega un documento con este ID exacto (tu UID):",
          user.uid
        );
        return Promise.reject(new Error("bloqueado"));
      });
    });
  }).catch(function (err) {
    if (err && err.message === "bloqueado") throw err;
    mostrarBloqueoAcceso(
      "No se pudo verificar tu acceso",
      "Esto casi siempre pasa porque las reglas de seguridad de Firestore todavía no están publicadas. Ve a <b>Firebase Console → Firestore Database → Reglas</b>, pega el contenido completo de <code>admin/firestore.rules</code> del repositorio y publica. Luego recarga esta página." +
        (err && err.message ? "<br><br><small style=\"color:var(--gray-d)\">Detalle técnico: " + String(err.message).replace(/[&<>]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]; }) + "</small>" : ""),
      null
    );
    throw err;
  });
}

// Pantalla de bloqueo a pantalla completa, reutilizable en cualquier página
// que use requireSuperAdmin(). No depende de nada del HTML de la página.
function mostrarBloqueoAcceso(titulo, cuerpoHtml, uid, cerrarFn) {
  if (document.getElementById("bloqueoAccesoOverlay")) return;
  const div = document.createElement("div");
  div.id = "bloqueoAccesoOverlay";
  div.className = "auth-shell";
  div.style.position = "fixed";
  div.style.inset = "0";
  div.style.zIndex = "9999";
  div.innerHTML =
    '<div class="auth-card wide">' +
      '<div class="auth-logo">' +
        '<svg width="40" height="49" viewBox="0 0 100 140"><rect x="4" y="4" width="92" height="132" rx="24" fill="#0B1626" stroke="#18A83A" stroke-width="5"/><rect x="16" y="26" width="68" height="90" rx="6" fill="#18A83A"/><line x1="16" y1="71" x2="84" y2="71" stroke="#fff" stroke-width="2.4" opacity=".85"/><circle cx="50" cy="71" r="15" fill="none" stroke="#fff" stroke-width="2.4" opacity=".85"/></svg>' +
        '<div class="name">Bio<b>Futbol</b></div>' +
      '</div>' +
      '<div class="error-box" style="display:block"><strong>' + titulo + '</strong><br><br>' + cuerpoHtml + '</div>' +
      (uid ? '<div class="field"><label>Tu UID</label><input type="text" id="uidBloqueo" value="' + uid + '" readonly></div><button type="button" class="btn btn-ghost btn-block btn-sm" id="btnCopiarUidBloqueo"><i class="fa-solid fa-copy"></i> Copiar UID</button>' : "") +
      '<button type="button" class="btn btn-primary btn-block" style="margin-top:14px" onclick="location.reload()"><i class="fa-solid fa-rotate"></i> Ya lo hice, reintentar</button>' +
      '<p class="center-note"><a href="#" id="salirBloqueo">Cerrar sesión</a></p>' +
    '</div>';
  document.body.appendChild(div);
  if (uid) {
    document.getElementById("btnCopiarUidBloqueo").addEventListener("click", function () {
      navigator.clipboard.writeText(uid);
      this.innerHTML = '<i class="fa-solid fa-check"></i> Copiado';
    });
  }
  document.getElementById("salirBloqueo").addEventListener("click", function (e) {
    e.preventDefault();
    (cerrarFn || cerrarSesion)();
  });
}

// Pantalla de bloqueo cuando el súper-admin suspendió el acceso de un club
// por falta de pago (clientes/{id}.accesoSuspendido === true). La ve
// CUALQUIERA que intente entrar a ese club — dueño, profesor o socio — así
// que el mensaje cambia según quién la está viendo: al dueño se le da un
// camino directo para pagar y reactivar; a socios y profesores se les pide
// amablemente que contacten a su club, sin exponerles detalles de cobro.
function mostrarClubSuspendido(clienteId, clubNombre, rol, cerrarFn) {
  if (document.getElementById("bloqueoAccesoOverlay")) return;
  const nombre = clubNombre || "tu club";
  const esAdmin = rol === "admin";
  const linkPago = "https://wa.me/573505457420?text=" + encodeURIComponent(
    "Hola, quiero ponerme al día con el pago de BioFutbol para reactivar el acceso de " + nombre + "."
  );
  const cuerpo = esAdmin
    ? "El acceso de <b>" + nombre + "</b> a BioFutbol está suspendido por falta de pago. " +
      "Ahora mismo, cada socio, acudiente y profesor que intente entrar está viendo este mismo aviso — para evitar esa mala imagen con las familias, ponte al día cuanto antes y el acceso se reactiva de inmediato."
    : "El club <b>" + nombre + "</b> tiene su acceso a BioFutbol suspendido temporalmente por un tema administrativo de pago. Por favor contacta directamente a la administración de tu club — ellos lo pueden resolver muy rápido.";
  const div = document.createElement("div");
  div.id = "bloqueoAccesoOverlay";
  div.className = "auth-shell";
  div.style.position = "fixed";
  div.style.inset = "0";
  div.style.zIndex = "9999";
  div.innerHTML =
    '<div class="auth-card" style="border-color:rgba(255,92,92,.5);box-shadow:0 0 0 1px rgba(255,92,92,.25),0 24px 60px rgba(0,0,0,.5)">' +
      '<div class="auth-logo">' +
        '<svg width="40" height="49" viewBox="0 0 100 140"><rect x="4" y="4" width="92" height="132" rx="24" fill="#0B1626" stroke="#18A83A" stroke-width="5"/><rect x="16" y="26" width="68" height="90" rx="6" fill="#18A83A"/><line x1="16" y1="71" x2="84" y2="71" stroke="#fff" stroke-width="2.4" opacity=".85"/><circle cx="50" cy="71" r="15" fill="none" stroke="#fff" stroke-width="2.4" opacity=".85"/></svg>' +
        '<div class="name">Bio<b>Futbol</b></div>' +
      '</div>' +
      '<div style="text-align:center;margin-bottom:14px"><i class="fa-solid fa-triangle-exclamation" style="font-size:2.1rem;color:var(--red)"></i></div>' +
      '<h2 style="text-align:center;font-size:1.05rem;font-weight:900;color:var(--red);margin-bottom:12px">Aplicación suspendida por falta de pago</h2>' +
      '<p style="font-size:.88rem;color:var(--white);line-height:1.6;text-align:center;margin-bottom:18px">' + cuerpo + '</p>' +
      (esAdmin ? '<a href="' + linkPago + '" target="_blank" rel="noopener" class="btn btn-primary btn-block"><i class="fa-brands fa-whatsapp"></i> Pagar y reactivar ahora</a>' : '') +
      '<button type="button" class="btn btn-ghost btn-block" style="margin-top:10px" onclick="location.reload()"><i class="fa-solid fa-rotate"></i> Ya se puso al día, reintentar</button>' +
      '<p class="center-note"><a href="#" id="salirBloqueoSuspendido">Cerrar sesión</a></p>' +
    '</div>';
  document.body.appendChild(div);
  document.getElementById("salirBloqueoSuspendido").addEventListener("click", function (e) {
    e.preventDefault();
    (cerrarFn || cerrarSesion)();
  });
}

// Protege el panel de un club: exige sesión y que esa cuenta sea la dueña
// (authUid) de algún club, O un profesor de ese club con acceso limitado
// (equipos, fixture y torneos — club-panel.html restringe el resto de la
// interfaz cuando esProfesor es true). Devuelve una promesa con
// { user, cliente, esProfesor }.
function requireClub() {
  return new Promise(function (resolve, reject) {
    auth.onAuthStateChanged(function (user) {
      if (!user) { window.location.href = "club-login.html"; reject(new Error("sin-sesion")); return; }
      db.collection("clientes").where("authUid", "==", user.uid).limit(1).get().then(function (snap) {
        if (!snap.empty) {
          const doc = snap.docs[0];
          const cliente = Object.assign({ id: doc.id }, doc.data());
          if (cliente.accesoSuspendido) {
            mostrarClubSuspendido(cliente.id, cliente.clubNombre, "admin", cerrarSesionClub);
            reject(new Error("bloqueado"));
            return;
          }
          resolve({ user: user, cliente: cliente, esProfesor: false });
          return;
        }
        // No es dueño de ningún club: puede ser un profesor con acceso
        // limitado, o el súper-admin de BioFutbol entrando por error — en
        // ese caso lo mandamos a su panel real en vez de dejarlo rebotando
        // en el login del club.
        db.collection("profesoresIndex").doc(user.uid).get().then(function (profDoc) {
          if (profDoc.exists) {
            db.collection("clientes").doc(profDoc.data().clienteId).get().then(function (clienteDoc) {
              if (clienteDoc.exists) {
                const clienteProf = Object.assign({ id: clienteDoc.id }, clienteDoc.data());
                if (clienteProf.accesoSuspendido) {
                  mostrarClubSuspendido(clienteProf.id, clienteProf.clubNombre, "profesor", cerrarSesionProfesor);
                  reject(new Error("bloqueado"));
                  return;
                }
                resolve({ user: user, cliente: clienteProf, esProfesor: true });
              } else {
                window.location.href = "club-login.html";
                reject(new Error("sin-club"));
              }
            }).catch(function () {
              window.location.href = "club-login.html";
              reject(new Error("sin-club"));
            });
            return;
          }
          db.collection("admins").doc(user.uid).get().then(function (adminDoc) {
            window.location.href = adminDoc.exists ? "index.html" : "club-login.html";
            reject(new Error("sin-club"));
          }).catch(function () {
            window.location.href = "club-login.html";
            reject(new Error("sin-club"));
          });
        }).catch(function () {
          window.location.href = "club-login.html";
          reject(new Error("sin-club"));
        });
      }).catch(function (err) {
        window.location.href = "club-login.html";
        reject(err);
      });
    });
  });
}

// Protege una página que pertenece a UN club puntual (ej. la ficha de un
// socio): deja entrar al súper-admin de BioFutbol O al dueño de ese club
// específico. Devuelve una promesa con { user, esSuperAdmin }.
function requireAccesoCliente(clienteId) {
  return requireAuth().then(function (user) {
    return db.collection("admins").doc(user.uid).get().then(function (adminDoc) {
      if (adminDoc.exists) return { user: user, esSuperAdmin: true };
      return db.collection("clientes").doc(clienteId).get().then(function (clienteDoc) {
        if (clienteDoc.exists && clienteDoc.data().authUid === user.uid) {
          return { user: user, esSuperAdmin: false };
        }
        mostrarBloqueoAcceso("No tienes acceso a este club", "Esta ficha pertenece a otro club, o el link que usaste no es correcto.", null);
        return Promise.reject(new Error("bloqueado"));
      });
    });
  }).catch(function (err) {
    if (err && err.message === "bloqueado") throw err;
    mostrarBloqueoAcceso(
      "No se pudo verificar tu acceso",
      "Esto casi siempre pasa porque las reglas de seguridad de Firestore todavía no están publicadas. Ve a <b>Firebase Console → Firestore Database → Reglas</b>, pega el contenido completo de <code>admin/firestore.rules</code> del repositorio y publica. Luego recarga esta página." +
        (err && err.message ? "<br><br><small style=\"color:var(--gray-d)\">Detalle técnico: " + String(err.message).replace(/[&<>]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]; }) + "</small>" : ""),
      null
    );
    throw err;
  });
}

// Registra una acción en la colección "auditoria" para trazabilidad.
function registrarAuditoria(accion, clienteId, clienteNombre, detalle) {
  const user = auth.currentUser;
  return db.collection("auditoria").add({
    adminEmail: user ? user.email : "desconocido",
    accion: accion,
    clienteId: clienteId || null,
    clienteNombre: clienteNombre || null,
    detalle: detalle || null,
    fecha: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function (err) {
    console.error("No se pudo registrar la auditoría:", err);
  });
}

function nombreAdmin(email) {
  if (!email) return "—";
  if (email.startsWith("admin1")) return "Juan Carlos";
  if (email.startsWith("admin2")) return "Nicol";
  return email.split("@")[0];
}

function cerrarSesion() {
  auth.signOut().then(function () { window.location.href = "login.html"; });
}

function cerrarSesionClub() {
  auth.signOut().then(function () { window.location.href = "club-login.html"; });
}

// Protege el panel autenticado de un socio/deportista (mi-panel.html):
// exige sesión y que esa cuenta esté ligada a un socio en /sociosIndex.
// Devuelve una promesa con { user, socio, club }.
function requireAccesoSocio() {
  return new Promise(function (resolve, reject) {
    auth.onAuthStateChanged(function (user) {
      if (!user) { window.location.href = "socio-login.html"; reject(new Error("sin-sesion")); return; }
      db.collection("sociosIndex").doc(user.uid).get().then(function (idxDoc) {
        if (!idxDoc.exists) {
          mostrarBloqueoAcceso("Esta cuenta no tiene un panel de socio", "Esta cuenta no está ligada a ningún deportista. Si crees que es un error, pídele al club que te cree el acceso de nuevo desde la ficha del socio.", null, cerrarSesionSocio);
          reject(new Error("bloqueado"));
          return;
        }
        const idx = idxDoc.data();
        Promise.all([
          db.collection("clientes").doc(idx.clienteId).collection("socios").doc(idx.socioId).get(),
          db.collection("clientes").doc(idx.clienteId).collection("publico").doc("marca").get().catch(function () { return null; })
        ]).then(function (res) {
          const socioDoc = res[0], marcaDoc = res[1];
          if (!socioDoc.exists) {
            mostrarBloqueoAcceso("No encontramos tu ficha", "Tu acceso existe pero no encontramos el registro del deportista. Contacta a tu club.", null, cerrarSesionSocio);
            reject(new Error("bloqueado"));
            return;
          }
          const clubPublico = (marcaDoc && marcaDoc.exists) ? marcaDoc.data() : {};
          if (clubPublico.accesoSuspendido) {
            mostrarClubSuspendido(idx.clienteId, clubPublico.clubNombre, "socio", cerrarSesionSocio);
            reject(new Error("bloqueado"));
            return;
          }
          resolve({
            user: user,
            socio: Object.assign({ id: socioDoc.id, clienteId: idx.clienteId }, socioDoc.data()),
            club: clubPublico
          });
        }).catch(function (err) { reject(err); });
      }).catch(function (err) {
        mostrarBloqueoAcceso(
          "No se pudo verificar tu acceso",
          "Esto casi siempre pasa porque las reglas de seguridad de Firestore todavía no están publicadas. Pídele a tu club que lo revise." +
            (err && err.message ? "<br><br><small style=\"color:var(--gray-d)\">Detalle técnico: " + String(err.message).replace(/[&<>]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]; }) + "</small>" : ""),
          null
        );
        reject(err);
      });
    });
  });
}

function cerrarSesionSocio() {
  auth.signOut().then(function () { window.location.href = "socio-login.html"; });
}

// Protege el panel autenticado de un profesor/entrenador (profesor-panel.html):
// exige sesión y que esa cuenta esté ligada a un profesor en /profesoresIndex.
// Devuelve una promesa con { user, profesor, club }.
function requireAccesoProfesor() {
  return new Promise(function (resolve, reject) {
    auth.onAuthStateChanged(function (user) {
      if (!user) { window.location.href = "profesor-login.html"; reject(new Error("sin-sesion")); return; }
      db.collection("profesoresIndex").doc(user.uid).get().then(function (idxDoc) {
        if (!idxDoc.exists) {
          mostrarBloqueoAcceso("Esta cuenta no tiene un panel de profesor", "Esta cuenta no está ligada a ningún profesor. Si crees que es un error, pídele al club que te cree el acceso de nuevo desde la pestaña Profesores.", null, cerrarSesionProfesor);
          reject(new Error("bloqueado"));
          return;
        }
        const idx = idxDoc.data();
        Promise.all([
          db.collection("clientes").doc(idx.clienteId).collection("profesores").doc(idx.profesorId).get(),
          db.collection("clientes").doc(idx.clienteId).collection("publico").doc("marca").get().catch(function () { return null; })
        ]).then(function (res) {
          const profesorDoc = res[0], marcaDoc = res[1];
          if (!profesorDoc.exists) {
            mostrarBloqueoAcceso("No encontramos tu ficha", "Tu acceso existe pero no encontramos el registro del profesor. Contacta a tu club.", null, cerrarSesionProfesor);
            reject(new Error("bloqueado"));
            return;
          }
          const clubPublico = (marcaDoc && marcaDoc.exists) ? marcaDoc.data() : {};
          if (clubPublico.accesoSuspendido) {
            mostrarClubSuspendido(idx.clienteId, clubPublico.clubNombre, "profesor", cerrarSesionProfesor);
            reject(new Error("bloqueado"));
            return;
          }
          resolve({
            user: user,
            profesor: Object.assign({ id: profesorDoc.id, clienteId: idx.clienteId }, profesorDoc.data()),
            club: clubPublico
          });
        }).catch(function (err) { reject(err); });
      }).catch(function (err) {
        mostrarBloqueoAcceso(
          "No se pudo verificar tu acceso",
          "Esto casi siempre pasa porque las reglas de seguridad de Firestore todavía no están publicadas. Pídele a tu club que lo revise." +
            (err && err.message ? "<br><br><small style=\"color:var(--gray-d)\">Detalle técnico: " + String(err.message).replace(/[&<>]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]; }) + "</small>" : ""),
          null
        );
        reject(err);
      });
    });
  });
}

function cerrarSesionProfesor() {
  auth.signOut().then(function () { window.location.href = "profesor-login.html"; });
}
