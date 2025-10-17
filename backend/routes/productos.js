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

    let orderBy = 'p.descripcion COLLATE NOCASE ASC';
    switch (orden) {
      case 'nombre_desc': orderBy = 'p.descripcion COLLATE NOCASE DESC'; break;
      case 'stock_asc':   orderBy = 'COALESCE(vs.cantidad_disponible,0) ASC'; break;
      case 'stock_desc':  orderBy = 'COALESCE(vs.cantidad_disponible,0) DESC'; break;
      default:            orderBy = 'p.descripcion COLLATE NOCASE ASC';
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
      if (err) return res.status(500).json({ error: 'Error en la consulta de listado' });
      res.json(rows || []);
    });
  });

  // RESUMEN POR PRODUCTO: GET /api/productos/resumen?q&orden
  router.get('/resumen', (req, res) => {
    const { q = '', orden = 'nombre_asc' } = req.query;
    const filtros = [];
    const params = [];

    if (q.trim() !== '') {
      filtros.push(`(LOWER(p.descripcion) LIKE ? OR LOWER(p.material) LIKE ?)`);
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
      if (err) return res.status(500).json({ error: 'Error en productos (resumen)' });
      res.json(rows || []);
    });
  });

  // DETALLE por CÓDIGO de variante: GET /api/productos/codigo/:codigo_variante
  // Se declara antes de "/:id" para evitar colisiones
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
      if (err) return res.status(500).json({ error: 'Error en la consulta de producto' });
      if (!row) return res.status(404).json({ message: 'Producto no encontrado' });

      const qColores = `SELECT color, codigo_color FROM colores_variantes WHERE id_variante = ? ORDER BY id;`;
      const qUbics = `
        SELECT u.id AS id_ubicacion, u.nombre AS ubicacion, u.descripcion AS ubicacion_descripcion,
               su.cantidad_disponible, su.cantidad_minima, su.fecha_ingreso, su.updated_at
        FROM stock_ubicaciones su
        JOIN ubicaciones u ON u.id = su.id_ubicacion
        WHERE su.id_variante = ?
        ORDER BY u.nombre;
      `;
      db.all(qColores, [row.id_variante], (errC, colores) => {
        if (errC) return res.status(500).json({ error: 'Error al obtener colores' });
        db.all(qUbics, [row.id_variante], (errU, ubicaciones) => {
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
              total: { cantidad_disponible: row.cantidad_disponible_total, cantidad_minima: row.cantidad_minima_total },
              ubicaciones: (ubicaciones || []).map(u => ({
                id_ubicacion: u.id_ubicacion, ubicacion: u.ubicacion, ubicacion_descripcion: u.ubicacion_descripcion,
                cantidad_disponible: u.cantidad_disponible, cantidad_minima: u.cantidad_minima,
                fecha_ingreso: u.fecha_ingreso, updated_at: u.updated_at
              }))
            }
          });
        });
      });
    });
  });

  // EDITAR PRODUCTO (payload completo): GET /api/productos/:id/editar
  router.get('/:id/editar', (req, res) => {
    const id = Number(req.params.id || 0);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const qProd = `
      SELECT id, descripcion, material, imagen, id_categoria, id_proveedor
      FROM productos WHERE id = ? LIMIT 1;
    `;
    const qVars = `
      SELECT id, id_producto, medida, codigo_variante, precio_venta, precio_compra, fecha_ingreso
      FROM variantes WHERE id_producto = ? ORDER BY medida COLLATE NOCASE ASC;
    `;
    const qCats = `SELECT id, nombre FROM categorias ORDER BY nombre COLLATE NOCASE ASC;`;
    const qProvs = `SELECT id, nombre FROM proveedores ORDER BY nombre COLLATE NOCASE ASC;`;

    db.get(qProd, [id], (errP, prod) => {
      if (errP) return res.status(500).json({ error: 'Error obteniendo producto' });
      if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

      db.all(qVars, [id], (errV, vars) => {
        if (errV) return res.status(500).json({ error: 'Error obteniendo variantes' });

        const varIds = (vars || []).map(v => v.id);
        const finalize = (coloresMap, categorias, proveedores) => {
          const variantes = (vars || []).map(v => ({
            ...v,
            colores: coloresMap.get(v.id) || []
          }));
          res.json({ producto: prod, variantes, lookups: { categorias, proveedores } });
        };

        const buildColors = (rows) => {
          const map = new Map();
          (rows || []).forEach(r => {
            if (!map.has(r.id_variante)) map.set(r.id_variante, []);
            map.get(r.id_variante).push({ color: r.color, codigo_color: r.codigo_color });
          });
          return map;
        };

        if (varIds.length === 0) {
          db.all(qCats, [], (eC, cats) => {
            if (eC) return res.status(500).json({ error: 'Error obteniendo categorías' });
            db.all(qProvs, [], (eP, provs) => {
              if (eP) return res.status(500).json({ error: 'Error obteniendo proveedores' });
              finalize(new Map(), cats || [], provs || []);
            });
          });
          return;
        }

        const placeholders = varIds.map(() => '?').join(',');
        const qColors = `
          SELECT id_variante, color, codigo_color
          FROM colores_variantes
          WHERE id_variante IN (${placeholders})
          ORDER BY id;
        `;
        db.all(qColors, varIds, (errC, colRows) => {
          if (errC) return res.status(500).json({ error: 'Error obteniendo colores' });
          const coloresMap = buildColors(colRows);

          db.all(qCats, [], (eC, cats) => {
            if (eC) return res.status(500).json({ error: 'Error obteniendo categorías' });
            db.all(qProvs, [], (eP, provs) => {
              if (eP) return res.status(500).json({ error: 'Error obteniendo proveedores' });
              finalize(coloresMap, cats || [], provs || []);
            });
          });
        });
      });
    });
  });

  // GUARDAR EDICIÓN PRODUCTO + variantes + colores: PUT /api/productos/:id
  router.put('/:id', express.json(), (req, res) => {
    const id = Number(req.params.id || 0);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const { producto, variantes } = req.body || {};
    if (!producto || !Array.isArray(variantes)) return res.status(400).json({ error: 'Payload incompleto' });
    if (Number(producto.id) !== id) return res.status(400).json({ error: 'ID de producto inconsistente' });

    const prodUpd = {
      descripcion: (producto.descripcion || '').trim(),
      material: (producto.material || '').trim(),
      imagen: (producto.imagen || '').trim() || null,
      id_categoria: Number(producto.id_categoria || 0) || null,
      id_proveedor: Number(producto.id_proveedor || 0) || null
    };

    db.serialize(() => {
      const rollback = (e) => {
        db.run('ROLLBACK');
        if (!res.headersSent) res.status(500).json({ error: e?.message || 'Error guardando cambios' });
      };

      db.run('BEGIN TRANSACTION');

      db.run(
        `UPDATE productos SET descripcion = ?, material = ?, imagen = ?, id_categoria = ?, id_proveedor = ? WHERE id = ?`,
        [prodUpd.descripcion, prodUpd.material, prodUpd.imagen, prodUpd.id_categoria, prodUpd.id_proveedor, id],
        function (err1) {
          if (err1) return rollback(err1);

          const updVar = (v, cb) => {
            const vId = Number(v.id || 0);

            // Insertar nueva variante (id=0)
            if (!vId) {
              db.run(
                `INSERT INTO variantes (id_producto, medida, codigo_variante, precio_venta, precio_compra, fecha_ingreso)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  id,
                  (v.medida || '').trim(),
                  (v.codigo_variante || '').trim(),
                  Number(v.precio_venta || 0),
                  Number(v.precio_compra || 0),
                  (v.fecha_ingreso || null)
                ],
                function (errIns) {
                  if (errIns) return cb(errIns);
                  const newId = this.lastID;
                  const cols = Array.isArray(v.colores) ? v.colores : [];
                  if (!cols.length) return cb();
                  const stmt = db.prepare(`INSERT INTO colores_variantes (id_variante, color, codigo_color) VALUES (?, ?, ?)`);
                  let error = null;
                  for (const c of cols) {
                    const color = (c?.color || '').trim();
                    const codigo = (c?.codigo_color || '').trim() || null;
                    if (!color) continue;
                    stmt.run([newId, color, codigo], (e) => { if (e) error = e; });
                    if (error) break;
                  }
                  stmt.finalize((e) => cb(e || error || null));
                }
              );
              return;
            }

            // Actualizar variante existente
            db.run(
              `UPDATE variantes SET medida = ?, codigo_variante = ?, precio_venta = ?, precio_compra = ?, fecha_ingreso = ?
               WHERE id = ? AND id_producto = ?`,
              [
                (v.medida || '').trim(),
                (v.codigo_variante || '').trim(),
                Number(v.precio_venta || 0),
                Number(v.precio_compra || 0),
                (v.fecha_ingreso || null),
                vId, id
              ],
              function (err2) {
                if (err2) return cb(err2);
                // Reemplazar colores
                db.run(`DELETE FROM colores_variantes WHERE id_variante = ?`, [vId], function (errDel) {
                  if (errDel) return cb(errDel);
                  const cols = Array.isArray(v.colores) ? v.colores : [];
                  if (!cols.length) return cb();
                  const stmt = db.prepare(`INSERT INTO colores_variantes (id_variante, color, codigo_color) VALUES (?, ?, ?)`);
                  let error = null;
                  for (const c of cols) {
                    const color = (c?.color || '').trim();
                    const codigo = (c?.codigo_color || '').trim() || null;
                    if (!color) continue;
                    stmt.run([vId, color, codigo], (e) => { if (e) error = e; });
                    if (error) break;
                  }
                  stmt.finalize((e) => cb(e || error || null));
                });
              }
            );
          };

          let i = 0;
          const next = (errN) => {
            if (errN) return rollback(errN);
            if (i >= variantes.length) {
              db.run('COMMIT', (errC) => {
                if (errC) return rollback(errC);
                res.json({ ok: true });
              });
              return;
            }
            const v = variantes[i++]; updVar(v, next);
          };
          next();
        }
      );
    });
  });

  // VARIANTES RESUMEN por producto: GET /api/productos/:id/variantes/resumen
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
      if (err) return res.status(500).json({ error: 'Error en variantes (resumen)' });
      res.json(rows || []);
    });
  });

  // INFO PRODUCTO por ID: GET /api/productos/:id
  router.get('/:id', (req, res) => {
    const id = Number(req.params.id || 0);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

    const sql = `SELECT id, descripcion, material, imagen FROM productos WHERE id = ? LIMIT 1`;
    db.get(sql, [id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Error consultando producto' });
      if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(row);
    });
  });

  return router;
};