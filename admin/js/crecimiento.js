// ── GRÁFICAS Y RECOMENDACIONES DE CRECIMIENTO ──
// Nota importante: los cálculos y referencias de este archivo son de
// carácter GENERAL Y ORIENTATIVO (no usan tablas oficiales OMS/CDC por
// sexo y edad exacta en meses). Nunca reemplazan una valoración pediátrica
// — su único objetivo es ayudar a la familia a visualizar la evolución y
// saber cuándo conviene comentarlo con el médico.

function crecHexToRgba(hex, a) {
  hex = (hex || "#18A83A").replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
  const num = parseInt(hex, 16);
  return "rgba(" + ((num >> 16) & 255) + "," + ((num >> 8) & 255) + "," + (num & 255) + "," + a + ")";
}

// Dibuja una gráfica de línea simple y nítida (retina-aware) dentro del
// canvas dado. puntos = [{ x: "etiqueta", y: número }], ya en orden
// cronológico.
function crecDibujarLinea(canvas, puntos, opts) {
  opts = opts || {};
  const color = opts.color || "#18A83A";
  const unidad = opts.unidad || "";
  const alto = opts.alto || 170;
  const dpr = window.devicePixelRatio || 1;
  const cssW = Math.max((canvas.parentElement && canvas.parentElement.clientWidth) || canvas.clientWidth || 300, 200);

  canvas.style.width = cssW + "px";
  canvas.style.height = alto + "px";
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(alto * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, alto);

  const padL = 40, padR = 12, padT = 18, padB = 24;
  const plotW = cssW - padL - padR;
  const plotH = alto - padT - padB;

  if (!puntos.length) {
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.font = "600 12px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Todavía no hay registros", cssW / 2, alto / 2);
    return;
  }

  const valores = puntos.map(function (p) { return p.y; });
  let minV = Math.min.apply(null, valores), maxV = Math.max.apply(null, valores);
  if (minV === maxV) { minV -= 1; maxV += 1; }
  const margen = (maxV - minV) * 0.2;
  minV -= margen; maxV += margen;

  function xAt(i) { return puntos.length === 1 ? padL + plotW / 2 : padL + (plotW * i) / (puntos.length - 1); }
  function yAt(v) { return padT + plotH - ((v - minV) / (maxV - minV)) * plotH; }

  // Líneas guía horizontales con su valor
  ctx.strokeStyle = "rgba(255,255,255,.08)";
  ctx.lineWidth = 1;
  ctx.font = "600 10px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.4)";
  ctx.textAlign = "right";
  const pasos = 3;
  for (let i = 0; i <= pasos; i++) {
    const v = minV + ((maxV - minV) * i) / pasos;
    const y = yAt(v);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(cssW - padR, y); ctx.stroke();
    ctx.fillText(v.toFixed(1), padL - 8, y + 3);
  }

  if (puntos.length > 1) {
    const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, crecHexToRgba(color, .32));
    grad.addColorStop(1, crecHexToRgba(color, 0));
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(puntos[0].y));
    puntos.forEach(function (p, i) { ctx.lineTo(xAt(i), yAt(p.y)); });
    ctx.lineTo(xAt(puntos.length - 1), padT + plotH);
    ctx.lineTo(xAt(0), padT + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    puntos.forEach(function (p, i) {
      const x = xAt(i), y = yAt(p.y);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  puntos.forEach(function (p, i) {
    const x = xAt(i), y = yAt(p.y);
    const esUltimo = i === puntos.length - 1;
    ctx.beginPath();
    ctx.arc(x, y, esUltimo ? 5 : 3, 0, Math.PI * 2);
    ctx.fillStyle = esUltimo ? color : "rgba(255,255,255,.7)";
    ctx.fill();
    if (esUltimo) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "800 12px Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.y.toFixed(1) + unidad, x, Math.max(y - 12, 12));
    }
  });

  ctx.fillStyle = "rgba(255,255,255,.4)";
  ctx.font = "600 10px Poppins, sans-serif";
  ctx.textAlign = "center";
  const idxLabels = puntos.length <= 4 ? puntos.map(function (_, i) { return i; }) : [0, Math.floor((puntos.length - 1) / 2), puntos.length - 1];
  idxLabels.forEach(function (i) { ctx.fillText(puntos[i].x, xAt(i), alto - 6); });
}

// Gráfica de dona simple para mostrar una distribución (ej. cuántos
// jugadores están al día vs. en vigilancia). segmentos = [{ label, valor,
// color }]. Pinta el total en el centro.
function crecDibujarDonut(canvas, segmentos) {
  const dpr = window.devicePixelRatio || 1;
  const size = Math.max(Math.min((canvas.parentElement && canvas.parentElement.clientWidth) || 200, 200), 140);
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const total = segmentos.reduce(function (acc, s) { return acc + s.valor; }, 0);
  const cx = size / 2, cy = size / 2, rOut = size / 2 - 6, rIn = rOut * 0.62;

  if (!total) {
    ctx.beginPath(); ctx.arc(cx, cy, rOut, 0, Math.PI * 2); ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
    ctx.closePath(); ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.font = "600 12px Poppins, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Sin datos", cx, cy + 4);
    return;
  }

  let ang = -Math.PI / 2;
  segmentos.forEach(function (s) {
    if (!s.valor) return;
    const slice = (s.valor / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rOut, ang, ang + slice);
    ctx.arc(cx, cy, rIn, ang + slice, ang, true);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    ang += slice;
  });

  ctx.fillStyle = "#fff"; ctx.font = "900 22px Poppins, sans-serif"; ctx.textAlign = "center";
  ctx.fillText(String(total), cx, cy + 2);
  ctx.font = "700 9px Poppins, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.5)";
  ctx.fillText(total === 1 ? "jugador" : "jugadores", cx, cy + 16);
}

function crecFechaCorta(fechaISO) {
  const d = new Date(fechaISO + "T12:00:00");
  if (isNaN(d.getTime())) return fechaISO || "";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

// Referencia general aproximada del límite inferior típico de IMC por edad
// (no es una tabla oficial de percentiles OMS/CDC por sexo y mes exacto —
// es solo una guía conservadora para dar una orientación, nunca un
// diagnóstico).
const CREC_IMC_REF_BAJA = { 5: 13.6, 6: 13.5, 7: 13.4, 8: 13.5, 9: 13.7, 10: 13.9, 11: 14.2, 12: 14.5, 13: 14.9, 14: 15.4, 15: 15.9, 16: 16.4, 17: 16.8 };

function crecImcReferenciaBaja(edad) {
  if (edad == null) return null;
  if (edad < 5) return 13.6;
  if (edad >= 18) return 18.5;
  return CREC_IMC_REF_BAJA[edad] != null ? CREC_IMC_REF_BAJA[edad] : 13.6;
}

// Velocidad de crecimiento en estatura entre el primer y el último registro
// disponible (cm ganados por año, proyectado). Solo se calcula si hay al
// menos 2 meses entre mediciones, para no sacar conclusiones de datos muy
// cercanos en el tiempo.
function crecVelocidadEstatura(historialOrdenado) {
  if (!historialOrdenado || historialOrdenado.length < 2) return null;
  const primero = historialOrdenado[0], ultimo = historialOrdenado[historialOrdenado.length - 1];
  const dias = (new Date(ultimo.fecha) - new Date(primero.fecha)) / 86400000;
  if (dias < 60) return null;
  const cmGanados = ultimo.estatura - primero.estatura;
  return { cmPorAnio: (cmGanados / dias) * 365, dias: dias };
}

const CREC_TIPS_PESO = [
  "Agrega una porción extra de proteína o carbohidrato saludable en el almuerzo y la cena (huevo, pollo, arroz, papa, aguacate).",
  "Ofrece comidas más seguidas: desayuno, media mañana, almuerzo, algo de la tarde y cena, en vez de solo 3 comidas grandes.",
  "Incluye frutos secos, aguacate o mantequilla de maní como snacks energéticos entre comidas.",
  "Evita reemplazar comidas por líquidos azucarados — mejor la fruta entera o en jugo natural."
];

const CREC_TIPS_TALLA = [
  "Cuida las horas de sueño: buena parte del crecimiento ocurre mientras el niño o joven duerme.",
  "Asegura calcio y proteína a diario (leche, huevo, queso, carnes, leguminosas).",
  "Mantén actividad física variada, no solo fútbol — ayuda al desarrollo general.",
  "El juego al aire libre y la luz solar también apoyan un buen desarrollo óseo."
];

// Evalúa el último registro y la tendencia, y devuelve todo lo necesario
// para pintar la tarjeta de recomendaciones. Devuelve null si no hay
// ningún registro todavía.
function crecEvaluar(edad, historial) {
  const ordenado = (historial || []).slice().sort(function (a, b) { return new Date(a.fecha) - new Date(b.fecha); });
  if (!ordenado.length) return null;
  const ultimo = ordenado[ordenado.length - 1];
  const imc = calcularIMC(ultimo.peso, ultimo.estatura);
  const imcRef = crecImcReferenciaBaja(edad);
  const alertaPeso = imc != null && imcRef != null && imc < imcRef;

  const velocidad = crecVelocidadEstatura(ordenado);
  const alertaTalla = !!(velocidad && edad != null && edad >= 3 && edad <= 15 && velocidad.cmPorAnio < 4);

  return { imc: imc, imcRef: imcRef, alertaPeso: alertaPeso, alertaTalla: alertaTalla, velocidad: velocidad, ordenado: ordenado };
}

// Pinta la tarjeta de recomendaciones dentro de "el". Siempre encabeza con
// la sugerencia de consultar al pediatra, presentada como algo preventivo
// y complementario — nunca como que este panel reemplaza esa valoración.
function crecPintarRecomendaciones(el, edad, historial) {
  const ev = crecEvaluar(edad, historial);

  let html = '<div class="creco-item creco-doc"><i class="fa-solid fa-user-doctor"></i><div>' +
    '<b>Consulta a tu pediatra</b>' +
    '<p>Esta gráfica es una ayuda visual para acompañar el crecimiento en casa — no reemplaza el control médico. Llévasela a la próxima cita: con las tablas oficiales y el historial completo, el pediatra puede confirmar si todo va bien o si conviene revisar algo a tiempo.</p>' +
    '</div></div>';

  if (!ev) {
    html += '<div class="creco-item creco-info"><i class="fa-solid fa-circle-info"></i><div>' +
      '<b>Agrega el primer registro</b><p>En cuanto tengas al menos una medición de peso y estatura vas a ver aquí la evolución y una orientación general.</p>' +
      '</div></div>';
    el.innerHTML = html;
    return;
  }

  if (ev.alertaPeso) {
    html += '<div class="creco-item creco-warn"><i class="fa-solid fa-triangle-exclamation"></i><div>' +
      '<b>El peso actual está por debajo del rango orientativo para su edad</b>' +
      '<p>Es una referencia general, no un diagnóstico — coméntaselo a tu pediatra. Mientras tanto, esto puede ayudar en casa:</p>' +
      '<ul>' + CREC_TIPS_PESO.slice(0, 3).map(function (t) { return "<li>" + t + "</li>"; }).join("") + '</ul>' +
      '</div></div>';
  }
  if (ev.alertaTalla) {
    html += '<div class="creco-item creco-warn"><i class="fa-solid fa-triangle-exclamation"></i><div>' +
      '<b>El aumento de estatura ha sido más lento de lo esperado</b>' +
      '<p>Es una referencia general basada en tus propios registros, no un diagnóstico — coméntaselo a tu pediatra. Esto puede ayudar en casa:</p>' +
      '<ul>' + CREC_TIPS_TALLA.slice(0, 3).map(function (t) { return "<li>" + t + "</li>"; }).join("") + '</ul>' +
      '</div></div>';
  }
  if (!ev.alertaPeso && !ev.alertaTalla) {
    html += '<div class="creco-item creco-ok"><i class="fa-solid fa-circle-check"></i><div>' +
      '<b>El peso y la estatura van dentro del rango orientativo</b>' +
      '<p>Sigue registrando periódicamente para ver la evolución, y mantén los controles de rutina con el pediatra.</p>' +
      '</div></div>';
  }
  el.innerHTML = html;
}

// Dibuja las dos gráficas (peso y estatura) a partir del historial crudo.
function crecPintarGraficas(canvasPeso, canvasEstatura, historial, colorPeso, colorEstatura) {
  const ordenado = (historial || []).slice().sort(function (a, b) { return new Date(a.fecha) - new Date(b.fecha); });
  const puntosPeso = ordenado.map(function (c) { return { x: crecFechaCorta(c.fecha), y: c.peso }; });
  const puntosEstatura = ordenado.map(function (c) { return { x: crecFechaCorta(c.fecha), y: c.estatura }; });
  crecDibujarLinea(canvasPeso, puntosPeso, { color: colorPeso || "#18A83A", unidad: " kg" });
  crecDibujarLinea(canvasEstatura, puntosEstatura, { color: colorEstatura || "#FFC933", unidad: " cm" });
}
