import { api } from "./api.js";

// GET /dashboard/metricas (solo admin). params: umbralStockBajo (entero > 0, por defecto 5)
// -> { totales, productosPorEstado, consultasPorEstado, productosStockBajo,
//      distribucionPorCategoria, precioPromedio, consultasRecientes,
//      productosConDescuento, productosDestacados, productoMasVisitado }
export function getMetricas(params, options) {
  return api.get("/dashboard/metricas", { ...options, params });
}
