// models/producto_categoria.model.js
module.exports = (sequelize, DataTypes) => {
  const ProductoCategoria = sequelize.define(
    "ProductoCategoria",
    {
      // PK compuesta (id_producto, id_categoria) del DER.
      idProducto: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      idCategoria: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
    },
    {
      tableName: "producto_categoria",
      underscored: true,
      timestamps: false, // tabla puramente intermedia, sin columnas propias en el DER
    },
  );

  return ProductoCategoria;
};
