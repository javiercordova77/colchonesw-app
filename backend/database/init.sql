-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_categoria INTEGER NOT NULL,
  proveedor TEXT,
  descripcion TEXT,
  imagen TEXT,
  material TEXT,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);

-- Crear tabla de variantes de producto
CREATE TABLE IF NOT EXISTS variantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_producto INTEGER NOT NULL,
  codigo_variante TEXT UNIQUE NOT NULL,
  medida TEXT,
  precio_venta REAL,
  precio_compra REAL,
  cantidad_disponible INTEGER,
  cantidad_minima INTEGER,
  fecha_ingreso TEXT,
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);

-- Crear tabla de colores por variante
CREATE TABLE IF NOT EXISTS colores_variantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_variante INTEGER NOT NULL,
  color TEXT,
  FOREIGN KEY (id_variante) REFERENCES variantes(id)
);

-- ------------------------------------------------------------
-- Datos de ejemplo
-- ------------------------------------------------------------

-- Insertar categorías
INSERT OR IGNORE INTO categorias (nombre) VALUES ('colchones');
INSERT OR IGNORE INTO categorias (nombre) VALUES ('almohadas');

-- Insertar producto: Colchón Chaide Imperial
INSERT OR IGNORE INTO productos (id_categoria, proveedor, descripcion, imagen, material)
VALUES (
  1, 'Chaide', 'Colchón Imperial Chaide', 'productos/colchones/chaideimperial.jpg', 'resortes'
);

-- Insertar variantes del colchón
INSERT OR IGNORE INTO variantes (
  id_producto, codigo_variante, medida, precio_venta, precio_compra,
  cantidad_disponible, cantidad_minima, fecha_ingreso
) VALUES
  (1, 'CH-105x190-BLN', '105x190', 1300, 1000, 20, 5, '2025-06-24'),
  (1, 'CH-135x190x23-NGR', '135x190x23', 1500, 1200, 15, 3, '2025-06-24'),
  (1, 'CH-135x190x27-BLN', '135x190x27', 1600, 1250, 10, 2, '2025-06-24');

-- Insertar colores para las variantes
INSERT OR IGNORE INTO colores_variantes (id_variante, color) VALUES
  (1, 'blanco'),
  (1, 'negro'),
  (2, 'negro'),
  (2, 'blanco'),
  (3, 'negro'),
  (3, 'blanco');

-- Insertar producto: Almohada Memory Foam
INSERT OR IGNORE INTO productos (id_categoria, proveedor, descripcion, imagen, material)
VALUES (
  2, 'Chaide', 'Almohada Memory Foam', 'productos/almohadas/chaidememory.jpg', 'espuma viscoelástica'
);

-- Variantes de almohada
INSERT OR IGNORE INTO variantes (
  id_producto, codigo_variante, medida, precio_venta, precio_compra,
  cantidad_disponible, cantidad_minima, fecha_ingreso
) VALUES
  (2, 'ALM-50x70-BLN', '50x70', 500, 400, 30, 10, '2025-06-24'),
  (2, 'ALM-60x80-NGR', '60x80', 700, 550, 25, 10, '2025-06-24');

-- Colores para almohadas
INSERT OR IGNORE INTO colores_variantes (id_variante, color) VALUES
  (4, 'blanco'),
  (4, 'negro'),
  (5, 'blanco'),
  (5, 'negro');