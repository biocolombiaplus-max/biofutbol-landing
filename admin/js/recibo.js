// ── GENERADOR DE RECIBOS DE PAGO (PDF) ── reutilizable para:
// (a) el pago del club a BioFutbol, (b) el pago de un socio a su club.
// Requiere jsPDF ya cargado (window.jspdf).

function reciboHexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "18A83A");
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 24, g: 168, b: 58 };
}

function reciboNumero() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return "BF-" + n;
}

// opts = {
//   emisorNombre, emisorLogoUrl, colorPrimario,
//   pagadorNombre, pagadorDoc (NIT/documento, opcional),
//   concepto, valor, fecha (Date), numSocios (opcional, número),
//   notaPie (opcional)
// }
// Devuelve el objeto jsPDF (doc) ya armado — el llamador decide si
// hace doc.save(), doc.output("blob"), etc.
function generarReciboPDF(opts) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: [340, opts.numSocios ? 520 : 490] });
  const W = 340;
  const rgb = reciboHexToRgb(opts.colorPrimario);
  const numero = reciboNumero();
  const fecha = opts.fecha || new Date();

  // Encabezado
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 0, W, 86, "F");
  doc.setFillColor(Math.max(rgb.r - 25, 0), Math.max(rgb.g - 25, 0), Math.max(rgb.b - 25, 0));
  doc.rect(0, 82, W, 4, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(255, 255, 255);
  doc.text(opts.emisorNombre || "BioFutbol", W / 2, 40, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text("RECIBO DE PAGO", W / 2, 58, { align: "center" });
  doc.setFontSize(8); doc.setTextColor(255, 255, 255);
  doc.text("N.° " + numero, W / 2, 72, { align: "center" });

  let y = 116;
  doc.setTextColor(30, 30, 30);

  function row(label, value) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(130, 130, 130);
    doc.text(label.toUpperCase(), 28, y);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12.5); doc.setTextColor(25, 25, 25);
    const lines = doc.splitTextToSize(String(value), W - 56);
    lines.forEach(function (line, i) { doc.text(line, 28, y + 16 + i * 15); });
    y += 34 + Math.max(0, lines.length - 1) * 15;
  }

  row("Recibido de", opts.pagadorNombre || "—");
  if (opts.pagadorDoc) row("Documento / NIT", opts.pagadorDoc);
  row("Concepto", opts.concepto || "—");
  if (opts.numSocios) row("Número de socios/deportistas", String(opts.numSocios));
  row("Fecha de pago", fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }));

  y += 4;
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.roundedRect(28, y, W - 56, 54, 8, 8, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
  doc.text("VALOR PAGADO", 40, y + 20);
  doc.setFontSize(19);
  doc.text(formatCOPRecibo(opts.valor), 40, y + 42);
  y += 54 + 24;

  doc.setDrawColor(225, 225, 225); doc.line(28, y, W - 28, y); y += 18;
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.6); doc.setTextColor(150, 150, 150);
  const nota = opts.notaPie || "Este recibo es soporte del pago realizado. Consérvalo para tu control.";
  doc.splitTextToSize(nota, W - 56).forEach(function (line) { doc.text(line, W / 2, y, { align: "center" }); y += 11; });
  doc.setFontSize(7); doc.text("Generado con BioFutbol", W / 2, y + 6, { align: "center" });

  return doc;
}

function formatCOPRecibo(n) {
  return "$" + Number(n || 0).toLocaleString("es-CO");
}

// Sube el PDF a Cloudinary y devuelve la URL (requiere cloudinary-config.js)
function subirReciboPDF(doc, nombreArchivo) {
  const blob = doc.output("blob");
  return subirACloudinary(blob, "recibos", nombreArchivo);
}
