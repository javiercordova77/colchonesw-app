-- ------------------------------------------------------------
-- Esquema base
-- ------------------------------------------------------------

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  actividad TEXT
);

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE
);

-- Productos (referencia a proveedores y categorías)
CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_categoria INTEGER NOT NULL,
  id_proveedor INTEGER NOT NULL,
  descripcion TEXT,
  imagen TEXT,
  material TEXT,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id),
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id),
  UNIQUE (id_categoria, id_proveedor, descripcion)
);

-- Variantes de producto (SIN cantidades: se mueven a stock_ubicaciones)
CREATE TABLE IF NOT EXISTS variantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_producto INTEGER NOT NULL,
  codigo_variante TEXT UNIQUE NOT NULL,
  medida TEXT,
  precio_venta REAL,
  precio_compra REAL,
  fecha_ingreso TEXT NOT NULL DEFAULT (datetime('now')), -- alta de la variante (UTC)
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),  -- última modificación (UTC)
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);

-- Catálogo de ubicaciones (bodegas/tiendas)
CREATE TABLE IF NOT EXISTS ubicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT
);

-- Stock por ubicación (relación variante-ubicación con cantidades)
CREATE TABLE IF NOT EXISTS stock_ubicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_variante INTEGER NOT NULL,
  id_ubicacion INTEGER NOT NULL,
  cantidad_disponible INTEGER NOT NULL DEFAULT 0,
  cantidad_minima     INTEGER NOT NULL DEFAULT 0,
  fecha_ingreso TEXT,                                -- primera entrada a esa ubicación (UTC)
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')), -- última modificación (UTC)
  FOREIGN KEY (id_variante) REFERENCES variantes(id),
  FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id),
  UNIQUE (id_variante, id_ubicacion)
);

-- Colores por variante (con código de color)
CREATE TABLE IF NOT EXISTS colores_variantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_variante INTEGER NOT NULL,
  color TEXT,
  codigo_color TEXT, -- código hexadecimal del color
  FOREIGN KEY (id_variante) REFERENCES variantes(id),
  UNIQUE (id_variante, color, codigo_color)
);

-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_variantes_codigo ON variantes(codigo_variante);
CREATE INDEX IF NOT EXISTS idx_variantes_producto ON variantes(id_producto);
CREATE INDEX IF NOT EXISTS idx_stock_ubicaciones_variante ON stock_ubicaciones(id_variante);
CREATE INDEX IF NOT EXISTS idx_stock_ubicaciones_ubicacion ON stock_ubicaciones(id_ubicacion);

-- Vista agregada: stock total por variante (para no romper consultas existentes)
CREATE VIEW IF NOT EXISTS vw_variantes_stock_agg AS
SELECT
  v.id               AS id_variante,
  COALESCE(SUM(su.cantidad_disponible), 0) AS cantidad_disponible,
  COALESCE(MIN(su.cantidad_minima), 0)     AS cantidad_minima
FROM variantes v
LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
GROUP BY v.id;

-- ------------------------------------------------------------
-- Datos de ejemplo
-- ------------------------------------------------------------

-- Proveedores
INSERT OR IGNORE INTO proveedores (id, nombre, actividad) VALUES 
  (1, 'Chaide', 'Venta de Colchones, Almohadas e Implementos para el descanso'),
  (2, 'Lamitex', 'Venta de Colchones, Almohadas e Implementos para el descanso');

-- Categorías
INSERT OR IGNORE INTO categorias (nombre) VALUES 
  ('colchones'),
  ('almohadas');

-- Productos
INSERT OR IGNORE INTO productos (id_categoria, id_proveedor, descripcion, imagen, material) VALUES
  (1, 1, 'Colchón Imperial', 'productos/colchones/chaideimperial.png', 'resortes'),
  (2, 1, 'Almohada Memory Foam', 'productos/almohadas/chaidememory.png', 'espuma viscoelástica');

-- Variantes (sin cantidades)
INSERT OR IGNORE INTO variantes (id_producto, codigo_variante, medida, precio_venta, precio_compra, fecha_ingreso) VALUES
  (1, 'CH-105x190-BLN',        '105x190',      130, 100, '2025-06-24'),
  (1, 'CH-135x190x23-NGR',     '135x190x23',   150, 120, '2025-06-24'),
  (1, 'CH-135x190x27-BLN',     '135x190x27',   160, 125, '2025-06-24'),
  (2, 'ALM-50x70-BLN',         '50x70',        10,  7,   '2025-06-24'),
  (2, 'ALM-60x80-NGR',         '60x80',        12,  9,   '2025-06-24');

-- Ubicaciones
INSERT OR IGNORE INTO ubicaciones (id, nombre, descripcion) VALUES
  (1, 'Bodega Central', 'Almacén principal'),
  (2, 'Sala de Ventas', 'Exhibición y ventas');

-- Stock por ubicación (mantenemos totales previos en Bodega Central)
INSERT OR IGNORE INTO stock_ubicaciones (id_variante, id_ubicacion, cantidad_disponible, cantidad_minima, fecha_ingreso) VALUES
  (1, 1, 20, 5,  '2025-06-24'),
  (2, 1, 15, 3,  '2025-06-24'),
  (3, 1, 10, 2,  '2025-06-24'),
  (4, 1, 30, 10, '2025-06-24'),
  (1, 2, 5, 1, '2025-06-24'),
  (5, 1, 25, 10, '2025-06-24'),
  (3, 2, 8, 1, '2025-06-24');


-- Colores (igual que antes)
INSERT OR IGNORE INTO colores_variantes (id_variante, color, codigo_color) VALUES
  (1, 'blanco', '#ffffff'),
  (1, 'negro',  '#000000'),
  (2, 'negro',  '#000000'),
  (2, 'blanco', '#ffffff'),
  (3, 'negro',  '#000000'),
  (3, 'blanco', '#ffffff');

INSERT OR IGNORE INTO colores_variantes (id_variante, color, codigo_color) VALUES
  (4, 'blanco', '#ffffff'),
  (4, 'beige',  '#F5F5DC'),
  (5, 'blanco', '#ffffff'),
  (5, 'beige',  '#F5F5DC');