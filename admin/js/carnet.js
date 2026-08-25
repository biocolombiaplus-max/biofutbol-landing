// ── CARNET DIGITAL — mismo formato para todos los clubes, con el escudo,
// nombre y color de cada uno. El QR se dibuja 100% en canvas, sin
// librerías externas (mismo método usado en la app de Atlético Norte).

function carnetEscHtml(s) {
  return String(s || "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c;
  });
}

function carnetIco(type) {
  if (type === "id") return '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2" stroke="white" stroke-width="1.8" fill="none"/><circle cx="8.5" cy="11" r="2" fill="white"/><path d="M5 18c0-2 1.5-3 3.5-3s3.5 1 3.5 3" fill="white"/><path d="M14 10h4M14 13h3" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>';
  if (type === "pos") return '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 100 14A7 7 0 0012 2zM4.929 19.071A10 10 0 0012 22a10 10 0 007.071-2.929" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
  if (type === "cat") return '<svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke="white" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>';
  return "";
}

function carnetStatusIco(activo) {
  var col = activo ? "#22c55e" : "#ef4444";
  return '<svg class="carnet-status-ico" viewBox="0 0 24 24" fill="none">'
    + '<path d="M12 2L4 6v5c0 5 3.5 9.3 8 10.5C16.5 20.3 20 16 20 11V6z" fill="' + col + '" opacity=".2"/>'
    + '<path d="M12 2L4 6v5c0 5 3.5 9.3 8 10.5C16.5 20.3 20 16 20 11V6z" stroke="' + col + '" stroke-width="1.8" fill="none"/>'
    + (activo ? '<path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : '<path d="M10 10l4 4M14 10l-4 4" stroke="white" stroke-width="2" stroke-linecap="round"/>')
    + '</svg>';
}

function carnetSigSvg() {
  return '<svg viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100px;height:26px">'
    + '<path d="M5 20 Q20 5 35 18 Q45 26 55 12 Q65 0 75 15 Q82 24 90 10 Q98 0 110 18" stroke="#444" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M100 22 Q104 28 108 22 Q112 16 115 20" stroke="#444" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
    + '</svg>';
}

// QR dibujado en canvas a partir de una semilla (no es un QR real escaneable
// por cualquier lector — es un patrón visual único por socio, en el mismo
// estilo que el carnet de referencia). El link real de verificación va
// debajo, en texto, para poder abrirlo manualmente.
function carnetDrawQR(canvas, seed, size, colorHex) {
  var N = 21, dpr = window.devicePixelRatio || 1, px = size * dpr;
  canvas.width = canvas.height = px; canvas.style.width = canvas.style.height = size + "px";
  var ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false;
  var mod = px / N, m = [], fn = [];
  for (var i = 0; i < N; i++) { m.push(new Array(N).fill(0)); fn.push(new Array(N).fill(false)); }
  function finder(r0, c0) { for (var dr = 0; dr < 7; dr++) for (var dc = 0; dc < 7; dc++) { m[r0 + dr][c0 + dc] = (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4)) ? 1 : 0; fn[r0 + dr][c0 + dc] = true; } }
  finder(0, 0); finder(0, 14); finder(14, 0);
  for (var i2 = 0; i2 < 8; i2++) fn[7][i2] = fn[i2][7] = fn[7][N - 1 - i2] = fn[i2][N - 8] = fn[N - 8][i2] = fn[N - 1 - i2][7] = true;
  for (var i3 = 8; i3 < N - 8; i3++) { m[6][i3] = i3 % 2 ? 0 : 1; m[i3][6] = i3 % 2 ? 0 : 1; fn[6][i3] = fn[i3][6] = true; }
  m[13][8] = 1; fn[13][8] = true;
  for (var i4 = 0; i4 < 9; i4++) fn[8][i4] = fn[i4][8] = fn[8][N - 1 - i4] = fn[N - 1 - i4][8] = true;
  for (var r0 = 8; r0 <= 12; r0++) for (var c0 = 8; c0 <= 12; c0++) fn[r0][c0] = true;
  var s = seed | 0;
  function bit() { s = Math.imul(s, 1664525) + 1013904223 | 0; return (s >>> 31) & 1; }
  for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (!fn[r][c]) m[r][c] = bit();
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, px, px);
  function rr(x, y, w, h, rd) { ctx.beginPath(); ctx.moveTo(x + rd, y); ctx.lineTo(x + w - rd, y); ctx.arcTo(x + w, y, x + w, y + rd, rd); ctx.lineTo(x + w, y + h - rd); ctx.arcTo(x + w, y + h, x + w - rd, y + h, rd); ctx.lineTo(x + rd, y + h); ctx.arcTo(x, y + h, x, y + h - rd, rd); ctx.lineTo(x, y + rd); ctx.arcTo(x, y, x + rd, y, rd); ctx.closePath(); ctx.fill(); }
  function dFinder(r0, c0) { var x = c0 * mod, y = r0 * mod; ctx.fillStyle = "#111"; rr(x + .5, y + .5, 7 * mod - 1, 7 * mod - 1, mod * .7); ctx.fillStyle = "#fff"; rr(x + mod + .5, y + mod + .5, 5 * mod - 1, 5 * mod - 1, mod * .5); ctx.fillStyle = "#111"; rr(x + 2 * mod + .5, y + 2 * mod + .5, 3 * mod - 1, 3 * mod - 1, mod * .4); }
  dFinder(0, 0); dFinder(0, 14); dFinder(14, 0);
  ctx.fillStyle = "#111";
  for (var r2 = 0; r2 < N; r2++) for (var c2 = 0; c2 < N; c2++) {
    if ((r2 < 8 && c2 < 8) || (r2 < 8 && c2 > 13) || (r2 > 13 && c2 < 8)) continue;
    if (!fn[r2][c2] && m[r2][c2]) { var pad = mod * .15; rr(c2 * mod + pad, r2 * mod + pad, mod - pad * 2, mod - pad * 2, mod * .25); }
  }
  var cx = N / 2 * mod, cy = N / 2 * mod, lr = mod * 2.2;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, lr + 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = colorHex || "#18A83A"; ctx.beginPath(); ctx.arc(cx, cy, lr, 0, Math.PI * 2); ctx.fill();
}

function carnetSeed(codigo) {
  var s = 0, str = codigo || "BF";
  for (var i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) >>> 0;
  return s;
}

// club = { clubNombre, logoUrl, colorPrimario, colorSecundario, colorTerciario }
// socio = { nombre, documento, posicion, categoria, estado, fotoUrl, id }
function carnetHtml(socio, club, verUrl, idSuffix) {
  var c1 = (club && club.colorPrimario) || "#18A83A";
  var c2 = (club && club.colorSecundario) || "#0e7d29";
  var c3 = (club && club.colorTerciario) || c1;
  var activo = (socio.estado || "Activo") === "Activo";
  var sufijo = idSuffix || "card";
  var photoHtml = socio.fotoUrl
    ? '<img class="carnet-photo" src="' + socio.fotoUrl + '" alt="foto">'
    : '<div class="carnet-photo"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="22" r="12" fill="#9aa5b4"/><ellipse cx="32" cy="52" rx="20" ry="12" fill="#9aa5b4"/></svg></div>';
  var crestHtml = (club && club.logoUrl)
    ? '<img class="carnet-crest" src="' + club.logoUrl + '" alt="escudo">'
    : '<div class="carnet-crest">' + carnetEscHtml((club && club.clubNombre) ? club.clubNombre.charAt(0) : "B") + '</div>';
  var nombreClub = (club && club.clubNombre) || "BioFutbol";

  return '<div class="carnet-card" style="--c1:' + c1 + ';--c2:' + c2 + ';--c3:' + c3 + '" id="carnetCard_' + sufijo + '">'
    + '<div class="carnet-stripe"><div class="carnet-stripe-txt">Carnet Digital de Socio</div><div class="carnet-stripe-bars"><div class="carnet-stripe-bar"></div><div class="carnet-stripe-bar"></div><div class="carnet-stripe-bar"></div></div></div>'
    + '<div class="carnet-tab"><div class="carnet-tab-dot" style="background:' + (activo ? "#22c55e" : "#ef4444") + ';box-shadow:0 0 6px ' + (activo ? "#22c55e" : "#ef4444") + '"></div><div class="carnet-tab-txt">' + (activo ? "Socio Activo" : "Inactivo") + '</div></div>'
    + '<div class="carnet-hdr">' + crestHtml
    + '<div class="carnet-wordmark"><div class="wl1">' + carnetEscHtml(nombreClub) + '</div><div class="wl3">Carnet Oficial</div><div class="wl4">Gestionado con BioFutbol</div></div></div>'
    + '<div class="carnet-body">'
    + '<div class="carnet-photo-wrap">' + photoHtml + '</div>'
    + '<div class="carnet-name">' + carnetEscHtml(socio.nombre || "Nombre del socio") + '</div>'
    + '<div class="carnet-divider"></div>'
    + '<div class="carnet-datarow">'
    + '<div class="carnet-fields">'
    + '<div class="carnet-field"><div class="carnet-ficon">' + carnetIco("id") + '</div><div class="carnet-ftxt"><div class="carnet-flabel">Documento</div><div class="carnet-fval">' + carnetEscHtml(socio.documento || "—") + '</div></div></div>'
    + '<div class="carnet-field"><div class="carnet-ficon">' + carnetIco("pos") + '</div><div class="carnet-ftxt"><div class="carnet-flabel">Posición</div><div class="carnet-fval">' + carnetEscHtml(socio.posicion || "—") + '</div></div></div>'
    + '<div class="carnet-field"><div class="carnet-ficon">' + carnetIco("cat") + '</div><div class="carnet-ftxt"><div class="carnet-flabel">Categoría</div><div class="carnet-fval">' + carnetEscHtml(socio.categoria || "—") + '</div></div></div>'
    + '</div>'
    + '<div class="carnet-qr"><canvas id="carnetQR_' + sufijo + '" width="70" height="70"></canvas><div class="carnet-qr-hint">Escanea para verificar</div></div>'
    + '</div>'
    + '<div class="carnet-status">' + carnetStatusIco(activo)
    + '<div class="carnet-status-txt"><div class="l1">' + (activo ? "Socio Activo" : "Inactivo") + '</div><div class="l2" style="color:' + (activo ? "#22c55e" : "#ef4444") + '">' + (activo ? "Al día con el club" : "Consultar con el club") + '</div></div>'
    + '</div>'
    + '<div class="carnet-sig">' + carnetSigSvg() + '<div class="carnet-sig-line"></div><div class="carnet-sig-name">' + carnetEscHtml(nombreClub) + '</div></div>'
    + '</div>'
    + '</div>';
}

function carnetRender(containerEl, socio, club, verUrl, idSuffix) {
  var sufijo = idSuffix || "card";
  containerEl.innerHTML = carnetHtml(socio, club, verUrl, sufijo);
  var c1 = (club && club.colorPrimario) || "#18A83A";
  setTimeout(function () {
    var canvas = document.getElementById("carnetQR_" + sufijo);
    if (canvas) carnetDrawQR(canvas, carnetSeed(socio.documento || socio.id || socio.nombre), 70, c1);
  }, 30);
}
