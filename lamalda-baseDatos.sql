CREATE DATABASE IF NOT EXISTS lamalda_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lamalda_db;

DROP TABLE IF EXISTS lineas_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS carritos;
DROP TABLE IF EXISTS imagenes_producto;
DROP TABLE IF EXISTS variantes_producto;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS direcciones;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE categorias (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  categoria_padre_id BIGINT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_padre_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE productos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  imagen_url VARCHAR(500),
  categoria_id BIGINT NOT NULL,
  destacado TINYINT(1) NOT NULL DEFAULT 0,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

CREATE TABLE variantes_producto (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  producto_id BIGINT NOT NULL,
  talla VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

CREATE TABLE imagenes_producto (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  producto_id BIGINT NOT NULL,
  url VARCHAR(500) NOT NULL,
  es_principal TINYINT(1) NOT NULL DEFAULT 0,
  orden INT NOT NULL DEFAULT 0,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

CREATE TABLE carritos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NULL,
  id_sesion VARCHAR(255) NULL,
  producto_id BIGINT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);

CREATE TABLE direcciones (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  calle VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  cp VARCHAR(20) NOT NULL,
  pais VARCHAR(100) NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE pedidos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  direccion_id BIGINT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (direccion_id) REFERENCES direcciones(id) ON DELETE RESTRICT
);

CREATE TABLE lineas_pedido (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  pedido_id BIGINT NOT NULL,
  producto_id BIGINT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);

INSERT INTO usuarios (id, email, password_hash, nombre, apellidos, telefono, rol, activo) VALUES
(1, 'josechan1302@gmail.com', '$2b$12$IIMFjFqUFCo2P08q9Y0swuu1ZV5SB6Mtiz18B.alRNl9ZGO/Nnc4e', 'Jose', 'Sánchez Pérez', '600123123', 'CLIENTE', 1),
(2, 'lamaldaculture@gmail.com', '$2a$10$xP4mMH51m6Xa4ZXive9lDO1aN4zeBALOJYNKgTbcDcc25AXYU/XJ2', 'Laura', 'García López', '610222333', 'ADMIN', 1),
(3, 'test@email.com', '$2a$10$4AxUBv1Cyo7HTeyrbmxzWeDOhZuZ0mEZJA2K1Pq.jrjk6SpfHjP1.', 'Pepe', 'Martín Ruiz', '690111222', 'CLIENTE', 1);


INSERT INTO categorias (id, nombre, slug, categoria_padre_id) VALUES
  (1, 'Mujer',       'mujer',             NULL),
  (2, 'Hombre',      'hombre',            NULL),
  (3, 'Ninos',       'ninos',             NULL),

  (4, 'Ropa Mujer',   'ropa-mujer',        1),
  (5, 'Accesorios Mujer',  'accesorios-mujer',  1),
  (6, 'Ropa Hombre',        'ropa-hombre',       2),
  (7, 'Accesorios Hombre',  'accesorios-hombre', 2),

  (8, 'Vestidos',    'vestidos-mujer',    4),
  (9, 'Camisetas Mujer',   'camisetas-mujer',   4),
  (10, 'Pantalones Mujer',  'pantalones-mujer',  4),
  (11, 'Chaquetas Mujer',   'chaquetas-mujer',   4),
  (12, 'Bikinis',     'bikinis-mujer',     4),

  (13, 'Gorras Mujer',     'gorras-mujer',      5),
  (14, 'Panuelos Mujer',   'panuelos-mujer',    5),

  (15, 'Camisetas Hombre',  'camisetas-hombre',  6),
  (16, 'Pantalones Hombre', 'pantalones-hombre', 6),
  (17, 'Chaquetas Hombre',  'chaquetas-hombre',  6),
  (18, 'Camisas',           'camisas-hombre',    6),

  (19, 'Gorras Hombre',     'gorras-hombre',     7),
  (20, 'Collares',          'collares',          5);



