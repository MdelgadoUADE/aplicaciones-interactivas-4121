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

/**
 * Agrega una imagen. Si esPrincipal=true, desmarca cualquier otra imagen
 * principal del mismo producto ANTES de insertar la nueva — la base
 * tiene un índice único parcial (uq_producto_imagen_principal) que
 * rechazaría el INSERT si hubiera dos con esPrincipal=true al mismo
 * tiempo, así que este orden importa.
 */
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

    const imagen = await ProductoImagen.create(
      {
        idProducto,
        imagenUrl: imageUrl,
        orden: orden ?? 0,
        esPrincipal: esPrincipal ?? false,
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
  // Nota: si la imagen borrada era la esPrincipal, el producto queda
  // sin imagen principal hasta que el admin marque otra. No se elige
  // automáticamente una nueva principal, para no sorprender al admin
  // con un cambio que no pidió explícitamente.
}

module.exports = {
  listar,
  agregar,
  eliminar,
};