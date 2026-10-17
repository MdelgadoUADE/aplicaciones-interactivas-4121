// controllers/dashboard.controller.js
const dashboardService = require('../services/dashboard.service');

async function metricas(req, res, next) {
  try {
    // Un valor que no sea un entero positivo (p. ej. ?umbralStockBajo=abc)
    // se ignora y se usa el umbral por defecto. Antes llegaba NaN a la
    // consulta y terminaba en un 500.
    const umbral = Number.parseInt(req.query.umbralStockBajo, 10);
    const resultado = await dashboardService.obtenerMetricas({
      umbralStockBajo: Number.isInteger(umbral) && umbral > 0 ? umbral : undefined,
    });
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  metricas,
};
