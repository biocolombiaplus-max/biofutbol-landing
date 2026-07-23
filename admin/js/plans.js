// Planes de BioFutbol — deben coincidir siempre con los precios publicados en la landing.
const PLANES = {
  hasta100: { label: "Hasta 100 socios", implementacion: 350000, mensual: 4000 },
  "101-200": { label: "101 a 200 socios", implementacion: 450000, mensual: 3000 },
  "201-500": { label: "201 a 500 socios", implementacion: 490000, mensual: 2500 },
  mas1000: { label: "Más de 1.000 socios", implementacion: 750000, mensual: 2000 }
};

function formatCOP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CO");
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
