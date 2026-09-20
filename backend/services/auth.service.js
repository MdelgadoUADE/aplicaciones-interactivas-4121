// services/auth.service.js
const db = require('../models');
const { Usuario } = db;
const { hashPassword, comparePassword } = require('../auth/hash');
const { generateToken } = require('../auth/jwt');

/**
 * Registra un nuevo usuario administrador.
 *
 * En este proyecto el único rol persistido es 'admin' (ver nota en
 * usuario.model.js: la consigna del TPO solo define "visitante" -sin
 * cuenta- y "administrador"). Como CUALQUIER registro exitoso otorga
 * rol admin, el endpoint deja de ser público sin control: exige un
 * inviteCode que coincide con process.env.ADMIN_INVITE_CODE, conocido
 * solo por el dueño del comercio. Esto reemplaza la defensa de "rol
 * cliente por defecto" que tendría sentido si hubiera más de un rol.
 *
 * Sigue habiendo allowlist explícita igual: el objeto que se pasa a
 * Usuario.create() se arma campo por campo, nunca Usuario.create(req.body).
 */
async function registrar({ nombre, apellido, email, telefono, direccion, password, inviteCode }) {
  if (inviteCode !== process.env.ADMIN_INVITE_CODE) {
    const error = new Error('Código de invitación inválido.');
    error.status = 403;
    throw error;
  }

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
    rol: 'admin', // único rol del sistema, explícito de todas formas
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