// routes/consulta.routes.js
const express = require('express');
const router = express.Router();

const consultaController = require('../controllers/consulta.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { manejarValidacion } = require('../middlewares/validation.middleware');

const validarConsulta = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('telefono').optional().trim(),
  body('asunto').trim().notEmpty().withMessage('El asunto es obligatorio'),
  body('mensaje').trim().notEmpty().withMessage('El mensaje es obligatorio'),
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
