// services/dashboard.service.js
const db = require('../models');
const { Producto, Categoria, Consulta, sequelize } = db;
const { Op, fn, col, literal } = require('sequelize');

const UMBRAL_STOCK_BAJO_DEFAULT = 5;
const DIAS_NOVEDAD_CONSULTAS_CORTO = 7;
const DIAS_NOVEDAD_CONSULTAS_LARGO = 30;

/**
 * Cuenta filas agrupadas por una columna (p.ej. producto.estado o
 * consulta.estado) y devuelve un objeto { valor: cantidad }, no un
 * array — así el frontend no tiene que buscar dentro de una lista
 * para saber cuántos productos están 'activo'.
 *
 * findAll + group + fn('COUNT', ...) en vez de tres Model.count()
 * separados: una sola query en vez de N, algo que sí importa acá
 * porque dashboard.metricas ya dispara bastantes queries en paralelo.
 */
async function contarAgrupadoPor(Model, columna) {
  const filas = await Model.findAll({
    attributes: [columna, [fn('COUNT', col(columna)), 'cantidad']],
    group: [columna],
    raw: true,
  });

  return filas.reduce((acc, fila) => {
    acc[fila[columna]] = parseInt(fila.cantidad, 10);
    return acc;
  }, {});
}

/**
 * Distribución de productos por categoría. Pasa por la tabla N:N
 * producto_categoria, así que no puede usar contarAgrupadoPor() directo
 * — arranca desde Categoria y cuenta sus productos asociados.
 *
 * Nota: un producto con más de una categoría (Etapa 5) suma en cada
 * una de sus categorías, no se reparte — es "cuántos productos toca
 * esta categoría", no una partición del catálogo.
 */
async function distribucionPorCategoria() {
  const categorias = await Categoria.findAll({
    attributes: [
      'idCategoria',
      'nombre',
      [fn('COUNT', col('productos.id_producto')), 'cantidadProductos'],
    ],
    include: [
      {
        model: Producto,
        as: 'productos',
        attributes: [],
        through: { attributes: [] },
        required: false,
        // Mismo criterio que el resto de la API pública: no contar acá
        // productos inactivos como si fueran parte del catálogo visible.
        where: { estado: 'activo' },
      },
    ],
    group: ['Categoria.id_categoria', 'Categoria.nombre'],
    raw: true,
  });

  return categorias.map((c) => ({
    idCategoria: c.idCategoria,
    nombre: c.nombre,
    cantidadProductos: parseInt(c.cantidadProductos, 10),
  }));
}

/**
 * Precio promedio general y por categoría, sobre precioFinal (precio
 * con descuento aplicado), no sobre precio de lista — es el número que
 * más le importa al admin para entender el catálogo real. Se calcula
 * en SQL (AVG sobre la expresión), no trayendo todas las filas a JS.
 */
async function precioPromedioGeneral() {
  const resultado = await Producto.findOne({
    attributes: [
      [
        fn('AVG', literal('precio * (1 - descuento / 100.0)')),
        'precioPromedio',
      ],
    ],
    where: { estado: 'activo' },
    raw: true,
  });

  return resultado?.precioPromedio ? +parseFloat(resultado.precioPromedio).toFixed(2) : 0;
}

async function precioPromedioPorCategoria() {
  const categorias = await Categoria.findAll({
    attributes: [
      'idCategoria',
      'nombre',
      [
        fn('AVG', literal('"productos"."precio" * (1 - "productos"."descuento" / 100.0)')),
        'precioPromedio',
      ],
    ],
    include: [
      {
        model: Producto,
        as: 'productos',
        attributes: [],
        through: { attributes: [] },
        required: false,
        where: { estado: 'activo' },
      },
    ],
    group: ['Categoria.id_categoria', 'Categoria.nombre'],
    raw: true,
  });

  return categorias.map((c) => ({
    idCategoria: c.idCategoria,
    nombre: c.nombre,
    precioPromedio: c.precioPromedio ? +parseFloat(c.precioPromedio).toFixed(2) : 0,
  }));
}

/**
 * Consultas recibidas en los últimos N días. 'fecha' es el nombre real
 * de la columna en Consulta (no tiene createdAt/updatedAt, ver
 * consulta.model.js), así que acá sí alcanza con el atributo del
 * modelo tal cual, sin sequelize.col().
 */
async function consultasUltimosDias(dias) {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  return Consulta.count({ where: { fecha: { [Op.gte]: desde } } });
}

/**
 * Métrica con cambio de esquema (Etapa 16): producto más visitado,
 * según el contador simple producto.visitas (incrementado en
 * product.controller.js en cada GET /products/:id de un visitante no
 * admin — ver esa función para el detalle de por qué vive ahí).
 *
 * Devuelve null si todavía nadie visitó ningún producto (visitas=0 en
 * toda la tabla), para no mostrarle al admin un "más visitado" fantasma
 * con 0 vistas apenas se levanta el sistema.
 */
async function productoMasVisitado() {
  const producto = await Producto.findOne({
    where: { visitas: { [Op.gt]: 0 } },
    order: [['visitas', 'DESC']],
    attributes: ['idProducto', 'nombre', 'visitas'],
  });

  if (!producto) return null;

  return {
    id: producto.idProducto,
    nombre: producto.nombre,
    visitas: producto.visitas,
  };
}

/**
 * Arma las 9 métricas "sin cambio de esquema" más la de producto más
 * visitado, todas en paralelo con Promise.all — son consultas de
 * solo lectura independientes entre sí, no hay ninguna razón para
 * esperarlas en serie.
 *
 * umbralStockBajo es configurable vía query param (?umbralStockBajo=N)
 * según lo que pide la consigna ("umbral configurable"); si no se
 * manda, usa UMBRAL_STOCK_BAJO_DEFAULT.
 */
async function obtenerMetricas({ umbralStockBajo = UMBRAL_STOCK_BAJO_DEFAULT } = {}) {
  const [
    totalProductos,
    totalCategorias,
    totalConsultas,
    productosPorEstado,
    consultasPorEstado,
    productosStockBajo,
    distribucionCategorias,
    precioPromedio,
    precioPromedioCategoria,
    consultas7dias,
    consultas30dias,
    productosConDescuento,
    productosDestacados,
    masVisitado,
  ] = await Promise.all([
    Producto.count(),
    Categoria.count(),
    Consulta.count(),
    contarAgrupadoPor(Producto, 'estado'),
    contarAgrupadoPor(Consulta, 'estado'),
    Producto.count({ where: { stock: { [Op.lt]: umbralStockBajo }, estado: 'activo' } }),
    distribucionPorCategoria(),
    precioPromedioGeneral(),
    precioPromedioPorCategoria(),
    consultasUltimosDias(DIAS_NOVEDAD_CONSULTAS_CORTO),
    consultasUltimosDias(DIAS_NOVEDAD_CONSULTAS_LARGO),
    Producto.count({ where: { descuento: { [Op.gt]: 0 }, estado: 'activo' } }),
    Producto.count({ where: { destacado: true } }),
    productoMasVisitado(),
  ]);

  return {
    totales: {
      productos: totalProductos,
      categorias: totalCategorias,
      consultas: totalConsultas,
    },
    productosPorEstado,
    consultasPorEstado,
    productosStockBajo: {
      umbral: umbralStockBajo,
      cantidad: productosStockBajo,
    },
    distribucionPorCategoria: distribucionCategorias,
    precioPromedio: {
      general: precioPromedio,
      porCategoria: precioPromedioCategoria,
    },
    consultasRecientes: {
      ultimos7Dias: consultas7dias,
      ultimos30Dias: consultas30dias,
    },
    productosConDescuento,
    productosDestacados: {
      cantidad: productosDestacados,
      maximo: 6, // Etapa 13 — ver MAX_DESTACADOS en product.service.js
    },
    productoMasVisitado: masVisitado,
  };
}

module.exports = {
  obtenerMetricas,
};