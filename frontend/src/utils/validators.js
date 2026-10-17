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
