// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const {
  manejarValidacion,
  validarRegistro,
  validarLogin,
} = require('../middlewares/validation.middleware');

// Mismas reglas y mensajes que el registro (validation.middleware.js) y que el
// formulario de perfil del front (utils/validators.js).
const TELEFONO_REGEX = /^[0-9+()\-\s]{6,30}$/;

const validarUpdateMe = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),
  body('apellido')
    .optional()
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio').bail()
    .isLength({ max: 100 }).withMessage('El apellido no puede superar los 100 caracteres'),
  body('telefono')
    .optional()
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio').bail()
    .matches(TELEFONO_REGEX)
    .withMessage('Teléfono inválido (solo números, espacios, +, - y paréntesis; hasta 30 caracteres)'),
  body('direccion').optional().trim(),
  // Sin validators para 'rol' ni 'email' a propósito: el controller ni
  // siquiera los lee del body (ver authService.actualizarPerfil).
];

const validarForgotPassword = [
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
];

const validarResetPassword = [
  body('token').trim().notEmpty().withMessage('Falta el token'),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres').bail()
    .isLength({ max: 72 }).withMessage('La contraseña no puede superar los 72 caracteres'),
];

router.post('/register', validarRegistro, manejarValidacion, authController.register);
router.post('/login', validarLogin, manejarValidacion, authController.login);
router.post('/logout', requireAuth, authController.logout);

router.get('/me', requireAuth, authController.me);
router.patch('/me', requireAuth, validarUpdateMe, manejarValidacion, authController.updateMe);

router.post('/forgot-password', validarForgotPassword, manejarValidacion, authController.forgotPassword);
router.post('/reset-password', validarResetPassword, manejarValidacion, authController.resetPassword);

module.exports = router;
