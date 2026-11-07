const cors = require("cors");

// hardcodeados
const ORIGENES_FIJOS = [
  "https://maxilibrerias.com",
  "https://www.maxilibrerias.com",
];

// no hardcodeados
const ORIGENES_ENV = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

const WHITELIST = [...ORIGENES_FIJOS, ...ORIGENES_ENV];

// localhost / 127.0.0.1 por nombre o IP loopback, con cualquier puerto o sin.
const REGEX_LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function origenPermitido(origin) {
  if (!origin) return true;
  if (REGEX_LOCALHOST.test(origin)) return true;
  return WHITELIST.includes(origin);
}

module.exports = cors({
  origin(origin, callback) {
    if (origenPermitido(origin)) {
      return callback(null, true);
    }
    //Retornar error con dato de cors.
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
});
