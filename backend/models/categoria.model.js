// models/categoria.model.js
module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define(
    'Categoria',
    {
      idCategoria: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_categoria',
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'categoria',
      timestamps: false, // esta tabla no tiene created_at/updated_at en el DER
    }
  );

  Categoria.associate = (models) => {
    // N:N con Producto a través de producto_categoria
    Categoria.belongsToMany(models.Producto, {
      through: models.ProductoCategoria,
      foreignKey: 'idCategoria',
      otherKey: 'idProducto',
      as: 'productos',
    });
  };

  return Categoria;
};