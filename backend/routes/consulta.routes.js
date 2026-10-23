// routes/consulta.routes.js
const express = require('express');
const router = express.Router();

const consultaController = require('../controllers/consulta.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { manejarValidacion } = require('../middlewares/validation.middleware');

// Los límites coinciden con las columnas de la tabla `consulta` (nombre 100,
// email 255, telefono 30, asunto 150): sin esto, un valor más largo llegaba
// a la base y terminaba en un 500. El front (utils/validators.js) usa las
// mismas reglas y los mismos mensajes.
const validarConsulta = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido').bail()
    .isLength({ max: 255 }).withMessage('El email no puede superar los 255 caracteres')
    .normalizeEmail(),
  body('telefono')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+()\-\s]{6,30}$/)
    .withMessage('Teléfono inválido (solo números, espacios, +, - y paréntesis; hasta 30 caracteres)'),
  body('asunto')
    .trim()
    .notEmpty().withMessage('El asunto es obligatorio').bail()
    .isLength({ min: 3, max: 150 }).withMessage('El asunto debe tener entre 3 y 150 caracteres'),
  body('mensaje')
    .trim()
    .notEmpty().withMessage('El mensaje es obligatorio').bail()
    .isLength({ min: 10, max: 2000 }).withMessage('El mensaje debe tener entre 10 y 2000 caracteres'),
];

const validarCambioEstado = [
  body('estado').isIn(['pendiente', 'leida', 'respondida']).withMessage('Estado inválido'),
];

// Público: cualquier visitante puede mandar una consulta
router.post('/', validarConsulta, manejarValidacion, consultaController.crear);

// Solo admin
router.get('/', requireAuth, requireRole('admin'), consultaController.listar);
router.get('/:id', requireAuth, requireRole('admin'), consultaController.obtenerPorId);
router.patch('/:id/estado', requireAuth, requireRole('admin'), validarCambioEstado, manejarValidacion, consultaController.cambiarEstado);
router.delete('/:id', requireAuth, requireRole('admin'), consultaController.eliminar);

module.exports = router;
