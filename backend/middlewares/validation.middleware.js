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

const validarRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio'),
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
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