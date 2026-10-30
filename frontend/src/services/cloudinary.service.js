// Subida directa desde el navegador a Cloudinary con un upload preset UNSIGNED.
// No pasa por nuestro back: después se guarda la URL con POST /products/:id/images.
//
// Variables (frontend/.env):
//   VITE_CLOUDINARY_CLOUD_NAME   nombre de la cuenta (Dashboard de Cloudinary)
//   VITE_CLOUDINARY_UPLOAD_PRESET  preset en modo "Unsigned"

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigurado = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
export const TAMANIO_MAX_MB = 5;
const TAMANIO_MAX_BYTES = TAMANIO_MAX_MB * 1024 * 1024;

// Devuelve un mensaje de error, o null si el archivo es válido.
export function validarArchivoImagen(file) {
  if (!TIPOS_IMAGEN.includes(file.type)) {
    return `"${file.name}": formato no permitido. Usá JPG, PNG o WebP.`;
  }
  if (file.size === 0) {
    return `"${file.name}": el archivo está vacío.`;
  }
  if (file.size > TAMANIO_MAX_BYTES) {
    return `"${file.name}": pesa más de ${TAMANIO_MAX_MB} MB.`;
  }
  return null;
}

// Sube un archivo y devuelve su URL https (secure_url).
export async function subirImagen(file, { signal } = {}) {
  if (!cloudinaryConfigurado) {
    throw new Error("Cloudinary no está configurado (faltan las variables VITE_CLOUDINARY_*).");
  }

  const datos = new FormData();
  datos.append("file", file);
  datos.append("upload_preset", UPLOAD_PRESET);

  let respuesta;
  try {
    respuesta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: datos,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("No se pudo conectar con Cloudinary. Revisá tu conexión.", { cause: err });
  }

  let json = null;
  try {
    json = await respuesta.json();
  } catch {
    /* respuesta sin JSON */
  }

  if (!respuesta.ok || !json?.secure_url) {
    throw new Error(json?.error?.message || "Cloudinary rechazó la imagen.");
  }
  return json.secure_url;
}
