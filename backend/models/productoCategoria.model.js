// models/producto_categoria.model.js
module.exports = (sequelize, DataTypes) => {
  const ProductoCategoria = sequelize.define(
    'ProductoCategoria',
    {
      idProducto: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        // Parte de la PK compuesta (id_producto, id_categoria) del DER.
        // No autoIncrement: es FK, no un ID propio.
      },
      idCategoria: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        // Segunda mitad de la PK compuesta.
      },
    },
    {
      tableName: 'producto_categoria',
      underscored: true,
      timestamps: false, // tabla puramente intermedia, sin columnas propias en el DER
    }
  );

  // Esta tabla intermedia no necesita belongsTo hacia Producto/Categoria
  // porque no se consulta directamente: Sequelize la usa "por debajo"
  // cuando llamás a producto.getCategorias() o categoria.getProductos(),
  // gracias al belongsToMany({ through: ProductoCategoria }) que ya
  // están definidos en producto.model.js y categoria.model.js.
  // No hace falta un associate() acá.

  return ProductoCategoria;
};