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

async function generarImagenPartido(canvas, d) {
  const ctx = canvas.getContext("2d");
  canvas.width = IMG_W; canvas.height = IMG_H;
  imgFondoBase(ctx, d.club);

  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  imgEscudo(ctx, logo, IMG_W / 2, 210, 90);

  ctx.textAlign = "center";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 30px Poppins, sans-serif";
  ctx.fillText("PRÓXIMO PARTIDO", IMG_W / 2, 400);

  const c2 = (d.club && d.club.colorSecundario) || "#0e7d29";
  await imgEquipoBadge(ctx, IMG_W / 2 - 240, 620, 100, d.propioLogoUrl, d.propio, (d.club && d.club.colorPrimario) || "#18A83A");
  await imgEquipoBadge(ctx, IMG_W / 2 + 240, 620, 100, d.rivalLogoUrl, d.rival, c2);

  ctx.fillStyle = "#fff";
  ctx.font = "900 46px Poppins, sans-serif";
  imgWrapText(ctx, (d.propio || "Nosotros").toUpperCase(), IMG_W / 2 - 240, 780, 320, 50, 2);

  ctx.font = "800 44px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillText("VS", IMG_W / 2, 630);

  ctx.fillStyle = "#fff";
  ctx.font = "900 46px Poppins, sans-serif";
  imgWrapText(ctx, (d.rival || "Rival").toUpperCase(), IMG_W / 2 + 240, 780, 320, 50, 2);

  const infoY = 980;
  ctx.font = "700 34px Poppins, sans-serif";
  ctx.fillStyle = "#fff";
  if (d.fecha) ctx.fillText(d.fecha, IMG_W / 2, infoY);
  if (d.hora) { ctx.font = "800 52px Poppins, sans-serif"; ctx.fillText(d.hora, IMG_W / 2, infoY + 80); }
  if (d.lugar) { ctx.font = "700 32px Poppins, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillText(d.lugar, IMG_W / 2, infoY + 140); }

  imgBarraInferior(ctx, d.club);
}

async function generarImagenResultado(canvas, d) {
  const ctx = canvas.getContext("2d");
  canvas.width = IMG_W; canvas.height = IMG_H;
  imgFondoBase(ctx, d.club);

  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  imgEscudo(ctx, logo, IMG_W / 2, 190, 80);

  ctx.textAlign = "center";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 30px Poppins, sans-serif";
  ctx.fillText("RESULTADO FINAL", IMG_W / 2, 340);

  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
  const c2 = (d.club && d.club.colorSecundario) || "#0e7d29";
  await imgEquipoBadge(ctx, IMG_W / 2 - 260, 560, 100, d.propioLogoUrl, d.propio, c1);
  await imgEquipoBadge(ctx, IMG_W / 2 + 260, 560, 100, d.rivalLogoUrl, d.rival, c2);

  ctx.fillStyle = "#fff";
  ctx.font = "800 38px Poppins, sans-serif";
  imgWrapText(ctx, (d.propio || "Nosotros").toUpperCase(), IMG_W / 2 - 260, 700, 320, 44, 2);
  imgWrapText(ctx, (d.rival || "Rival").toUpperCase(), IMG_W / 2 + 260, 700, 320, 44, 2);

  imgRoundRect(ctx, IMG_W / 2 - 220, 800, 440, 200, 26);
  ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "900 130px Poppins, sans-serif";
  ctx.fillText((d.golesPropio != null ? d.golesPropio : 0) + "  -  " + (d.golesRival != null ? d.golesRival : 0), IMG_W / 2, 940);

  if (d.fecha) {
    ctx.font = "700 32px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillText(d.fecha, IMG_W / 2, 1080);
  }

  imgBarraInferior(ctx, d.club);
}

async function generarImagenJornada(canvas, d) {
  const ctx = canvas.getContext("2d");
  canvas.width = IMG_W; canvas.height = IMG_H;
  imgFondoBase(ctx, d.club);

  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  imgEscudo(ctx, logo, IMG_W / 2, 155, 62);

  ctx.textAlign = "center";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 28px Poppins, sans-serif";
  ctx.fillText("PRÓXIMA JORNADA", IMG_W / 2, 270);
  ctx.fillStyle = "#fff";
  ctx.font = "900 42px Poppins, sans-serif";
  imgWrapText(ctx, (d.club && d.club.clubNombre ? d.club.clubNombre.toUpperCase() : "NUESTROS PARTIDOS"), IMG_W / 2, 328, 900, 46, 1);

  const partidos = (d.partidos || []).slice(0, 5);
  const ROW_H_BY_COUNT = { 1: 340, 2: 300, 3: 260, 4: 210, 5: 180 };
  const rowH = ROW_H_BY_COUNT[partidos.length] || 210;
  const zonaTop = 420, zonaBottom = IMG_H - 210 - 40;
  const startY = zonaTop + Math.max(0, (zonaBottom - zonaTop - rowH * partidos.length) / 2);
  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
  const c2 = (d.club && d.club.colorSecundario) || "#0e7d29";

  if (!partidos.length) {
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.font = "700 32px Poppins, sans-serif";
    ctx.fillText("Muy pronto anunciaremos la próxima jornada.", IMG_W / 2, 700);
  }

  for (let i = 0; i < partidos.length; i++) {
    const p = partidos[i];
    const y = startY + i * rowH;
    const boxH = rowH - 26;

    imgRoundRect(ctx, 70, y, IMG_W - 140, boxH, 22);
    ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = imgRgba(c1, .35); ctx.stroke();

    const badgeCy = y + boxH / 2 + 6;
    const badgeR = boxH >= 200 ? 58 : 48;
    await imgEquipoBadge(ctx, 195, badgeCy, badgeR, p.localLogoUrl, p.local, c1);
    await imgEquipoBadge(ctx, IMG_W - 195, badgeCy, badgeR, p.visitanteLogoUrl, p.visitante, c2);

    ctx.fillStyle = "#fff";
    ctx.font = "800 24px Poppins, sans-serif";
    ctx.textAlign = "center";
    imgWrapText(ctx, (p.local || "").toUpperCase(), 195, badgeCy + badgeR + 34, 200, 26, 1);
    imgWrapText(ctx, (p.visitante || "").toUpperCase(), IMG_W - 195, badgeCy + badgeR + 34, 200, 26, 1);

    ctx.font = "800 32px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.fillText("VS", IMG_W / 2, badgeCy + 10);

    ctx.font = "700 23px Poppins, sans-serif";
    ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
    const infoTxt = [p.fecha, p.hora].filter(Boolean).join(" · ");
    if (infoTxt) ctx.fillText(infoTxt, IMG_W / 2, y + 34);
    if (p.cancha) {
      ctx.font = "600 19px Poppins, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.fillText(p.cancha, IMG_W / 2, y + boxH - 12);
    }
  }

  imgBarraInferior(ctx, d.club);
}

async function generarImagenGoleadores(canvas, d) {
  const ctx = canvas.getContext("2d");
  canvas.width = IMG_W; canvas.height = IMG_H;
  imgFondoBase(ctx, d.club);

  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  imgEscudo(ctx, logo, IMG_W / 2, 175, 70);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "900 44px Poppins, sans-serif";
  ctx.fillText("TABLA DE GOLEADORES", IMG_W / 2, 310);

  const medallas = ["🥇", "🥈", "🥉"];
  const filas = (d.filas || []).slice(0, 10);
  const startY = 410, rowH = 128, padX = 60;
  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
  const cOro = (d.club && d.club.colorTerciario) || "#FFC933";

  if (!filas.length) {
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.font = "700 32px Poppins, sans-serif";
    ctx.fillText("Todavía no hay goles registrados.", IMG_W / 2, 700);
  }

  filas.forEach(function (s, i) {
    const y = startY + i * rowH;
    imgRoundRect(ctx, padX - 20, y, IMG_W - (padX - 20) * 2, rowH - 18, 18);
    ctx.fillStyle = i < 3 ? imgRgba(cOro, .14) : "rgba(255,255,255,.05)";
    ctx.fill();
    if (i < 3) { ctx.lineWidth = 1.5; ctx.strokeStyle = imgRgba(cOro, .5); ctx.stroke(); }

    ctx.textAlign = "left";
    ctx.font = "900 38px Poppins, sans-serif";
    ctx.fillStyle = i < 3 ? "#fff" : "rgba(255,255,255,.85)";
    ctx.fillText(i < 3 ? medallas[i] : String(i + 1), padX, y + 68);

    ctx.font = "800 32px Poppins, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText((s.nombre || "").length > 16 ? s.nombre.slice(0, 15) + "…" : (s.nombre || ""), padX + 90, y + 50);
    ctx.font = "600 22px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.fillText(s.equipoNombre || "", padX + 90, y + 84);

    ctx.textAlign = "right";
    ctx.fillStyle = c1;
    ctx.font = "900 44px Poppins, sans-serif";
    ctx.fillText(String(s.goles), IMG_W - padX, y + 68);
    ctx.font = "700 19px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.fillText("GOLES", IMG_W - padX, y + 92);
  });

  imgBarraInferior(ctx, d.club);
}

async function generarImagenTabla(canvas, d) {
  const ctx = canvas.getContext("2d");
  canvas.width = IMG_W; canvas.height = IMG_H;
  imgFondoBase(ctx, d.club);

  const logo = await imgLoadImage(d.club && d.club.logoUrl);
  imgEscudo(ctx, logo, IMG_W / 2, 175, 70);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "900 44px Poppins, sans-serif";
  ctx.fillText("TABLA DE POSICIONES", IMG_W / 2, 310);

  const filas = (d.filas || []).slice(0, 10);
  const startY = 400, rowH = 108, padX = 60;
  const c1 = (d.club && d.club.colorPrimario) || "#18A83A";

  ctx.textAlign = "left";
  ctx.font = "800 26px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.5)";
  ctx.fillText("#", padX, startY - 20);
  ctx.fillText("EQUIPO", padX + 80, startY - 20);
  ctx.textAlign = "right";
  ["PJ", "DG", "PTS"].forEach(function (t, i) { ctx.fillText(t, IMG_W - padX - (2 - i) * 130, startY - 20); });

  filas.forEach(function (s, i) {
    const y = startY + i * rowH;
    if (i % 2 === 0) { ctx.fillStyle = "rgba(255,255,255,.04)"; ctx.fillRect(padX - 20, y - rowH + 30, IMG_W - (padX - 20) * 2, rowH - 14); }
    if (i < 3) { ctx.fillStyle = imgRgba(c1, .18); ctx.fillRect(padX - 20, y - rowH + 30, 10, rowH - 14); }

    ctx.textAlign = "left";
    ctx.fillStyle = i < 3 ? "#fff" : "rgba(255,255,255,.85)";
    ctx.font = "900 34px Poppins, sans-serif";
    ctx.fillText(String(i + 1), padX, y);
    ctx.font = "800 32px Poppins, sans-serif";
    ctx.fillText((s.nombre || "").length > 18 ? s.nombre.slice(0, 17) + "…" : (s.nombre || ""), padX + 80, y);

    ctx.textAlign = "right";
    ctx.font = "700 30px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillText(String(s.pj), IMG_W - padX - 260, y);
    ctx.fillText((s.dg > 0 ? "+" : "") + s.dg, IMG_W - padX - 130, y);
    ctx.fillStyle = "#fff"; ctx.font = "900 34px Poppins, sans-serif";
    ctx.fillText(String(s.pts), IMG_W - padX, y);
  });

  imgBarraInferior(ctx, d.club);
}

async function generarImagenAliado(canvas, d) {
  const ctx = canvas.getContext("2d");
  canvas.width = IMG_W; canvas.height = IMG_H;
  imgFondoBase(ctx, d.club);

  if (d.mostrarEscudo) {
    const logo = await imgLoadImage(d.club && d.club.logoUrl);
    imgEscudo(ctx, logo, IMG_W / 2, 160, 60);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 28px Poppins, sans-serif";
  ctx.fillText("ALIADO OFICIAL", IMG_W / 2, 300);

  const patLogo = await imgLoadImage(d.logoUrl);
  if (patLogo) {
    imgRoundRect(ctx, IMG_W / 2 - 180, 360, 360, 220, 20);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.save();
    imgRoundRect(ctx, IMG_W / 2 - 180, 360, 360, 220, 20); ctx.clip();
    const scale = Math.min(320 / patLogo.width, 180 / patLogo.height);
    const w = patLogo.width * scale, h = patLogo.height * scale;
    ctx.drawImage(patLogo, IMG_W / 2 - w / 2, 360 + 110 - h / 2, w, h);
    ctx.restore();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "900 58px Poppins, sans-serif";
  imgWrapText(ctx, (d.nombre || "Nuestro aliado").toUpperCase(), IMG_W / 2, 700, 900, 64, 2);

  if (d.oferta) {
    const c1 = (d.club && d.club.colorPrimario) || "#18A83A";
    imgRoundRect(ctx, IMG_W / 2 - 260, 800, 520, 90, 45);
    ctx.fillStyle = c1; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "800 36px Poppins, sans-serif";
    ctx.fillText(d.oferta, IMG_W / 2, 856);
  }

  if (d.descripcion) {
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.font = "600 32px Poppins, sans-serif";
    imgWrapText(ctx, d.descripcion, IMG_W / 2, 990, 820, 44, 4);
  }

  if (d.ctaTexto) {
    imgRoundRect(ctx, IMG_W / 2 - 220, 1200, 440, 100, 50);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "800 34px Poppins, sans-serif";
    ctx.fillText(d.ctaTexto, IMG_W / 2, 1258);
  }

  imgBarraInferior(ctx, d.club);
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

// d = { club, nombre, categoria, fotoUrl, formato, fondoUrl }
async function generarImagenCumpleanos(canvas, d) {
  const fmt = IMG_FORMATOS[d.formato] || IMG_FORMATOS.story;
  const W = fmt.w, H = fmt.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fondoImg = d.fondoUrl ? await imgLoadImage(d.fondoUrl) : null;
  imgFondoPersonalizado(ctx, W, H, fondoImg, d.club);

  const barraH = H * 0.11;
  ctx.textAlign = "center";
  ctx.fillStyle = (d.club && d.club.colorTerciario) || "#FFC933";
  ctx.font = "800 " + Math.round(W * 0.04) + "px Poppins, sans-serif";
  ctx.fillText("🎉 ¡FELIZ CUMPLEAÑOS! 🎉", W / 2, H * 0.15);

  const r = W * 0.22;
  const cy = H * 0.34;
  await imgEquipoBadge(ctx, W / 2, cy, r, d.fotoUrl, d.nombre, (d.club && d.club.colorPrimario) || "#18A83A");

  ctx.fillStyle = "#fff";
  ctx.font = "900 " + Math.round(W * 0.066) + "px Poppins, sans-serif";
  imgWrapText(ctx, (d.nombre || "").toUpperCase(), W / 2, cy + r + H * 0.055, W * 0.85, W * 0.07, 2);

  if (d.categoria) {
    ctx.font = "700 " + Math.round(W * 0.03) + "px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.fillText(d.categoria, W / 2, cy + r + H * 0.11);
  }

  ctx.font = "600 " + Math.round(W * 0.03) + "px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.85)";
  imgWrapText(ctx, "Todo el equipo de " + ((d.club && d.club.clubNombre) || "tu club") + " te desea un día increíble ⚽🎂", W / 2, cy + r + H * 0.19, W * 0.78, W * 0.04, 3);

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

async function imgDescargar(canvas, nombreArchivo) {
  const blob = await imgCanvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombreArchivo || "biofutbol.png";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}

async function imgCompartir(canvas, nombreArchivo, textoCaption) {
  const blob = await imgCanvasToBlob(canvas);
  const file = new File([blob], nombreArchivo || "biofutbol.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], text: textoCaption || "" });
    return true;
  }
  await imgDescargar(canvas, nombreArchivo);
  return false;
}
