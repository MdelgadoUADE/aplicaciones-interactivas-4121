// models/producto_imagen.model.js
module.exports = (sequelize, DataTypes) => {
  const ProductoImagen = sequelize.define(
    'ProductoImagen',
    {
      idImagen: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      idProducto: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      imagenUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      esPrincipal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'producto_imagen',
      underscored: true,
      timestamps: false,
    }
  );

  ProductoImagen.associate = (models) => {
    ProductoImagen.belongsTo(models.Producto, {
      foreignKey: 'idProducto',
      as: 'producto',
    });
  };

  return ProductoImagen;
};