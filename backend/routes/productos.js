// === backend/routes/productos.js ===
const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  // === LISTAR TODOS LOS PRODUCTOS / VARIANTES ===
  // GET /api/productos
  // Query params (opcionales):
  //   q=texto (busca en descripcion, codigo_variante, medida)
  //   orden=nombre_asc|nombre_desc|stock_asc|stock_desc
  router.get('/', (req, res) => {
    const { q = '', orden = 'nombre_asc' } = req.query;

    const filtros = [];
    const params = [];

    if (q.trim() !== '') {
      filtros.push(`(
        LOWER(p.descripcion) LIKE ? OR
        LOWER(v.codigo_variante) LIKE ? OR
        LOWER(v.medida) LIKE ?
      )`);
      const like = `%${q.trim().toLowerCase()}%`;
      params.push(like, like, like);
    }

    let orderBy = 'p.descripcion ASC';
    switch (orden) {
      case 'nombre_desc':
        orderBy = 'p.descripcion DESC';
        break;
      case 'stock_asc':
        orderBy = 'v.cantidad_disponible ASC';
        break;
      case 'stock_desc':
        orderBy = 'v.cantidad_disponible DESC';
        break;
      default:
        orderBy = 'p.descripcion ASC';
    }

    const whereClause = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';

    const sql = `
      SELECT
        v.id            AS id_variante,
        v.codigo_variante,
        p.descripcion,
        p.imagen,
        c.nombre        AS categoria,
        v.medida,
        v.precio_venta,
        v.cantidad_disponible
      FROM variantes v
      JOIN productos p ON v.id_producto = p.id
      JOIN categorias c ON p.id_categoria = c.id
      ${whereClause}
      ORDER BY ${orderBy};
    `;

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error listando productos:', err);
        return res.status(500).json({ error: 'Error en la consulta de listado' });
      }
      res.json(rows || []);
    });
  });

  // === DETALLE POR CODIGO VARIANTE ===
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

      const coloresQuery = `
        SELECT color, codigo_color
        FROM colores_variantes
        WHERE id_variante = ?
        ORDER BY id;
      `;

      db.all(coloresQuery, [row.id_variante], (err2, colores) => {
        if (err2) {
          console.error('Error al obtener colores:', err2);
          return res.status(500).json({ error: 'Error al obtener colores del producto' });
        }

        const coloresFormateados = (colores || []).map(c => ({
          color: c.color,
          codigo_color: c.codigo_color
        }));

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