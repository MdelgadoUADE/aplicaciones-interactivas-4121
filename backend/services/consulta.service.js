// services/consulta.service.js
const db = require('../models');
const { Consulta } = db;

/**
 * Crea una consulta pública. 'estado' NUNCA se lee del input — se
 * asigna 'pendiente' de forma explícita, sin importar qué mande el
 * cliente (mismo criterio de allowlist que en auth.service.js).
 */
async function crear({ nombre, email, telefono, asunto, mensaje }) {
  const consulta = await Consulta.create({
    nombre,
    email,
    telefono: telefono || null,
    asunto,
    mensaje,
    estado: 'pendiente',
  });

  return consulta;
}

async function listar({ page = 1, limit = 20, estado } = {}) {
  const where = {};
  if (estado) where.estado = estado;

  const offset = (page - 1) * limit;
  const { count, rows } = await Consulta.findAndCountAll({
    where,
    limit,
    offset,
    order: [['fecha', 'DESC']],
  });

  return {
    items: rows,
    total: count,
    page,
    limit,
  };
}

async function obtenerPorId(id) {
  const consulta = await Consulta.findByPk(id);
  if (!consulta) {
    const error = new Error('Consulta no encontrada.');
    error.status = 404;
    throw error;
  }
  return consulta;
}

async function cambiarEstado(id, estado) {
  const consulta = await obtenerPorId(id);
  await consulta.update({ estado });
  return consulta;
}

async function eliminar(id) {
  const consulta = await obtenerPorId(id);
  await consulta.destroy();
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  cambiarEstado,
  eliminar,
};