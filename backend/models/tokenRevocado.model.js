// models/token_revocado.model.js
module.exports = (sequelize, DataTypes) => {
  const TokenRevocado = sequelize.define(
    'TokenRevocado',
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
        // "JWT ID": claim estándar que identifica unívocamente cada JWT
        // emitido. Se genera al firmar el token (ej. con uuid.v4()) y se
        // incluye en su payload. Al hacer logout, se guarda ese jti acá
        // para invalidar el token antes de su expiración natural.
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
        // Sirve para poder purgar filas viejas sin riesgo: una vez pasada
        // esta fecha, el JWT ya habría expirado solo de todas formas,
        // así que ya no hace falta seguir guardando su jti acá.
      },
    },
    {
      tableName: 'token_revocado',
      underscored: true,
      timestamps: false,
    }
  );

  // Sin associate(): esta tabla no tiene relación declarada con Usuario
  // en el DER (no guarda idUsuario, solo el jti del token). Se consulta
  // de forma independiente desde el middleware de autenticación.

  return TokenRevocado;
};