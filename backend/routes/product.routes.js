// routes/product.routes.js
const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');
const { requireAuth, optionalAuth, requireRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { manejarValidacion } = require('../middlewares/validation.middleware');

const validarProducto = [
  body('tipoProducto').isIn(['libro', 'papeleria', 'accesorio', 'otros']).withMessage('tipoProducto inválido'),
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
  body('categoryIds').isArray({ min: 1 }).withMessage('Debe incluir al menos una categoría'),
  body('descuento').optional().isFloat({ min: 0, max: 100 }),
  body('stock').optional().isInt({ min: 0 }),
  body('estado').optional().isIn(['activo', 'inactivo', 'agotado']),
];

const validarEstado = [
  body('estado').isIn(['activo', 'inactivo', 'agotado']).withMessage('Estado inválido'),
];

// Públicas (optionalAuth: cambia el comportamiento si sos admin, pero no bloquea)
router.get('/', optionalAuth, productController.listar);
router.get('/:id', optionalAuth, productController.obtenerPorId);

// Solo admin
router.post('/', requireAuth, requireRole('admin'), validarProducto, manejarValidacion, productController.crear);
router.put('/:id', requireAuth, requireRole('admin'), validarProducto, manejarValidacion, productController.actualizar);
router.patch('/:id', requireAuth, requireRole('admin'), productController.actualizarParcial);
router.patch('/:id/status', requireAuth, requireRole('admin'), validarEstado, manejarValidacion, productController.cambiarEstado);
router.delete('/:id', requireAuth, requireRole('admin'), productController.eliminar);

// Imágenes: sub-rutas anidadas bajo /:id/images (mergeParams en el
// router hijo permite que lea req.params.id de esta ruta padre)
router.use('/:id/images', require('./productImage.routes'));

module.exports = router;
