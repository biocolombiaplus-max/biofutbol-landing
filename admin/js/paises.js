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

// ── Moneda, indicativo de WhatsApp y bancos comunes por país ──
// Todo lo que el club le cobra a SUS socios (mensualidad, recibos,
// informes, uniformes) usa esto — la facturación de BioFutbol al club
// (PLANES, en plans.js) siempre queda en pesos colombianos, es un negocio
// aparte. "Otro" queda sin indicativo/bancos fijos para que el club los
// escriba a mano.
const PAISES_INFO = {
  "Colombia": { indicativo: "57", moneda: "COP", bancos: ["Bancolombia", "Davivienda", "BBVA Colombia", "Banco de Bogotá", "Banco de Occidente", "Banco Popular", "Banco AV Villas", "Banco Caja Social", "Banco Agrario", "Scotiabank Colpatria", "Itaú", "Banco Falabella", "Bancoomeva", "Confiar Cooperativa"] },
  "Venezuela": { indicativo: "58", moneda: "VES", bancos: ["Banco de Venezuela", "Banesco", "Mercantil Banco", "BBVA Provincial", "Banco Bicentenario", "Banco del Tesoro", "Bancaribe", "BOD (Banco Occidental de Descuento)"] },
  "Ecuador": { indicativo: "593", moneda: "USD", bancos: ["Banco Pichincha", "Banco Guayaquil", "Produbanco", "Banco del Pacífico", "Banco Bolivariano", "Banco Internacional", "Cooperativa JEP"] },
  "Perú": { indicativo: "51", moneda: "PEN", bancos: ["BCP (Banco de Crédito del Perú)", "BBVA Perú", "Interbank", "Scotiabank Perú", "Banco de la Nación", "BanBif", "Banco Pichincha Perú"] },
  "Bolivia": { indicativo: "591", moneda: "BOB", bancos: ["Banco Unión", "Banco Nacional de Bolivia", "Banco Mercantil Santa Cruz", "Banco Bisa", "Banco Ganadero", "Banco Fassil", "Banco Económico"] },
  "Chile": { indicativo: "56", moneda: "CLP", bancos: ["Banco de Chile", "BancoEstado", "Banco Santander Chile", "BCI", "Scotiabank Chile", "Banco Falabella", "Banco Itaú Chile"] },
  "Argentina": { indicativo: "54", moneda: "ARS", bancos: ["Banco Nación", "Banco Provincia", "Banco Galicia", "Banco Santander Río", "BBVA Argentina", "Banco Macro", "Mercado Pago (cuenta virtual)"] },
  "Uruguay": { indicativo: "598", moneda: "UYU", bancos: ["BROU (Banco República)", "Santander Uruguay", "BBVA Uruguay", "Itaú Uruguay", "Scotiabank Uruguay", "HSBC Uruguay"] },
  "Paraguay": { indicativo: "595", moneda: "PYG", bancos: ["Banco Nacional de Fomento", "Banco Continental", "Itaú Paraguay", "Banco GNB Paraguay", "Sudameris Bank", "Banco Familiar"] },
  "Brasil": { indicativo: "55", moneda: "BRL", bancos: ["Banco do Brasil", "Itaú Unibanco", "Bradesco", "Caixa Econômica Federal", "Santander Brasil", "Nubank"] },
  "Panamá": { indicativo: "507", moneda: "USD", bancos: ["Banco General", "Banistmo", "BAC Credomatic Panamá", "Banco Nacional de Panamá", "Global Bank", "Scotiabank Panamá"] },
  "Costa Rica": { indicativo: "506", moneda: "CRC", bancos: ["Banco Nacional de Costa Rica", "Banco de Costa Rica", "BAC Credomatic", "Banco Popular", "Scotiabank Costa Rica"] },
  "Nicaragua": { indicativo: "505", moneda: "NIO", bancos: ["Banpro", "BAC Credomatic Nicaragua", "Banco Lafise Bancentro", "Ficohsa Nicaragua"] },
  "Honduras": { indicativo: "504", moneda: "HNL", bancos: ["Banco Atlántida", "BAC Credomatic Honduras", "Banco Ficohsa", "Banco de Occidente Honduras", "Banpaís"] },
  "El Salvador": { indicativo: "503", moneda: "USD", bancos: ["Banco Agrícola", "BAC Credomatic El Salvador", "Banco Davivienda Salvador", "Banco Promerica", "Scotiabank El Salvador"] },
  "Guatemala": { indicativo: "502", moneda: "GTQ", bancos: ["Banco Industrial", "Banrural", "BAC Credomatic Guatemala", "Banco G&T Continental", "Banco Promerica Guatemala"] },
  "Otro": { indicativo: "", moneda: "USD", bancos: [] }
};

function paisInfo(pais) {
  return PAISES_INFO[pais] || PAISES_INFO["Colombia"];
}
function indicativoDePais(pais) { return paisInfo(pais).indicativo; }
function monedaDePais(pais) { return paisInfo(pais).moneda; }
function bancosDePais(pais) { return paisInfo(pais).bancos; }

// Monedas que se pueden elegir a mano (por si el club cobra en una
// distinta a la de su país — dolarización informal, etc.)
const MONEDAS = [
  { code: "COP", label: "Peso colombiano (COP)" },
  { code: "USD", label: "Dólar estadounidense (USD)" },
  { code: "VES", label: "Bolívar venezolano (VES)" },
  { code: "PEN", label: "Sol peruano (PEN)" },
  { code: "BOB", label: "Boliviano (BOB)" },
  { code: "CLP", label: "Peso chileno (CLP)" },
  { code: "ARS", label: "Peso argentino (ARS)" },
  { code: "UYU", label: "Peso uruguayo (UYU)" },
  { code: "PYG", label: "Guaraní paraguayo (PYG)" },
  { code: "BRL", label: "Real brasileño (BRL)" },
  { code: "CRC", label: "Colón costarricense (CRC)" },
  { code: "NIO", label: "Córdoba nicaragüense (NIO)" },
  { code: "HNL", label: "Lempira hondureño (HNL)" },
  { code: "GTQ", label: "Quetzal guatemalteco (GTQ)" }
];

const MONEDA_LOCALE = {
  COP: "es-CO", USD: "es-US", VES: "es-VE", PEN: "es-PE", BOB: "es-BO",
  CLP: "es-CL", ARS: "es-AR", UYU: "es-UY", PYG: "es-PY", BRL: "pt-BR",
  CRC: "es-CR", NIO: "es-NI", HNL: "es-HN", GTQ: "es-GT"
};

// Tasas de referencia APROXIMADAS (unidades de moneda local por 1 USD),
// solo para mostrar al club un equivalente informativo junto al precio real
// en dólares de los planes de BioFutbol — nunca se usan para cobrar. Se
// deben revisar y actualizar de vez en cuando a mano.
const TASA_USD_APROX = {
  COP: 4000, ARS: 1000, VES: 40, PEN: 3.8, BOB: 6.9, CLP: 950,
  UYU: 40, PYG: 7300, BRL: 5.5, CRC: 520, NIO: 36.7, HNL: 24.7, GTQ: 7.7
};

// Devuelve el equivalente aproximado de un valor en USD, formateado en la
// moneda local dada — o null si la moneda ya es USD o no hay tasa cargada.
function equivalenteUsdEnMoneda(valorUsd, moneda) {
  if (!moneda || moneda === "USD") return null;
  const tasa = TASA_USD_APROX[moneda];
  if (!tasa) return null;
  return formatMoneda(valorUsd * tasa, moneda);
}

function llenarSelectMonedas(select, seleccionada) {
  select.innerHTML = MONEDAS.map(function (m) { return '<option value="' + m.code + '">' + m.label + '</option>'; }).join("");
  select.value = seleccionada && MONEDAS.some(function (m) { return m.code === seleccionada; }) ? seleccionada : "COP";
}

// Formateador único de dinero para toda la app — reemplaza los 4
// formatCOP/formatCOPPortal/formatCOPRecibo/informeFormatCOP que había
// sueltos y duplicados. Sin moneda (clubes viejos, sin país configurado)
// se comporta exactamente igual que antes: pesos colombianos.
function formatMoneda(valor, moneda) {
  const code = moneda || "COP";
  const locale = MONEDA_LOCALE[code] || "es-CO";
  try {
    // Sin espacio entre el símbolo y el número (Intl mete uno de por
    // medio) para que se vea igual de compacto que el resto de la app.
    return new Intl.NumberFormat(locale, { style: "currency", currency: code, maximumFractionDigits: 0 }).format(Number(valor) || 0).replace(/\s/g, "");
  } catch (e) {
    return "$" + Number(valor || 0).toLocaleString("es-CO");
  }
}

// ── Teléfono con indicativo automático ──
// El campo de WhatsApp deja de pedirle a la persona que escriba el
// indicativo de memoria: se muestra fijo (según el país del club) y ella
// solo escribe su número local. Lo guardado sigue siendo el número
// completo de siempre (indicativo + local pegados), así que es 100%
// compatible con todos los números ya guardados antes de este cambio.
function soloDigitos(s) {
  return String(s || "").replace(/[^0-9]/g, "");
}

// Un número local típico en la región tiene entre 6 y 10 dígitos.
function numeroLocalValido(numeroLocal) {
  const d = soloDigitos(numeroLocal);
  return d.length >= 6 && d.length <= 10;
}

function numeroCompleto(indicativo, numeroLocal) {
  return soloDigitos(indicativo) + soloDigitos(numeroLocal);
}

// Prepara un <div class="tel-input-wrap"> (con un <span class="tel-indicativo">
// y un <input>) para que muestre el indicativo del país dado.
function iniciarInputTelefono(wrapEl, pais) {
  const indicativo = indicativoDePais(pais);
  wrapEl.dataset.indicativo = indicativo;
  const span = wrapEl.querySelector(".tel-indicativo");
  if (span) span.textContent = indicativo ? "+" + indicativo : "+__";
}

// Carga un número YA guardado (completo, con indicativo pegado) en el
// input, mostrando solo la parte local — si el indicativo no coincide
// (número de otro país, o dato viejo raro), deja el número completo tal
// cual para no perder el dato.
function cargarTelefonoEnInput(wrapEl, valorCompleto) {
  const indicativo = wrapEl.dataset.indicativo || "";
  const input = wrapEl.querySelector("input");
  const digits = soloDigitos(valorCompleto);
  if (!input) return;
  if (indicativo && digits.indexOf(indicativo) === 0 && digits.length - indicativo.length >= 6) {
    input.value = digits.slice(indicativo.length);
  } else {
    input.value = digits;
  }
}

// Devuelve el número completo (indicativo + local) listo para guardar o
// para armar un link de wa.me. Si el campo local quedó vacío (típico en
// campos opcionales, como el teléfono de emergencia) devuelve "" en vez
// de guardar el indicativo solo, que no es un número real.
function leerTelefonoDeInput(wrapEl) {
  const indicativo = wrapEl.dataset.indicativo || "";
  const input = wrapEl.querySelector("input");
  const local = soloDigitos(input ? input.value : "");
  return local ? indicativo + local : "";
}

// Marca el campo en rojo (y opcionalmente muestra un mensajito) apenas el
// número local no tiene una cantidad razonable de dígitos — así el club
// se da cuenta al momento, antes de guardar o de intentar escribirle a
// alguien por WhatsApp con un número incompleto.
function wireValidacionTelefono(wrapEl, hintEl) {
  const input = wrapEl.querySelector("input");
  if (!input) return;
  function validar() {
    const vacio = !soloDigitos(input.value);
    const valido = vacio || numeroLocalValido(input.value);
    wrapEl.classList.toggle("invalid", !valido);
    if (hintEl) hintEl.style.display = valido ? "none" : "block";
  }
  input.addEventListener("input", validar);
  input.addEventListener("blur", validar);
}
