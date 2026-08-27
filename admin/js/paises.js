// ── Países donde opera BioFutbol ──
// Hoy la base de clientes es 100% colombiana, por eso queda como
// selección por defecto, pero el listado ya cubre Centro y Suramérica
// pensando en la expansión regional.
const PAISES = [
  "Colombia",
  "Venezuela", "Ecuador", "Perú", "Bolivia", "Chile", "Argentina", "Uruguay", "Paraguay", "Brasil",
  "Panamá", "Costa Rica", "Nicaragua", "Honduras", "El Salvador", "Guatemala",
  "Otro"
];

function llenarSelectPaises(select, seleccionado) {
  select.innerHTML = PAISES.map(function (p) { return '<option value="' + p + '">' + p + '</option>'; }).join("");
  select.value = seleccionado && PAISES.indexOf(seleccionado) !== -1 ? seleccionado : "Colombia";
}
