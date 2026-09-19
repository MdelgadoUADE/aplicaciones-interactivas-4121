// models/usuario.model.js
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    'Usuario',
    {
      idUsuario: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        // La base ya genera esto con gen_random_uuid() (DEFAULT en el SQL),
        // pero declararlo también acá permite que Sequelize arme el objeto
        // completo en memoria antes del INSERT si hiciera falta (por ej.
        // para usarlo en otra tabla dentro de la misma transacción sin
        // esperar el round-trip a la base).
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
        defaultValue: 'cliente',
        // OJO: el DEFAULT real en la base de datos es 'admin' (ver nota
        // de seguridad más abajo). Este defaultValue de Sequelize NO es
        // suficiente por sí solo como defensa; el service de registro
        // debe asignar 'cliente' de forma explícita en cada creación,
        // sin depender de este default ni del de la base.
        validate: {
          isIn: [['admin', 'cliente']],
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
    },
    {
      tableName: 'usuarios',
      underscored: true,
      timestamps: false, // fecha_registro ya cumple ese rol, no created_at/updated_at
      defaultScope: {
        // Excluye el hash de password de TODAS las consultas por defecto.
        // Ver nota de seguridad de la clase de ciberseguridad: nunca debe
        // viajar en ninguna respuesta salvo que se pida explícitamente.
        attributes: { exclude: ['passwordHash'] },
      },
      scopes: {
        // Único lugar donde se necesita el hash: al hacer login, para
        // comparar con bcrypt. Se usa así: Usuario.scope('conPassword').findOne(...)
        conPassword: {
          attributes: {},
        },
      },
    }
  );

  Usuario.associate = (models) => {
    Usuario.hasMany(models.PasswordResetToken, {
      foreignKey: 'idUsuario',
      as: 'tokensRecuperacion',
    });
  };

  return Usuario;
};
