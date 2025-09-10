// === backend/routes/productos.js ===
const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  router.get('/:codigo_variante', (req, res) => {
    const codigo = req.params.codigo_variante;

    const query = `
      SELECT p.descripcion, p.material, p.imagen, c.nombre AS categoria,
            v.medida, v.precio_venta, v.precio_compra,
            v.cantidad_disponible, v.fecha_ingreso, v.codigo_variante
      FROM variantes v
      JOIN productos p ON v.id_producto = p.id
      JOIN categorias c ON p.id_categoria = c.id
      WHERE v.codigo_variante = ?`;

    db.get(query, [codigo], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ message: 'Producto no encontrado' });

      db.all(
        `SELECT color FROM colores_variantes WHERE id_variante = (SELECT id FROM variantes WHERE codigo_variante = ?)`,
        [codigo],
        (err, colores) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ ...row, colores: colores.map(c => c.color) });
        }
      );
    });
  });

  return router;
};