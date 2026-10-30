// controllers/productImage.controller.js
const productImageService = require('../services/productImage.service');

async function listar(req, res, next) {
  try {
    const imagenes = await productImageService.listar(req.params.id);
    res.status(200).json(imagenes);
  } catch (err) {
    next(err);
  }
}

async function agregar(req, res, next) {
  try {
    const { imageUrl, orden, esPrincipal } = req.body;
    const imagen = await productImageService.agregar(req.params.id, { imageUrl, orden, esPrincipal });
    res.status(201).json(imagen);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { esPrincipal, orden } = req.body;
    const imagen = await productImageService.actualizar(req.params.id, req.params.imageId, { esPrincipal, orden });
    res.status(200).json(imagen);
  } catch (err) {
    next(err);
  }
}

async function reordenar(req, res, next) {
  try {
    const imagenes = await productImageService.reordenar(req.params.id, req.body.orden);
    res.status(200).json(imagenes);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await productImageService.eliminar(req.params.id, req.params.imageId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  agregar,
  actualizar,
  reordenar,
  eliminar,
};