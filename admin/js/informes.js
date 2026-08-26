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

// datos = { club, socio: {nombre, documento, categoria}, tipo, fechaTexto,
//   horarioTexto (opcional), lugar (opcional), observaciones (opcional),
//   firmante (opcional) }
// Constancia/excusa deportiva de una sola página, lista para que el
// deportista la presente en el colegio o en el trabajo.
function generarExcusaPDF(datos) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const rgb = reciboHexToRgb((datos.club && datos.club.colorPrimario) || "18A83A");
  const numero = reciboNumero();

  // Encabezado tipo membrete
  doc.setFillColor(11, 22, 38);
  doc.rect(0, 0, pageWidth, 118, "F");
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 114, pageWidth, 4, "F");

  const escR = 24, escX = margin + escR, escY = 52;
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.circle(escX, escY, escR, "F");
  doc.setDrawColor(255, 255, 255); doc.setLineWidth(1.4);
  doc.circle(escX, escY, escR, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
  const inicial = ((datos.club && datos.club.clubNombre) || "B").trim().charAt(0).toUpperCase();
  doc.text(inicial, escX, escY + 7, { align: "center" });

  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(255, 255, 255);
  doc.text((datos.club && datos.club.clubNombre) || "Mi club", escX + escR + 14, 44);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(200, 200, 200);
  doc.text("Gestionado con BioFutbol", escX + escR + 14, 60);

  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(255, 201, 51);
  doc.text("CONSTANCIA DEPORTIVA", pageWidth - margin, 44, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(200, 200, 200);
  doc.text("N.° " + numero, pageWidth - margin, 60, { align: "right" });

  let y = 156;
  doc.setTextColor(30, 30, 30);

  const ciudad = (datos.club && datos.club.ciudad) || "";
  const fechaHoy = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text((ciudad ? ciudad + ", " : "") + fechaHoy, pageWidth - margin, y, { align: "right" });
  y += 36;

  doc.setFont("helvetica", "bold"); doc.setFontSize(11.5);
  doc.text("A quien interese,", margin, y);
  y += 26;

  const socio = datos.socio || {};
  let parrafo = "Por medio de la presente, " + ((datos.club && datos.club.clubNombre) || "nuestra escuela de fútbol") +
    " hace constar que " + (socio.nombre || "el/la deportista") +
    (socio.documento ? ", identificado(a) con documento " + socio.documento + "," : ",") +
    (socio.categoria ? " integrante de la categoría " + socio.categoria + "," : "") +
    " participa en nuestras actividades deportivas y tiene programada su asistencia a " +
    (datos.tipo ? datos.tipo.toLowerCase() : "una actividad deportiva") +
    " el día " + (datos.fechaTexto || "—") +
    (datos.horarioTexto ? ", en el horario de " + datos.horarioTexto : "") +
    (datos.lugar ? ", en " + datos.lugar : "") + ".";

  doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  doc.splitTextToSize(parrafo, pageWidth - margin * 2).forEach(function (line) { doc.text(line, margin, y); y += 17; });
  y += 10;

  if (datos.observaciones) {
    doc.splitTextToSize(datos.observaciones, pageWidth - margin * 2).forEach(function (line) { doc.text(line, margin, y); y += 17; });
    y += 10;
  }

  const cierre = "Agradecemos de antemano la comprensión y el apoyo brindado a la formación deportiva de nuestros niños, niñas y jóvenes.";
  doc.splitTextToSize(cierre, pageWidth - margin * 2).forEach(function (line) { doc.text(line, margin, y); y += 17; });
  y += 46;

  doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  doc.text("Cordialmente,", margin, y);
  y += 56;

  doc.setDrawColor(80, 80, 80); doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 220, y);
  y += 16;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(20, 20, 20);
  doc.text(datos.firmante || (datos.club && datos.club.clubNombre) || "Dirección deportiva", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(120, 120, 120);
  doc.text((datos.club && datos.club.clubNombre) || "", margin, y);

  // Sello circular decorativo de validación, esquina inferior derecha.
  const selloX = pageWidth - margin - 46, selloY = pageHeight - 118;
  doc.setDrawColor(rgb.r, rgb.g, rgb.b); doc.setLineWidth(1.6);
  doc.circle(selloX, selloY, 40, "S");
  doc.setLineWidth(0.8);
  doc.circle(selloX, selloY, 34, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.text("DOCUMENTO", selloX, selloY - 4, { align: "center" });
  doc.text("VÁLIDO", selloX, selloY + 7, { align: "center" });
  doc.setFontSize(6.5); doc.setTextColor(150, 150, 150);
  doc.text(numero, selloX, selloY + 18, { align: "center" });

  doc.setDrawColor(225, 225, 225); doc.setLineWidth(0.6);
  doc.line(margin, pageHeight - 50, pageWidth - margin, pageHeight - 50);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(140, 140, 140);
  doc.text("Documento generado electrónicamente con BioFutbol el " + fechaHoy, pageWidth / 2, pageHeight - 34, { align: "center" });

  return doc;
}

// Sube la excusa/constancia a Cloudinary y devuelve la URL (requiere
// cloudinary-config.js).
function subirExcusaPDF(doc, nombreArchivo) {
  const blob = doc.output("blob");
  return subirACloudinary(blob, "excusas", nombreArchivo);
}

// datos = { club, filtroTexto, filas: [{ socio, edad, ev, estado, banda }] }
// — la misma forma que devuelve calcularEstadoNutricionalClub() en
// club-panel.html. estado es "ok" | "vigilar" | "sin-datos".
function generarReporteNutricionalPDF(datos) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = informeEncabezado(doc, { club: datos.club, margin: margin, titulo: "ESTADO NUTRICIONAL DEL CLUB", subtitulo: datos.filtroTexto || "Todas las categorías" });

  const filas = datos.filas || [];
  const alDia = filas.filter(function (f) { return f.estado === "ok"; });
  const enVigilancia = filas.filter(function (f) { return f.estado === "vigilar"; });
  const sinDatos = filas.filter(function (f) { return f.estado === "sin-datos"; });

  const cardW = (pageWidth - margin * 2 - 24) / 3;
  const cards = [
    { label: "AL DÍA", valor: String(alDia.length), color: [24, 168, 58] },
    { label: "EN VIGILANCIA", valor: String(enVigilancia.length), color: [214, 158, 15] },
    { label: "SIN REGISTROS", valor: String(sinDatos.length), color: [58, 70, 82] }
  ];
  cards.forEach(function (c, i) {
    const x = margin + i * (cardW + 12);
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.roundedRect(x, y, cardW, 56, 7, 7, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
    doc.text(c.label, x + 12, y + 20);
    doc.setFontSize(20);
    doc.text(c.valor, x + 12, y + 44);
  });
  y += 56 + 20;

  // Barra de distribución (visual simple, sin librería de gráficas)
  const total = filas.length || 1;
  const barW = pageWidth - margin * 2, barH = 16;
  let bx = margin;
  [{ n: alDia.length, color: [24, 168, 58] }, { n: enVigilancia.length, color: [255, 201, 51] }, { n: sinDatos.length, color: [58, 70, 82] }].forEach(function (seg) {
    const w = (seg.n / total) * barW;
    if (w > 0) { doc.setFillColor(seg.color[0], seg.color[1], seg.color[2]); doc.rect(bx, y, w, barH, "F"); }
    bx += w;
  });
  y += barH + 26;

  if (!filas.length) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(120, 120, 120);
    doc.text("No hay deportistas que coincidan con este filtro.", margin, y + 10);
  }

  const columnas = [
    { label: "NOMBRE", w: 170 },
    { label: "CATEGORÍA", w: 90 },
    { label: "EDAD", w: 50, align: "right" },
    { label: "IMC", w: 60, align: "right" },
    { label: "ESTADO", w: pageWidth - margin * 2 - (170 + 90 + 50 + 60) }
  ];
  const ordenActual = { vigilar: 0, ok: 1, "sin-datos": 2 };
  const ordenadas = filas.slice().sort(function (a, b) { return ordenActual[a.estado] - ordenActual[b.estado]; });
  const filasTabla = ordenadas.map(function (f) {
    const imcTxt = f.ev && f.ev.imc != null ? f.ev.imc.toFixed(1) : "—";
    let estadoTxt = "Sin registros";
    if (f.estado === "ok") estadoTxt = "Al día";
    else if (f.estado === "vigilar") {
      const partes = [];
      if (f.ev.alertaPeso) partes.push("peso");
      if (f.ev.alertaTalla) partes.push("talla");
      estadoTxt = "Vigilar " + partes.join(" y ");
    }
    return [f.socio.nombre || "Sin nombre", f.socio.categoria || "—", f.edad != null ? f.edad + " a." : "—", imcTxt, estadoTxt];
  });
  y = informeTabla(doc, { y: y, margin: margin, pageHeight: pageHeight, columnas: columnas, filas: filasTabla });
  y += 26;

  // Recomendaciones agrupadas por banda de edad, solo para quienes están en vigilancia
  const bandasConAlerta = {};
  enVigilancia.forEach(function (f) { bandasConAlerta[f.banda] = true; });
  const bandas = Object.keys(bandasConAlerta);
  if (bandas.length) {
    if (y + 70 > pageHeight - margin - 40) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(11, 22, 38);
    doc.text("Recomendaciones para mejorar", margin, y); y += 20;
    bandas.forEach(function (b) {
      const guia = GUIA_NUTRICIONAL[b];
      if (y + 60 > pageHeight - margin - 40) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(24, 168, 58);
      doc.text(NOMBRE_BANDA[b], margin, y); y += 15;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
      doc.splitTextToSize(guia.enfoque, pageWidth - margin * 2).forEach(function (l) { doc.text(l, margin, y); y += 13; });
      y += 3;
      guia.tips.slice(0, 3).forEach(function (t) {
        doc.splitTextToSize("• " + t, pageWidth - margin * 2 - 10).forEach(function (l, li) { doc.text(l, margin + (li === 0 ? 0 : 10), y); y += 13; });
      });
      y += 12;
    });
    doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(140, 140, 140);
    doc.splitTextToSize("Estas son orientaciones generales — para casos puntuales, lo ideal es acompañarlas con un profesional de nutrición.", pageWidth - margin * 2).forEach(function (l) { doc.text(l, margin, y); y += 11; });
  }

  informePie(doc, { club: datos.club, margin: margin, titulo: "Estado nutricional del club" });
  return doc;
}
