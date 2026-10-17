// services/category.service.js
const db = require('../models');
const { Categoria } = db;
const productService = require('./product.service');

async function listar() {
  const categorias = await Categoria.findAll({
    order: [['nombre', 'ASC']],
  });

  // productCount no es una columna real (ver api.yaml: Category.productCount),
  // se calcula contando la relación N:N vía producto_categoria.
  const conConteo = await Promise.all(
    categorias.map(async (cat) => {
      const productCount = await cat.countProductos();
      return { ...cat.toJSON(), productCount };
    })
  );

  return conConteo;
}

async function obtenerPorId(id) {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    const error = new Error('Categoría no encontrada.');
    error.status = 404;
    throw error;
  }
  const productCount = await categoria.countProductos();
  return { ...categoria.toJSON(), productCount };
}

async function crear({ nombre, descripcion }) {
  const existente = await Categoria.findOne({ where: { nombre } });
  if (existente) {
    const error = new Error('Ya existe una categoría con ese nombre.');
    error.status = 409;
    throw error;
  }

  const categoria = await Categoria.create({
    nombre,
    descripcion: descripcion || null,
  });

  return { ...categoria.toJSON(), productCount: 0 };
}

async function actualizar(id, { nombre, descripcion }) {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    const error = new Error('Categoría no encontrada.');
    error.status = 404;
    throw error;
  }

  if (nombre && nombre !== categoria.nombre) {
    const existente = await Categoria.findOne({ where: { nombre } });
    if (existente) {
      const error = new Error('Ya existe una categoría con ese nombre.');
      error.status = 409;
      throw error;
    }
  }

  await categoria.update({
    nombre: nombre ?? categoria.nombre,
    descripcion: descripcion !== undefined ? descripcion : categoria.descripcion,
  });

  const productCount = await categoria.countProductos();
  return { ...categoria.toJSON(), productCount };
}

/**
 * Eliminar una categoría, respetando la regla de negocio (y el trigger
 * fn_check_categoria_on_delete de la base): ningún producto puede
 * quedarse sin categorías. Se verifica ANTES de intentar borrar, para
 * poder devolver un 409 con mensaje claro en vez de que el trigger de
 * Postgres tire una excepción genérica.
 */
async function eliminar(id) {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    const error = new Error('Categoría no encontrada.');
    error.status = 404;
    throw error;
  }

  const productos = await categoria.getProductos();

  for (const producto of productos) {
    const categoriasDelProducto = await producto.countCategorias();
    if (categoriasDelProducto <= 1) {
      const error = new Error(
        `El producto "${producto.nombre}" quedaría sin categorías. No se puede eliminar.`
      );
      error.status = 409;
      throw error;
    }
  }

  await categoria.destroy();
}

async function listarProductosDeCategoria(id, { page = 1, limit = 20 } = {}) {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    const error = new Error('Categoría no encontrada.');
    error.status = 404;
    throw error;
  }

  // Se delega en productService.listar para que este endpoint devuelva la
  // misma forma que GET /products y, sobre todo, solo productos ACTIVOS:
  // antes devolvía filas crudas del modelo e incluía productos inactivos
  // a cualquier visitante.
  return productService.listar({ page, limit, categoryId: Number(id), isAdmin: false });
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  listarProductosDeCategoria,
};