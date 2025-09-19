// === backend/routes/productos.js ===
const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  // GET /api/productos/:codigo_variante
  router.get('/:codigo_variante', (req, res) => {
    const codigo = req.params.codigo_variante;

    const query = `
      SELECT
        v.id AS id_variante,
        p.id AS id_producto,
        p.descripcion,
        p.material,
        p.imagen,
        c.nombre AS categoria,
        v.medida,
        v.precio_venta,
        v.precio_compra,
        v.cantidad_disponible,
        v.fecha_ingreso,
        v.codigo_variante,
        prov.id AS id_proveedor,
        prov.nombre AS proveedor,
        prov.actividad AS proveedor_actividad
      FROM variantes v
      JOIN productos p ON v.id_producto = p.id
      JOIN categorias c ON p.id_categoria = c.id
      JOIN proveedores prov ON p.id_proveedor = prov.id
      WHERE v.codigo_variante = ?;
    `;

    db.get(query, [codigo], (err, row) => {
      if (err) {
        console.error('Error en consulta producto:', err);
        return res.status(500).json({ error: 'Error en la consulta de producto' });
      }
      if (!row) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // Obtener colores con su codigo hexadecimal
      const coloresQuery = `
        SELECT color, codigo_color
        FROM colores_variantes
        WHERE id_variante = ?
        ORDER BY id;
      `;

      db.all(coloresQuery, [row.id_variante], (err, colores) => {
        if (err) {
          console.error('Error al obtener colores:', err);
          return res.status(500).json({ error: 'Error al obtener colores del producto' });
        }

        // Formatear colores (array de objetos { color, codigo_color })
        const coloresFormateados = (colores || []).map(c => ({
          color: c.color,
          codigo_color: c.codigo_color
        }));

        // Respuesta final
        const response = {
          id_producto: row.id_producto,
          id_variante: row.id_variante,
          codigo_variante: row.codigo_variante,
          descripcion: row.descripcion,
          material: row.material,
          imagen: row.imagen,
          categoria: row.categoria,
          medida: row.medida,
          precio_venta: row.precio_venta,
          precio_compra: row.precio_compra,
          cantidad_disponible: row.cantidad_disponible,
          fecha_ingreso: row.fecha_ingreso,
          proveedor: {
            id: row.id_proveedor,
            nombre: row.proveedor,
            actividad: row.proveedor_actividad
          },
          colores: coloresFormateados
        };

        res.json(response);
      });
    });
  });

  return router;
};