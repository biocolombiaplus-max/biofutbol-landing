// ── MOCK DE FIREBASE PARA LA DEMO PÚBLICA (demo.html) ──
// Reimplementa, en memoria y sin red, el subconjunto de la API de Firebase
// que usa club-panel.html: Firestore (collection/doc/get/set/update/delete/
// add/onSnapshot/orderBy/limit/batch), FieldValue.serverTimestamp/increment/
// arrayUnion, Timestamp.fromDate, y el patrón de "app secundaria" que se usa
// para crear accesos de socios/profesores (createUserWithEmailAndPassword).
// Así, casi todo el código real del panel (los mismos escuchar*/pintar*/
// guardar* de siempre) funciona sin cambios contra datos de mentira.

const DEMO_STORE = {};       // path (ej: "clientes/demo/socios") -> { id: data }
const DEMO_LIST_COL = {};    // path -> [callback...]
const DEMO_LIST_DOC = {};    // "path/id" -> [callback...]

function demoId() {
  return "demo-" + Math.random().toString(36).slice(2, 10);
}

function demoTimestamp(date) {
  date = date || new Date();
  return {
    __esTimestampDemo: true,
    toDate: function () { return date; },
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0
  };
}

function demoDocSnapshot(id, data) {
  return { id: id, exists: data !== undefined && data !== null, data: function () { return data; } };
}

function demoQuerySnapshot(pares) {
  return {
    empty: pares.length === 0,
    size: pares.length,
    docs: pares.map(function (p) { return demoDocSnapshot(p[0], p[1]); }),
    forEach: function (cb) { pares.forEach(function (p) { cb(demoDocSnapshot(p[0], p[1])); }); }
  };
}

function demoNotificarColeccion(path) {
  (DEMO_LIST_COL[path] || []).forEach(function (entry) {
    entry.cb(demoConsultar(path, entry.orderBy, entry.limit));
  });
}

function demoNotificarDoc(path, id) {
  const key = path + "/" + id;
  (DEMO_LIST_DOC[key] || []).forEach(function (cb) {
    cb(demoDocSnapshot(id, (DEMO_STORE[path] || {})[id]));
  });
}

function demoConsultar(path, orden, limite) {
  let pares = Object.keys(DEMO_STORE[path] || {}).map(function (id) { return [id, DEMO_STORE[path][id]]; });
  if (orden) {
    pares.sort(function (a, b) {
      const va = a[1][orden.campo], vb = b[1][orden.campo];
      let cmp = 0;
      if (va == null && vb == null) cmp = 0;
      else if (va == null) cmp = -1;
      else if (vb == null) cmp = 1;
      else if (va.seconds != null && vb.seconds != null) cmp = va.seconds - vb.seconds;
      else if (va > vb) cmp = 1;
      else if (va < vb) cmp = -1;
      return orden.dir === "desc" ? -cmp : cmp;
    });
  }
  if (limite) pares = pares.slice(0, limite);
  return demoQuerySnapshot(pares);
}

// Aplica FieldValue.serverTimestamp()/increment()/arrayUnion() y la notación
// de punto ("asistentes.socio123") que usa update() para tocar un solo campo
// anidado sin sobreescribir el resto del mapa.
function demoAplicarCampos(actual, cambios, esUpdate) {
  actual = actual || {};
  const resultado = Object.assign({}, actual);
  Object.keys(cambios).forEach(function (clave) {
    const valor = cambios[clave];
    if (esUpdate && clave.indexOf(".") !== -1) {
      const partes = clave.split(".");
      let obj = resultado;
      for (let i = 0; i < partes.length - 1; i++) {
        if (typeof obj[partes[i]] !== "object" || obj[partes[i]] == null) obj[partes[i]] = {};
        else obj[partes[i]] = Object.assign({}, obj[partes[i]]);
        obj = obj[partes[i]];
      }
      obj[partes[partes.length - 1]] = demoResolverValor(obj[partes[partes.length - 1]], valor);
      return;
    }
    resultado[clave] = demoResolverValor(actual[clave], valor);
  });
  return resultado;
}

function demoResolverValor(valorActual, valorPropuesto) {
  if (valorPropuesto && valorPropuesto.__campoDemo === "serverTimestamp") return demoTimestamp(new Date());
  if (valorPropuesto && valorPropuesto.__campoDemo === "increment") return (Number(valorActual) || 0) + valorPropuesto.n;
  if (valorPropuesto && valorPropuesto.__campoDemo === "arrayUnion") return (Array.isArray(valorActual) ? valorActual : []).concat(valorPropuesto.items);
  return valorPropuesto;
}

function demoDocRef(path, id) {
  return {
    id: id,
    get: function () {
      return Promise.resolve(demoDocSnapshot(id, (DEMO_STORE[path] || {})[id]));
    },
    set: function (data, opts) {
      DEMO_STORE[path] = DEMO_STORE[path] || {};
      const merge = opts && opts.merge;
      DEMO_STORE[path][id] = demoAplicarCampos(merge ? DEMO_STORE[path][id] : {}, data, true);
      demoNotificarColeccion(path); demoNotificarDoc(path, id);
      return Promise.resolve();
    },
    update: function (data) {
      DEMO_STORE[path] = DEMO_STORE[path] || {};
      DEMO_STORE[path][id] = demoAplicarCampos(DEMO_STORE[path][id], data, true);
      demoNotificarColeccion(path); demoNotificarDoc(path, id);
      return Promise.resolve();
    },
    delete: function () {
      if (DEMO_STORE[path]) delete DEMO_STORE[path][id];
      demoNotificarColeccion(path); demoNotificarDoc(path, id);
      return Promise.resolve();
    },
    onSnapshot: function (cb) {
      const key = path + "/" + id;
      DEMO_LIST_DOC[key] = DEMO_LIST_DOC[key] || [];
      DEMO_LIST_DOC[key].push(cb);
      cb(demoDocSnapshot(id, (DEMO_STORE[path] || {})[id]));
      return function unsubscribe() {
        DEMO_LIST_DOC[key] = (DEMO_LIST_DOC[key] || []).filter(function (x) { return x !== cb; });
      };
    },
    collection: function (sub) { return demoCollectionRef(path + "/" + id + "/" + sub); }
  };
}

function demoCollectionRef(path, orden, limite) {
  return {
    doc: function (id) { return demoDocRef(path, id || demoId()); },
    add: function (data) {
      const id = demoId();
      DEMO_STORE[path] = DEMO_STORE[path] || {};
      DEMO_STORE[path][id] = demoAplicarCampos({}, data, false);
      demoNotificarColeccion(path);
      return Promise.resolve({ id: id });
    },
    orderBy: function (campo, dir) { return demoCollectionRef(path, { campo: campo, dir: dir || "asc" }, limite); },
    limit: function (n) { return demoCollectionRef(path, orden, n); },
    where: function () { return this; }, // no se usa en el panel; se ignora sin romper nada
    get: function () { return Promise.resolve(demoConsultar(path, orden, limite)); },
    onSnapshot: function (cb, errCb) {
      DEMO_LIST_COL[path] = DEMO_LIST_COL[path] || [];
      const entry = { cb: cb, orderBy: orden, limit: limite };
      DEMO_LIST_COL[path].push(entry);
      cb(demoConsultar(path, orden, limite));
      return function unsubscribe() {
        DEMO_LIST_COL[path] = (DEMO_LIST_COL[path] || []).filter(function (x) { return x !== entry; });
      };
    }
  };
}

const db = {
  collection: function (path) { return demoCollectionRef(path); },
  batch: function () {
    const ops = [];
    return {
      set: function (ref, data, opts) { ops.push({ tipo: "set", ref: ref, data: data, opts: opts }); },
      update: function (ref, data) { ops.push({ tipo: "update", ref: ref, data: data }); },
      delete: function (ref) { ops.push({ tipo: "delete", ref: ref }); },
      commit: function () {
        ops.forEach(function (op) {
          if (op.tipo === "set") op.ref.set(op.data, op.opts);
          else if (op.tipo === "update") op.ref.update(op.data);
          else op.ref.delete();
        });
        return Promise.resolve();
      }
    };
  }
};

const auth = {
  currentUser: { email: "demo@biofutbol.com", uid: "demo-uid" },
  onAuthStateChanged: function (cb) { cb(this.currentUser); return function () {}; },
  signOut: function () { return Promise.resolve(); },
  sendPasswordResetEmail: function () { return Promise.resolve(); }
};

// "App secundaria" que usa el panel para crear el acceso de un socio o
// profesor sin cerrar la sesión del administrador. En la demo, cualquier
// correo/clave "funciona" y no crea ninguna cuenta real.
const firebase = {
  apps: [],
  initializeApp: function () {
    const app = {
      name: "secondary",
      auth: function () {
        return {
          createUserWithEmailAndPassword: function () {
            return Promise.resolve({ user: { uid: demoId() } });
          },
          signOut: function () { return Promise.resolve(); }
        };
      }
    };
    return app;
  },
  firestore: {
    FieldValue: {
      serverTimestamp: function () { return { __campoDemo: "serverTimestamp" }; },
      increment: function (n) { return { __campoDemo: "increment", n: n }; },
      arrayUnion: function () { return { __campoDemo: "arrayUnion", items: Array.prototype.slice.call(arguments) }; }
    },
    Timestamp: {
      fromDate: function (d) { return demoTimestamp(d); }
    }
  }
};

// Cloudinary real reemplazado: la "subida" es instantánea y local (el
// archivo se muestra tal cual lo eligió el visitante, sin tocar ningún
// servidor ni cuenta real de BioFutbol).
function subirACloudinary(file) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(URL.createObjectURL(file)); }, 500);
  });
}

// EmailJS real reemplazado: simula el envío sin mandar ningún correo.
const EMAILJS_PUBLIC_KEY = "demo";
const EMAILJS_SERVICE_ID = "demo";
const EMAILJS_TEMPLATE_ID = "demo";
const emailjs = {
  init: function () {},
  send: function () { return new Promise(function (resolve) { setTimeout(function () { resolve({ status: 200, text: "OK (demo)" }); }, 500); }); }
};
