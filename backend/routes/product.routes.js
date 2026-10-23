// routes/product.routes.js
const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');
const { requireAuth, optionalAuth, requireRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { manejarValidacion } = require('../middlewares/validation.middleware');

// Límites alineados con las columnas (precio DECIMAL(10,2), isbn VARCHAR(20))
// y con utils/validators.js del front. Sin ellos, un valor fuera de rango
// llegaba a la base y terminaba en un 500.
const PRECIO_MAX = 99999999.99;
const STOCK_MAX = 100000;
const esLibro = (_valor, { req }) => req.body.tipoProducto === 'libro';

const validarProducto = [
  body('tipoProducto').isIn(['libro', 'papeleria', 'accesorio', 'otros']).withMessage('tipoProducto inválido'),
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 200 }).withMessage('El nombre no puede superar los 200 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .isLength({ max: 5000 }).withMessage('La descripción no puede superar los 5000 caracteres'),
  body('precio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0').bail()
    .isFloat({ max: PRECIO_MAX }).withMessage('El precio es demasiado alto'),
  body('descuento')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0 y 100'),
  body('stock')
    .optional()
    .isInt({ min: 0, max: STOCK_MAX }).withMessage(`El stock debe ser un entero entre 0 y ${STOCK_MAX}`),
  body('estado').optional().isIn(['activo', 'inactivo', 'agotado']).withMessage('Estado inválido'),
  body('categoryIds').isArray({ min: 1 }).withMessage('Debe incluir al menos una categoría'),
  body('categoryIds.*').isInt({ min: 1 }).withMessage('Categoría inválida'),

  // Datos de libro: solo se validan cuando el producto es un libro.
  body('libro.isbn')
    .if(esLibro)
    .trim()
    .notEmpty().withMessage('El ISBN es obligatorio para libros').bail()
    .isLength({ max: 20 }).withMessage('El ISBN no puede superar los 20 caracteres'),
  body('libro.autor')
    .if(esLibro)
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 200 }).withMessage('El autor no puede superar los 200 caracteres'),
  body('libro.editorial')
    .if(esLibro)
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 200 }).withMessage('La editorial no puede superar los 200 caracteres'),
  body('libro.anioPublicacion')
    .if(esLibro)
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1000 y ${new Date().getFullYear() + 1}`),
];

const validarEstado = [
  body('estado').isIn(['activo', 'inactivo', 'agotado']).withMessage('Estado inválido'),
];

const validarDestacado = [
  body('destacado').isBoolean().withMessage('destacado debe ser true o false'),
];

// Públicas (optionalAuth: cambia el comportamiento si sos admin, pero no bloquea)
router.get('/', optionalAuth, productController.listar);
router.get('/:id', optionalAuth, productController.obtenerPorId);

// Solo admin
router.post('/', requireAuth, requireRole('admin'), validarProducto, manejarValidacion, productController.crear);
router.put('/:id', requireAuth, requireRole('admin'), validarProducto, manejarValidacion, productController.actualizar);
router.patch('/:id', requireAuth, requireRole('admin'), productController.actualizarParcial);
router.patch('/:id/status', requireAuth, requireRole('admin'), validarEstado, manejarValidacion, productController.cambiarEstado);
router.patch('/:id/destacado', requireAuth, requireRole('admin'), validarDestacado, manejarValidacion, productController.cambiarDestacado);
router.delete('/:id', requireAuth, requireRole('admin'), productController.eliminar);

// Imágenes: sub-rutas anidadas bajo /:id/images (mergeParams en el
// router hijo permite que lea req.params.id de esta ruta padre)
router.use('/:id/images', require('./productImage.routes'));

module.exports = router;
