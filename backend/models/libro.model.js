// models/libro.model.js
module.exports = (sequelize, DataTypes) => {
  const Libro = sequelize.define(
    'Libro',
    {
      idProducto: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        // No autoIncrement: este valor viene de producto.id_producto,
        // no se genera solo (es FK y PK a la vez).
      },
      isbn: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      autor: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      editorial: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      anioPublicacion: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
    },
    {
      tableName: 'libro',
      underscored: true,
      timestamps: false, // libro no tiene columnas de fecha en el DER
    }
  );

  Libro.associate = (models) => {
    // 1:1 inverso: Libro pertenece a un Producto
    Libro.belongsTo(models.Producto, {
      foreignKey: 'idProducto',
      as: 'producto',
    });
  };

  return Libro;
};