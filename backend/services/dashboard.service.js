// services/dashboard.service.js
const db = require("../models");
const { Producto, Categoria, Consulta, sequelize } = db;
const { Op, fn, col, literal } = require("sequelize");

const UMBRAL_STOCK_BAJO_DEFAULT = 5;
const DIAS_NOVEDAD_CONSULTAS_CORTO = 7;
const DIAS_NOVEDAD_CONSULTAS_LARGO = 30;

/**
 * Cuenta filas agrupadas por una columna y devuelve un objeto { valor: cantidad }, no un
 * array
 *
 * findAll + group + fn('COUNT', ...) en vez de tres Model.count()
 * separados.
 */
async function contarAgrupadoPor(Model, columna) {
  const filas = await Model.findAll({
    attributes: [columna, [fn("COUNT", col(columna)), "cantidad"]],
    group: [columna],
    raw: true,
  });

  return filas.reduce((acc, fila) => {
    acc[fila[columna]] = parseInt(fila.cantidad, 10);
    return acc;
  }, {});
}

// Distribución de productos por categoría
async function distribucionPorCategoria() {
  const categorias = await Categoria.findAll({
    attributes: [
      "idCategoria",
      "nombre",
      [fn("COUNT", col("productos.id_producto")), "cantidadProductos"],
    ],
    include: [
      {
        model: Producto,
        as: "productos",
        attributes: [],
        through: { attributes: [] },
        required: false,
        // Mismo criterio que el resto de la API pública: no contar acá
        // productos inactivos como si fueran parte del catálogo visible.
        where: { estado: "activo" },
      },
    ],
    group: ["Categoria.id_categoria", "Categoria.nombre"],
    raw: true,
  });

  return categorias.map((c) => ({
    idCategoria: c.idCategoria,
    nombre: c.nombre,
    cantidadProductos: parseInt(c.cantidadProductos, 10),
  }));
}

// Precio promedio general y por categoría, sobre precioFinal (precio
// con descuento aplicado), no sobre precio de lista¿
async function precioPromedioGeneral() {
  const resultado = await Producto.findOne({
    attributes: [
      [
        fn("AVG", literal("precio * (1 - descuento / 100.0)")),
        "precioPromedio",
      ],
    ],
    where: { estado: "activo" },
    raw: true,
  });

  return resultado?.precioPromedio
    ? +parseFloat(resultado.precioPromedio).toFixed(2)
    : 0;
}

async function precioPromedioPorCategoria() {
  const categorias = await Categoria.findAll({
    attributes: [
      "idCategoria",
      "nombre",
      [
        fn(
          "AVG",
          literal(
            '"productos"."precio" * (1 - "productos"."descuento" / 100.0)',
          ),
        ),
        "precioPromedio",
      ],
    ],
    include: [
      {
        model: Producto,
        as: "productos",
        attributes: [],
        through: { attributes: [] },
        required: false,
        where: { estado: "activo" },
      },
    ],
    group: ["Categoria.id_categoria", "Categoria.nombre"],
    raw: true,
  });

  return categorias.map((c) => ({
    idCategoria: c.idCategoria,
    nombre: c.nombre,
    precioPromedio: c.precioPromedio
      ? +parseFloat(c.precioPromedio).toFixed(2)
      : 0,
  }));
}

//Consultas recibidas en los últimos N días¿

async function consultasUltimosDias(dias) {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  return Consulta.count({ where: { fecha: { [Op.gte]: desde } } });
}

//auto explicativo
async function productoMasVisitado() {
  const producto = await Producto.findOne({
    where: { visitas: { [Op.gt]: 0 } },
    // Desempate por id: sin él, dos productos con las mismas visitas podían
    // alternar cuál se devuelve como "más visitado" entre requests.
    order: [
      ["visitas", "DESC"],
      ["idProducto", "ASC"],
    ],
    attributes: ["idProducto", "nombre", "visitas"],
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
 * visitado
 */
async function obtenerMetricas({
  umbralStockBajo = UMBRAL_STOCK_BAJO_DEFAULT,
} = {}) {
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
    contarAgrupadoPor(Producto, "estado"),
    contarAgrupadoPor(Consulta, "estado"),
    Producto.count({
      where: { stock: { [Op.lt]: umbralStockBajo }, estado: "activo" },
    }),
    distribucionPorCategoria(),
    precioPromedioGeneral(),
    precioPromedioPorCategoria(),
    consultasUltimosDias(DIAS_NOVEDAD_CONSULTAS_CORTO),
    consultasUltimosDias(DIAS_NOVEDAD_CONSULTAS_LARGO),
    Producto.count({ where: { descuento: { [Op.gt]: 0 }, estado: "activo" } }),
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
