// models/password_reset_token.model.js
module.exports = (sequelize, DataTypes) => {
  const PasswordResetToken = sequelize.define(
    'PasswordResetToken',
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
        // Nunca se guarda el token en texto plano acá. El flujo correcto:
        // 1) generar un token random (crypto.randomBytes(32).toString('hex'))
        // 2) guardar SOLO su hash acá (bcrypt o sha256, no hace falta bcrypt
        //    porque no es una contraseña de usuario, con sha256 alcanza)
        // 3) mandar el token en texto plano por EMAIL, nunca por consola/log
        // 4) al llegar el reset, hashear el token recibido y buscarlo acá
        //    por tokenHash, nunca comparar el texto plano directamente.
      },
      estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'vigente',
        validate: {
          isIn: [['vigente', 'usado', 'expirado']],
        },
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
        // No tiene defaultValue acá porque depende de la lógica del
        // service (la ventana de expiración es una decisión de negocio,
        // no algo que el modelo deba asumir).
      },
    },
    {
      tableName: 'password_reset_token',
      underscored: true,
      timestamps: false,
    }
  );

  // Método de instancia: ¿este token todavía se puede usar?
  PasswordResetToken.prototype.esValido = function () {
    return this.estado === 'vigente' && this.fechaExpiracion > new Date();
  };

  PasswordResetToken.associate = (models) => {
    PasswordResetToken.belongsTo(models.Usuario, {
      foreignKey: 'idUsuario',
      as: 'usuario',
    });
  };

  return PasswordResetToken;
};