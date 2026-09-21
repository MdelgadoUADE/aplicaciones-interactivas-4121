// controllers/auth.controller.js
const authService = require('../services/auth.service');

/**
 * POST /auth/register
 * El controller solo extrae los campos esperados del body (misma
 * allowlist que el service, por defensa en profundidad) y delega toda
 * la lógica de negocio. No decide reglas acá, solo traduce HTTP <-> service.
 */
async function register(req, res, next) {
  try {
    const { nombre, apellido, email, telefono, direccion, password, inviteCode } = req.body;

    const { token, usuario } = await authService.registrar({
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      password,
      inviteCode,
    });

    res.status(201).json({ token, user: usuario });
  } catch (err) {
    next(err); // lo resuelve el error handler centralizado de app.js
  }
}

/**
 * POST /auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { token, usuario } = await authService.login({ email, password });

    res.status(200).json({ token, user: usuario });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /auth/me
 */
async function me(req, res, next) {
  try {
    const usuario = await authService.obtenerPerfil(req.userId);
    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /auth/me
 */
async function updateMe(req, res, next) {
  try {
    const { nombre, apellido, telefono, direccion } = req.body;
    const usuario = await authService.actualizarPerfil(req.userId, { nombre, apellido, telefono, direccion });
    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/logout
 */
async function logout(req, res, next) {
  try {
    // req.tokenJti y la expiración vienen del middleware requireAuth,
    // que ya decodificó y verificó el token en esta misma request.
    await authService.logout(req.tokenJti, new Date(req.tokenExp * 1000));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/forgot-password
 * Responde 200 siempre, exista o no el email — la lógica de no filtrar
 * esa información vive en authService.solicitarRecuperacion().
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    await authService.solicitarRecuperacion(email);
    res.status(200).json({ message: 'Si el email existe, se enviaron instrucciones.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/reset-password
 */
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    await authService.restablecerContrasena(token, password);
    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  me,
  updateMe,
  logout,
  forgotPassword,
  resetPassword,
};