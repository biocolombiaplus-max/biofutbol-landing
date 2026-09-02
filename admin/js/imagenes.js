// ── GENERADOR DE IMÁGENES PARA REDES SOCIALES ──
// Genera gráficas 1080x1920 (formato historia/reel) con los colores y el
// escudo de cada club, usando Canvas 2D (sin librerías externas). Inspirado
// en el generador de Atlético Norte, pero parametrizado por cliente.

const IMG_W = 1080, IMG_H = 1920;

function imgHexToRgb(hex) {
  hex = (hex || "#18A83A").replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function imgRgba(hex, a) {
  const c = imgHexToRgb(hex);
  return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
}

function imgLoadImage(url) {
  return new Promise(function (resolve, reject) {
    if (!url) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = url;
  });
}

function imgRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function imgWrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || "").split(" ");
  let line = "", lines = [];
  words.forEach(function (w) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  if (maxLines) lines = lines.slice(0, maxLines);
  lines.forEach(function (l, i) { ctx.fillText(l, x, y + i * lineHeight); });
  return lines.length;
}

// Reduce el tamaño de fuente hasta que el texto quepa en maxWidth (para
// textos de una sola línea de largo variable, como rangos de fechas, que no
// se pueden partir en varias líneas dentro de una tarjeta de altura fija).
function imgFitFont(ctx, text, maxWidth, fontWeight, maxPx, minPx) {
  let size = maxPx;
  while (size > minPx) {
    ctx.font = fontWeight + " " + Math.round(size) + "px Poppins, sans-serif";
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

// Fondo cinematográfico oscuro con resplandor del color principal del club.
function imgFondoBase(ctx, club) {
  const c1 = (club && club.colorPrimario) || "#18A83A";
  ctx.fillStyle = "#05070a";
  ctx.fillRect(0, 0, IMG_W, IMG_H);

  const glow = ctx.createRadialGradient(IMG_W / 2, IMG_H * 0.22, 40, IMG_W / 2, IMG_H * 0.22, IMG_W * 0.85);
  glow.addColorStop(0, imgRgba(c1, 0.35));
  glow.addColorStop(1, imgRgba(c1, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, IMG_W, IMG_H);

  // Textura sutil de puntos
  ctx.fillStyle = "rgba(255,255,255,.035)";
  for (let y = 0; y < IMG_H; y += 34) {
    for (let x = (y / 34) % 2 === 0 ? 0 : 17; x < IMG_W; x += 34) {
      ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Viñeta
  const vig = ctx.createRadialGradient(IMG_W / 2, IMG_H / 2, IMG_H * 0.35, IMG_W / 2, IMG_H / 2, IMG_H * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, IMG_W, IMG_H);
}

// Barra inferior con degradado de marca + nombre del club + watermark.
function imgBarraInferior(ctx, club) {
  const c1 = (club && club.colorPrimario) || "#18A83A";
  const c2 = (club && club.colorSecundario) || "#0e7d29";
  const y0 = IMG_H - 210;
  const grad = ctx.createLinearGradient(0, y0, IMG_W, IMG_H);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, y0, IMG_W, 210);

  ctx.fillStyle = "rgba(0,0,0,.15)";
  for (let x = -200; x < IMG_W + 200; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, y0); ctx.lineTo(x + 24, y0); ctx.lineTo(x - 30, IMG_H); ctx.lineTo(x - 54, IMG_H);
    ctx.closePath(); ctx.fill();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "900 46px Poppins, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText((club && club.clubNombre ? club.clubNombre.toUpperCase() : "MI CLUB"), IMG_W / 2, y0 + 90);
  ctx.font = "700 24px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillText("Gestionado con BioFutbol", IMG_W / 2, y0 + 130);
}

function imgEscudo(ctx, img, cx, cy, r) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
  ctx.lineWidth = 5; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#0f1720"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  if (img) {
    const scale = Math.min((r * 1.7) / img.width, (r * 1.7) / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  } else {
    ctx.fillStyle = "#fff"; ctx.font = "900 " + Math.floor(r) + "px Poppins, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("⚽", cx, cy + 4);
  }
  ctx.restore();
}

function imgTeamBadge(ctx, cx, cy, r, letra, colorHex) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = colorHex || "#18A83A"; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "900 " + Math.floor(r * 0.85) + "px Poppins, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText((letra || "?").slice(0, 2).toUpperCase(), cx, cy + 4);
  ctx.restore();
}

// Igual que imgTeamBadge, pero si el equipo tiene escudo propio lo usa en
// vez del círculo con iniciales.
async function imgEquipoBadge(ctx, cx, cy, r, logoUrl, letra, colorHex) {
  const img = await imgLoadImage(logoUrl);
  if (img) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    const scale = Math.min((r * 1.8) / img.width, (r * 1.8) / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
  } else {
    imgTeamBadge(ctx, cx, cy, r, letra, colorHex);
  }
}

// d = { club, propio, propioLogoUrl, rival, rivalLogoUrl, fecha, hora, lugar, formato, fondoUrl }
async function generarImagenPartido(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
  const c2 = (d.club && d.club.colorSecundario) || "#0e7d29";
  const cGold = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.textAlign = "center";

  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  const escudoR = W * 0.055;
  const escudoY = H * 0.08;
  imgEscudo(ctx, logo, W / 2, escudoY, escudoR);

  // Etiqueta "PRÓXIMO PARTIDO" en pastilla, más vistosa que texto plano.
  const labelY = escudoY + escudoR + H * 0.055;
  const labelTxt = "PRÓXIMO PARTIDO";
  ctx.font = "800 " + Math.round(W * 0.03) + "px Poppins, sans-serif";
  const labelPadX = W * 0.045, labelH = H * 0.034;
  const labelW = ctx.measureText(labelTxt).width + labelPadX * 2;
  imgRoundRect(ctx, W / 2 - labelW / 2, labelY - labelH * 0.68, labelW, labelH, labelH / 2);
  ctx.fillStyle = imgRgba(cGold, .16);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = imgRgba(cGold, .5);
  ctx.stroke();
  ctx.fillStyle = cGold;
  ctx.fillText(labelTxt, W / 2, labelY + labelH * 0.1);

  // Escudos de los dos equipos, bien grandes, con "VS" en una burbuja
  // entre ambos para que se vea como una tarjeta de vs. profesional.
  const badgeR = W * 0.15;
  const badgeCy = H * 0.33;
  const badgeOffsetX = W * 0.25;
  await imgEquipoBadge(ctx, W / 2 - badgeOffsetX, badgeCy, badgeR, d.propioLogoUrl, d.propio, c1);
  await imgEquipoBadge(ctx, W / 2 + badgeOffsetX, badgeCy, badgeR, d.rivalLogoUrl, d.rival, c2);

  const vsR = W * 0.052;
  ctx.beginPath(); ctx.arc(W / 2, badgeCy, vsR, 0, Math.PI * 2);
  ctx.fillStyle = "#05070a"; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(vsR * 0.9) + "px Poppins, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("VS", W / 2, badgeCy + vsR * 0.05);
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(W * 0.044) + "px Poppins, sans-serif";
  imgWrapText(ctx, (d.propio || "Nosotros").toUpperCase(), W / 2 - badgeOffsetX, badgeCy + badgeR + H * 0.05, W * 0.42, W * 0.048, 2);
  imgWrapText(ctx, (d.rival || "Rival").toUpperCase(), W / 2 + badgeOffsetX, badgeCy + badgeR + H * 0.05, W * 0.42, W * 0.048, 2);

  // Tarjeta con fecha, hora y lugar, con el mismo look premium que las
  // demás plantillas (torneo, entrenamiento).
  const cardW = W * 0.82, cardH = H * 0.2, cardY = H * 0.6, cardX = (W - cardW) / 2;
  imgRoundRect(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.stroke();

  if (d.fecha) {
    imgFitFont(ctx, d.fecha, cardW * 0.88, "700", cardH * 0.2, cardH * 0.1);
    ctx.fillStyle = "#fff";
    ctx.fillText(d.fecha, W / 2, cardY + cardH * 0.32);
  }
  if (d.hora) {
    ctx.font = "800 " + Math.round(cardH * 0.34) + "px Poppins, sans-serif";
    ctx.fillStyle = cGold;
    ctx.fillText(d.hora, W / 2, cardY + cardH * 0.68);
  }
  if (d.lugar) {
    ctx.font = "600 " + Math.round(cardH * 0.15) + "px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.78)";
    imgWrapText(ctx, d.lugar, W / 2, cardY + cardH * 0.92, cardW * 0.9, cardH * 0.16, 1);
  }

  ctx.font = "600 " + Math.round(W * 0.028) + "px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.fillText("¡No te lo pierdas! 💪⚽", W / 2, cardY + cardH + H * 0.055);

  imgBarraInferiorGen(ctx, d.club, W, H, barraH);
}

async function generarImagenResultado(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  const escudoR = W * 0.09;
  const escudoY = H * 0.1;
  imgEscudo(ctx, logo, W / 2, escudoY, escudoR);

  ctx.textAlign = "center";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 " + Math.round(W * 0.028) + "px Poppins, sans-serif";
  ctx.fillText("RESULTADO FINAL", W / 2, escudoY + escudoR + H * 0.038);

  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
  const c2 = (d.club && d.club.colorSecundario) || "#0e7d29";
  const badgeR = W * 0.135;
  const badgeCy = escudoY + escudoR + H * 0.155;
  const badgeOffsetX = W * 0.24;
  await imgEquipoBadge(ctx, W / 2 - badgeOffsetX, badgeCy, badgeR, d.propioLogoUrl, d.propio, c1);
  await imgEquipoBadge(ctx, W / 2 + badgeOffsetX, badgeCy, badgeR, d.rivalLogoUrl, d.rival, c2);

  ctx.fillStyle = "#fff";
  ctx.font = "800 " + Math.round(W * 0.04) + "px Poppins, sans-serif";
  imgWrapText(ctx, (d.propio || "Nosotros").toUpperCase(), W / 2 - badgeOffsetX, badgeCy + badgeR + H * 0.048, W * 0.42, W * 0.042, 2);
  imgWrapText(ctx, (d.rival || "Rival").toUpperCase(), W / 2 + badgeOffsetX, badgeCy + badgeR + H * 0.048, W * 0.42, W * 0.042, 2);

  const cardW = W * 0.62, cardH = H * 0.115, cardY = badgeCy + badgeR + H * 0.14, cardX = (W - cardW) / 2;
  imgRoundRect(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(cardH * 0.62) + "px Poppins, sans-serif";
  ctx.fillText((d.golesPropio != null ? d.golesPropio : 0) + "  -  " + (d.golesRival != null ? d.golesRival : 0), W / 2, cardY + cardH * 0.66);

  if (d.fecha) {
    ctx.font = "700 " + Math.round(W * 0.0296) + "px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillText(d.fecha, W / 2, cardY + cardH + H * 0.048);
  }

  imgBarraInferiorGen(ctx, d.club, W, H, barraH);
}

async function generarImagenJornada(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  const escudoR = W * 0.066;
  imgEscudo(ctx, logo, W / 2, H * 0.081, escudoR);

  ctx.textAlign = "center";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 " + Math.round(W * 0.026) + "px Poppins, sans-serif";
  ctx.fillText("PRÓXIMA JORNADA", W / 2, H * 0.141);
  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(W * 0.039) + "px Poppins, sans-serif";
  imgWrapText(ctx, (d.club && d.club.clubNombre ? d.club.clubNombre.toUpperCase() : "NUESTROS PARTIDOS"), W / 2, H * 0.171, W * 0.83, W * 0.0426, 1);

  const partidos = (d.partidos || []).slice(0, 5);
  const ROW_H_FRAC_BY_COUNT = { 1: 0.177, 2: 0.156, 3: 0.135, 4: 0.109, 5: 0.094 };
  const rowH = H * (ROW_H_FRAC_BY_COUNT[partidos.length] || 0.109);
  const zonaTop = H * 0.219, zonaBottom = H - barraH - H * 0.021;
  const startY = zonaTop + Math.max(0, (zonaBottom - zonaTop - rowH * partidos.length) / 2);
  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
  const c2 = (d.club && d.club.colorSecundario) || "#0e7d29";

  if (!partidos.length) {
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.font = "700 " + Math.round(W * 0.03) + "px Poppins, sans-serif";
    ctx.fillText("Muy pronto anunciaremos la próxima jornada.", W / 2, H * 0.365);
  }

  for (let i = 0; i < partidos.length; i++) {
    const p = partidos[i];
    const y = startY + i * rowH;
    const boxH = rowH - H * 0.0135;

    imgRoundRect(ctx, W * 0.065, y, W * 0.87, boxH, 22);
    ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = imgRgba(c1, .35); ctx.stroke();

    const badgeCy = y + boxH / 2 + H * 0.003;
    const badgeR = boxH >= H * 0.15 ? W * 0.062 : W * 0.05;
    await imgEquipoBadge(ctx, W * 0.181, badgeCy, badgeR, p.localLogoUrl, p.local, c1);
    await imgEquipoBadge(ctx, W - W * 0.181, badgeCy, badgeR, p.visitanteLogoUrl, p.visitante, c2);

    ctx.fillStyle = "#fff";
    ctx.font = "800 " + Math.round(W * 0.0222) + "px Poppins, sans-serif";
    ctx.textAlign = "center";
    imgWrapText(ctx, (p.local || "").toUpperCase(), W * 0.181, badgeCy + badgeR + H * 0.0177, W * 0.185, W * 0.024, 1);
    imgWrapText(ctx, (p.visitante || "").toUpperCase(), W - W * 0.181, badgeCy + badgeR + H * 0.0177, W * 0.185, W * 0.024, 1);

    ctx.font = "800 " + Math.round(W * 0.0296) + "px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.fillText("VS", W / 2, badgeCy + H * 0.005);

    ctx.font = "700 " + Math.round(W * 0.0213) + "px Poppins, sans-serif";
    ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
    const infoTxt = [p.fecha, p.hora].filter(Boolean).join(" · ");
    if (infoTxt) ctx.fillText(infoTxt, W / 2, y + H * 0.0177);
    if (p.cancha) {
      ctx.font = "600 " + Math.round(W * 0.0176) + "px Poppins, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.fillText(p.cancha, W / 2, y + boxH - H * 0.006);
    }
  }

  imgBarraInferiorGen(ctx, d.club, W, H, barraH);
}

async function generarImagenGoleadores(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  const escudoR = W * 0.08;
  imgEscudo(ctx, logo, W / 2, H * 0.091, escudoR);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(W * 0.041) + "px Poppins, sans-serif";
  ctx.fillText("TABLA DE GOLEADORES", W / 2, H * 0.161);

  const medallas = ["🥇", "🥈", "🥉"];
  const filas = (d.filas || []).slice(0, 10);
  const filasN = Math.max(filas.length, 1);
  const zonaTop = H * 0.213, zonaBottom = H - barraH - H * 0.021;
  const rowH = Math.min(H * 0.0667, (zonaBottom - zonaTop) / filasN);
  const padX = W * 0.0556;
  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
  const cOro = (d.club && d.club.colorTerciario) || "#FFC933";

  if (!filas.length) {
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.font = "700 " + Math.round(W * 0.03) + "px Poppins, sans-serif";
    ctx.fillText("Todavía no hay goles registrados.", W / 2, H * 0.365);
  }

  filas.forEach(function (s, i) {
    const y = zonaTop + i * rowH;
    imgRoundRect(ctx, padX - W * 0.0185, y, W - (padX - W * 0.0185) * 2, rowH - H * 0.0094, 18);
    ctx.fillStyle = i < 3 ? imgRgba(cOro, .14) : "rgba(255,255,255,.05)";
    ctx.fill();
    if (i < 3) { ctx.lineWidth = 1.5; ctx.strokeStyle = imgRgba(cOro, .5); ctx.stroke(); }

    ctx.textAlign = "left";
    ctx.font = "900 " + Math.round(W * 0.0352) + "px Poppins, sans-serif";
    ctx.fillStyle = i < 3 ? "#fff" : "rgba(255,255,255,.85)";
    ctx.fillText(i < 3 ? medallas[i] : String(i + 1), padX, y + rowH * 0.53);

    ctx.font = "800 " + Math.round(W * 0.0296) + "px Poppins, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText((s.nombre || "").length > 16 ? s.nombre.slice(0, 15) + "…" : (s.nombre || ""), padX + W * 0.0833, y + rowH * 0.39);
    ctx.font = "600 " + Math.round(W * 0.0204) + "px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.fillText(s.equipoNombre || "", padX + W * 0.0833, y + rowH * 0.66);

    ctx.textAlign = "right";
    ctx.fillStyle = c1;
    ctx.font = "900 " + Math.round(W * 0.0407) + "px Poppins, sans-serif";
    ctx.fillText(String(s.goles), W - padX, y + rowH * 0.53);
    ctx.font = "700 " + Math.round(W * 0.0176) + "px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.fillText("GOLES", W - padX, y + rowH * 0.72);
  });

  imgBarraInferiorGen(ctx, d.club, W, H, barraH);
}

async function generarImagenTabla(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  const escudoR = W * 0.08;
  imgEscudo(ctx, logo, W / 2, H * 0.091, escudoR);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(W * 0.041) + "px Poppins, sans-serif";
  ctx.fillText("TABLA DE POSICIONES", W / 2, H * 0.161);

  const filas = (d.filas || []).slice(0, 10);
  const filasN = Math.max(filas.length, 1);
  const zonaTop = H * 0.208, zonaBottom = H - barraH - H * 0.021;
  const rowH = Math.min(H * 0.0563, (zonaBottom - zonaTop) / filasN);
  const padX = W * 0.0556;
  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";

  ctx.textAlign = "left";
  ctx.font = "800 " + Math.round(W * 0.024) + "px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.5)";
  ctx.fillText("#", padX, zonaTop - H * 0.01);
  ctx.fillText("EQUIPO", padX + W * 0.074, zonaTop - H * 0.01);
  ctx.textAlign = "right";
  ["PJ", "DG", "PTS"].forEach(function (t, i) { ctx.fillText(t, W - padX - (2 - i) * W * 0.12, zonaTop - H * 0.01); });

  filas.forEach(function (s, i) {
    const y = zonaTop + i * rowH + rowH * 0.7;
    if (i % 2 === 0) { ctx.fillStyle = "rgba(255,255,255,.04)"; ctx.fillRect(padX - W * 0.0185, y - rowH + H * 0.0156, W - (padX - W * 0.0185) * 2, rowH - H * 0.0073); }
    if (i < 3) { ctx.fillStyle = imgRgba(c1, .18); ctx.fillRect(padX - W * 0.0185, y - rowH + H * 0.0156, 10, rowH - H * 0.0073); }

    ctx.textAlign = "left";
    ctx.fillStyle = i < 3 ? "#fff" : "rgba(255,255,255,.85)";
    ctx.font = "900 " + Math.round(W * 0.0315) + "px Poppins, sans-serif";
    ctx.fillText(String(i + 1), padX, y);
    ctx.font = "800 " + Math.round(W * 0.0296) + "px Poppins, sans-serif";
    ctx.fillText((s.nombre || "").length > 18 ? s.nombre.slice(0, 17) + "…" : (s.nombre || ""), padX + W * 0.074, y);

    ctx.textAlign = "right";
    ctx.font = "700 " + Math.round(W * 0.0278) + "px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillText(String(s.pj), W - padX - W * 0.241, y);
    ctx.fillText((s.dg > 0 ? "+" : "") + s.dg, W - padX - W * 0.12, y);
    ctx.fillStyle = "#fff"; ctx.font = "900 " + Math.round(W * 0.0315) + "px Poppins, sans-serif";
    ctx.fillText(String(s.pts), W - padX, y);
  });

  imgBarraInferiorGen(ctx, d.club, W, H, barraH);
}

async function generarImagenAliado(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  let topY = H * 0.083;
  if (d.mostrarEscudo) {
    const logo = await imgLoadImage(d.club && d.club.logoUrl);
    const escudoR = W * 0.07;
    imgEscudo(ctx, logo, W / 2, topY, escudoR);
    topY += escudoR + H * 0.07;
  } else {
    topY += H * 0.03;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 " + Math.round(W * 0.026) + "px Poppins, sans-serif";
  ctx.fillText("ALIADO OFICIAL", W / 2, topY);

  const patLogo = await imgLoadImage(d.logoUrl);
  const boxW = W * 0.4, boxH = H * 0.13, boxY = topY + H * 0.033;
  if (patLogo) {
    imgRoundRect(ctx, W / 2 - boxW / 2, boxY, boxW, boxH, 20);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.save();
    imgRoundRect(ctx, W / 2 - boxW / 2, boxY, boxW, boxH, 20); ctx.clip();
    const scale = Math.min((boxW * 0.89) / patLogo.width, (boxH * 0.82) / patLogo.height);
    const w = patLogo.width * scale, h = patLogo.height * scale;
    ctx.drawImage(patLogo, W / 2 - w / 2, boxY + boxH / 2 - h / 2, w, h);
    ctx.restore();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(W * 0.054) + "px Poppins, sans-serif";
  const nombreY = boxY + boxH + H * 0.075;
  imgWrapText(ctx, (d.nombre || "Nuestro aliado").toUpperCase(), W / 2, nombreY, W * 0.83, W * 0.059, 2);

  let cursorY = nombreY + H * 0.075;
  if (d.oferta) {
    const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
    const ofertaW = Math.min(W * 0.72, ctx.measureText(d.oferta).width + W * 0.12);
    imgRoundRect(ctx, W / 2 - ofertaW / 2, cursorY, ofertaW, H * 0.047, H * 0.023);
    ctx.fillStyle = c1; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "800 " + Math.round(W * 0.033) + "px Poppins, sans-serif";
    ctx.fillText(d.oferta, W / 2, cursorY + H * 0.031);
    cursorY += H * 0.08;
  }

  if (d.descripcion) {
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.font = "600 " + Math.round(W * 0.0296) + "px Poppins, sans-serif";
    imgWrapText(ctx, d.descripcion, W / 2, cursorY + H * 0.03, W * 0.76, W * 0.0407, 4);
    cursorY += H * 0.13;
  }

  if (d.ctaTexto) {
    const ctaW = W * 0.41, ctaH = H * 0.052, ctaY = Math.max(cursorY + H * 0.02, H - barraH - H * 0.13);
    imgRoundRect(ctx, W / 2 - ctaW / 2, ctaY, ctaW, ctaH, ctaH / 2);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "800 " + Math.round(W * 0.0315) + "px Poppins, sans-serif";
    ctx.fillText(d.ctaTexto, W / 2, ctaY + ctaH * 0.65);
  }

  imgBarraInferiorGen(ctx, d.club, W, H, barraH);
}

// ── Formatos e imágenes con fondo personalizado (entrenamientos, cumpleaños) ──
// Estas usan un segundo sistema de fondo/pie de página que admite dos
// proporciones (historia 9:16 y cuadrada 1:1) y una imagen de fondo subida
// por el club, sin tocar los generadores existentes arriba.
const IMG_FORMATOS = {
  story: { w: 1080, h: 1920, label: "9:16 · Historia" },
  square: { w: 1080, h: 1080, label: "1:1 · Cuadrada" }
};

function imgFondoPersonalizado(ctx, w, h, fondoImg, club) {
  if (fondoImg) {
    const scale = Math.max(w / fondoImg.width, h / fondoImg.height);
    const iw = fondoImg.width * scale, ih = fondoImg.height * scale;
    ctx.drawImage(fondoImg, (w - iw) / 2, (h - ih) / 2, iw, ih);
    const overlay = ctx.createLinearGradient(0, 0, 0, h);
    overlay.addColorStop(0, "rgba(5,7,10,.5)");
    overlay.addColorStop(.55, "rgba(5,7,10,.28)");
    overlay.addColorStop(1, "rgba(5,7,10,.8)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const c1 = (club && club.colorPrimario) || "#18A83A";
  ctx.fillStyle = "#05070a";
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w / 2, h * 0.22, 40, w / 2, h * 0.22, Math.max(w, h) * 0.85);
  glow.addColorStop(0, imgRgba(c1, .35));
  glow.addColorStop(1, imgRgba(c1, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,.035)";
  for (let y = 0; y < h; y += 34) {
    for (let x = (y / 34) % 2 === 0 ? 0 : 17; x < w; x += 34) {
      ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
    }
  }
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function imgBarraInferiorGen(ctx, club, w, h, barraH) {
  const c1 = (club && club.colorPrimario) || "#18A83A";
  const c2 = (club && club.colorSecundario) || "#0e7d29";
  const y0 = h - barraH;
  const grad = ctx.createLinearGradient(0, y0, w, h);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, y0, w, barraH);
  ctx.fillStyle = "rgba(0,0,0,.15)";
  for (let x = -200; x < w + 200; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, y0); ctx.lineTo(x + 24, y0); ctx.lineTo(x - 30, h); ctx.lineTo(x - 54, h);
    ctx.closePath(); ctx.fill();
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(barraH * 0.22) + "px Poppins, sans-serif";
  ctx.fillText((club && club.clubNombre ? club.clubNombre.toUpperCase() : "MI CLUB"), w / 2, y0 + barraH * 0.44);
  ctx.font = "700 " + Math.round(barraH * 0.115) + "px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillText("Gestionado con BioFutbol", w / 2, y0 + barraH * 0.62);
}

// d = { club, tipo: "recordatorio"|"hoy", categoria, dia, hora, sede, formato, fondoUrl }
async function generarImagenEntrenamiento(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  const escudoR = W * 0.075;
  const escudoY = H * 0.13;
  imgEscudo(ctx, logo, W / 2, escudoY, escudoR);

  ctx.textAlign = "center";
  const esHoy = d.tipo === "hoy";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 " + Math.round(W * 0.032) + "px Poppins, sans-serif";
  ctx.fillText(esHoy ? "¡HOY ENTRENAMOS!" : "RECORDATORIO · ENTRENAMOS MAÑANA", W / 2, escudoY + escudoR + H * 0.045);

  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(W * 0.068) + "px Poppins, sans-serif";
  imgWrapText(ctx, d.categoria ? d.categoria.toUpperCase() : "TODAS LAS CATEGORÍAS", W / 2, escudoY + escudoR + H * 0.11, W * 0.85, W * 0.072, 2);

  const cardW = W * 0.82, cardH = H * 0.24, cardY = H * 0.46, cardX = (W - cardW) / 2;
  imgRoundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(cardH * 0.32) + "px Poppins, sans-serif";
  ctx.fillText(d.dia || "", W / 2, cardY + cardH * 0.4);
  ctx.font = "800 " + Math.round(cardH * 0.24) + "px Poppins, sans-serif";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.fillText(d.hora || "", W / 2, cardY + cardH * 0.7);
  if (d.sede) {
    ctx.font = "600 " + Math.round(cardH * 0.15) + "px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillText(d.sede, W / 2, cardY + cardH * 0.92);
  }

  ctx.font = "600 " + Math.round(W * 0.03) + "px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.8)";
  imgWrapText(ctx, esHoy ? "¡No faltes! Nos vemos en la cancha 💪⚽" : "Prepárate, mañana seguimos mejorando 💪⚽", W / 2, cardY + cardH + H * 0.06, W * 0.78, W * 0.038, 2);

  imgBarraInferiorGen(ctx, d.club, W, H, barraH);
}

// Confeti de puntos y formas de colores repartidos por el lienzo — el
// toque festivo que separa una imagen de cumpleaños "premium" de una
// plantilla genérica. Determinístico (sin Math.random) para que el PDF/PNG
// se vea igual cada vez que se regenera con los mismos datos.
function imgConfeti(ctx, w, h, colores, zonaY0, zonaY1) {
  const formas = ["circulo", "cuadro", "circulo", "raya"];
  const n = 46;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const x = (w * ((t * 13.37) % 1));
    const y = zonaY0 + (zonaY1 - zonaY0) * ((t * 7.919 + i * 0.031) % 1);
    const color = colores[i % colores.length];
    const size = w * (0.006 + ((i * 37) % 10) / 1000);
    const rot = (i * 53) % 360;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot * Math.PI / 180);
    ctx.globalAlpha = 0.55 + ((i % 5) * 0.08);
    ctx.fillStyle = color;
    const forma = formas[i % formas.length];
    if (forma === "circulo") {
      ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
    } else if (forma === "cuadro") {
      ctx.fillRect(-size * 0.8, -size * 0.8, size * 1.6, size * 1.6);
    } else {
      ctx.fillRect(-size * 1.5, -size * 0.4, size * 3, size * 0.8);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// d = { club, nombre, categoria, fotoUrl, formato, fondoUrl }
async function generarImagenCumpleanos(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  const cOro = (d.club && d.club.colorTerciario) || "#FFC933";
  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
  const c2 = (d.club && d.club.colorSecundario) || "#0e7d29";
  ctx.textAlign = "center";

  imgConfeti(ctx, W, H, [cOro, c1, "#ff6b8b", "#4fc3f7", "#ffffff"], H * 0.02, H * 0.98);

  // El formato cuadrado tiene ~44% menos alto que la historia con el mismo
  // ancho — sin este factor, el titular y la foto tuvieron que reducirse o
  // se encimaban. "k" comprime tipografía/foto solo en cuadrado.
  const k = H < W * 1.4 ? 0.72 : 1;

  // Pastilla "CUMPLEAÑOS" pequeña arriba, como preludio del titular grande.
  const pillTxt = "🎉  CUMPLEAÑOS  🎉";
  ctx.font = "800 " + Math.round(W * 0.026 * k) + "px Poppins, sans-serif";
  const pillPadX = W * 0.045, pillH = H * 0.032;
  const pillW = ctx.measureText(pillTxt).width + pillPadX * 2;
  const pillY = H * 0.075;
  imgRoundRect(ctx, W / 2 - pillW / 2, pillY - pillH * 0.7, pillW, pillH, pillH / 2);
  ctx.fillStyle = imgRgba(cOro, .18); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = imgRgba(cOro, .55); ctx.stroke();
  ctx.fillStyle = cOro;
  ctx.fillText(pillTxt, W / 2, pillY + pillH * 0.14);

  // Titular grande "¡FELIZ CUMPLEAÑOS!" — el foco visual de toda la
  // imagen: tipografía juvenil bien gruesa, con degradado dorado y
  // resplandor, tal como pide un look "muy pro, muy premium".
  const tituloY = H * 0.155;
  const tituloLineGap = W * 0.095 * k;
  ctx.save();
  ctx.font = "900 " + Math.round(W * 0.088 * k) + "px Poppins, sans-serif";
  const tituloGrad = ctx.createLinearGradient(W * 0.5 - W * 0.42, 0, W * 0.5 + W * 0.42, 0);
  tituloGrad.addColorStop(0, "#fff8e0");
  tituloGrad.addColorStop(.45, cOro);
  tituloGrad.addColorStop(1, "#fff8e0");
  ctx.fillStyle = tituloGrad;
  ctx.shadowColor = imgRgba(cOro, .55);
  ctx.shadowBlur = W * 0.035;
  imgWrapText(ctx, "¡FELIZ", W / 2, tituloY, W * 0.92, W * 0.086 * k, 1);
  imgWrapText(ctx, "CUMPLEAÑOS!", W / 2, tituloY + tituloLineGap, W * 0.94, W * 0.086 * k, 1);
  ctx.restore();

  const r = W * 0.25 * k;
  const cy = tituloY + tituloLineGap + H * (k < 1 ? 0.205 : 0.135);
  const glow = ctx.createRadialGradient(W / 2, cy, r * 0.6, W / 2, cy, r * 1.35);
  glow.addColorStop(0, imgRgba(cOro, .28));
  glow.addColorStop(1, imgRgba(cOro, 0));
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(W / 2, cy, r * 1.35, 0, Math.PI * 2); ctx.fill();

  await imgEquipoBadge(ctx, W / 2, cy, r, d.fotoUrl, d.nombre, c1);

  // Estrellita de acento sobre el aro de la foto, como si fuera una
  // insignia — remata el efecto "muy premium" de la pieza.
  ctx.save();
  ctx.font = "900 " + Math.round(W * 0.07 * k) + "px Poppins, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("⭐", W / 2 + r * 0.78, cy - r * 0.78);
  ctx.restore();

  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(W * 0.07 * k) + "px Poppins, sans-serif";
  imgWrapText(ctx, (d.nombre || "").toUpperCase(), W / 2, cy + r + H * 0.06, W * 0.85, W * 0.075 * k, 2);

  if (d.categoria) {
    ctx.font = "700 " + Math.round(W * 0.03 * k) + "px Poppins, sans-serif";
    ctx.fillStyle = imgRgba(cOro, .95);
    ctx.fillText(d.categoria, W / 2, cy + r + H * 0.118);
  }

  ctx.font = "600 " + Math.round(W * 0.03 * k) + "px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.88)";
  imgWrapText(ctx, "Todo el equipo de " + ((d.club && d.club.clubNombre) || "tu club") + " te desea un día increíble ⚽🎂", W / 2, cy + r + H * 0.2, W * 0.8, W * 0.042 * k, 3);

  imgBarraInferiorGen(ctx, d.club, W, H, barraH);
}

// d = { club, torneo: {nombre, logoUrl, fechaTexto, lugar, valorInscripcion}, formato, fondoUrl }
async function generarImagenTorneo(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const torneo = d.torneo || {};

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  ctx.textAlign = "center";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 " + Math.round(W * 0.032) + "px Poppins, sans-serif";
  ctx.fillText("🏆 NOS VAMOS AL TORNEO", W / 2, H * 0.11);

  const r = W * 0.19;
  const cy = H * 0.28;
  await imgEquipoBadge(ctx, W / 2, cy, r, torneo.logoUrl, "🏆", (d.club && d.club.colorPrimario) || "#18A83A");

  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(W * 0.062) + "px Poppins, sans-serif";
  imgWrapText(ctx, (torneo.nombre || "Torneo").toUpperCase(), W / 2, cy + r + H * 0.075, W * 0.85, W * 0.066, 2);

  const cardW = W * 0.82, cardH = H * 0.22, cardY = H * 0.56, cardX = (W - cardW) / 2;
  imgRoundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.stroke();

  const fechaTxt = torneo.fechaTexto || "Fecha por confirmar";
  imgFitFont(ctx, fechaTxt, cardW * 0.9, "800", cardH * 0.24, cardH * 0.11);
  ctx.fillStyle = "#fff";
  ctx.fillText(fechaTxt, W / 2, cardY + cardH * 0.34);

  if (torneo.lugar) {
    ctx.font = "600 " + Math.round(cardH * 0.15) + "px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.8)";
    imgWrapText(ctx, "📍 " + torneo.lugar, W / 2, cardY + cardH * 0.6, cardW * 0.9, cardH * 0.16, 1);
  }

  if (torneo.valorInscripcion) {
    const inscTxt = "Inscripción: $" + Number(torneo.valorInscripcion).toLocaleString("es-CO");
    imgFitFont(ctx, inscTxt, cardW * 0.9, "800", cardH * 0.2, cardH * 0.1);
    ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
    ctx.fillText(inscTxt, W / 2, cardY + cardH * 0.9);
  }

  ctx.font = "600 " + Math.round(W * 0.03) + "px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.fillText("¡Vamos con todo! 💪⚽", W / 2, cardY + cardH + H * 0.055);

  imgBarraInferiorGen(ctx, d.club, W, H, barraH);
}

function imgCanvasToBlob(canvas) {
  return new Promise(function (resolve, reject) {
    try {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob); else reject(new Error("No se pudo generar la imagen."));
      }, "image/png", 1);
    } catch (err) { reject(err); }
  });
}

// blobPrecomputado (opcional): si ya se generó el blob de antemano (ver
// generarImagenClub en club-panel.html), se usa directo en vez de volver a
// codificar el canvas — así el botón responde al toque sin ningún await de
// por medio, evitando que Safari/iOS pierda el "gesto del usuario" y cancele
// el share sheet solo (error "Abort due to cancellation of share").
async function imgDescargar(canvas, nombreArchivo, blobPrecomputado) {
  const blob = blobPrecomputado || await imgCanvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombreArchivo || "biofutbol.png";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}

async function imgCompartir(canvas, nombreArchivo, textoCaption, blobPrecomputado) {
  const blob = blobPrecomputado || await imgCanvasToBlob(canvas);
  const file = new File([blob], nombreArchivo || "biofutbol.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], text: textoCaption || "" });
    return true;
  }
  await imgDescargar(canvas, nombreArchivo, blob);
  return false;
}
