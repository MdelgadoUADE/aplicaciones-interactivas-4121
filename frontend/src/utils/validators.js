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
