const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;

// Tiempo máximo que esperamos a que la base responda antes de darla por caída.
// Sin esto, si el host no responde, el arranque se queda "colgado" ~60s
// (el timeout por defecto del pool de Sequelize) sin decir nada.
const DB_TIMEOUT_MS = 10000;

// Arma un texto legible a partir del error de Sequelize. Muchas veces el
// error viene con `message` vacío y esconde el detalle real en .parent /
// .original / .cause / .errors (por ej. un AggregateError de Node cuando
// fallan IPv6 e IPv4 a la vez). Por eso se recorre el árbol de errores.
function describirError(error, vistos = new Set(), profundidad = 0) {
  if (!error || typeof error !== 'object' || vistos.has(error) || profundidad > 4) {
    return [];
  }
  vistos.add(error);

  const partes = [];
  if (error.code) partes.push(error.code);
  if (error.message) partes.push(error.message);

  for (const clave of ['parent', 'original', 'cause']) {
    partes.push(...describirError(error[clave], vistos, profundidad + 1));
  }
  if (Array.isArray(error.errors)) {
    error.errors.forEach((sub) => partes.push(...describirError(sub, vistos, profundidad + 1)));
  }
  return partes;
}

// Traduce los errores de conexión más comunes a una pista accionable.
// Se evalúa contra el nombre del error de Sequelize + todos los detalles.
function pistaDeError(texto) {
  if (/database .* does not exist/i.test(texto)) {
    return 'La base indicada en DB_NAME no existe. En Supabase la base siempre se llama "postgres".';
  }
  if (/AccessDenied|password authentication failed|role .* does not exist/i.test(texto)) {
    return 'Usuario o contraseña incorrectos (DB_USER / DB_PASSWORD). Con el pooler de Supabase el usuario es "postgres.<project-ref>".';
  }
  if (/HostNotFound|HostNotReachable|ENETUNREACH|EHOSTUNREACH|ENOTFOUND|EAI_AGAIN/i.test(texto)) {
    return 'La red no llega al host de la base. Si es Supabase, usá el host del POOLER (aws-0-<region>.pooler.supabase.com) y NO el directo db.<ref>.supabase.co, que resuelve solo a IPv6.';
  }
  if (/ConnectionRefused|ECONNREFUSED/i.test(texto)) {
    return 'Nadie está escuchando en DB_HOST:DB_PORT. Revisá que el Postgres local esté levantado y que el puerto sea el correcto.';
  }
  if (/ConnectionTimedOut|ETIMEDOUT|Timeout/i.test(texto)) {
    return 'La base no respondió a tiempo. Revisá firewall/red y que DB_HOST y DB_PORT sean correctos.';
  }
  if (/self-signed certificate|certificate chain/i.test(texto)) {
    return 'Problema de TLS. Si la base es administrada (Supabase, Neon, Render), poné DB_SSL=true.';
  }
  return null;
}

// Verifica que la base esté accesible ANTES de aceptar requests.
async function verificarConexion() {
  const autenticacion = db.sequelize.authenticate();
  // Si gana el timeout, la promesa de authenticate queda pendiente y podría
  // rechazar después: este catch evita un "unhandled rejection" en consola.
  autenticacion.catch(() => {});

  let timeoutId;
  const timeout = new Promise((resolve, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Timeout: la base no respondió en ${DB_TIMEOUT_MS / 1000}s`)),
      DB_TIMEOUT_MS
    );
  });

  try {
    await Promise.race([autenticacion, timeout]);
    clearTimeout(timeoutId);
    console.log('Conexión a la base de datos OK.');
    return true;
  } catch (error) {
    clearTimeout(timeoutId);

    const nombre = error.name || 'Error';
    const detalles = [...new Set(describirError(error))];
    const detalle = detalles.length ? detalles.join(' | ') : 'sin detalle';
    const textoCompleto = `${nombre} ${detalle}`;

    console.error('');
    console.error('ERROR: no se pudo conectar a la base de datos.');
    console.error(
      `  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}  |  Base: ${process.env.DB_NAME}  |  Usuario: ${process.env.DB_USER}`
    );
    console.error(`  Detalle: ${nombre}: ${detalle}`);
    const pista = pistaDeError(textoCompleto);
    if (pista) console.error(`  Pista: ${pista}`);
    console.error('');
    return false;
  }
}

async function iniciar() {
  const conexionOk = await verificarConexion();

  if (!conexionOk) {
    // Fail-fast: sin base de datos el backend no puede responder nada útil,
    // así que no lo dejamos levantado sirviendo errores 500. Con nodemon,
    // al guardar cualquier archivo se reintenta el arranque.
    console.error('Servidor NO iniciado. Corregí el .env y volvé a intentar.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

iniciar();
