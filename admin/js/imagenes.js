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
  imgTeamBadge(ctx, IMG_W / 2 - 240, 620, 100, d.propio, (d.club && d.club.colorPrimario) || "#18A83A");
  imgTeamBadge(ctx, IMG_W / 2 + 240, 620, 100, d.rival, c2);

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
  imgTeamBadge(ctx, IMG_W / 2 - 260, 560, 100, d.propio, c1);
  imgTeamBadge(ctx, IMG_W / 2 + 260, 560, 100, d.rival, c2);

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
