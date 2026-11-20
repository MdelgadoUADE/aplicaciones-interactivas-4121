// models/password_reset_token.model.js
module.exports = (sequelize, DataTypes) => {
  const PasswordResetToken = sequelize.define(
    "PasswordResetToken",
    {
      idToken: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      idUsuario: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      tokenHash: {
        type: DataTypes.TEXT,
        allowNull: false,
        // aca solo se guarda el hash que se crea con bcrypt
      },
      usado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      fechaExpiracion: {
        type: DataTypes.DATE,
        allowNull: false,
        // Se setea al crear el token, típicamente NOW() + 30 minutos.
      },
    },
    {
      tableName: "password_reset_token",
      underscored: true,
      timestamps: false,
    },
  );

  // Método de instancia: ¿este token todavía se puede usar?
  PasswordResetToken.prototype.esValido = function () {
    return this.usado === false && this.fechaExpiracion > new Date();
  };

  PasswordResetToken.associate = (models) => {
    PasswordResetToken.belongsTo(models.Usuario, {
      foreignKey: "idUsuario",
      as: "usuario",
    });
  };

  return PasswordResetToken;
};
