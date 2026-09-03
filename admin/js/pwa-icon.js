// Genera un ícono de "app" premium para cada club — el escudo que subieron
// en lo administrativo, centrado con buen margen (para que ningún launcher
// de Android se lo recorte raro) sobre un fondo con la identidad de
// BioFutbol y un resplandor con el color del club — y lo aplica al vuelo
// al manifest.json + favicon de la página. Así, cuando alguien hace
// "Agregar a pantalla de inicio", el ícono que le queda es el escudo del
// club, no el logo genérico de BioFutbol.
//
// Se usa en club-panel.html, demo.html, mi-panel.html, portal-socio.html y
// profesor-panel.html — cada una llama a pwaAplicarIconoClub(club, startUrl)
// apenas tiene los datos del club (logoUrl, colorPrimario, clubNombre).

function pwaCargarImagen(url) {
  return new Promise(function (resolve) {
    if (!url) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = url;
  });
}

function pwaOscurecer(hex, amt) {
  hex = (hex || "#0B1626").replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
  const num = parseInt(hex, 16);
  if (isNaN(num)) return "#0B1626";
  let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  r = Math.max(0, Math.min(255, Math.round(r + (amt < 0 ? r : 255 - r) * amt)));
  g = Math.max(0, Math.min(255, Math.round(g + (amt < 0 ? g : 255 - g) * amt)));
  b = Math.max(0, Math.min(255, Math.round(b + (amt < 0 ? b : 255 - b) * amt)));
  return "rgb(" + r + "," + g + "," + b + ")";
}

// Dibuja el ícono a tamaño "size" (px) y devuelve un data URL PNG.
// El escudo nunca ocupa más del 66% del lienzo — esa es la "zona segura"
// que sobrevive al recorte circular/squircle que Android aplica solo a
// los íconos "adaptativos", así se vea perfecto sin importar el launcher.
function pwaDibujarIcono(logoImg, colorAcento, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const acento = colorAcento || "#18A83A";

  ctx.fillStyle = "#0B1626";
  ctx.fillRect(0, 0, size, size);

  const glow = ctx.createRadialGradient(size / 2, size * 0.46, size * 0.08, size / 2, size * 0.46, size * 0.62);
  glow.addColorStop(0, pwaOscurecer(acento, .12));
  glow.addColorStop(1, "#0B1626");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  if (logoImg && logoImg.width) {
    const safe = size * 0.66;
    const scale = Math.min(safe / logoImg.width, safe / logoImg.height);
    const w = logoImg.width * scale, h = logoImg.height * scale;
    const x = (size - w) / 2, y = (size - h) / 2;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = size * 0.06;
    ctx.shadowOffsetY = size * 0.018;
    ctx.drawImage(logoImg, x, y, w, h);
    ctx.restore();
  }
  return canvas.toDataURL("image/png");
}

// club: { clubNombre, logoUrl, colorPrimario } — normalmente clienteActual,
// r.club (mi-panel) o el doc "publico/marca" (portal-socio). startUrl es la
// URL exacta a la que debe abrir el ícono instalado (con sus query params,
// si la página los necesita, como portal-socio.html).
function pwaAplicarIconoClub(club, startUrl) {
  if (!club || !club.logoUrl) return;
  pwaCargarImagen(club.logoUrl).then(function (img) {
    if (!img) return;
    const icon192 = pwaDibujarIcono(img, club.colorPrimario, 192);
    const icon512 = pwaDibujarIcono(img, club.colorPrimario, 512);

    document.querySelectorAll('link[rel="apple-touch-icon"], link[rel="icon"]').forEach(function (l) {
      l.href = icon512;
    });

    const manifest = {
      name: (club.clubNombre || "BioFutbol") + " · BioFutbol",
      short_name: (club.clubNombre || "BioFutbol").slice(0, 16),
      start_url: startUrl,
      scope: "./",
      display: "standalone",
      background_color: "#0B1626",
      theme_color: "#0B1626",
      icons: [
        { src: icon192, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: icon512, sizes: "512x512", type: "image/png", purpose: "any" },
        { src: icon192, sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: icon512, sizes: "512x512", type: "image/png", purpose: "maskable" }
      ]
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = URL.createObjectURL(blob);
  });
}
