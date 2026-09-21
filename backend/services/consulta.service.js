// services/consulta.service.js
const db = require('../models');
const { Consulta } = db;
const { enviarNotificacionConsulta } = require('./email.service');

/**
 * Crea una consulta pública. 'estado' NUNCA se lee del input — se
 * asigna 'pendiente' de forma explícita, sin importar qué mande el
 * cliente (mismo criterio de allowlist que en auth.service.js).
 *
 * Envía notificación por mail al comercio (funcionalidad extra de la
 * consigna: "Envío de correos electrónicos desde el formulario de
 * contacto"). El fallo del envío de mail NO hace fallar la creación de
 * la consulta: la consulta ya quedó guardada en la base (que es el
 * requisito obligatorio), el mail es un extra — si Gmail está caído o
 * hay un problema de red, el visitante igual recibe su 201 y la
 * consulta queda registrada para que el admin la vea desde el panel.
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

  try {
    await enviarNotificacionConsulta(consulta);
  } catch (err) {
    console.error('No se pudo enviar el mail de notificación de consulta:', err.message);
  }

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