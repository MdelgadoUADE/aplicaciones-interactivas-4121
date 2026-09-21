// services/auth.service.js
const crypto = require('crypto');
const db = require('../models');
const { Usuario, PasswordResetToken, TokenRevocado } = db;
const { hashPassword, comparePassword } = require('../auth/hash');
const { generateToken } = require('../auth/jwt');
const { enviarEmailRecuperacion } = require('./email.service');

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
  obtenerPerfil,
  actualizarPerfil,
  logout,
  solicitarRecuperacion,
  restablecerContrasena,
};

/**
 * GET /auth/me. userId viene SIEMPRE del token verificado (req.userId
 * en el middleware), nunca de un parámetro de la URL o del body — así
 * no hay forma de pedir el perfil de otro usuario.
 */
async function obtenerPerfil(userId) {
  const usuario = await Usuario.findByPk(userId);
  if (!usuario) {
    const error = new Error('Usuario no encontrado.');
    error.status = 404;
    throw error;
  }
  return usuario;
}

/**
 * PATCH /auth/me. Mismo criterio: el ID a modificar es SIEMPRE
 * req.userId del token, nunca un id que venga en el body. No existe (ni
 * debe existir) un endpoint para que un usuario modifique a otro por id
 * — eso sería exactamente el bug de IDOR visto en la clase de
 * ciberseguridad (Investigación 2: "estoy autenticado como el usuario 25
 * y borro al usuario 26").
 *
 * No incluye 'rol' ni 'email' entre los campos aceptados — cambiar el
 * email requeriría un flujo de verificación aparte que no está
 * implementado, y 'rol' nunca debe poder auto-asignarse.
 */
async function actualizarPerfil(userId, { nombre, apellido, telefono, direccion }) {
  const usuario = await Usuario.findByPk(userId);
  if (!usuario) {
    const error = new Error('Usuario no encontrado.');
    error.status = 404;
    throw error;
  }

  await usuario.update({
    nombre: nombre ?? usuario.nombre,
    apellido: apellido ?? usuario.apellido,
    telefono: telefono ?? usuario.telefono,
    direccion: direccion !== undefined ? direccion : usuario.direccion,
  });

  return usuario;
}

/**
 * POST /auth/logout. Agrega el jti del token actual a token_revocado,
 * para que ese JWT puntual deje de ser válido antes de su expiración
 * natural (ver auth/jwt.js y middlewares/auth.middleware.js).
 */
async function logout(jti, tokenExpiraEn) {
  await TokenRevocado.create({
    jti,
    fechaExpiracion: tokenExpiraEn,
  });
}

/**
 * POST /auth/forgot-password.
 *
 * Seguridad: si el email no existe, la función retorna sin hacer nada
 * (silenciosamente) — el controller responde 200 en cualquier caso, para
 * no filtrar qué emails están registrados en el sistema (mismo criterio
 * que el mensaje genérico de login).
 *
 * El token en texto plano viaja SOLO por email (enviarEmailRecuperacion),
 * nunca se loguea ni se devuelve en la respuesta HTTP. Solo se persiste
 * su hash (sha256), nunca el token real — si la tabla se filtrara, nadie
 * podría reconstruir tokens válidos a partir de los hashes.
 */
async function solicitarRecuperacion(email) {
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) return; // no revelamos si el email existe o no

  const tokenPlano = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');

  await PasswordResetToken.create({
    idUsuario: usuario.idUsuario,
    tokenHash,
    fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
  });

  await enviarEmailRecuperacion(usuario.email, tokenPlano);
}

/**
 * POST /auth/reset-password. Busca el token por su HASH (nunca por el
 * texto plano recibido), valida que sea válido (ver
 * PasswordResetToken.esValido() en el modelo: no usado y no vencido), y
 * si todo está bien, actualiza la contraseña y marca el token como
 * usado para que no pueda reutilizarse.
 */
async function restablecerContrasena(tokenPlano, nuevaPassword) {
  const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');

  const registroToken = await PasswordResetToken.findOne({ where: { tokenHash } });

  const tokenInvalido = () => {
    const error = new Error('Token inválido, ya usado o expirado.');
    error.status = 400;
    return error;
  };

  if (!registroToken || !registroToken.esValido()) {
    throw tokenInvalido();
  }

  const usuario = await Usuario.findByPk(registroToken.idUsuario);
  if (!usuario) {
    throw tokenInvalido();
  }

  const passwordHash = await hashPassword(nuevaPassword);

  await usuario.update({ passwordHash });
  await registroToken.update({ usado: true });
}