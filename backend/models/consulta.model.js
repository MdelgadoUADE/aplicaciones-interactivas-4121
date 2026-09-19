// models/consulta.model.js
module.exports = (sequelize, DataTypes) => {
  const Consulta = sequelize.define(
    'Consulta',
    {
      idConsulta: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      telefono: {
        type: DataTypes.STRING(30),
        allowNull: true, // opcional, según la consigna del TPO
      },
      asunto: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      mensaje: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pendiente',
        // El service de creación NUNCA debe aceptar 'estado' del body:
        // toda consulta nueva entra como 'pendiente' sin excepción,
        // sin importar qué envíe el cliente (mismo criterio de
        // mass assignment aplicado acá que en el rol de Usuario).
        validate: {
          isIn: [['pendiente', 'respondida', 'cerrada']],
        },
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'consulta',
      underscored: true,
      timestamps: false, // "fecha" ya cumple ese rol
    }
  );

  // Sin associate(): consulta es independiente en el DER, no tiene FK
  // hacia ninguna otra tabla ni ninguna otra tabla apunta hacia ella.

  return Consulta;
};