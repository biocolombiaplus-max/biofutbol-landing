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
function mostrarBloqueoAcceso(titulo, cuerpoHtml, uid) {
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
    cerrarSesion();
  });
}

// Protege el panel de un club: exige sesión y que esa cuenta sea la dueña
// (authUid) de algún club. Devuelve una promesa con { user, cliente }.
function requireClub() {
  return new Promise(function (resolve, reject) {
    auth.onAuthStateChanged(function (user) {
      if (!user) { window.location.href = "club-login.html"; reject(new Error("sin-sesion")); return; }
      db.collection("clientes").where("authUid", "==", user.uid).limit(1).get().then(function (snap) {
        if (!snap.empty) {
          const doc = snap.docs[0];
          resolve({ user: user, cliente: Object.assign({ id: doc.id }, doc.data()) });
          return;
        }
        // No es dueño de ningún club: si es el súper-admin de BioFutbol
        // (por ejemplo, entró aquí por error), lo mandamos a su panel real
        // en vez de dejarlo rebotando en el login del club.
        db.collection("admins").doc(user.uid).get().then(function (adminDoc) {
          window.location.href = adminDoc.exists ? "index.html" : "club-login.html";
          reject(new Error("sin-club"));
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
