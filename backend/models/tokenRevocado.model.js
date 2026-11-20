// models/token_revocado.model.js
module.exports = (sequelize, DataTypes) => {
  const TokenRevocado = sequelize.define(
    "TokenRevocado",
    {
      idTokenRevocado: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      jti: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        // JWT ID identifica unívocamente cada JWT emitido
        // necesita en la BBDD uuid.v4()
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      fechaExpiracion: {
        type: DataTypes.DATE,
        allowNull: false,
        // Igual a la fecha de expiración natural del JWT original.
        // Sirve para poder purgar filas viejas sin riesgo
      },
    },
    {
      tableName: "token_revocado",
      underscored: true,
      timestamps: false,
    },
  );

  return TokenRevocado;
};
