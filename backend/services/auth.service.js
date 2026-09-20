// services/auth.service.js
const db = require('../models');
const { Usuario } = db;
const { hashPassword, comparePassword } = require('../auth/hash');
const { generateToken } = require('../auth/jwt');

/**
 * Registra un nuevo usuario.
 *
 * Seguridad: el objeto que se pasa a Usuario.create() se arma a mano,
 * campo por campo (allowlist explícita) — NUNCA se hace algo como
 * Usuario.create(req.body). Esto es intencional: la tabla usuarios tiene
 * DEFAULT 'admin' en la columna rol a nivel de base de datos, y el
 * cliente jamás debe poder decidir su propio rol (mass assignment, visto
 * en la clase de ciberseguridad). 'cliente' se asigna acá de forma
 * explícita, sin importar qué venga en el input.
 */
async function registrar({ nombre, apellido, email, telefono, direccion, password }) {
  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    const error = new Error('El email ya está registrado.');
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const usuario = await Usuario.create({
    nombre,
    apellido,
    email,
    telefono,
    direccion: direccion || null,
    passwordHash,
    rol: 'cliente', // explícito, nunca desde el input del cliente
  });

  const { token } = generateToken(usuario);

  return { token, usuario };
}

/**
 * Login. Usa el scope 'conPassword' porque el defaultScope de Usuario
 * excluye passwordHash de toda consulta (ver models/usuario.model.js) —
 * este es el único lugar de todo el backend donde se necesita el hash.
 */
async function login({ email, password }) {
  const usuario = await Usuario.scope('conPassword').findOne({ where: { email } });

  // Mismo mensaje de error tanto si el email no existe como si el
  // password no coincide — no hay que darle a un atacante la pista de
  // "este email sí existe, probá otra contraseña".
  const credencialesInvalidas = () => {
    const error = new Error('Email o contraseña incorrectos.');
    error.status = 401;
    return error;
  };

  if (!usuario) {
    throw credencialesInvalidas();
  }

  const passwordCorrecta = await comparePassword(password, usuario.passwordHash);
  if (!passwordCorrecta) {
    throw credencialesInvalidas();
  }

  const { token } = generateToken(usuario);

  // Recargamos sin el scope conPassword antes de devolver el usuario,
  // para no filtrar el hash en la respuesta del login.
  const usuarioSinPassword = await Usuario.findByPk(usuario.idUsuario);

  return { token, usuario: usuarioSinPassword };
}

module.exports = {
  registrar,
  login,
};