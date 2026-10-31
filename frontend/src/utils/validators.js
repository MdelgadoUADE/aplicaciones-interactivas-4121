// Validaciones del front. Las reglas y los mensajes son los MISMOS que usa
// el back (routes/consulta.routes.js): el front las aplica para dar feedback
// inmediato, y el back las vuelve a aplicar porque es quien tiene la última palabra.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_RE = /^[0-9+()\-\s]{6,30}$/;

export const LIMITES_CONSULTA = {
  nombre: { min: 2, max: 100 },
  email: { max: 255 },
  telefono: { max: 30 },
  asunto: { min: 3, max: 150 },
  mensaje: { min: 10, max: 2000 },
};

export const CAMPOS_CONSULTA = ["nombre", "email", "telefono", "asunto", "mensaje"];

// Devuelve el mensaje de error del campo, o "" si es válido.
export function validarCampoConsulta(campo, valor) {
  const v = String(valor ?? "").trim();
  const l = LIMITES_CONSULTA[campo];

  switch (campo) {
    case "nombre":
      if (!v) return "El nombre es obligatorio";
      if (v.length < l.min || v.length > l.max) return `El nombre debe tener entre ${l.min} y ${l.max} caracteres`;
      return "";
    case "email":
      if (!EMAIL_RE.test(v)) return "Email inválido";
      if (v.length > l.max) return `El email no puede superar los ${l.max} caracteres`;
      return "";
    case "telefono": // opcional
      if (v && !TELEFONO_RE.test(v)) {
        return "Teléfono inválido (solo números, espacios, +, - y paréntesis; hasta 30 caracteres)";
      }
      return "";
    case "asunto":
      if (!v) return "El asunto es obligatorio";
      if (v.length < l.min || v.length > l.max) return `El asunto debe tener entre ${l.min} y ${l.max} caracteres`;
      return "";
    case "mensaje":
      if (!v) return "El mensaje es obligatorio";
      if (v.length < l.min || v.length > l.max) return `El mensaje debe tener entre ${l.min} y ${l.max} caracteres`;
      return "";
    default:
      return "";
  }
}

// Devuelve { campo: mensaje } solo con los campos inválidos.
export function validarConsulta(valores) {
  const errores = {};
  CAMPOS_CONSULTA.forEach((campo) => {
    const mensaje = validarCampoConsulta(campo, valores[campo]);
    if (mensaje) errores[campo] = mensaje;
  });
  return errores;
}

// ---------------------------------------------------------------------------
// Autenticación (mismas reglas y mensajes que middlewares/validation.middleware.js
// y routes/auth.routes.js del back)
// ---------------------------------------------------------------------------

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bcrypt solo considera los primeros 72 bytes

export function validarEmail(valor) {
  const v = String(valor ?? "").trim();
  if (!EMAIL_RE.test(v)) return "Email inválido";
  if (v.length > 255) return "El email no puede superar los 255 caracteres";
  return "";
}

export function validarPassword(valor) {
  const v = String(valor ?? "");
  if (v.length < PASSWORD_MIN) return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`;
  if (v.length > PASSWORD_MAX) return `La contraseña no puede superar los ${PASSWORD_MAX} caracteres`;
  return "";
}

function requerido(valor, mensaje, max, mensajeMax) {
  const v = String(valor ?? "").trim();
  if (!v) return mensaje;
  if (max && v.length > max) return mensajeMax;
  return "";
}

export function validarLogin({ email, password }) {
  const errores = {};
  const eEmail = validarEmail(email);
  if (eEmail) errores.email = eEmail;
  // En el login no se exige el largo mínimo: solo que no esté vacía.
  if (!password) errores.password = "La contraseña es obligatoria";
  return errores;
}

export function validarRegistro({ nombre, apellido, email, telefono, password, confirmar, inviteCode }) {
  const errores = {};

  const eNombre = requerido(nombre, "El nombre es obligatorio", 100, "El nombre no puede superar los 100 caracteres");
  if (eNombre) errores.nombre = eNombre;

  const eApellido = requerido(apellido, "El apellido es obligatorio", 100, "El apellido no puede superar los 100 caracteres");
  if (eApellido) errores.apellido = eApellido;

  const eEmail = validarEmail(email);
  if (eEmail) errores.email = eEmail;

  const tel = String(telefono ?? "").trim();
  if (!tel) errores.telefono = "El teléfono es obligatorio";
  else if (!TELEFONO_RE.test(tel)) {
    errores.telefono = "Teléfono inválido (solo números, espacios, +, - y paréntesis; hasta 30 caracteres)";
  }

  const ePassword = validarPassword(password);
  if (ePassword) errores.password = ePassword;
  else if (password !== confirmar) errores.confirmar = "Las contraseñas no coinciden";

  if (!String(inviteCode ?? "").trim()) errores.inviteCode = "Falta el código de invitación";

  return errores;
}

export function validarRestablecer({ password, confirmar }) {
  const errores = {};
  const ePassword = validarPassword(password);
  if (ePassword) errores.password = ePassword;
  else if (password !== confirmar) errores.confirmar = "Las contraseñas no coinciden";
  return errores;
}

export function validarRecuperacion({ email }) {
  const e = validarEmail(email);
  return e ? { email: e } : {};
}

// ---------------------------------------------------------------------------
// Productos (mismas reglas y mensajes que routes/product.routes.js del back)
// ---------------------------------------------------------------------------

export const LIMITES_PRODUCTO = {
  nombre: 200,
  descripcion: 5000,
  precioMax: 99999999.99,
  stockMax: 100000,
  isbn: 20,
  autor: 200,
  editorial: 200,
  anioMin: 1000,
};

const TIPOS_VALIDOS = ["libro", "papeleria", "accesorio", "otros"];
const ESTADOS_VALIDOS = ["activo", "inactivo", "agotado"];

const esNumero = (texto) => String(texto ?? "").trim() !== "" && Number.isFinite(Number(texto));

export function validarProducto(v) {
  const errores = {};
  const nombre = String(v.nombre ?? "").trim();
  const anioMax = new Date().getFullYear() + 1;

  if (!TIPOS_VALIDOS.includes(v.tipoProducto)) errores.tipoProducto = "tipoProducto inválido";

  if (!nombre) errores.nombre = "El nombre es obligatorio";
  else if (nombre.length > LIMITES_PRODUCTO.nombre) {
    errores.nombre = `El nombre no puede superar los ${LIMITES_PRODUCTO.nombre} caracteres`;
  }

  if (String(v.descripcion ?? "").length > LIMITES_PRODUCTO.descripcion) {
    errores.descripcion = `La descripción no puede superar los ${LIMITES_PRODUCTO.descripcion} caracteres`;
  }

  if (!esNumero(v.precio) || Number(v.precio) < 0) errores.precio = "El precio debe ser un número mayor o igual a 0";
  else if (Number(v.precio) > LIMITES_PRODUCTO.precioMax) errores.precio = "El precio es demasiado alto";

  if (String(v.descuento ?? "").trim() !== "" && (!esNumero(v.descuento) || Number(v.descuento) < 0 || Number(v.descuento) > 100)) {
    errores.descuento = "El descuento debe estar entre 0 y 100";
  }

  if (String(v.stock ?? "").trim() !== "") {
    const n = Number(v.stock);
    if (!esNumero(v.stock) || !Number.isInteger(n) || n < 0 || n > LIMITES_PRODUCTO.stockMax) {
      errores.stock = `El stock debe ser un entero entre 0 y ${LIMITES_PRODUCTO.stockMax}`;
    }
  }

  if (!ESTADOS_VALIDOS.includes(v.estado)) errores.estado = "Estado inválido";

  if (!Array.isArray(v.categoryIds) || v.categoryIds.length === 0) {
    errores.categoryIds = "Debe incluir al menos una categoría";
  }

  if (v.tipoProducto === "libro") {
    const isbn = String(v.isbn ?? "").trim();
    if (!isbn) errores.isbn = "El ISBN es obligatorio para libros";
    else if (isbn.length > LIMITES_PRODUCTO.isbn) errores.isbn = `El ISBN no puede superar los ${LIMITES_PRODUCTO.isbn} caracteres`;

    if (String(v.autor ?? "").trim().length > LIMITES_PRODUCTO.autor) {
      errores.autor = `El autor no puede superar los ${LIMITES_PRODUCTO.autor} caracteres`;
    }
    if (String(v.editorial ?? "").trim().length > LIMITES_PRODUCTO.editorial) {
      errores.editorial = `La editorial no puede superar los ${LIMITES_PRODUCTO.editorial} caracteres`;
    }

    if (String(v.anioPublicacion ?? "").trim() !== "") {
      const anio = Number(v.anioPublicacion);
      if (!Number.isInteger(anio) || anio < LIMITES_PRODUCTO.anioMin || anio > anioMax) {
        errores.anioPublicacion = `El año debe estar entre ${LIMITES_PRODUCTO.anioMin} y ${anioMax}`;
      }
    }
  }

  return errores;
}

// ---------------------------------------------------------------------------
// Categorías (mismas reglas y mensajes que routes/category.routes.js del back)
// ---------------------------------------------------------------------------

export const LIMITES_CATEGORIA = { nombre: 100 };

export function validarCategoria({ nombre }) {
  const errores = {};
  const v = String(nombre ?? "").trim();
  if (!v) errores.nombre = "El nombre es obligatorio";
  else if (v.length > LIMITES_CATEGORIA.nombre) {
    errores.nombre = `El nombre no puede superar los ${LIMITES_CATEGORIA.nombre} caracteres`;
  }
  return errores;
}

// ---------------------------------------------------------------------------
// Comercio y perfil (mismas reglas y mensajes que routes/comercio.routes.js y
// routes/auth.routes.js del back)
// ---------------------------------------------------------------------------

const MENSAJE_TELEFONO = "Teléfono inválido (solo números, espacios, +, - y paréntesis; hasta 30 caracteres)";

export const LIMITES_COMERCIO = { nombre: 150, telefono: 30, tipoRed: 50, urlRed: 500, maxRedes: 10 };

export function validarComercio({ nombre, direccion, telefono }) {
  const errores = {};

  const n = String(nombre ?? "").trim();
  if (!n) errores.nombre = "El nombre es obligatorio";
  else if (n.length > LIMITES_COMERCIO.nombre) {
    errores.nombre = `El nombre no puede superar los ${LIMITES_COMERCIO.nombre} caracteres`;
  }

  if (!String(direccion ?? "").trim()) errores.direccion = "La dirección es obligatoria";

  const t = String(telefono ?? "").trim();
  if (!t) errores.telefono = "El teléfono es obligatorio";
  else if (!TELEFONO_RE.test(t)) errores.telefono = MENSAJE_TELEFONO;

  return errores;
}

// http(s) con dominio (el back exige protocolo y TLD).
export function esUrlWeb(valor) {
  try {
    const url = new URL(String(valor ?? "").trim());
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

// `filas` = [{ uid, tipo, url }]. Devuelve { [uid]: { tipo?, url? } } solo con las filas inválidas.
export function validarRedesSociales(filas) {
  const errores = {};
  const vistos = new Set();

  filas.forEach(({ uid, tipo, url }) => {
    const e = {};
    const t = String(tipo ?? "").trim().toLowerCase();
    const u = String(url ?? "").trim();

    if (!t) e.tipo = "Cada red social necesita un tipo";
    else if (t.length > LIMITES_COMERCIO.tipoRed) {
      e.tipo = `El tipo de red social no puede superar los ${LIMITES_COMERCIO.tipoRed} caracteres`;
    } else if (vistos.has(t)) e.tipo = "Ya cargaste una red de este tipo";
    if (t) vistos.add(t);

    if (!esUrlWeb(u)) e.url = "Cada red social necesita una URL válida (con http:// o https://)";
    else if (u.length > LIMITES_COMERCIO.urlRed) e.url = `La URL no puede superar los ${LIMITES_COMERCIO.urlRed} caracteres`;

    if (e.tipo || e.url) errores[uid] = e;
  });

  return errores;
}

export function validarPerfil({ nombre, apellido, telefono }) {
  const errores = {};

  const eNombre = requerido(nombre, "El nombre es obligatorio", 100, "El nombre no puede superar los 100 caracteres");
  if (eNombre) errores.nombre = eNombre;

  const eApellido = requerido(apellido, "El apellido es obligatorio", 100, "El apellido no puede superar los 100 caracteres");
  if (eApellido) errores.apellido = eApellido;

  const t = String(telefono ?? "").trim();
  if (!t) errores.telefono = "El teléfono es obligatorio";
  else if (!TELEFONO_RE.test(t)) errores.telefono = MENSAJE_TELEFONO;

  return errores;
}
