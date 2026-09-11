// ── CATEGORÍAS DE FÚTBOL FORMATIVO ──
// Estándar usado por ligas y escuelas: la categoría se calcula por el año
// de nacimiento (año en curso menos año de nacimiento), no por la edad
// exacta en días — así es como se arman las categorías en el fútbol
// profesional y formativo colombiano.

const CATEGORIAS_FUTBOL = [
  "Sub-6", "Sub-7", "Sub-8", "Sub-9", "Sub-10", "Sub-11", "Sub-12", "Sub-13",
  "Sub-14", "Sub-15", "Sub-16", "Sub-17", "Sub-18", "Sub-20", "Sub-23", "Mayores"
];

function categoriaPorFechaNacimiento(fechaNacimiento) {
  if (!fechaNacimiento) return "";
  const nacimiento = new Date(fechaNacimiento + "T12:00:00");
  if (isNaN(nacimiento.getTime())) return "";
  const edad = new Date().getFullYear() - nacimiento.getFullYear();
  if (edad <= 6) return "Sub-6";
  if (edad <= 17) return "Sub-" + edad;
  if (edad <= 20) return "Sub-20";
  if (edad <= 23) return "Sub-23";
  return "Mayores";
}

// Combina las categorías estándar con las personalizadas que cada club
// puede agregar (ej: "Iniciación", "Cebollitas", "Baby") desde Mi club.
// baseOverride: si el club editó o eliminó alguna de las 16 estándar
// (clubActual.categoriasEstandar), esa lista reemplaza a CATEGORIAS_FUTBOL
// como base — si no, se usan las 16 de siempre, sin tocar nada.
function categoriasBase(baseOverride) {
  return Array.isArray(baseOverride) && baseOverride.length ? baseOverride : CATEGORIAS_FUTBOL;
}

function categoriasConPersonalizadas(extra, baseOverride) {
  const propias = Array.isArray(extra) ? extra.filter(Boolean) : [];
  return categoriasBase(baseOverride).concat(propias);
}

function llenarSelectCategorias(select, incluirOtra, extra, baseOverride) {
  select.innerHTML = '<option value="">Selecciona...</option>' +
    categoriasConPersonalizadas(extra, baseOverride).map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join("") +
    (incluirOtra ? '<option value="__otra__">Otra (escribir)</option>' : "");
}

// Para ordenar listas por categoría en el orden natural del fútbol
// formativo (Sub-6, Sub-7... Mayores) en vez de alfabético. Las
// categorías personalizadas del club quedan al final, en el orden en que
// se agregaron.
function ordenCategoria(categoria, extra, baseOverride) {
  const base = categoriasBase(baseOverride);
  const i = base.indexOf(categoria);
  if (i !== -1) return i;
  const propias = Array.isArray(extra) ? extra : [];
  const j = propias.indexOf(categoria);
  return j === -1 ? 999 : base.length + j;
}

// ── Color por categoría ──
// Cada categoría siempre se ve del mismo color en todo el panel (admin y
// profesores) — así se reconoce de un vistazo quién es de qué categoría,
// sin tener que leer el texto cada vez. Las 16 estándar usan la paleta en
// orden fijo; las personalizadas del club siguen después, y cualquier otra
// (por ejemplo texto libre escrito a mano) cae en un color estable
// calculado con un hash simple de su nombre.
const CATEGORIA_COLORES = [
  { hex: "#18A83A", bg: "rgba(24,168,58,.16)" },
  { hex: "#2563eb", bg: "rgba(37,99,235,.16)" },
  { hex: "#d6249f", bg: "rgba(214,36,159,.16)" },
  { hex: "#f59e0b", bg: "rgba(245,158,11,.16)" },
  { hex: "#dc2626", bg: "rgba(220,38,38,.16)" },
  { hex: "#0ea5a0", bg: "rgba(14,165,160,.16)" },
  { hex: "#7c3aed", bg: "rgba(124,58,237,.16)" },
  { hex: "#e11d48", bg: "rgba(225,29,72,.16)" },
  { hex: "#0891b2", bg: "rgba(8,145,178,.16)" },
  { hex: "#65a30d", bg: "rgba(101,163,13,.16)" },
  { hex: "#c026d3", bg: "rgba(192,38,211,.16)" },
  { hex: "#ea580c", bg: "rgba(234,88,12,.16)" }
];

function colorCategoria(categoria, extra, baseOverride) {
  const i = ordenCategoria(categoria, extra, baseOverride);
  if (i !== 999) return CATEGORIA_COLORES[i % CATEGORIA_COLORES.length];
  let hash = 0;
  for (let k = 0; k < categoria.length; k++) hash = (hash * 31 + categoria.charCodeAt(k)) >>> 0;
  return CATEGORIA_COLORES[hash % CATEGORIA_COLORES.length];
}

function categoriaEsc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
  });
}

// Etiqueta con "punto" de color — el gatillo visual para reconocer cada
// categoría de un vistazo. extra/baseOverride: mismos parámetros que
// ordenCategoria, para que el color coincida con las categorías propias
// de cada club.
function chipCategoria(categoria, extra, baseOverride) {
  if (!categoria) return '<span class="cat-chip-dot muted"><i></i>Sin categoría</span>';
  const c = colorCategoria(categoria, extra, baseOverride);
  return '<span class="cat-chip-dot" style="background:' + c.bg + ';color:' + c.hex + '"><i style="background:' + c.hex + '"></i>' + categoriaEsc(categoria) + '</span>';
}

// Conecta un <input type="date"> de fecha de nacimiento con un <select> de
// categoría: al elegir la fecha, sugiere y preselecciona la categoría
// estándar, pero si el administrador la cambia a mano, deja de tocarla.
function wireCategoriaAutomatica(fechaInputEl, categoriaSelectEl) {
  let tocadaManualmente = false;
  categoriaSelectEl.addEventListener("change", function () { tocadaManualmente = true; });
  fechaInputEl.addEventListener("change", function () {
    if (tocadaManualmente) return;
    const sugerida = categoriaPorFechaNacimiento(fechaInputEl.value);
    if (sugerida) categoriaSelectEl.value = sugerida;
  });
}
