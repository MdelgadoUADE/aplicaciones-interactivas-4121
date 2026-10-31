// routes/comercio.routes.js
const express = require('express');
const router = express.Router();

const comercioController = require('../controllers/comercio.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { manejarValidacion } = require('../middlewares/validation.middleware');

// Los límites coinciden con las columnas (nombre 150, telefono 30, red_social.tipo 50):
// sin esto, un valor más largo llegaba a la base y terminaba en un 500. El front
// (utils/validators.js) usa las mismas reglas y los mismos mensajes.
const TELEFONO_REGEX = /^[0-9+()\-\s]{6,30}$/;
const MAX_REDES = 10;

const validarComercio = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 150 }).withMessage('El nombre no puede superar los 150 caracteres'),
  body('direccion').trim().notEmpty().withMessage('La dirección es obligatoria'),
  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio').bail()
    .matches(TELEFONO_REGEX)
    .withMessage('Teléfono inválido (solo números, espacios, +, - y paréntesis; hasta 30 caracteres)'),
  body('descripcion').optional().trim(),
  body('horarios').optional().trim(),
  body('redesSociales')
    .optional()
    .isArray({ max: MAX_REDES }).withMessage(`redesSociales debe ser una lista de hasta ${MAX_REDES} elementos`),
  // El tipo se normaliza a minúsculas: así "Instagram" e "instagram" cuentan como
  // la misma red (el UNIQUE de la base distingue mayúsculas) y el ícono del front coincide.
  body('redesSociales.*.tipo')
    .optional()
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Cada red social necesita un tipo').bail()
    .isLength({ max: 50 }).withMessage('El tipo de red social no puede superar los 50 caracteres'),
  // require_protocol: sin http(s):// el link del sitio sería relativo y no llevaría a ningún lado.
  body('redesSociales.*.url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Cada red social necesita una URL válida (con http:// o https://)').bail()
    .isLength({ max: 500 }).withMessage('La URL no puede superar los 500 caracteres'),
];

router.get('/', comercioController.obtener);
router.put('/', requireAuth, requireRole('admin'), validarComercio, manejarValidacion, comercioController.guardar);

module.exports = router;
