// controllers/comercio.controller.js
const comercioService = require('../services/comercio.service');

async function obtener(req, res, next) {
  try {
    const comercio = await comercioService.obtener();
    res.status(200).json(comercio);
  } catch (err) {
    next(err);
  }
}

async function guardar(req, res, next) {
  try {
    const { nombre, descripcion, direccion, telefono, horarios, redesSociales } = req.body;
    const comercio = await comercioService.guardar({
      nombre,
      descripcion,
      direccion,
      telefono,
      horarios,
      redesSociales,
    });
    res.status(200).json(comercio);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  obtener,
  guardar,
};