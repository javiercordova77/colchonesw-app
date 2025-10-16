// === backend/routes/productos.js ===
const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  // LISTADO: GET /api/productos?q&orden
  // orden: nombre_asc|nombre_desc|stock_asc|stock_desc
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
      case 'nombre_desc': orderBy = 'p.descripcion DESC'; break;
      case 'stock_asc':   orderBy = 'COALESCE(vs.cantidad_disponible,0) ASC'; break;
      case 'stock_desc':  orderBy = 'COALESCE(vs.cantidad_disponible,0) DESC'; break;
      default:            orderBy = 'p.descripcion ASC';
    }

    const whereClause = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';

    const sql = `
      SELECT
        v.id                 AS id_variante,
        v.codigo_variante,
        p.descripcion,
        p.imagen,
        c.nombre             AS categoria,
        v.medida,
        v.precio_venta,
        COALESCE(vs.cantidad_disponible, 0) AS cantidad_disponible
      FROM variantes v
      JOIN productos  p ON v.id_producto = p.id
      JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN vw_variantes_stock_agg vs ON vs.id_variante = v.id
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

  // RESUMEN POR PRODUCTO: GET /api/productos/resumen?q&orden
  // orden: nombre_asc|nombre_desc|stock_asc|stock_desc
  router.get('/resumen', (req, res) => {
    const { q = '', orden = 'nombre_asc' } = req.query;

    const filtros = [];
    const params = [];

    if (q.trim() !== '') {
      filtros.push(`(
        LOWER(p.descripcion) LIKE ? OR
        LOWER(p.material) LIKE ?
      )`);
      const like = `%${q.trim().toLowerCase()}%`;
      params.push(like, like);
    }

    let orderBy = 'p.descripcion COLLATE NOCASE ASC';
    switch (orden) {
      case 'nombre_desc': orderBy = 'p.descripcion COLLATE NOCASE DESC'; break;
      case 'stock_asc':   orderBy = 'stock_total ASC'; break;
      case 'stock_desc':  orderBy = 'stock_total DESC'; break;
      default:            orderBy = 'p.descripcion COLLATE NOCASE ASC';
    }

    const whereClause = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';

    const sql = `
      SELECT
        p.id,
        p.descripcion,
        p.material,
        p.imagen,
        COALESCE(SUM(su.cantidad_disponible), 0) AS stock_total
      FROM productos p
      LEFT JOIN variantes v ON v.id_producto = p.id
      LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy};
    `;

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error listando productos (resumen):', err);
        return res.status(500).json({ error: 'Error en la consulta de productos (resumen)' });
      }
      res.json(rows || []);
    });
  });

  // DETALLE por CÓDIGO de variante: GET /api/productos/codigo/:codigo_variante
  // Colocada antes de rutas dinámicas para evitar colisiones
  router.get('/codigo/:codigo_variante', (req, res) => {
    const codigo = req.params.codigo_variante;

    const qDetalle = `
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
        v.fecha_ingreso,
        v.codigo_variante,
        prov.id   AS id_proveedor,
        prov.nombre AS proveedor,
        prov.actividad AS proveedor_actividad,
        COALESCE(vs.cantidad_disponible, 0) AS cantidad_disponible_total,
        COALESCE(vs.cantidad_minima, 0)     AS cantidad_minima_total
      FROM variantes v
      JOIN productos p  ON v.id_producto = p.id
      JOIN categorias c ON p.id_categoria = c.id
      JOIN proveedores prov ON p.id_proveedor = prov.id
      LEFT JOIN vw_variantes_stock_agg vs ON vs.id_variante = v.id
      WHERE v.codigo_variante = ?;
    `;

    db.get(qDetalle, [codigo], (err, row) => {
      if (err) {
        console.error('Error en consulta producto:', err);
        return res.status(500).json({ error: 'Error en la consulta de producto' });
      }
      if (!row) return res.status(404).json({ message: 'Producto no encontrado' });

      const qColores = `
        SELECT color, codigo_color
        FROM colores_variantes
        WHERE id_variante = ?
        ORDER BY id;
      `;
      const qUbicaciones = `
        SELECT
          u.id       AS id_ubicacion,
          u.nombre   AS ubicacion,
          u.descripcion AS ubicacion_descripcion,
          su.cantidad_disponible,
          su.cantidad_minima,
          su.fecha_ingreso,
          su.updated_at
        FROM stock_ubicaciones su
        JOIN ubicaciones u ON u.id = su.id_ubicacion
        WHERE su.id_variante = ?
        ORDER BY u.nombre;
      `;

      db.all(qColores, [row.id_variante], (errC, colores) => {
        if (errC) return res.status(500).json({ error: 'Error al obtener colores del producto' });
        db.all(qUbicaciones, [row.id_variante], (errU, ubicaciones) => {
          if (errU) return res.status(500).json({ error: 'Error al obtener stock por ubicación' });

          res.json({
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
            fecha_ingreso: row.fecha_ingreso,
            proveedor: { id: row.id_proveedor, nombre: row.proveedor, actividad: row.proveedor_actividad },
            colores: (colores || []).map(c => ({ color: c.color, codigo_color: c.codigo_color })),
            stock: {
              total: {
                cantidad_disponible: row.cantidad_disponible_total,
                cantidad_minima: row.cantidad_minima_total
              },
              ubicaciones: (ubicaciones || []).map(u => ({
                id_ubicacion: u.id_ubicacion,
                ubicacion: u.ubicacion,
                ubicacion_descripcion: u.ubicacion_descripcion,
                cantidad_disponible: u.cantidad_disponible,
                cantidad_minima: u.cantidad_minima,
                fecha_ingreso: u.fecha_ingreso,
                updated_at: u.updated_at
              }))
            }
          });
        });
      });
    });
  });

  // INFO PRODUCTO por ID: GET /api/productos/:id
  router.get('/:id', (req, res) => {
    const id = Number(req.params.id || 0);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const sql = `SELECT id, descripcion, material, imagen FROM productos WHERE id = ? LIMIT 1`;
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error('Error obteniendo producto:', err);
        return res.status(500).json({ error: 'Error consultando producto' });
      }
      if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(row);
    });
  });

  // VARIANTES (RESUMEN) por producto: GET /api/productos/:id/variantes/resumen?q&orden
  // orden: medida_asc|medida_desc|codigo_asc|codigo_desc|stock_asc|stock_desc
  router.get('/:id/variantes/resumen', (req, res) => {
    const id = Number(req.params.id || 0);
    const { q = '', orden = 'medida_asc' } = req.query;
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const filtros = ['v.id_producto = ?'];
    const params = [id];

    if (q.trim() !== '') {
      const like = `%${q.trim().toLowerCase()}%`;
      filtros.push(`(LOWER(v.medida) LIKE ? OR LOWER(v.codigo_variante) LIKE ?)`);
      params.push(like, like);
    }

    let orderBy = 'v.medida COLLATE NOCASE ASC';
    switch (orden) {
      case 'medida_desc': orderBy = 'v.medida COLLATE NOCASE DESC'; break;
      case 'codigo_asc':  orderBy = 'v.codigo_variante COLLATE NOCASE ASC'; break;
      case 'codigo_desc': orderBy = 'v.codigo_variante COLLATE NOCASE DESC'; break;
      case 'stock_asc':   orderBy = 'stock_total ASC'; break;
      case 'stock_desc':  orderBy = 'stock_total DESC'; break;
      default:            orderBy = 'v.medida COLLATE NOCASE ASC';
    }

    const whereClause = `WHERE ${filtros.join(' AND ')}`;
    const sql = `
      SELECT
        v.id,
        v.codigo_variante,
        v.medida,
        COALESCE(SUM(su.cantidad_disponible), 0) AS stock_total
      FROM variantes v
      LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
      ${whereClause}
      GROUP BY v.id
      ORDER BY ${orderBy};
    `;

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error listando variantes (resumen):', err);
        return res.status(500).json({ error: 'Error en la consulta de variantes (resumen)' });
      }
      res.json(rows || []);
    });
  });

  return router;
};