// models/comercio.model.js
module.exports = (sequelize, DataTypes) => {
  const Comercio = sequelize.define(
    'Comercio',
    {
      idComercio: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      horarios: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'comercio',
      underscored: true,
      timestamps: true,
      createdAt: false, // comercio solo tiene updated_at en el DER
      updatedAt: 'updated_at',
    }
  );

  Comercio.associate = (models) => {
    Comercio.hasMany(models.RedSocial, {
      foreignKey: 'idComercio',
      as: 'redesSociales',
    });
  };

  return Comercio;
};