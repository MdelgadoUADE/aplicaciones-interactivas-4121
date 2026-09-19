// models/red_social.model.js
module.exports = (sequelize, DataTypes) => {
  const RedSocial = sequelize.define(
    'RedSocial',
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
        // Ej: 'instagram', 'facebook', 'whatsapp'. Sin enum en la base
        // (es VARCHAR libre), así que no agrego isIn acá tampoco, para
        // no atarse a una lista cerrada que la base no exige.
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
      tableName: 'red_social',
      underscored: true,
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['id_comercio', 'tipo'],
          // Refleja el UNIQUE (id_comercio, tipo) del SQL: un mismo
          // comercio no puede tener dos filas con el mismo tipo de red
          // social (ej. dos Instagram distintos).
        },
      ],
    }
  );

  RedSocial.associate = (models) => {
    RedSocial.belongsTo(models.Comercio, {
      foreignKey: 'idComercio',
      as: 'comercio',
    });
  };

  return RedSocial;
};