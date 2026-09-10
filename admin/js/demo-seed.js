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
  clubPais: "Colombia",
  moneda: "COP",
  entrenaFestivos: true,
  modulosActivos: { equipos: true },
  pagoMensualidad: 60000,
  pagoNequiApp: "Nequi",
  pagoNequiNumero: "300 000 0000",
  pagoNequiTitular: "Unión Tenerife F.C",
  pagoEfectivo: true,
  pagoEfectivoNota: "Con el profesor, en la cancha",
  estado: "activo",
  deportistasPautados: 8,
  valorPorDeportista: 2500
};

// ── Adaptar la demo al país que el visitante quiera simular ──
// Lee "?pais=Argentina" de la URL: si viene y es un país válido distinto
// de Colombia, cambia el nombre, la ciudad, la moneda, la mensualidad y la
// billetera del club de ejemplo para que la demo se sienta local a quien la
// está viendo — sin tocar nada del producto real. Sin el parámetro (o con
// uno inválido) la demo sigue mostrando a Unión Tenerife F.C. en Colombia
// como siempre, así que ningún link ya compartido se rompe.
const DEMO_IDENTIDADES = {
  "México": { clubNombre: "Deportivo Condesa", ciudad: "Condesa, Ciudad de México", direccion: "Cancha Parque México" },
  "Venezuela": { clubNombre: "Real Maracay F.C.", ciudad: "Maracay, Aragua", direccion: "Complejo Deportivo José Casanova Godoy" },
  "Ecuador": { clubNombre: "Deportivo Cumbayá F.C.", ciudad: "Cumbayá, Quito", direccion: "Cancha Parque Central" },
  "Perú": { clubNombre: "Alianza San Isidro F.C.", ciudad: "San Isidro, Lima", direccion: "Complejo Deportivo Municipal" },
  "Bolivia": { clubNombre: "Club Atlético Sucre", ciudad: "Sucre", direccion: "Estadio Patria" },
  "Chile": { clubNombre: "Unión Ñuñoa F.C.", ciudad: "Ñuñoa, Santiago", direccion: "Estadio Municipal de Ñuñoa" },
  "Argentina": { clubNombre: "Atlético San Telmo", ciudad: "San Telmo, Buenos Aires", direccion: "Club de Barrio San Telmo" },
  "Uruguay": { clubNombre: "Nacional Pocitos F.C.", ciudad: "Pocitos, Montevideo", direccion: "Complejo Deportivo Pocitos" },
  "Paraguay": { clubNombre: "Sport Club Asunción", ciudad: "Asunción", direccion: "Polideportivo Municipal" },
  "Brasil": { clubNombre: "Grêmio Ipanema F.C.", ciudad: "Ipanema, Rio de Janeiro", direccion: "Complexo Esportivo Municipal" },
  "Panamá": { clubNombre: "Deportivo Bella Vista", ciudad: "Bella Vista, Panamá", direccion: "Complejo Deportivo Bella Vista" },
  "Costa Rica": { clubNombre: "Escuela Curridabat F.C.", ciudad: "Curridabat, San José", direccion: "Polideportivo de Curridabat" },
  "Nicaragua": { clubNombre: "Deportivo Bolonia", ciudad: "Bolonia, Managua", direccion: "Complejo Deportivo Bolonia" },
  "Honduras": { clubNombre: "Real Comayagüela", ciudad: "Comayagüela", direccion: "Estadio Marcelo Tinoco" },
  "El Salvador": { clubNombre: "Deportivo Escalón", ciudad: "Escalón, San Salvador", direccion: "Cancha Municipal Escalón" },
  "Guatemala": { clubNombre: "Deportivo Zona 10", ciudad: "Zona 10, Ciudad de Guatemala", direccion: "Complejo Deportivo Zona 10" }
};

// Cambia de página con ?pais=X (o lo quita si vuelve a Colombia). La usan
// tanto el selector del banner como el de la bienvenida del recorrido.
function demoIrAPais(pais) {
  const url = new URL(location.href);
  if (pais && pais !== "Colombia") url.searchParams.set("pais", pais);
  else url.searchParams.delete("pais");
  location.href = url.toString();
}

(function adaptarDemoAlPais() {
  const pais = new URLSearchParams(location.search).get("pais");
  const identidad = pais && DEMO_IDENTIDADES[pais];
  if (!identidad) return;

  Object.assign(DEMO_CLUB, identidad, {
    clubPais: pais,
    moneda: monedaDePais(pais),
    pagoNequiApp: billeteraTipica(pais),
    pagoNequiTitular: identidad.clubNombre
  });
})();

// Todos los valores de dinero del seed están escritos en pesos colombianos
// (COP). Si el visitante eligió otro país, esta función los reescala
// proporcionalmente a la moneda de ese país (misma "sensación" de precio,
// nunca un número absurdo como "$60.000 USD/mes" por un solo jugador) —
// se llama una sola vez, al final de poblarDemo(), ya con todo sembrado.
function demoReescalarMoneda() {
  const pais = DEMO_CLUB.clubPais;
  if (!pais || pais === "Colombia") return;
  const tasaCop = TASA_USD_APROX.COP;
  const tasaDestino = TASA_USD_APROX[DEMO_CLUB.moneda];
  if (!tasaDestino) return;
  const factor = tasaDestino / tasaCop;
  function r(v) { return Math.round((v * factor) / 5) * 5; }

  DEMO_CLUB.pagoMensualidad = r(DEMO_CLUB.pagoMensualidad);

  const base = "clientes/" + DEMO_CLIENTE_ID;
  const socios = DEMO_STORE[base + "/socios"] || {};
  Object.keys(socios).forEach(function (id) {
    const s = socios[id];
    if (s.pagoValor) s.pagoValor = r(s.pagoValor);
    if (s.historialPagosSocio) s.historialPagosSocio.forEach(function (h) { h.valor = r(h.valor); });
  });

  const torneos = DEMO_STORE[base + "/torneos"] || {};
  Object.keys(torneos).forEach(function (id) { if (torneos[id].valorInscripcion) torneos[id].valorInscripcion = r(torneos[id].valorInscripcion); });

  const partidos = DEMO_STORE[base + "/partidos"] || {};
  Object.keys(partidos).forEach(function (id) { if (partidos[id].arbitraje) partidos[id].arbitraje = r(partidos[id].arbitraje); });

  const gastos = DEMO_STORE[base + "/gastos"] || {};
  Object.keys(gastos).forEach(function (id) { if (gastos[id].valor) gastos[id].valor = r(gastos[id].valor); });
}

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
    { id: "s1", nombre: "Samuel Torres Martínez", categoria: "Sub-12", camiseta: 9, posicion: "Delantero", pieHabil: "Derecho", telefono: "3001112233", correo: "papa.samuel@correo.com", documento: "1102345671", fechaNacimiento: "2014-03-12", talla: "10", colegio: "IE Tenerife", estado: "Activo", pagoValor: 60000, pagoProximo: fechaIso(9), pagoUltimo: fechaIso(-21), historialPagosSocio: [{ fecha: fechaIso(-21), valor: 60000 }], entrenamientosAsistidos: 17, entrenamientosProgramados: 20, creado: tsHace(210) },
    { id: "s2", nombre: "Isabella Ramírez Cortés", categoria: "Sub-12", camiseta: 7, posicion: "Mediocampista", pieHabil: "Izquierdo", telefono: "3002223344", correo: "mama.isa@correo.com", documento: "1102345672", fechaNacimiento: "2014-07-02", talla: "8", colegio: "IE Tenerife", estado: "Activo", pagoValor: 60000, pagoProximo: fechaIso(-3), historialPagosSocio: [{ fecha: fechaIso(-6), valor: 60000 }], entrenamientosAsistidos: 19, entrenamientosProgramados: 20, creado: tsHace(190) },
    { id: "s3", nombre: "Juan David Pérez Suárez", categoria: "Sub-10", camiseta: 5, posicion: "Defensa", pieHabil: "Derecho", telefono: "3003334455", correo: "", documento: "1102345673", fechaNacimiento: "2016-01-20", talla: "8", colegio: "Col. San José", estado: "Activo", pagoValor: 60000, pagoProximo: fechaIso(21), historialPagosSocio: [{ fecha: fechaIso(-14), valor: 60000 }], entrenamientosAsistidos: 12, entrenamientosProgramados: 14, creado: tsHace(150) },
    { id: "s4", nombre: "Mariana Gómez López", categoria: "Sub-10", camiseta: 3, posicion: "Defensa", pieHabil: "Derecho", telefono: "3004445566", correo: "familia.gomez@correo.com", documento: "1102345674", fechaNacimiento: "2016-09-08", talla: "6", colegio: "Col. San José", estado: "Activo", pagoValor: 60000, pagoProximo: fechaIso(14), entrenamientosAsistidos: 13, entrenamientosProgramados: 14, creado: tsHace(150) },
    { id: "s5", nombre: "Santiago Rodríguez Díaz", categoria: "Sub-15", camiseta: 10, posicion: "Delantero", pieHabil: "Derecho", telefono: "3005556677", correo: "", documento: "1102345675", fechaNacimiento: "2011-05-30", talla: "M", colegio: "IE Tenerife", estado: "Activo", pagoValor: 70000, pagoProximo: fechaIso(-8), historialPagosSocio: [{ fecha: fechaIso(-9), valor: 70000 }], entrenamientosAsistidos: 24, entrenamientosProgramados: 26, creado: tsHace(300) },
    { id: "s6", nombre: "Valentina Herrera Ruiz", categoria: "Sub-15", camiseta: 8, posicion: "Mediocampista", pieHabil: "Izquierdo", telefono: "3006667788", correo: "papa.herrera@correo.com", documento: "1102345676", fechaNacimiento: "2011-11-14", talla: "M", colegio: "IE Tenerife", estado: "Activo", pagoValor: 70000, pagoProximo: fechaIso(5), historialPagosSocio: [{ fecha: fechaIso(-18), valor: 70000 }], entrenamientosAsistidos: 22, entrenamientosProgramados: 26, creado: tsHace(300) },
    { id: "s7", nombre: "Emmanuel Castro Vega", categoria: "Sub-8", camiseta: 1, posicion: "Portero", pieHabil: "Derecho", acudiente: "Rosa Vega", telefono: "3007778899", correo: "", documento: "1102345677", fechaNacimiento: "2018-02-17", talla: "6", colegio: "Jardín Los Angelitos", estado: "Activo", pagoValor: 50000, pagoProximo: fechaIso(18), historialPagosSocio: [{ fecha: fechaIso(-4), valor: 50000 }], entrenamientosAsistidos: 8, entrenamientosProgramados: 9, creado: tsHace(60) },
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

  demoSeedColeccion(base + "/gastos", [
    { id: "g1", concepto: "Arriendo cancha municipal", categoria: "Arriendo y sede", valor: 150000, fecha: fechaIso(-16), notas: "" },
    { id: "g2", concepto: "Balones y petos de entrenamiento", categoria: "Implementos y uniformes", valor: 70000, fecha: fechaIso(-10), notas: "" },
    { id: "g3", concepto: "Arbitraje jornada Sub-12", categoria: "Arbitraje y torneos", valor: 40000, fecha: fechaIso(-5), notas: "" },
    { id: "g4", concepto: "Transporte a partido fuera de casa", categoria: "Transporte", valor: 25000, fecha: fechaIso(-2), notas: "" }
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

  demoReescalarMoneda();
})();
