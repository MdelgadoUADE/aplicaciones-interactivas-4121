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

const validarUpdateMe = [
  body('nombre').optional().trim().notEmpty(),
  body('apellido').optional().trim().notEmpty(),
  body('telefono').optional().trim().notEmpty(),
  body('direccion').optional().trim(),
  // Sin validators para 'rol' ni 'email' a propósito: el controller ni
  // siquiera los lee del body (ver authService.actualizarPerfil).
];

const validarForgotPassword = [
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
];

const validarResetPassword = [
  body('token').trim().notEmpty().withMessage('Falta el token'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
];

router.post('/register', validarRegistro, manejarValidacion, authController.register);
router.post('/login', validarLogin, manejarValidacion, authController.login);
router.post('/logout', requireAuth, authController.logout);

router.get('/me', requireAuth, authController.me);
router.patch('/me', requireAuth, validarUpdateMe, manejarValidacion, authController.updateMe);

router.post('/forgot-password', validarForgotPassword, manejarValidacion, authController.forgotPassword);
router.post('/reset-password', validarResetPassword, manejarValidacion, authController.resetPassword);

module.exports = router;