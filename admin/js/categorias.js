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

function llenarSelectCategorias(select, incluirOtra) {
  select.innerHTML = '<option value="">Selecciona...</option>' +
    CATEGORIAS_FUTBOL.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join("") +
    (incluirOtra ? '<option value="__otra__">Otra (escribir)</option>' : "");
}

// Para ordenar listas por categoría en el orden natural del fútbol
// formativo (Sub-6, Sub-7... Mayores) en vez de alfabético.
function ordenCategoria(categoria) {
  const i = CATEGORIAS_FUTBOL.indexOf(categoria);
  return i === -1 ? 999 : i;
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
