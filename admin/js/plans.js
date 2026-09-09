// Planes de BioFutbol — deben coincidir siempre con los precios publicados en la landing.
// Catálogo para Colombia: precio por socio/mes en pesos + implementación
// única. Se mantiene la llave "mas1000" por compatibilidad con clientes ya
// guardados con ese plan, aunque el rango real ahora arranca en 501.
const PLANES = {
  hasta100: { label: "Hasta 100 socios", implementacion: 350000, mensual: 2500 },
  "101-200": { label: "101 a 200 socios", implementacion: 450000, mensual: 2000 },
  "201-500": { label: "201 a 500 socios", implementacion: 490000, mensual: 1500 },
  mas1000: { label: "Más de 500 socios", implementacion: 750000, mensual: 1000 }
};

// Catálogo para clubes fuera de Colombia: valor FIJO mensual en dólares (no
// se multiplica por socios, ni lleva implementación). Es un precio de
// lanzamiento, pensado para los primeros 10 clubes internacionales — pero
// el sistema no bloquea a nadie después de esos 10, solo lo muestra como
// referencia en el panel del súper-admin (ver contadorClubesIntl en
// cliente.html). Llaves con prefijo "intl_" para que nunca choquen con las
// de PLANES, aunque un club cambie de país después de elegir plan.
const PLANES_INTL = {
  intl_hasta50: { label: "Hasta 50 deportistas", mensualUSD: 30 },
  intl_51_100: { label: "51 a 100 deportistas", mensualUSD: 50 },
  intl_101_200: { label: "101 a 200 deportistas", mensualUSD: 70 },
  intl_201_500: { label: "201 a 500 deportistas", mensualUSD: 95 },
  intl_mas500: { label: "Más de 500 deportistas", mensualUSD: 120 }
};

// Los dos catálogos juntos, para cuando solo se necesita mostrar el label
// de un plan ya guardado (sin importar el catálogo al que pertenezca).
const PLANES_TODOS = Object.assign({}, PLANES, PLANES_INTL);

function formatCOP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CO");
}

function esColombiaPais(pais) {
  return !pais || pais === "Colombia";
}

// El catálogo de planes que corresponde a un país: PLANES (Colombia, COP,
// por socio) o PLANES_INTL (resto de países, USD, fijo).
function catalogoPlanes(pais) {
  return esColombiaPais(pais) ? PLANES : PLANES_INTL;
}

// Texto del valor mensual de un plan, según el país del club: en Colombia
// sigue siendo un valor fijo por socio en pesos; en cualquier otro país es
// un valor FIJO total al mes en dólares (no se multiplica por socios), con
// el equivalente aproximado en la moneda local si aplica.
function planPrecioMensualTexto(plan, pais) {
  if (esColombiaPais(pais)) return formatCOP(plan.mensual) + "/socio/mes";
  let texto = "$" + plan.mensualUSD + " USD/mes";
  if (typeof monedaDePais === "function" && typeof equivalenteUsdEnMoneda === "function") {
    const equiv = equivalenteUsdEnMoneda(plan.mensualUSD, monedaDePais(pais));
    if (equiv) texto += " (≈ " + equiv + ")";
  }
  return texto;
}

function formatFecha(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function diasHasta(ts) {
  if (!ts) return null;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const hoy = new Date();
  d.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);
  return Math.round((d - hoy) / 86400000);
}

// Genera un usuario sugerido a partir del nombre del club, ej: "Halcones FC" -> "halcones.fc"
function generarUsuarioApp(nombreClub) {
  const base = (nombreClub || "club")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // quita tildes
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");
  const sufijo = Math.floor(100 + Math.random() * 900);
  return (base || "club") + "." + sufijo;
}

// Genera una clave temporal legible, ej: "BF-7K2P9Q"
function generarClaveApp() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return "BF-" + out;
}

// Valor real a cobrarle a un socio: $0 si está becado; si no, su propio
// valor (el admin lo puede dejar distinto a la mensualidad estándar del
// club, por ejemplo con un descuento por hermanos) o, si no tiene uno
// propio, la mensualidad estándar del club.
function valorCobroSocio(socio, club) {
  if (socio && socio.becado) return 0;
  return (socio && socio.pagoValor) || (club && club.pagoMensualidad) || 0;
}

// Devuelve { texto, clase } para pintar el estado de pago de un cliente
function estadoPago(cliente) {
  if (cliente.estado === "pendiente") return { texto: "Registro pendiente", clase: "muted" };
  if (cliente.estado === "inactivo") return { texto: "Inactivo", clase: "muted" };
  const dias = diasHasta(cliente.proximoPago);
  if (dias === null) return { texto: "Sin definir", clase: "muted" };
  if (dias < 0) return { texto: `Vencido hace ${Math.abs(dias)}d`, clase: "bad" };
  if (dias <= 5) return { texto: `Vence en ${dias}d`, clase: "warn" };
  return { texto: `Al día (${dias}d)`, clase: "ok" };
}
