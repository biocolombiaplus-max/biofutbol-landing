// ── AVATAR DE CAMISETA POR DEFECTO ──
// Cuando un socio no tiene foto, en vez de un ícono genérico se muestra
// una camiseta con los colores del club y su número — se ve mucho más
// "de app profesional" que un silueta gris. Se genera con Canvas y se usa
// como data URL, así funciona igual en <img src="..."> que en las
// plantillas HTML del carnet.

function avatarHexToRgb(hex) {
  hex = (hex || "#18A83A").replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function avatarShade(hex, amt) {
  const c = avatarHexToRgb(hex);
  const f = function (v) { return Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt)))); };
  return "rgb(" + f(c.r) + "," + f(c.g) + "," + f(c.b) + ")";
}

function avatarJerseyDataUrl(club, numero) {
  const c1 = (club && club.colorPrimario) || "#18A83A";
  const c2 = (club && club.colorSecundario) || "#0e7d29";
  const canvas = document.createElement("canvas");
  canvas.width = 240; canvas.height = 240;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createRadialGradient(120, 90, 20, 120, 120, 170);
  bg.addColorStop(0, avatarShade(c1, -0.55));
  bg.addColorStop(1, "#12181f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 240, 240);

  function jerseyPath() {
    ctx.beginPath();
    ctx.moveTo(96, 60);
    ctx.bezierCurveTo(96, 78, 144, 78, 144, 60);
    ctx.lineTo(178, 72);
    ctx.bezierCurveTo(196, 80, 208, 100, 214, 128);
    ctx.lineTo(184, 148);
    ctx.lineTo(172, 122);
    ctx.lineTo(178, 232);
    ctx.bezierCurveTo(150, 240, 90, 240, 62, 232);
    ctx.lineTo(68, 122);
    ctx.lineTo(56, 148);
    ctx.lineTo(26, 128);
    ctx.bezierCurveTo(32, 100, 44, 80, 62, 72);
    ctx.closePath();
  }

  ctx.save();
  jerseyPath();
  ctx.clip();
  const jg = ctx.createLinearGradient(0, 50, 0, 240);
  jg.addColorStop(0, avatarShade(c1, 0.12));
  jg.addColorStop(1, avatarShade(c1, -0.18));
  ctx.fillStyle = jg;
  ctx.fillRect(0, 0, 240, 240);
  // franja diagonal
  ctx.fillStyle = avatarShade(c2, 0);
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(20, 190); ctx.lineTo(60, 150); ctx.lineTo(80, 150); ctx.lineTo(40, 240); ctx.lineTo(0, 240);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // contorno + cuello en V
  jerseyPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,.35)";
  ctx.stroke();
  ctx.fillStyle = avatarShade(c2, -0.1);
  ctx.beginPath();
  ctx.moveTo(102, 62); ctx.lineTo(120, 92); ctx.lineTo(138, 62);
  ctx.bezierCurveTo(133, 71, 107, 71, 102, 62);
  ctx.closePath();
  ctx.fill();

  // número
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.font = "900 92px Poppins, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(numero || "?"), 122, 168);
  ctx.fillStyle = "#fff";
  ctx.fillText(String(numero || "?"), 120, 165);

  return canvas.toDataURL("image/png");
}

// Pone la foto real si existe, o si no, la camiseta de avatar.
function aplicarAvatarOFoto(imgEl, fotoUrl, club, numero) {
  imgEl.src = fotoUrl || avatarJerseyDataUrl(club, numero);
}
