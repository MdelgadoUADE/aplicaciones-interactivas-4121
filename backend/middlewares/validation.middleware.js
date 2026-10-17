// middlewares/validation.middleware.js
const { body, validationResult } = require('express-validator');

/**
 * Corta la request con 400 si express-validator encontró errores.
 * Se usa como último elemento de la cadena de validators en la ruta:
 *   router.post('/register', validarRegistro, manejarValidacion, controller.register);
 */
function manejarValidacion(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      detalles: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
}

// Mismo criterio que en el formulario de contacto.
const TELEFONO_REGEX = /^[0-9+()\-\s]{6,30}$/;

// Límites = columnas de la tabla usuario (nombre/apellido 100, email 255,
// teléfono 30). bcrypt solo usa los primeros 72 bytes de la contraseña, así
// que un máximo de 72 evita que dos contraseñas distintas sean equivalentes.
const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio').bail()
    .isLength({ max: 100 }).withMessage('El apellido no puede superar los 100 caracteres'),
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido').bail()
    .isLength({ max: 255 }).withMessage('El email no puede superar los 255 caracteres')
    .normalizeEmail(),
  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio').bail()
    .matches(TELEFONO_REGEX)
    .withMessage('Teléfono inválido (solo números, espacios, +, - y paréntesis; hasta 30 caracteres)'),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres').bail()
    .isLength({ max: 72 }).withMessage('La contraseña no puede superar los 72 caracteres'),
  body('inviteCode')
    .notEmpty()
    .withMessage('Falta el código de invitación'),
  // Nota importante: NO hay ningún validator para 'rol' acá. Si alguien
  // manda 'rol' en el body, express-validator no lo bloquea (solo valida
  // los campos listados), pero el controller/service tampoco lo lee del
  // body — la allowlist real está en auth.service.js, no acá. Esta
  // validación es sobre forma de los datos, no sobre seguridad de campos.
  // La verificación real de que inviteCode sea CORRECTO (no solo que
  // esté presente) pasa en auth.service.js, comparando contra
  // process.env.ADMIN_INVITE_CODE.
];

const validarLogin = [
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

module.exports = {
  manejarValidacion,
  validarRegistro,
  validarLogin,
};
