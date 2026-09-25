// controllers/dashboard.controller.js
const dashboardService = require('../services/dashboard.service');

async function metricas(req, res, next) {
  try {
    const { umbralStockBajo } = req.query;
    const resultado = await dashboardService.obtenerMetricas({
      umbralStockBajo: umbralStockBajo ? parseInt(umbralStockBajo, 10) : undefined,
    });
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  metricas,
};