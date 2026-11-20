// services/productImage.service.js
const db = require('../models');
const { Producto, ProductoImagen, sequelize } = db;

async function listar(idProducto) {
  const producto = await Producto.findByPk(idProducto);
  if (!producto) {
    const error = new Error('Producto no encontrado.');
    error.status = 404;
    throw error;
  }

  return ProductoImagen.findAll({
    where: { idProducto },
    order: [['orden', 'ASC']],
  });
}

// Desmarcá la principal antes de insertar: el índice único parcial no deja dos.
async function agregar(idProducto, { imageUrl, orden, esPrincipal }) {
  const producto = await Producto.findByPk(idProducto);
  if (!producto) {
    const error = new Error('Producto no encontrado.');
    error.status = 404;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    if (esPrincipal) {
      await ProductoImagen.update(
        { esPrincipal: false },
        { where: { idProducto, esPrincipal: true }, transaction: t }
      );
    }

    // Sin orden va al final; si no hay principal, la primera queda como tal.
    let ordenFinal = orden;
    let principalFinal = esPrincipal;
    if (ordenFinal === undefined || principalFinal === undefined) {
      const existentes = await ProductoImagen.findAll({ where: { idProducto }, transaction: t });
      if (ordenFinal === undefined) {
        ordenFinal = existentes.reduce((max, img) => Math.max(max, img.orden), 0) + 1;
      }
      if (principalFinal === undefined) {
        principalFinal = !existentes.some((img) => img.esPrincipal);
      }
    }

    const imagen = await ProductoImagen.create(
      {
        idProducto,
        imagenUrl: imageUrl,
        orden: ordenFinal,
        esPrincipal: principalFinal,
      },
      { transaction: t }
    );

    await t.commit();
    return imagen;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

function noEncontrada() {
  const error = new Error('Imagen no encontrada.');
  error.status = 404;
  return error;
}

// Al marcar principal, desmarcamos las demás en la misma transacción.
async function actualizar(idProducto, idImagen, { esPrincipal, orden }) {
  const t = await sequelize.transaction();
  try {
    const imagen = await ProductoImagen.findOne({ where: { idImagen, idProducto }, transaction: t });
    if (!imagen) throw noEncontrada();

    if (esPrincipal === true) {
      await ProductoImagen.update(
        { esPrincipal: false },
        { where: { idProducto, esPrincipal: true }, transaction: t }
      );
    }

    const cambios = {};
    if (esPrincipal !== undefined) cambios.esPrincipal = esPrincipal;
    if (orden !== undefined) cambios.orden = orden;
    await imagen.update(cambios, { transaction: t });

    await t.commit();
    return imagen;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

// ids tiene que traer exactamente las imágenes del producto.
async function reordenar(idProducto, ids) {
  const producto = await Producto.findByPk(idProducto);
  if (!producto) {
    const error = new Error('Producto no encontrado.');
    error.status = 404;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    const imagenes = await ProductoImagen.findAll({ where: { idProducto }, transaction: t });
    const pedidos = ids.map(String);
    const existentes = imagenes.map((img) => String(img.idImagen));
    const coincide =
      pedidos.length === existentes.length &&
      new Set(pedidos).size === pedidos.length &&
      pedidos.every((id) => existentes.includes(id));

    if (!coincide) {
      const error = new Error('La lista de imágenes no coincide con las del producto.');
      error.status = 400;
      throw error;
    }

    for (let i = 0; i < pedidos.length; i += 1) {
      await ProductoImagen.update(
        { orden: i + 1 },
        { where: { idImagen: pedidos[i], idProducto }, transaction: t }
      );
    }

    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }

  return listar(idProducto);
}

async function eliminar(idProducto, idImagen) {
  const imagen = await ProductoImagen.findOne({
    where: { idImagen, idProducto },
  });

  if (!imagen) {
    const error = new Error('Imagen no encontrada.');
    error.status = 404;
    throw error;
  }

  await imagen.destroy();
  // Si borrás la principal, el producto queda sin principal hasta que el
  // admin elija otra.
}

module.exports = {
  listar,
  agregar,
  actualizar,
  reordenar,
  eliminar,
};