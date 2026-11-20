// auth/jwt.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

if (!SECRET) {
  // Fallar rápido y ruidoso en desarrollo es mejor que firmar tokens
  // con un secret undefined, que Node aceptaría en silencio.
  throw new Error("Falta JWT_SECRET en las variables de entorno (.env)");
}

// Genera un JWT para un usuario autenticado.

function generateToken(usuario) {
  const jti = crypto.randomUUID();

  const token = jwt.sign(
    {
      id: usuario.idUsuario,
      rol: usuario.rol,
      jti,
    },
    SECRET,
    { expiresIn: EXPIRES_IN },
  );

  return { token, jti };
}

// Verifica un JWT
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};
