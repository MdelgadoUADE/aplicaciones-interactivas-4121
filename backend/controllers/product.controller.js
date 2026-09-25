// controllers/product.controller.js
const productService = require('../services/product.service');

function parseBool(value) {
  if (value === undefined) return undefined;
  return value === 'true' || value === true;
}

async function listar(req, res, next) {
  try {
    const isAdmin = req.userRole === 'admin';
    const {
      page, limit, categoryId, search, minPrice, maxPrice,
      inStock, estado, tipoProducto, onSale, destacado, novedades, sort,
    } = req.query;

    const resultado = await productService.listar({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: parseBool(inStock),
      estado,
      tipoProducto,
      onSale: parseBool(onSale),
      destacado: parseBool(destacado),
      novedades: parseBool(novedades),
      sort,
      isAdmin,
    });

    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const isAdmin = req.userRole === 'admin';
    const producto = await productService.obtenerPorId(req.params.id, { isAdmin });
    res.status(200).json(producto);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { tipoProducto, nombre, descripcion, precio, descuento, stock, estado, categoryIds, images, libro } = req.body;
    const producto = await productService.crear({
      tipoProducto, nombre, descripcion, precio, descuento, stock, estado, categoryIds, images, libro,
    });
    res.status(201).json(producto);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { tipoProducto, nombre, descripcion, precio, descuento, stock, estado, categoryIds, libro } = req.body;
    const producto = await productService.actualizar(req.params.id, {
      tipoProducto, nombre, descripcion, precio, descuento, stock, estado, categoryIds, libro,
    });
    res.status(200).json(producto);
  } catch (err) {
    next(err);
  }
}

async function actualizarParcial(req, res, next) {
  try {
    const { nombre, descripcion, precio, descuento, stock, estado, categoryIds } = req.body;
    const producto = await productService.actualizarParcial(req.params.id, {
      nombre, descripcion, precio, descuento, stock, estado, categoryIds,
    });
    res.status(200).json(producto);
  } catch (err) {
    next(err);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const producto = await productService.cambiarEstado(req.params.id, req.body.estado);
    res.status(200).json(producto);
  } catch (err) {
    next(err);
  }
}

async function cambiarDestacado(req, res, next) {
  try {
    const producto = await productService.cambiarDestacado(req.params.id, req.body.destacado);
    res.status(200).json(producto);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await productService.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  actualizarParcial,
  cambiarEstado,
  cambiarDestacado,
  eliminar,
};