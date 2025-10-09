// === backend/server.js ===
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONT_ORIGIN = 'https://192.168.10.104:5174';

// Rutas de archivos
const dbPath = path.join(__dirname, 'database', 'colchoneswilson.db');
const sqlInitPath = path.join(__dirname, 'database', 'init.sql');

// Inicializar base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir base de datos:', err.message);
    return;
  }
  try {
    const initSQL = fs.readFileSync(sqlInitPath, 'utf-8');
    db.exec(initSQL, (err2) => {
      if (err2) return console.error('Error al ejecutar init.sql:', err2.message);
      console.log('Base de datos inicializada correctamente.');
    });
  } catch (e) {
    console.error('No se pudo leer init.sql:', e.message);
  }
});

// Middleware
app.use(cors({
  origin: FRONT_ORIGIN,
  credentials: false
}));
app.use(express.json());

// Salud / diagnostico
app.get('/api/ping', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Imágenes estáticas
app.use('/images', express.static(path.join(__dirname, 'images')));

// Rutas de productos
const productosRoutes = require('./routes/productos');
app.use('/api/productos', productosRoutes(db));

// SSL (usa mismo cert que frontend)
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../cert/keyXentra.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../cert/certXentra.pem')),
  // Si usas CA propia y quieres enviar la cadena (no obligatorio para clientes que ya confían):
  // ca: fs.readFileSync(path.join(__dirname, '../cert/ca.crt')),
  // requestCert: false,
  // rejectUnauthorized: false
};

// Servidor HTTPS
const server = https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor HTTPS iniciado en https://192.168.10.104:${PORT}`);
});

// Manejo de cierre elegante
function shutdown(signal) {
  console.log(`\nRecibido ${signal}. Cerrando servidor...`);
  server.close(() => {
    console.log('Servidor cerrado.');
    db.close(() => {
      console.log('Base de datos cerrada.');
      process.exit(0);
    });
  });
  // Forzar si tarda
  setTimeout(() => process.exit(1), 8000).unref();
}

['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => shutdown(sig)));