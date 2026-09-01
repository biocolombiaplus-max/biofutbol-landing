// ── DATOS DE EJEMPLO PARA LA DEMO PÚBLICA ──
// Marca real de Unión Tenerife F.C, pero jugadores, padres, profesores,
// partidos, torneos y patrocinadores 100% ficticios — pensados solo para
// mostrar cómo se ve y se siente la app, sin exponer datos reales de nadie.
// Requiere que js/demo-mock.js se haya cargado antes (usa DEMO_STORE).

const DEMO_CLIENTE_ID = "demo-union-tenerife";

const DEMO_CLUB = {
  id: DEMO_CLIENTE_ID,
  clubNombre: "Unión Tenerife F.C",
  ciudad: "Tenerife, Magdalena",
  direccion: "Complejo Deportivo Municipal",
  nit: "",
  logoUrl: "",
  colorPrimario: "#18A83A",
  colorSecundario: "#0e7d29",
  colorTerciario: "#FFC933",
  entrenaFestivos: true,
  modulosActivos: { equipos: true },
  pagoMensualidad: 60000,
  pagoNequiNumero: "300 000 0000",
  pagoNequiTitular: "Unión Tenerife F.C",
  estado: "activo",
  deportistasPautados: 8,
  valorPorDeportista: 2500
};

const DEMO_USER_MOCK = { email: "demo@biofutbol.com", uid: "demo-uid" };

function demoSeedColeccion(path, filas) {
  const mapa = {};
  filas.forEach(function (f) {
    const id = f.id || demoId();
    const data = Object.assign({}, f);
    delete data.id;
    mapa[id] = data;
  });
  DEMO_STORE[path] = mapa;
}

(function poblarDemo() {
  const base = "clientes/" + DEMO_CLIENTE_ID;
  const hoy = new Date();
  function fechaIso(offsetDias) {
    const d = new Date(hoy); d.setDate(d.getDate() + offsetDias);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function tsHace(dias) {
    const d = new Date(hoy); d.setDate(d.getDate() - dias);
    return demoTimestamp(d);
  }
  function tsEn(dias) {
    const d = new Date(hoy); d.setDate(d.getDate() + dias);
    return demoTimestamp(d);
  }

  demoSeedColeccion(base + "/socios", [
    { id: "s1", nombre: "Samuel Torres Martínez", categoria: "Sub-12", camiseta: 9, posicion: "Delantero", pieHabil: "Derecho", telefono: "3001112233", correo: "papa.samuel@correo.com", documento: "1102345671", fechaNacimiento: "2014-03-12", talla: "10", colegio: "IE Tenerife", estado: "Activo", pagoValor: 60000, pagoProximo: fechaIso(9), entrenamientosAsistidos: 17, entrenamientosProgramados: 20, creado: tsHace(210) },
    { id: "s2", nombre: "Isabella Ramírez Cortés", categoria: "Sub-12", camiseta: 7, posicion: "Mediocampista", pieHabil: "Izquierdo", telefono: "3002223344", correo: "mama.isa@correo.com", documento: "1102345672", fechaNacimiento: "2014-07-02", talla: "8", colegio: "IE Tenerife", estado: "Activo", pagoValor: 60000, pagoProximo: fechaIso(-3), entrenamientosAsistidos: 19, entrenamientosProgramados: 20, creado: tsHace(190) },
    { id: "s3", nombre: "Juan David Pérez Suárez", categoria: "Sub-10", camiseta: 5, posicion: "Defensa", pieHabil: "Derecho", telefono: "3003334455", correo: "", documento: "1102345673", fechaNacimiento: "2016-01-20", talla: "8", colegio: "Col. San José", estado: "Activo", pagoValor: 60000, pagoProximo: fechaIso(21), entrenamientosAsistidos: 12, entrenamientosProgramados: 14, creado: tsHace(150) },
    { id: "s4", nombre: "Mariana Gómez López", categoria: "Sub-10", camiseta: 3, posicion: "Defensa", pieHabil: "Derecho", telefono: "3004445566", correo: "familia.gomez@correo.com", documento: "1102345674", fechaNacimiento: "2016-09-08", talla: "6", colegio: "Col. San José", estado: "Activo", pagoValor: 60000, pagoProximo: fechaIso(14), entrenamientosAsistidos: 13, entrenamientosProgramados: 14, creado: tsHace(150) },
    { id: "s5", nombre: "Santiago Rodríguez Díaz", categoria: "Sub-15", camiseta: 10, posicion: "Delantero", pieHabil: "Derecho", telefono: "3005556677", correo: "", documento: "1102345675", fechaNacimiento: "2011-05-30", talla: "M", colegio: "IE Tenerife", estado: "Activo", pagoValor: 70000, pagoProximo: fechaIso(-8), entrenamientosAsistidos: 24, entrenamientosProgramados: 26, creado: tsHace(300) },
    { id: "s6", nombre: "Valentina Herrera Ruiz", categoria: "Sub-15", camiseta: 8, posicion: "Mediocampista", pieHabil: "Izquierdo", telefono: "3006667788", correo: "papa.herrera@correo.com", documento: "1102345676", fechaNacimiento: "2011-11-14", talla: "M", colegio: "IE Tenerife", estado: "Activo", pagoValor: 70000, pagoProximo: fechaIso(5), entrenamientosAsistidos: 22, entrenamientosProgramados: 26, creado: tsHace(300) },
    { id: "s7", nombre: "Emmanuel Castro Vega", categoria: "Sub-8", camiseta: 1, posicion: "Portero", pieHabil: "Derecho", acudiente: "Rosa Vega", telefono: "3007778899", correo: "", documento: "1102345677", fechaNacimiento: "2018-02-17", talla: "6", colegio: "Jardín Los Angelitos", estado: "Activo", pagoValor: 50000, pagoProximo: fechaIso(18), entrenamientosAsistidos: 8, entrenamientosProgramados: 9, creado: tsHace(60) },
    { id: "s8", nombre: "Mateo Castro Vega", categoria: "Sub-8", camiseta: 2, posicion: "Defensa", pieHabil: "Derecho", acudiente: "Rosa Vega", telefono: "3007778899", correo: "familia.castro@correo.com", documento: "1102345678", fechaNacimiento: "2018-06-25", talla: "6", colegio: "Jardín Los Angelitos", estado: "Activo", pagoValor: 40000, notaCobro: "Descuento por 2 hermanos en el club", pagoProximo: fechaIso(18), entrenamientosAsistidos: 4, entrenamientosProgramados: 9, creado: tsHace(60) },
    { id: "s9", nombre: "Tomás Fernández Silva", categoria: "Sub-12", camiseta: 4, posicion: "Defensa", pieHabil: "Izquierdo", telefono: "3009990011", correo: "", documento: "1102345679", fechaNacimiento: "2014-10-05", talla: "10", colegio: "IE Tenerife", estado: "Activo", becado: true, notaCobro: "Beca deportiva por rendimiento", entrenamientosAsistidos: 16, entrenamientosProgramados: 20, creado: tsHace(210) }
  ]);

  demoSeedColeccion(base + "/profesores", [
    { id: "p1", nombre: "Néver López", telefono: "3010001122", correo: "never.lopez@correo.com", categorias: ["Sub-10", "Sub-12"], authUid: "demo-auth-p1", correoAcceso: "never.lopez@correo.com" },
    { id: "p2", nombre: "Carolina Jiménez", telefono: "3020002233", correo: "carolina.jimenez@correo.com", categorias: ["Sub-15"], authUid: "", correoAcceso: "" },
    { id: "p3", nombre: "Andrés Fabián Reyes", telefono: "3030003344", correo: "andres.reyes@correo.com", categorias: ["Sub-8"], authUid: "", correoAcceso: "" }
  ]);

  demoSeedColeccion(base + "/equipos", [
    { id: "e1", nombre: "Unión Tenerife Sub-12", logoUrl: "" },
    { id: "e2", nombre: "Halcones del Magdalena", logoUrl: "" },
    { id: "e3", nombre: "Unión Tenerife Sub-15", logoUrl: "" },
    { id: "e4", nombre: "Águilas de Plato", logoUrl: "" }
  ]);

  demoSeedColeccion(base + "/sedes", [
    { id: "sede1", nombre: "Cancha Municipal Tenerife", direccion: "Cra 5 # 10-20, Tenerife" },
    { id: "sede2", nombre: "Polideportivo San José", direccion: "Calle 8 # 4-15, Tenerife" }
  ]);

  demoSeedColeccion(base + "/horarios", [
    { id: "h1", categoria: "Sub-12", dia: "Lunes", horaInicio: "16:00", horaFin: "17:30", sedeId: "sede1" },
    { id: "h2", categoria: "Sub-12", dia: "Miércoles", horaInicio: "16:00", horaFin: "17:30", sedeId: "sede1" },
    { id: "h3", categoria: "Sub-10", dia: "Martes", horaInicio: "15:00", horaFin: "16:15", sedeId: "sede2" },
    { id: "h4", categoria: "Sub-15", dia: "Jueves", horaInicio: "17:30", horaFin: "19:00", sedeId: "sede1" },
    { id: "h5", categoria: "Sub-8", dia: "Viernes", horaInicio: "14:30", horaFin: "15:30", sedeId: "sede2" }
  ]);

  demoSeedColeccion(base + "/excepciones", [
    { id: "ex1", tipo: "extra", fecha: fechaIso(6), horaInicio: "08:00", horaFin: "10:00", categoria: "Sub-12", sedeId: "sede1" }
  ]);

  demoSeedColeccion(base + "/uniformes", [
    { id: "u1", nombre: "Titular", color: "#18A83A", fotoUrl: "" },
    { id: "u2", nombre: "Alterno", color: "#FFC933", fotoUrl: "" }
  ]);

  demoSeedColeccion(base + "/torneos", [
    { id: "t1", nombre: "Copa Magdalena Sub-12", logoUrl: "", fechaInicio: fechaIso(10), fechaFin: fechaIso(12), lugar: "Complejo Deportivo Municipal", mapsUrl: "", valorInscripcion: 80000, notas: "Incluye arbitraje" }
  ]);
  demoSeedColeccion(base + "/torneos/t1/inscripciones", [
    { id: "s1", pagado: true, fechaPago: fechaIso(-5) },
    { id: "s2", pagado: false },
    { id: "s9", pagado: true, fechaPago: fechaIso(-2) }
  ]);

  demoSeedColeccion(base + "/patrocinadores", [
    { id: "pat1", nombre: "Almacén Deportivo El Gol", tier: "oro", contacto: "300 111 2233", descripcion: "20% de descuento para socios", logoUrl: "", activo: true },
    { id: "pat2", nombre: "Panadería La Espiga", tier: "plata", contacto: "300 222 3344", descripcion: "Refrigerio después de cada partido", logoUrl: "", activo: true },
    { id: "pat3", nombre: "Droguería San Rafael", tier: "bronce", contacto: "300 333 4455", descripcion: "", logoUrl: "", activo: true }
  ]);

  demoSeedColeccion(base + "/partidos", [
    { id: "pa1", local: "e1", visitante: "e2", fecha: tsEn(4), hora: "15:00", cancha: "Cancha Municipal Tenerife", jugado: false, torneoId: "t1", uniformeId: "u1", arbitraje: 60000, mapsUrl: "", notas: "" },
    { id: "pa2", local: "e3", visitante: "e4", fecha: tsEn(8), hora: "17:00", cancha: "Polideportivo San José", jugado: false, uniformeId: "u2", arbitraje: 60000 },
    { id: "pa3", local: "e1", visitante: "e4", fecha: tsHace(6), hora: "15:00", cancha: "Cancha Municipal Tenerife", jugado: true, golesLocal: 3, golesVisitante: 1, torneoId: "t1",
      goleadores: [{ nombre: "Samuel Torres Martínez", equipoId: "e1", goles: 2 }, { nombre: "Tomás Fernández Silva", equipoId: "e1", goles: 1 }],
      tarjetas: [{ nombre: "Jugador rival", equipoId: "e4", tipo: "amarilla" }] },
    { id: "pa4", local: "e2", visitante: "e1", fecha: tsHace(13), hora: "16:00", cancha: "Cancha Municipal Tenerife", jugado: true, golesLocal: 0, golesVisitante: 2, torneoId: "t1",
      goleadores: [{ nombre: "Samuel Torres Martínez", equipoId: "e1", goles: 1 }, { nombre: "Isabella Ramírez Cortés", equipoId: "e1", goles: 1 }],
      tarjetas: [] }
  ]);

  demoSeedColeccion(base + "/entrenamientos", [
    { id: "en1", categoria: "Sub-12", sedeId: "sede1", fecha: fechaIso(-2), estado: "finalizado", horaInicio: tsHace(2), horaFin: tsHace(2),
      asistentes: { s1: true, s2: true, s9: false } },
    { id: "en2", categoria: "Sub-10", sedeId: "sede2", fecha: fechaIso(-1), estado: "finalizado", horaInicio: tsHace(1), horaFin: tsHace(1),
      asistentes: { s3: true, s4: true } }
  ]);

  DEMO_STORE["config"] = { anuncio: { texto: "Así se ve la barra de anuncios: prográmala una vez y se muestra sola a todos tus socios.", activo: true, color: "#0e7d29", colorTexto: "#ffffff", etiqueta: "Ejemplo", botonTexto: "Ver más", link: "https://wa.me/573505457420" } };
})();
