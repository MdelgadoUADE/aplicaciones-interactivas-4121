// routes/auth.routes.js
const express = require('express');
const router = express.Router();

const { requireAuth, optionalAuth, requireRole } = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

const {
  manejarValidacion,
  validarRegistro,
  validarLogin,
} = require('../middlewares/validation.middleware');


// Ruta que requiere estar logueado, cualquier rol
// router.get('/auth/me', requireAuth, authController.me);

router.post('/register', validarRegistro, manejarValidacion, authController.register);
router.post('/login', validarLogin, manejarValidacion, authController.login);

module.exports = router;