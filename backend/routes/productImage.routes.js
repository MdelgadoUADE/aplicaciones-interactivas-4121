// routes/productImage.routes.js
// Se monta DENTRO de product.routes.js con router.use, o se registra
// aparte en app.js apuntando a /api/products/:id/images — ver nota al
// final sobre cómo conectarlo, porque necesita mergeParams para leer
// :id desde la ruta padre.
const express = require('express');
const router = express.Router({ mergeParams: true });

const productImageController = require('../controllers/productImage.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { manejarValidacion } = require('../middlewares/validation.middleware');

const validarImagen = [
  body('imageUrl').trim().notEmpty().withMessage('imageUrl es obligatorio').isURL().withMessage('imageUrl debe ser una URL válida'),
  body('orden').optional().isInt({ min: 0 }),
  body('esPrincipal').optional().isBoolean(),
];

router.get('/', productImageController.listar);
router.post('/', requireAuth, requireRole('admin'), validarImagen, manejarValidacion, productImageController.agregar);
router.delete('/:imageId', requireAuth, requireRole('admin'), productImageController.eliminar);

module.exports = router;