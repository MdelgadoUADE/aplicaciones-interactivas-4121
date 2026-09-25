// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

// Etapa 16: admin-only, sin excepción — las métricas del comercio no
// son información pública (mismo criterio que /api/consultas).
router.get('/metricas', requireAuth, requireRole('admin'), dashboardController.metricas);

module.exports = router;