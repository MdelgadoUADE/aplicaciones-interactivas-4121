// routes/comercio.routes.js
const express = require('express');
const router = express.Router();

const comercioController = require('../controllers/comercio.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { manejarValidacion } = require('../middlewares/validation.middleware');

const validarComercio = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('direccion').trim().notEmpty().withMessage('La dirección es obligatoria'),
  body('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio'),
  body('descripcion').optional().trim(),
  body('horarios').optional().trim(),
  body('redesSociales').optional().isArray().withMessage('redesSociales debe ser un array'),
  body('redesSociales.*.tipo').optional().trim().notEmpty().withMessage('Cada red social necesita un tipo'),
  body('redesSociales.*.url').optional().trim().isURL().withMessage('Cada red social necesita una URL válida'),
];

router.get('/', comercioController.obtener);
router.put('/', requireAuth, requireRole('admin'), validarComercio, manejarValidacion, comercioController.guardar);

module.exports = router;