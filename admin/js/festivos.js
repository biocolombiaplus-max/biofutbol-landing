// ── FESTIVOS DE COLOMBIA ──
// Calcula los 18 días festivos de Colombia para un año dado, aplicando la
// Ley Emiliani (varios festivos se trasladan al lunes siguiente si no caen
// en lunes). La Pascua se calcula con el algoritmo de Gauss/Meeus.

function festivosPascua(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function festivosMoverALunes(fecha) {
  const dow = fecha.getDay(); // 0=domingo..6=sábado
  const add = (8 - dow) % 7;
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + add);
  return nueva;
}

function festivosSumarDias(fecha, dias) {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
}

const _festivosCache = {};

function festivosColombia(year) {
  if (_festivosCache[year]) return _festivosCache[year];
  const pascua = festivosPascua(year);
  const lista = [
    { fecha: new Date(year, 0, 1), nombre: "Año Nuevo" },
    { fecha: festivosMoverALunes(new Date(year, 0, 6)), nombre: "Día de los Reyes Magos" },
    { fecha: festivosMoverALunes(new Date(year, 2, 19)), nombre: "Día de San José" },
    { fecha: festivosSumarDias(pascua, -3), nombre: "Jueves Santo" },
    { fecha: festivosSumarDias(pascua, -2), nombre: "Viernes Santo" },
    { fecha: new Date(year, 4, 1), nombre: "Día del Trabajo" },
    { fecha: festivosMoverALunes(festivosSumarDias(pascua, 39)), nombre: "Ascensión del Señor" },
    { fecha: festivosMoverALunes(festivosSumarDias(pascua, 60)), nombre: "Corpus Christi" },
    { fecha: festivosMoverALunes(festivosSumarDias(pascua, 68)), nombre: "Sagrado Corazón" },
    { fecha: festivosMoverALunes(new Date(year, 5, 29)), nombre: "San Pedro y San Pablo" },
    { fecha: new Date(year, 6, 20), nombre: "Día de la Independencia" },
    { fecha: new Date(year, 7, 7), nombre: "Batalla de Boyacá" },
    { fecha: festivosMoverALunes(new Date(year, 7, 15)), nombre: "Asunción de la Virgen" },
    { fecha: festivosMoverALunes(new Date(year, 9, 12)), nombre: "Día de la Raza" },
    { fecha: festivosMoverALunes(new Date(year, 10, 1)), nombre: "Todos los Santos" },
    { fecha: festivosMoverALunes(new Date(year, 10, 11)), nombre: "Independencia de Cartagena" },
    { fecha: new Date(year, 11, 8), nombre: "Inmaculada Concepción" },
    { fecha: new Date(year, 11, 25), nombre: "Navidad" }
  ];
  _festivosCache[year] = lista;
  return lista;
}

function festivosFechaAISO(fecha) {
  const y = fecha.getFullYear(), m = String(fecha.getMonth() + 1).padStart(2, "0"), d = String(fecha.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

// Devuelve el nombre del festivo si la fecha dada es festivo en Colombia,
// o null si no lo es.
function festivoColombiaEn(fecha) {
  const iso = festivosFechaAISO(fecha);
  const lista = festivosColombia(fecha.getFullYear());
  const encontrado = lista.find(function (f) { return festivosFechaAISO(f.fecha) === iso; });
  return encontrado ? encontrado.nombre : null;
}
