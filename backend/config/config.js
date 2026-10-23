// config/config.js
require('dotenv').config();

// Postgres administrado (Supabase, Render, Neon, etc.) exige SSL en la
// conexión; un Postgres local (localhost) no. Se controla con DB_SSL en el
// .env para no tener que tocar este archivo según el entorno.
const useSsl = String(process.env.DB_SSL).toLowerCase() === 'true';

const dialectOptions = useSsl
  ? {
      ssl: {
        require: true,
        // Supabase usa certificados propios; sin esto la conexión TLS falla
        // con "self-signed certificate in certificate chain".
        rejectUnauthorized: false,
      },
    }
  : {};

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || `${process.env.DB_NAME}_test`,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};