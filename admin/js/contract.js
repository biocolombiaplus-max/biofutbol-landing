// Genera el PDF del contrato para un cliente y devuelve una Promise<Blob>.
// IMPORTANTE: esta es una PLANTILLA. Debe ser revisada por un abogado antes de usarse
// formalmente con clientes reales — no constituye asesoría legal.
function generarContratoPDF(cliente) {
  return new Promise(function (resolve) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const plan = PLANES[cliente.plan] || { label: "—", implementacion: 0, mensual: 0 };
    const margin = 54;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    let y = margin;

    function checkPageBreak(extra) {
      if (y + (extra || 0) > pageHeight - margin - 20) { doc.addPage(); y = margin; }
    }

    function heading(text) {
      checkPageBreak(34);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(11, 22, 38);
      doc.text(text, margin, y);
      y += 6;
      doc.setDrawColor(24, 168, 58);
      doc.setLineWidth(1.2);
      doc.line(margin, y, margin + 34, y);
      doc.setLineWidth(0.6);
      y += 14;
    }

    function paragraph(text) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(text, usableWidth);
      lines.forEach(function (line) {
        checkPageBreak(14);
        doc.text(line, margin, y);
        y += 14;
      });
      y += 6;
    }

    function bullet(text) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize("•  " + text, usableWidth - 10);
      lines.forEach(function (line, i) {
        checkPageBreak(14);
        doc.text(line, margin + (i === 0 ? 0 : 10), y);
        y += 14;
      });
    }

    // ── Encabezado ──
    doc.setFillColor(11, 22, 38);
    doc.rect(0, 0, pageWidth, 70, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(24, 168, 58);
    doc.text("Bio", margin, 42);
    doc.setTextColor(255, 255, 255);
    doc.text("Futbol", margin + doc.getTextWidth("Bio"), 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    doc.text("Software de gestión para clubes y escuelas de fútbol", margin, 58);
    y = 98;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(11, 22, 38);
    doc.text("CONTRATO DE PRESTACIÓN DE SERVICIOS TECNOLÓGICOS", pageWidth / 2, y, { align: "center" });
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(90, 90, 90);
    doc.text("Desarrollo, licencia de uso y soporte de aplicación personalizada de gestión deportiva", pageWidth / 2, y, { align: "center" });
    y += 26;

    const fecha = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    paragraph("En " + (cliente.clubCiudad || "Colombia") + ", a " + fecha + ".");

    heading("PARTES");
    paragraph(
      "Entre los suscritos, por una parte BIOMARKETING, titular de la marca BioFutbol (en adelante, “EL PRESTADOR”), " +
      "y por otra parte " + (cliente.clubNombre || "—") +
      (cliente.clubNit ? ", identificado con NIT " + cliente.clubNit : "") +
      ", representado legalmente por " + (cliente.repNombre || "—") +
      ", identificado con cédula de ciudadanía No. " + (cliente.repCedula || "—") +
      " (en adelante, “EL CLIENTE”), hemos acordado celebrar el presente contrato, el cual se regirá por las siguientes cláusulas:"
    );

    heading("PRIMERA — OBJETO");
    paragraph(
      "EL PRESTADOR se compromete a diseñar, desarrollar y entregar a EL CLIENTE una aplicación 100% personalizada " +
      "para la gestión administrativa, deportiva y financiera de " + (cliente.clubNombre || "el club") +
      ", conforme al plan contratado: " + plan.label + "."
    );

    heading("SEGUNDA — ALCANCE DEL SERVICIO");
    paragraph("La aplicación incluye, entre otras, las siguientes funcionalidades:");
    [
      "Gestión de socios, cobros y comunicación por WhatsApp",
      "Fixture con equidad, generado con Inteligencia Artificial",
      "Generación de imágenes para redes sociales en un clic",
      "Registro de resultados en vivo (goles, tarjetas y demás eventos)",
      "Portal individual por socio, con usuario y clave propios",
      "Reportes mensuales generados con IA para mejorar los procesos del club"
    ].forEach(bullet);
    y += 6;

    heading("TERCERA — VALOR Y FORMA DE PAGO");
    paragraph(
      "EL CLIENTE pagará a EL PRESTADOR los siguientes valores, según el plan " + plan.label + " contratado:"
    );

    (function () {
      const filas = [
        ["Implementación inicial (pago único)", formatCOP(plan.implementacion)],
        ["Mensualidad por socio/deportista activo", formatCOP(plan.mensual)],
        [(cliente.numSocios || 0) + " socios registrados a la fecha de firma — total mensual estimado", formatCOP(plan.mensual * (cliente.numSocios || 0))]
      ];
      const boxH = filas.length * 22 + 16;
      checkPageBreak(boxH + 10);
      doc.setFillColor(244, 249, 246);
      doc.setDrawColor(210, 228, 218);
      doc.roundedRect(margin, y, usableWidth, boxH, 4, 4, "FD");
      let fy = y + 22;
      filas.forEach(function (f, i) {
        doc.setFont("helvetica", i === filas.length - 1 ? "bold" : "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        const lbl = doc.splitTextToSize(f[0], usableWidth - 130);
        doc.text(lbl, margin + 14, fy);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(11, 22, 38);
        doc.text(f[1], margin + usableWidth - 14, fy, { align: "right" });
        fy += 22;
      });
      y += boxH + 14;
    })();

    paragraph("Este valor se ajustará automáticamente según el número real de socios activos cada mes, de acuerdo con lo registrado en la plataforma.");

    heading("CUARTA — PLAZO DE ENTREGA");
    paragraph("EL PRESTADOR entregará la aplicación funcionando en un plazo máximo de siete (7) días hábiles, contados a partir de la recepción de la información completa y el pago de la implementación inicial.");

    heading("QUINTA — VIGENCIA Y TERMINACIÓN");
    paragraph("El presente contrato tiene vigencia mensual, renovable automáticamente. Cualquiera de las partes podrá darlo por terminado con un preaviso de al menos ocho (8) días calendario, sin penalidad alguna.");

    heading("SEXTA — OBLIGACIONES DE EL CLIENTE");
    paragraph("Suministrar información veraz y oportuna, el logo y colores del club, realizar los pagos en las fechas acordadas, e informar oportunamente cualquier cambio en el número de socios activos.");

    heading("SÉPTIMA — OBLIGACIONES DE EL PRESTADOR");
    paragraph("Entregar la aplicación dentro del plazo acordado, brindar soporte y mantenimiento continuo, y mantener la confidencialidad de la información del club y sus socios.");

    heading("OCTAVA — ACCESO A LA PLATAFORMA");
    paragraph(
      "Se entregan a EL CLIENTE las siguientes credenciales iniciales de acceso: Usuario: " +
      (cliente.usuarioApp || "—") + " · Clave temporal: " + (cliente.claveApp || "—") +
      ". Se recomienda cambiar la clave en el primer ingreso."
    );

    heading("NOVENA — PROTECCIÓN Y TRATAMIENTO DE DATOS PERSONALES");
    paragraph(
      "EL PRESTADOR actúa como encargado del tratamiento de los datos personales de EL CLIENTE y de los socios o " +
      "deportistas registrados en la aplicación (nombres, documentos de identidad, fecha de nacimiento, datos de " +
      "contacto, información básica de salud cuando aplique, y fotografías), conforme a la Ley 1581 de 2012, el " +
      "Decreto 1377 de 2013 y demás normas vigentes en Colombia sobre protección de datos personales — o, si " +
      (cliente.clubNombre || "el club") + " opera fuera de Colombia, conforme a la normativa de protección de datos " +
      "vigente en su país."
    );
    paragraph(
      "Estos datos se usan única y exclusivamente para la operación de la aplicación (gestión deportiva y " +
      "administrativa del club) y no serán usados para fines distintos. EL PRESTADOR NO comparte, vende, alquila " +
      "ni cede estas bases de datos a terceros bajo ninguna circunstancia."
    );
    paragraph(
      "La información se almacena en infraestructura en la nube de Google Cloud / Firebase, con acceso restringido " +
      "solo a personal autorizado, cifrado en tránsito y buenas prácticas de seguridad informática. Los titulares " +
      "de los datos (socios, deportistas o sus acudientes, si son menores de edad) pueden ejercer en cualquier " +
      "momento sus derechos de acceso, actualización, rectificación y supresión (habeas data) contactando a EL " +
      "CLIENTE o directamente a EL PRESTADOR. Los datos se conservan mientras dure la relación contractual y el " +
      "tiempo adicional que exija la ley."
    );

    heading("DÉCIMA — POLÍTICA DE USO DE IMÁGENES Y CONTENIDO AUDIOVISUAL");
    paragraph(
      "EL CLIENTE es responsable de contar con la autorización expresa de cada socio o deportista — o de su " +
      "padre, madre o acudiente, si es menor de edad — para el uso de sus fotografías, videos y demás datos " +
      "dentro de la aplicación, así como para su eventual publicación en redes sociales o material promocional " +
      "del club."
    );
    paragraph(
      "EL PRESTADOR únicamente aloja y procesa las imágenes que EL CLIENTE decide cargar en la plataforma para " +
      "el funcionamiento de la aplicación (carnet digital, portal del socio, imágenes de partidos), y no las " +
      "usará con fines distintos ni las publicará por fuera de la plataforma del club, salvo autorización " +
      "expresa y adicional de EL CLIENTE (por ejemplo, para casos de éxito o material promocional de BioFutbol)."
    );

    heading("UNDÉCIMA — PRINCIPIOS Y COMPROMISO CORPORATIVO");
    paragraph(
      "BioFutbol se compromete a actuar con transparencia, confidencialidad, seguridad de la información y " +
      "responsabilidad en el manejo de los datos de EL CLIENTE y sus socios, como parte de sus principios y " +
      "valores corporativos."
    );

    // ── Firmas ──
    checkPageBreak(130);
    y += 30;
    doc.setDrawColor(150, 150, 150);
    doc.line(margin, y, margin + 200, y);
    doc.line(pageWidth - margin - 200, y, pageWidth - margin, y);
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 30, 30);
    doc.text("EL PRESTADOR", margin, y);
    doc.text("EL CLIENTE", pageWidth - margin - 200, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("BioMarketing · BioFutbol", margin, y);
    doc.text((cliente.repNombre || "—") + (cliente.repCedula ? " · C.C. " + cliente.repCedula : ""), pageWidth - margin - 200, y, { maxWidth: 200 });

    // ── Encabezado delgado (páginas 2 en adelante) y pie de página en todas ──
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
        doc.text("Contrato de prestación de servicios", pageWidth - margin, 20, { align: "right" });
      }

      doc.setDrawColor(225, 225, 225);
      doc.setLineWidth(0.6);
      doc.line(margin, pageHeight - 46, pageWidth - margin, pageHeight - 46);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text((cliente.clubNombre || "BioFutbol") + " · Contrato de prestación de servicios", margin, pageHeight - 34);
      doc.text("Página " + p + " de " + totalPaginas, pageWidth - margin, pageHeight - 34, { align: "right" });
      doc.text("Documento generado automáticamente por el panel de BioFutbol a partir de una plantilla. No constituye asesoría legal; se recomienda su revisión por un abogado.", pageWidth / 2, pageHeight - 22, { align: "center", maxWidth: usableWidth });
    }

    resolve(doc.output("blob"));
  });
}
