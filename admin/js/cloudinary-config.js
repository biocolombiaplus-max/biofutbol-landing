// ── CONFIGURACIÓN DE CLOUDINARY (almacenamiento de imágenes y archivos, gratis) ──
// Reemplaza estos 2 valores con los de TU cuenta gratuita de Cloudinary.
// 1. Crea una cuenta gratis (sin tarjeta) en https://cloudinary.com
// 2. El "Cloud name" aparece arriba en tu Dashboard.
// 3. Ve a Settings (engranaje) > Upload > Upload presets > Add upload preset,
//    ponle "Signing Mode: Unsigned" y guarda — copia el nombre del preset.
const CLOUDINARY_CLOUD_NAME = "lx52fybs";
const CLOUDINARY_UPLOAD_PRESET = "zugtzfz1";

function subirACloudinary(file, folder, filename) {
  if (CLOUDINARY_CLOUD_NAME === "TU_CLOUD_NAME") {
    return Promise.reject(new Error("Falta configurar Cloudinary (js/cloudinary-config.js)."));
  }
  // Los PDF (contratos, recibos) se suben como "raw" en vez de "auto/image":
  // desde 2024 muchas cuentas de Cloudinary nuevas traen desactivada por
  // seguridad la entrega de PDF cuando se suben como imagen (da error "No
  // se pudo cargar el documento PDF" al abrirlos). Como "raw" no pasa por
  // ese filtro, los PDF siempre se pueden ver/descargar sin tocar nada en
  // la cuenta de Cloudinary.
  const esPdf = (filename || file.name || "").toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
  const tipoRecurso = esPdf ? "raw" : "auto";
  const url = "https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD_NAME + "/" + tipoRecurso + "/upload";
  const formData = new FormData();
  formData.append("file", file, filename || file.name || "archivo");
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  if (folder) formData.append("folder", folder);
  return fetch(url, { method: "POST", body: formData }).then(function (res) {
    if (!res.ok) throw new Error("No se pudo subir el archivo (revisa el preset de Cloudinary).");
    return res.json();
  }).then(function (data) {
    if (!data.secure_url) throw new Error("Cloudinary no devolvió una URL válida.");
    return data.secure_url;
  });
}
