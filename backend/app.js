// Cargar variables de .env
require('dotenv').config();

var express = require('express');
var cors = require('cors');

// Instancia de Express
var app = express();

// Habilita CORS para todas las rutas
app.use(cors());


// Middleware para interpretar JSON y datos de formularios URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba (Etapa 1: confirmar que el server responde)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/consultas', require('./routes/consulta.routes'));
app.use('/api/comercio', require('./routes/comercio.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Manejo de rutas no encontradas (404) — conviene tenerlo desde ya
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo de errores centralizado (Express lo reconoce por tener 4 parámetros)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;