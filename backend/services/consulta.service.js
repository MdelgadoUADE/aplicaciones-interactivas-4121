// services/consulta.service.js
const db = require("../models");
const { Consulta } = db;
const { enviarNotificacionConsulta } = require("./email.service");

// Crea una consulta pública.
async function crear({ nombre, email, telefono, asunto, mensaje }) {
  const consulta = await Consulta.create({
    nombre,
    email,
    telefono: telefono || null,
    asunto,
    mensaje,
    estado: "pendiente",
  });

  try {
    await enviarNotificacionConsulta(consulta);
  } catch (err) {
    console.error(
      "No se pudo enviar el mail de notificación de consulta:",
      err.message,
    );
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
    order: [["fecha", "DESC"]],
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
    const error = new Error("Consulta no encontrada.");
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
