// controllers/category.controller.js
const categoryService = require('../services/category.service');

async function listar(req, res, next) {
  try {
    const categorias = await categoryService.listar();
    res.status(200).json(categorias);
  } catch (err) {
    next(err);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const categoria = await categoryService.obtenerPorId(req.params.id);
    res.status(200).json(categoria);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { name, description } = req.body;
    const categoria = await categoryService.crear({ name, description });
    res.status(201).json(categoria);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { name, description } = req.body;
    const categoria = await categoryService.actualizar(req.params.id, { name, description });
    res.status(200).json(categoria);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await categoryService.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function listarProductos(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const resultado = await categoryService.listarProductosDeCategoria(req.params.id, { page, limit });
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  listarProductos,
};