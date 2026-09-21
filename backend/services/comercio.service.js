// services/comercio.service.js
const db = require('../models');
const { Comercio, RedSocial, sequelize } = db;

async function obtener() {
  const comercio = await Comercio.findOne({
    include: { model: RedSocial, as: 'redesSociales' },
    order: [['idComercio', 'ASC']], // por si alguna vez hubiera más de uno, tomamos el primero
  });

  if (!comercio) {
    const error = new Error('Todavía no se cargó la información del comercio.');
    error.status = 404;
    throw error;
  }

  return comercio;
}

/**
 * Upsert: si ya existe un comercio, lo actualiza; si no, lo crea.
 * El array redesSociales SIEMPRE reemplaza el set completo existente
 * (se borran todas las filas viejas y se insertan las nuevas), dentro
 * de una transacción — no hace merge campo por campo.
 */
async function guardar({ nombre, descripcion, direccion, telefono, horarios, redesSociales }) {
  const t = await sequelize.transaction();

  try {
    let comercio = await Comercio.findOne({ transaction: t });

    if (comercio) {
      await comercio.update({ nombre, descripcion, direccion, telefono, horarios }, { transaction: t });
    } else {
      comercio = await Comercio.create({ nombre, descripcion, direccion, telefono, horarios }, { transaction: t });
    }

    if (redesSociales) {
      await RedSocial.destroy({ where: { idComercio: comercio.idComercio }, transaction: t });

      if (redesSociales.length > 0) {
        await RedSocial.bulkCreate(
          redesSociales.map((rs) => ({
            idComercio: comercio.idComercio,
            tipo: rs.tipo,
            url: rs.url,
          })),
          { transaction: t }
        );
      }
    }

    await t.commit();

    return Comercio.findByPk(comercio.idComercio, {
      include: { model: RedSocial, as: 'redesSociales' },
    });
  } catch (err) {
    await t.rollback();
    // El UNIQUE (id_comercio, tipo) rechazaría dos redes sociales del
    // mismo tipo en el mismo array del body.
    if (err.name === 'SequelizeUniqueConstraintError') {
      const error = new Error('No puede haber dos redes sociales del mismo tipo.');
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

module.exports = {
  obtener,
  guardar,
};