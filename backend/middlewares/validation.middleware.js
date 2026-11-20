// middlewares/validation.middleware.js
// este middleware se usa para hacer todas las validaciones de sistema
const { body, validationResult } = require("express-validator");

/**
 * Corta la request con 400 si express-validator encontró errores.
 **/
function manejarValidacion(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: "Datos de entrada inválidos",
      detalles: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
}

// Mismo criterio que en el formulario de contacto.
const TELEFONO_REGEX = /^[0-9+()\-\s]{6,30}$/;

// Límites = columnas de la tabla usuario (nombre/apellido 100, email 255, teléfono 30)
const validarRegistro = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .bail()
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar los 100 caracteres"),
  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .bail()
    .isLength({ max: 100 })
    .withMessage("El apellido no puede superar los 100 caracteres"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email inválido")
    .bail()
    .isLength({ max: 255 })
    .withMessage("El email no puede superar los 255 caracteres")
    .normalizeEmail(),
  body("telefono")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es obligatorio")
    .bail()
    .matches(TELEFONO_REGEX)
    .withMessage(
      "Teléfono inválido (solo números, espacios, +, - y paréntesis; hasta 30 caracteres)",
    ),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .bail()
    .isLength({ max: 72 })
    .withMessage("La contraseña no puede superar los 72 caracteres"),
  body("inviteCode").notEmpty().withMessage("Falta el código de invitación"),
];
//aca no hay validacion de roles, ver en auth.middleware.js

const validarLogin = [
  body("email").trim().isEmail().withMessage("Email inválido").normalizeEmail(),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

module.exports = {
  manejarValidacion,
  validarRegistro,
  validarLogin,
};
