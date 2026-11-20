// middlewares/auth.middleware.js
const { verifyToken } = require("../auth/jwt");
const db = require("../models");
const { TokenRevocado } = db;

/**
 * Autenticación OBLIGATORIA: corta con 401 si no hay token válido.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ error: "No se proporcionó token de autenticación." });
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }

  const revocado = await TokenRevocado.findOne({ where: { jti: decoded.jti } });
  if (revocado) {
    return res.status(401).json({ error: "Token revocado." });
  }

  // A partir de acá, cualquier controller/service puede usar req.userId
  // y req.userRole SIN volver a decodificar el token.
  req.userId = decoded.id;
  req.userRole = decoded.rol;
  req.tokenJti = decoded.jti;
  req.tokenExp = decoded.exp; // timestamp unix (segundos) de expiración

  next();
}

/**
 * Autenticación OPCIONAL: si hay token válido, carga req.userId/userRole;
 * si no hay token, o es inválido, sigue igual pero sin esos campos.
 * Se usa en endpoints públicos
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(); // sigue sin autenticar, no es un error acá
  }

  try {
    const decoded = verifyToken(token);
    const revocado = await TokenRevocado.findOne({
      where: { jti: decoded.jti },
    });
    if (!revocado) {
      req.userId = decoded.id;
      req.userRole = decoded.rol;
      req.tokenJti = decoded.jti;
    }
  } catch (err) {
    // Token mal formado o expirado en un endpoint público: no es un
    // error fatal, simplemente se trata como "no autenticado".
  }

  next();
}

/**
 * Autorización por rol. Se usa DESPUÉS de requireAuth
 * requireAuth llena req.userRole, esto solo lo verifica.
 */
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.userRole || !rolesPermitidos.includes(req.userRole)) {
      return res
        .status(403)
        .json({ error: "No tenés permisos para esta operación." });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
};
