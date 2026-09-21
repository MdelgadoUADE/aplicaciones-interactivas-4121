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
      inStock, estado, tipoProducto, onSale, sort,
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
    const producto = await productService.crear(req.body);
    res.status(201).json(producto);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const producto = await productService.actualizar(req.params.id, req.body);
    res.status(200).json(producto);
  } catch (err) {
    next(err);
  }
}

async function actualizarParcial(req, res, next) {
  try {
    const producto = await productService.actualizarParcial(req.params.id, req.body);
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
  eliminar,
};