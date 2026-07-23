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
