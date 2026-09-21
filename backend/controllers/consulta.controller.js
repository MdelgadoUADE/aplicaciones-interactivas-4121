// controllers/consulta.controller.js
const consultaService = require('../services/consulta.service');

async function crear(req, res, next) {
  try {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    const consulta = await consultaService.crear({ nombre, email, telefono, asunto, mensaje });
    res.status(201).json(consulta);
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { estado } = req.query;
    const resultado = await consultaService.listar({ page, limit, estado });
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const consulta = await consultaService.obtenerPorId(req.params.id);
    res.status(200).json(consulta);
  } catch (err) {
    next(err);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const consulta = await consultaService.cambiarEstado(req.params.id, req.body.estado);
    res.status(200).json(consulta);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await consultaService.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  cambiarEstado,
  eliminar,
};