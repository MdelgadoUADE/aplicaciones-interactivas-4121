// routes/category.routes.js
const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { manejarValidacion } = require('../middlewares/validation.middleware');

const validarCategoria = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),
  body('descripcion').optional({ nullable: true }).trim(),
];

// Públicas
router.get('/', categoryController.listar);
router.get('/:id', categoryController.obtenerPorId);
router.get('/:id/products', categoryController.listarProductos);

// Solo admin
router.post('/', requireAuth, requireRole('admin'), validarCategoria, manejarValidacion, categoryController.crear);
router.put('/:id', requireAuth, requireRole('admin'), validarCategoria, manejarValidacion, categoryController.actualizar);
router.delete('/:id', requireAuth, requireRole('admin'), categoryController.eliminar);

module.exports = router;