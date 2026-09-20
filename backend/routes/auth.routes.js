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

// Ruta pública, pero se comporta distinto si sos admin autenticado
router.get('/products', optionalAuth, productController.list);

// Ruta que requiere estar logueado, cualquier rol
router.get('/auth/me', requireAuth, authController.me);

// Ruta que requiere ser admin específicamente
router.post('/products', requireAuth, requireRole('admin'), productController.create);

router.post('/register', validarRegistro, manejarValidacion, authController.register);
router.post('/login', validarLogin, manejarValidacion, authController.login);

module.exports = router;