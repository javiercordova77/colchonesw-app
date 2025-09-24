-- Crear tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  actividad TEXT
);

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE
);

-- Crear tabla de productos (referencia a proveedores por id_proveedor)
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

-- Crear tabla de colores por variante (con codigo_color)
CREATE TABLE IF NOT EXISTS colores_variantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_variante INTEGER NOT NULL,
  color TEXT,
  codigo_color TEXT, -- código hexadecimal del color
  FOREIGN KEY (id_variante) REFERENCES variantes(id)
  UNIQUE (id_variante, color, codigo_color)
);

-- ------------------------------------------------------------
-- Datos de ejemplo
-- ------------------------------------------------------------

-- Insertar proveedor de ejemplo
INSERT OR IGNORE INTO proveedores (id, nombre, actividad) VALUES 
  (1, 'Chaide', 'Venta de Colchones, Almohadas e Implementos para el descanso'),
  (2, 'Lamitex', 'Venta de Colchones, Almohadas e Implementos para el descanso');

-- Insertar categorías
INSERT OR IGNORE INTO categorias (nombre) VALUES 
  ('colchones'),
  ('almohadas');

-- Insertar producto: Colchón Chaide Imperial
INSERT OR IGNORE INTO productos (id_categoria, id_proveedor, descripcion, imagen, material)
VALUES 
  (1, 1, 'Colchón Imperial Chaide', 'productos/colchones/chaideimperial.jpg', 'resortes'),
  (2, 1, 'Almohada Memory Foam', 'productos/almohadas/chaidememory.jpg', 'espuma viscoelástica');

-- Variantes del colchón y almohada
INSERT OR IGNORE INTO variantes (
  id_producto, codigo_variante, medida, precio_venta, precio_compra,
  cantidad_disponible, cantidad_minima, fecha_ingreso
) VALUES
  (1, 'CH-105x190-BLN', '105x190', 130, 100, 20, 5, '2025-06-24'),
  (1, 'CH-135x190x23-NGR', '135x190x23', 150, 120, 15, 3, '2025-06-24'),
  (1, 'CH-135x190x27-BLN', '135x190x27', 160, 125, 10, 2, '2025-06-24'),
  (2, 'ALM-50x70-BLN', '50x70', 10, 7, 30, 10, '2025-06-24'),
  (2, 'ALM-60x80-NGR', '60x80', 12, 9, 25, 10, '2025-06-24');

-- Colores para las variantes del colchón
INSERT OR IGNORE INTO colores_variantes (id_variante, color, codigo_color) VALUES
  (1, 'blanco', '#ffffff'),
  (1, 'negro', '#000000'),
  (2, 'negro', '#000000'),
  (2, 'blanco', '#ffffff'),
  (3, 'negro', '#000000'),
  (3, 'blanco', '#ffffff');


-- Colores para almohadas
INSERT OR IGNORE INTO colores_variantes (id_variante, color, codigo_color) VALUES
  (4, 'blanco', '#ffffff'),
  (4, 'negro', '#000000'),
  (5, 'blanco', '#ffffff'),
  (5, 'negro', '#000000');