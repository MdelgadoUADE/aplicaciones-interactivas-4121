// models/usuario.model.js
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      //Necesita UUID V4 en la BBDD si no explota
      idUsuario: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      telefono: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rol: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "admin",
        // Único rol del sistema, por eso el default
        validate: {
          isIn: [["admin"]],
        },
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fechaRegistro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      intentosFallidos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        // Se incrementa en cada login fallido, se resetea a 0 en cada
        // login exitoso (ver auth.service.js).
      },
      bloqueadoHasta: {
        type: DataTypes.DATE,
        allowNull: true,
        // Si tiene un valor y ese valor es futuro, el login se rechaza
        // sin siquiera comparar la contraseña, hasta que pase esa fecha.
      },
    },
    {
      tableName: "usuarios",
      underscored: true,
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ["passwordHash"] },
      },
      scopes: {
        conPassword: {
          attributes: {},
        },
      },
    },
  );

  Usuario.associate = (models) => {
    Usuario.hasMany(models.PasswordResetToken, {
      foreignKey: "idUsuario",
      as: "tokensRecuperacion",
    });
  };

  return Usuario;
};
