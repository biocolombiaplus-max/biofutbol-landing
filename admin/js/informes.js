// ── INFORMES / REPORTES EN PDF ──
// Requiere jsPDF ya cargado (window.jspdf).

function informeFormatCOP(n) { return "$" + Number(n || 0).toLocaleString("es-CO"); }

function informeEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const n = new Date(fechaNacimiento + "T12:00:00");
  if (isNaN(n.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - n.getFullYear();
  const m = hoy.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--;
  return edad;
}

function informeTruncar(doc, texto, maxWidth) {
  texto = String(texto == null ? "—" : texto);
  if (doc.getTextWidth(texto) <= maxWidth) return texto;
  while (texto.length > 1 && doc.getTextWidth(texto + "…") > maxWidth) texto = texto.slice(0, -1);
  return texto + "…";
}

// Encabezado navy con nombre del club a la izquierda y título/subtítulo del
// reporte a la derecha. Devuelve el "y" donde puede empezar el contenido.
function informeEncabezado(doc, opts) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = opts.margin;
  doc.setFillColor(11, 22, 38);
  doc.rect(0, 0, pageWidth, 92, "F");
  doc.setFillColor(24, 168, 58);
  doc.rect(0, 88, pageWidth, 4, "F");

  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(255, 255, 255);
  doc.text((opts.club && opts.club.clubNombre) || "Mi club", margin, 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(200, 200, 200);
  doc.text("Gestionado con BioFutbol", margin, 50);

  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
  doc.text(opts.titulo, pageWidth - margin, 34, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(200, 200, 200);
  doc.text(opts.subtitulo || "", pageWidth - margin, 50, { align: "right" });
  const generado = "Generado el " + new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(generado, pageWidth - margin, 64, { align: "right" });

  return 116;
}

function informePie(doc, opts) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = opts.margin;
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(225, 225, 225); doc.setLineWidth(0.6);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(140, 140, 140);
    doc.text(((opts.club && opts.club.clubNombre) || "BioFutbol") + " · " + opts.titulo, margin, pageHeight - 28);
    doc.text("Página " + p + " de " + total, pageWidth - margin, pageHeight - 28, { align: "right" });
  }
}

// Dibuja una tabla con encabezado navy y filas con sombreado alterno,
// repitiendo el encabezado cuando pasa a una página nueva. Devuelve el "y"
// donde quedó el cursor al terminar.
function informeTabla(doc, opts) {
  let y = opts.y;
  const pageWidth = doc.internal.pageSize.getWidth();
  const rowH = 22;

  function dibujarEncabezado() {
    doc.setFillColor(11, 22, 38);
    doc.rect(opts.margin, y, pageWidth - opts.margin * 2, rowH, "F");
    let x = opts.margin + 8;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.4); doc.setTextColor(255, 255, 255);
    opts.columnas.forEach(function (c) {
      doc.text(c.label, c.align === "right" ? x + c.w - 8 : x, y + 14, { align: c.align === "right" ? "right" : "left" });
      x += c.w;
    });
    y += rowH;
  }

  dibujarEncabezado();
  opts.filas.forEach(function (fila, i) {
    if (y + rowH > opts.pageHeight - opts.margin - 40) {
      doc.addPage();
      y = opts.margin;
      dibujarEncabezado();
    }
    if (i % 2 === 0) { doc.setFillColor(244, 247, 245); doc.rect(opts.margin, y, pageWidth - opts.margin * 2, rowH, "F"); }
    let x = opts.margin + 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.2); doc.setTextColor(40, 40, 40);
    fila.forEach(function (val, ci) {
      const c = opts.columnas[ci];
      const txt = informeTruncar(doc, val, c.w - 12);
      doc.text(txt, c.align === "right" ? x + c.w - 8 : x, y + 14, { align: c.align === "right" ? "right" : "left" });
      x += c.w;
    });
    y += rowH;
  });
  return y;
}

// datos = { club, filtroTexto, totalSocios, grupos: [{ categoria, socios: [...] }] }
function generarReporteJugadoresPDF(datos) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = informeEncabezado(doc, { club: datos.club, margin: margin, titulo: "REPORTE DE JUGADORES", subtitulo: datos.filtroTexto || "Todos los jugadores" });

  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(11, 22, 38);
  doc.text(datos.totalSocios + " jugador" + (datos.totalSocios === 1 ? "" : "es") + " en " + datos.grupos.length + " categoría" + (datos.grupos.length === 1 ? "" : "s"), margin, y);
  y += 24;

  if (!datos.grupos.length) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(120, 120, 120);
    doc.text("No hay jugadores que coincidan con este filtro.", margin, y + 10);
  }

  const colTelDoc = [
    { label: "NOMBRE", w: 148 },
    { label: "DOCUMENTO", w: 78 },
    { label: "EDAD", w: 40, align: "right" },
    { label: "TELÉFONO", w: 88 },
    { label: "TALLA", w: 46 },
    { label: "COLEGIO", w: pageWidth - margin * 2 - (148 + 78 + 40 + 88 + 46) }
  ];

  datos.grupos.forEach(function (g) {
    if (y + 50 > pageHeight - margin - 40) { doc.addPage(); y = margin; }
    doc.setFillColor(24, 168, 58);
    doc.roundedRect(margin, y, 220, 24, 5, 5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(255, 255, 255);
    doc.text(g.categoria + " · " + g.socios.length + (g.socios.length === 1 ? " jugador" : " jugadores"), margin + 12, y + 16);
    y += 34;

    const filas = g.socios.map(function (s) {
      const edad = informeEdad(s.fechaNacimiento);
      return [s.nombre || "Sin nombre", s.documento || "—", edad != null ? edad + " a." : "—", s.telefono || "—", s.talla || "—", s.colegio || "—"];
    });
    y = informeTabla(doc, { y: y, margin: margin, pageHeight: pageHeight, columnas: colTelDoc, filas: filas });
    y += 26;
  });

  informePie(doc, { club: datos.club, margin: margin, titulo: "Reporte de jugadores" });
  return doc;
}

// datos = { club, filtroTexto, resumen: {totalEsperado, totalMorosos, totalPendiente}, filas: [{nombre,categoria,telefono,valor,vence,estadoTexto}] }
function generarReporteCarteraPDF(datos) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = informeEncabezado(doc, { club: datos.club, margin: margin, titulo: "REPORTE DE CARTERA", subtitulo: datos.filtroTexto || "Todos los socios" });

  const cardW = (pageWidth - margin * 2 - 24) / 3;
  const cards = [
    { label: "TOTAL ESPERADO", valor: informeFormatCOP(datos.resumen.totalEsperado), color: [11, 22, 38] },
    { label: "SOCIOS EN MORA", valor: String(datos.resumen.totalMorosos), color: [180, 45, 45] },
    { label: "PENDIENTE POR COBRAR", valor: informeFormatCOP(datos.resumen.totalPendiente), color: [24, 168, 58] }
  ];
  cards.forEach(function (c, i) {
    const x = margin + i * (cardW + 12);
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.roundedRect(x, y, cardW, 56, 7, 7, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
    doc.text(c.label, x + 12, y + 20);
    doc.setFontSize(16);
    doc.text(informeTruncar(doc, c.valor, cardW - 24), x + 12, y + 42);
  });
  y += 56 + 28;

  if (!datos.filas.length) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(120, 120, 120);
    doc.text("No hay socios que coincidan con este filtro.", margin, y + 10);
  }

  const columnas = [
    { label: "NOMBRE", w: 128 },
    { label: "CATEGORÍA", w: 68 },
    { label: "TELÉFONO", w: 84 },
    { label: "MENSUALIDAD", w: 76, align: "right" },
    { label: "VENCE", w: 62 },
    { label: "ESTADO", w: pageWidth - margin * 2 - (128 + 68 + 84 + 76 + 62) }
  ];
  const filas = datos.filas.map(function (f) {
    return [f.nombre || "Sin nombre", f.categoria || "—", f.telefono || "—", informeFormatCOP(f.valor), f.vence || "—", f.estadoTexto || "—"];
  });
  y = informeTabla(doc, { y: y, margin: margin, pageHeight: pageHeight, columnas: columnas, filas: filas });

  informePie(doc, { club: datos.club, margin: margin, titulo: "Reporte de cartera" });
  return doc;
}
