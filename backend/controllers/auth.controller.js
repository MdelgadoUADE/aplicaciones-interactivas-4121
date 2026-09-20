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
    const { nombre, apellido, email, telefono, direccion, password } = req.body;

    const { token, usuario } = await authService.registrar({
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      password,
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

module.exports = {
  register,
  login,
};