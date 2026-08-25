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
// de un club), la saca de aquí y la manda a su propio panel de club.
function requireSuperAdmin() {
  return requireAuth().then(function (user) {
    return db.collection("admins").doc(user.uid).get().then(function (doc) {
      if (!doc.exists) {
        window.location.href = "club-login.html";
        return Promise.reject(new Error("no-es-super-admin"));
      }
      return user;
    });
  });
}

// Protege el panel de un club: exige sesión y que esa cuenta sea la dueña
// (authUid) de algún club. Devuelve una promesa con { user, cliente }.
function requireClub() {
  return new Promise(function (resolve, reject) {
    auth.onAuthStateChanged(function (user) {
      if (!user) { window.location.href = "club-login.html"; reject(new Error("sin-sesion")); return; }
      db.collection("clientes").where("authUid", "==", user.uid).limit(1).get().then(function (snap) {
        if (snap.empty) {
          window.location.href = "club-login.html";
          reject(new Error("sin-club"));
          return;
        }
        const doc = snap.docs[0];
        resolve({ user: user, cliente: Object.assign({ id: doc.id }, doc.data()) });
      }).catch(function (err) {
        window.location.href = "club-login.html";
        reject(err);
      });
    });
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
