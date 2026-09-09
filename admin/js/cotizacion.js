// Genera la cotización comercial de BioFutbol en PDF: un documento de venta
// (no legal, a diferencia de contract.js) pensado para enviarle a un club o
// escuela interesado, con todas las funcionalidades explicadas a fondo y un
// precio ya calculado según su número de deportistas. Devuelve Promise<Blob>.
// datos = { clubNombre, contactoNombre, contactoEmail, contactoTelefono, pais, numSocios, preparadoPor }
function generarCotizacionPDF(datos) {
  return new Promise(function (resolve) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const esColombia = esColombiaPais(datos.pais);
    const claveplan = planClavePorNumSocios(datos.numSocios, datos.pais);
    const plan = catalogoPlanes(datos.pais)[claveplan];
    const margin = 54;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    const numero = "COT-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(100 + Math.random() * 900);
    const fechaHoy = new Date();
    const fechaVence = new Date(fechaHoy.getTime() + 15 * 86400000);
    const fmtFecha = function (d) { return d.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }); };
    let y = margin;

    function checkPageBreak(extra) {
      if (y + (extra || 0) > pageHeight - margin - 26) { doc.addPage(); y = margin; }
    }

    function heading(text) {
      checkPageBreak(34);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(11, 22, 38);
      doc.text(text, margin, y);
      y += 6;
      doc.setDrawColor(24, 168, 58);
      doc.setLineWidth(1.4);
      doc.line(margin, y, margin + 34, y);
      doc.setLineWidth(0.6);
      y += 16;
    }

    function paragraph(text) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.6);
      doc.setTextColor(35, 35, 35);
      const lines = doc.splitTextToSize(text, usableWidth);
      lines.forEach(function (line) {
        checkPageBreak(14);
        doc.text(line, margin, y);
        y += 14;
      });
      y += 6;
    }

    // Bloque de módulo: título en verde con check dorado + su lista de bullets.
    function modulo(titulo, items) {
      checkPageBreak(20);
      doc.setFillColor(24, 168, 58);
      doc.circle(margin + 5, y - 4, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.2);
      doc.setTextColor(11, 22, 38);
      doc.text(titulo, margin + 16, y);
      y += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.2);
      doc.setTextColor(50, 50, 50);
      items.forEach(function (item) {
        const lines = doc.splitTextToSize(item, usableWidth - 22);
        lines.forEach(function (line, i) {
          checkPageBreak(13);
          if (i === 0) {
            doc.setTextColor(255, 201, 51);
            doc.text("•", margin + 16, y);
            doc.setTextColor(50, 50, 50);
          }
          doc.text(line, margin + 28, y);
          y += 13;
        });
      });
      y += 8;
    }

    // ── Encabezado ──
    doc.setFillColor(11, 22, 38);
    doc.rect(0, 0, pageWidth, 78, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(24, 168, 58);
    doc.text("Bio", margin, 40);
    doc.setTextColor(255, 255, 255);
    doc.text("Futbol", margin + doc.getTextWidth("Bio"), 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    doc.text("La plataforma líder en Latinoamérica para la administración de clubes y escuelas de fútbol, con Inteligencia Artificial", margin, 57, { maxWidth: usableWidth * 0.62 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 201, 51);
    doc.text("COTIZACIÓN", pageWidth - margin, 36, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(210, 210, 210);
    doc.text(numero, pageWidth - margin, 50, { align: "right" });
    doc.text("Válida hasta " + fmtFecha(fechaVence), pageWidth - margin, 62, { align: "right" });
    y = 104;

    // ── Datos de la cotización (preparado para) ──
    (function () {
      const filas = [
        ["Preparada para", datos.clubNombre || "—"],
        ["Atención de", datos.contactoNombre || "—"],
        ["Contacto", [datos.contactoEmail, datos.contactoTelefono].filter(Boolean).join(" · ") || "—"],
        ["Fecha", fmtFecha(fechaHoy)]
      ];
      const boxH = filas.length * 16 + 14;
      checkPageBreak(boxH + 10);
      doc.setFillColor(244, 249, 246);
      doc.setDrawColor(210, 228, 218);
      doc.roundedRect(margin, y, usableWidth, boxH, 4, 4, "FD");
      let fy = y + 20;
      filas.forEach(function (f) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.6);
        doc.setTextColor(90, 100, 95);
        doc.text(f[0].toUpperCase(), margin + 14, fy);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.4);
        doc.setTextColor(20, 20, 20);
        doc.text(String(f[1]), margin + 150, fy);
        fy += 16;
      });
      y += boxH + 20;
    })();

    // ── Introducción de venta ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13.5);
    doc.setTextColor(11, 22, 38);
    checkPageBreak(24);
    doc.text("La app #1 en Latinoamérica para tu club o escuela de fútbol", margin, y);
    y += 20;
    paragraph(
      "BioFutbol es la plataforma más completa de Latinoamérica creada específicamente para la administración " +
      "integral de clubes y escuelas de fútbol, potenciada con Inteligencia Artificial. En una sola app, " +
      (datos.clubNombre || "tu club") + " puede manejar socios, cobros, entrenamientos, torneos, comunicación con " +
      "los padres y su imagen en redes sociales — todo desde el celular, sin hojas de cálculo ni WhatsApp " +
      "desordenado, y con una imagen 100% profesional frente a sus deportistas y patrocinadores."
    );

    heading("TODO LO QUE INCLUYE BIOFUTBOL");

    modulo("Gestión de socios y cobros", [
      "Ficha completa de cada deportista: datos, documento, acudientes y estado de pago al día, en verde/amarillo/rojo.",
      "Cobro mensual automático por socio, con becas y descuentos por hermanos.",
      "Recordatorios de pago enviados por WhatsApp y correo con un clic, con QR o cuenta bancaria incluidos.",
      "Recibos de pago generados y enviados automáticamente."
    ]);
    modulo("Fixture, resultados y tabla de posiciones con IA", [
      "Fixture generado con Inteligencia Artificial, repartiendo los partidos de forma equitativa entre todos los equipos.",
      "Registro de resultados en vivo: goles, tarjetas y demás eventos del partido.",
      "Tabla de posiciones calculada sola con cada resultado, sin hacer cuentas a mano."
    ]);
    modulo("Torneos internos y externos", [
      "Creación de torneos con logo propio, fechas, inscripciones y control de tarjetas/sanciones por jugador.",
      "Recordatorio automático a padres y deportistas del pago de inscripción."
    ]);
    modulo("Generador de imágenes profesionales para redes con IA", [
      "Convocatorias, resultados, próximos partidos, cumpleaños y anuncios de torneo generados en segundos.",
      "Con el escudo, los colores y el nombre de tu club automáticamente — listas para WhatsApp e Instagram.",
      "Sin pagar diseñador ni perder tiempo: la app arma la gráfica profesional por ti."
    ]);
    modulo("Profesores y asistencia en vivo", [
      "Acceso propio para cada entrenador, con sus categorías y alumnos asignados.",
      "Asistencia en vivo con un toque: todos presentes por defecto, el profe solo marca a quien falta."
    ]);
    modulo("Portal individual para socios y padres de familia", [
      "Cada deportista o su acudiente entra con su propio usuario y clave a ver su estado de cuenta, horario, torneos e inscripciones.",
      "Mayor confianza y transparencia frente a las familias del club."
    ]);
    modulo("Informes inteligentes generados con IA", [
      "Reporte de cartera y de jugadores en PDF, listos para imprimir o compartir.",
      "Estado nutricional de cada deportista con recomendaciones generadas con IA para padres y entrenadores.",
      "Constancias deportivas profesionales en PDF, generadas y enviadas en segundos."
    ]);
    modulo("Comunicación automática por WhatsApp", [
      "Recordatorios de pago, de entrenamiento, de torneo y mensajes de cumpleaños, listos para enviar con un clic.",
      "CRM de comunicaciones: queda registro de cada mensaje enviado a cada socio."
    ]);
    modulo("100% personalizable a la marca de tu club", [
      "Tu escudo, tus colores y tus datos de pago en toda la aplicación — se adapta a tu club, no al revés.",
      "Funciona como app instalable en el celular (PWA), con ícono propio del club."
    ]);

    checkPageBreak(60);
    heading("¿POR QUÉ ELEGIR BIOFUTBOL?");
    [
      "La única plataforma de gestión de clubes de fútbol en Latinoamérica con Inteligencia Artificial aplicada de verdad: fixture equitativo, informes y recomendaciones generados con IA.",
      "Implementación funcionando en solo 7 días hábiles, con capacitación incluida para tu equipo.",
      "No se instala nada: funciona desde el navegador del celular o computador de cualquier persona del club.",
      "Soporte directo y cercano — hablas con nosotros, no con un buzón de tickets.",
      "Precios pensados para clubes y escuelas de Latinoamérica, no importados de otros mercados."
    ].forEach(function (t) {
      const lines = doc.splitTextToSize("•  " + t, usableWidth - 10);
      lines.forEach(function (line, i) {
        checkPageBreak(14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.4);
        doc.setTextColor(35, 35, 35);
        doc.text(line, margin + (i === 0 ? 0 : 10), y);
        y += 14;
      });
    });
    y += 6;

    // ── Inversión ──
    checkPageBreak(50);
    heading("INVERSIÓN SUGERIDA PARA " + (datos.clubNombre ? datos.clubNombre.toUpperCase() : "TU CLUB"));
    paragraph(
      "Con base en " + (Number(datos.numSocios) || 0) + " deportistas/socios estimados, el plan que más te conviene es:"
    );
    (function () {
      const filas = esColombia
        ? [
          ["Plan sugerido", plan.label],
          ["Implementación inicial (pago único)", formatCOP(plan.implementacion)],
          ["Mensualidad por socio/deportista activo", formatCOP(plan.mensual)],
          ["Total mensual estimado (" + (Number(datos.numSocios) || 0) + " deportistas)", formatCOP(plan.mensual * (Number(datos.numSocios) || 0))]
        ]
        : [
          ["Plan sugerido", plan.label],
          ["Mensualidad fija (sin importar el número de deportistas)", planPrecioMensualTexto(plan, datos.pais)],
          ["Implementación inicial", "Sin costo"]
        ];
      const boxH = filas.length * 22 + 16;
      checkPageBreak(boxH + 40);
      doc.setFillColor(11, 22, 38);
      doc.roundedRect(margin, y, usableWidth, boxH, 4, 4, "F");
      let fy = y + 22;
      filas.forEach(function (f, i) {
        doc.setFont("helvetica", i === filas.length - 1 ? "bold" : "normal");
        doc.setFontSize(9.4);
        doc.setTextColor(220, 226, 232);
        const lbl = doc.splitTextToSize(f[0], usableWidth - 150);
        doc.text(lbl, margin + 16, fy);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(255, 201, 51);
        doc.text(String(f[1]), margin + usableWidth - 16, fy, { align: "right" });
        fy += 22;
      });
      y += boxH + 12;
      if (!esColombia) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.4);
        doc.setTextColor(120, 120, 120);
        const nota = doc.splitTextToSize("Precio de lanzamiento, válido para los primeros clubes de tu país que se registren en BioFutbol.", usableWidth);
        checkPageBreak(nota.length * 11 + 6);
        doc.text(nota, margin, y);
        y += nota.length * 11 + 6;
      }
    })();

    // ── Llamado a la acción ──
    checkPageBreak(90);
    y += 6;
    doc.setFillColor(24, 168, 58);
    doc.roundedRect(margin, y, usableWidth, 70, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(255, 255, 255);
    doc.text("¿Listo para modernizar la administración de tu club?", margin + 18, y + 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.4);
    doc.text("Escríbenos y activamos BioFutbol en " + (datos.clubNombre || "tu club") + " en solo 7 días hábiles.", margin + 18, y + 48);
    y += 90;

    // ── Pie de página en todas las páginas ──
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPaginas; p++) {
      doc.setPage(p);
      if (p > 1) {
        doc.setFillColor(11, 22, 38);
        doc.rect(0, 0, pageWidth, 30, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(24, 168, 58);
        doc.text("Bio", margin, 20);
        doc.setTextColor(255, 255, 255);
        doc.text("Futbol", margin + doc.getTextWidth("Bio"), 20);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(210, 210, 210);
        doc.text("Cotización comercial " + numero, pageWidth - margin, 20, { align: "right" });
      }
      doc.setDrawColor(225, 225, 225);
      doc.setLineWidth(0.6);
      doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text("BioMarketing · BioFutbol · wa.me/573505457420", margin, pageHeight - 26);
      doc.text("Página " + p + " de " + totalPaginas, pageWidth - margin, pageHeight - 26, { align: "right" });
    }

    resolve(doc.output("blob"));
  });
}
