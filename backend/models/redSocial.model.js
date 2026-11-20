// models/red_social.model.js
module.exports = (sequelize, DataTypes) => {
  const RedSocial = sequelize.define(
    "RedSocial",
    {
      idRedSocial: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      idComercio: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
    },
    {
      tableName: "red_social",
      underscored: true,
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["id_comercio", "tipo"],
          // UNIQUE (id_comercio, tipo) del SQL, un mismo
          // comercio no puede tener dos filas con el mismo tipo de red
          // social (ej. dos Instagram distintos).
        },
      ],
    },
  );

  RedSocial.associate = (models) => {
    RedSocial.belongsTo(models.Comercio, {
      foreignKey: "idComercio",
      as: "comercio",
    });
  };

  return RedSocial;
};
