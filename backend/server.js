// === backend/server.js ===
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;

// Rutas de archivos
const dbPath = path.join(__dirname, 'database', 'colchoneswilson.db');
const sqlInitPath = path.join(__dirname, 'database', 'init.sql');

// Crear base de datos si no existe y ejecutar init.sql
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Error al abrir base de datos:', err.message);

  // Leer el archivo SQL e inicializar
  const initSQL = fs.readFileSync(sqlInitPath, 'utf-8');
  db.exec(initSQL, (err) => {
    if (err) return console.error('Error al ejecutar init.sql:', err.message);
    console.log('Base de datos inicializada correctamente.');
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para imágenes estáticas (asegúrate de colocar las imágenes allí)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Rutas
const productosRoutes = require('./routes/productos');
app.use('/api/productos', productosRoutes(db)); // ← Le pasamos la DB

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});