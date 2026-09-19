-- INSTRUCCIONES, CORRER PRIMERO BBDD_SEED.SQL PARA GENERAR EL ESQUEMA DE LA BASE DE DATOS 
-- Y LUEGO USAR ESTE QUERY PARA POBLARLA

BEGIN;

-- ==========================================
-- 1. CATEGORÍAS
-- ==========================================
INSERT INTO categoria (id_categoria, nombre, descripcion) 
OVERRIDING SYSTEM VALUE
VALUES 
    (1, 'Novela', 'Obras de ficción narrativa'),
    (2, 'Ciencia Ficción', 'Literatura especulativa y futurista'),
    (3, 'Papelería', 'Artículos de oficina y escolares');

-- ==========================================
-- 2. COMERCIO Y REDES SOCIALES
-- ==========================================
INSERT INTO comercio (id_comercio, nombre, descripcion, direccion, telefono, horarios)
OVERRIDING SYSTEM VALUE
VALUES (1, 'MaxiLibrerías Central', 'Tu librería de confianza', 'Av. Siempre Viva 742', '555-1234', 'Lunes a Viernes de 09:00 a 18:00');

INSERT INTO red_social (id_red_social, id_comercio, tipo, url)
OVERRIDING SYSTEM VALUE
VALUES 
    (1, 1, 'Instagram', 'https://instagram.com/maxilibros'),
    (2, 1, 'Facebook', 'https://facebook.com/maxilibros'),
    (3, 1, 'Twitter', 'https://twitter.com/maxilibros');

-- ==========================================
-- 3. USUARIO ADMINISTRADOR
-- ==========================================
INSERT INTO usuarios (id_usuario, nombre, apellido, email, telefono, password_hash, rol, direccion)
OVERRIDING SYSTEM VALUE
VALUES ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Señor', 'X', 'senor.x@maxilibros.com', '555-9876', 'hashed_password_super_seguro_xyz', 'admin', 'Calle Falsa 123');

-- ==========================================
-- 4. CONSULTAS (5 registros)
-- ==========================================
INSERT INTO consulta (id_consulta, nombre, email, telefono, asunto, mensaje, estado)
OVERRIDING SYSTEM VALUE
VALUES 
    (1, 'Ned Flanders', 'vecinirijillo.religiosillo@springfield_mail.com', '111-2222', 'Disponibilidad de libro', 'Hola, ¿tienen "La Biblia" en stock?', 'pendiente'),
    (2, 'Martin Prince', 'admiradordehawking123@springfield_mail.com', '333-4444', 'Horarios de atención', '¿Abren los sábados?', 'respondida'),
    (3, 'Bart Simpson', 'cometemiscalzones@springfield_mail.com', NULL, 'Pedido especial', 'Comete mis calzones', 'pendiente'),
    (4, 'Lisa Simpson', 'supersax@springfield_mail.com', '555-6666', 'Devolución', 'Quiero devolver un libro comprado ayer.', 'cerrada'),
    (5, 'Cletus', 'redneck@springfield_mail.com', '777-8888', 'Descuentos', '¿Tienen descuentos por hijos?, A ver Higinio, Ufano, Hilario, Jacinta, Cándido, Teodosia, Cástulo, Gervasia, Epifanio, Gaudelia, Eufemio, Eustaquio, Brígida, Melitón, Leonila, Nicanor, Martina, Régulo, Teodora, Teódulo, Tiburcio, Celso', 'pendiente');

-- ==========================================
-- 5. LIBROS Y SUS DEPENDENCIAS
-- Insertamos Producto, Libro, Categoría asociada e Imagen
-- ==========================================

-- Libro 1: El Hobbit
INSERT INTO producto (id_producto, tipo_producto, nombre, descripcion, precio, stock, estado, descuento) 
OVERRIDING SYSTEM VALUE VALUES (1, 'libro', 'El Hobbit', 'Una aventura inolvidable en la Tierra Media.', 15000.00, 10, 'activo', 10.00);
INSERT INTO libro (id_producto, isbn, autor, editorial, anio_publicacion) 
VALUES (1, '978-0261102217', 'J.R.R. Tolkien', 'HarperCollins', 1937);
INSERT INTO producto_categoria (id_producto, id_categoria) VALUES (1, 1);
INSERT INTO producto_imagen (id_imagen, id_producto, imagen_url, orden, es_principal) 
OVERRIDING SYSTEM VALUE VALUES (1, 1, 'https://images.example.com/el-hobbit.jpg', 1, TRUE);

-- Libro 2: Dune
INSERT INTO producto (id_producto, tipo_producto, nombre, descripcion, precio, stock, estado, descuento) 
OVERRIDING SYSTEM VALUE VALUES (2, 'libro', 'Dune', 'Epopeya de ciencia ficción en el planeta Arrakis.', 18000.00, 5, 'activo', 0.00);
INSERT INTO libro (id_producto, isbn, autor, editorial, anio_publicacion) 
VALUES (2, '978-0441172719', 'Frank Herbert', 'Ace Books', 1965);
INSERT INTO producto_categoria (id_producto, id_categoria) VALUES (2, 2);
INSERT INTO producto_imagen (id_imagen, id_producto, imagen_url, orden, es_principal) 
OVERRIDING SYSTEM VALUE VALUES (2, 2, 'https://images.example.com/dune.jpg', 1, TRUE);

-- Libro 3: 1984
INSERT INTO producto (id_producto, tipo_producto, nombre, descripcion, precio, stock, estado, descuento) 
OVERRIDING SYSTEM VALUE VALUES (3, 'libro', '1984', 'Distopía sobre el totalitarismo.', 12000.00, 0, 'agotado', 0.00);
INSERT INTO libro (id_producto, isbn, autor, editorial, anio_publicacion) 
VALUES (3, '978-0451524935', 'George Orwell', 'Signet Classic', 1949);
INSERT INTO producto_categoria (id_producto, id_categoria) VALUES (3, 1);
INSERT INTO producto_imagen (id_imagen, id_producto, imagen_url, orden, es_principal) 
OVERRIDING SYSTEM VALUE VALUES (3, 3, 'https://images.example.com/1984.jpg', 1, TRUE);

-- Libro 4: Fundación
INSERT INTO producto (id_producto, tipo_producto, nombre, descripcion, precio, stock, estado, descuento) 
OVERRIDING SYSTEM VALUE VALUES (4, 'libro', 'Fundación', 'El imperio galáctico comienza a caer.', 14000.00, 8, 'activo', 5.00);
INSERT INTO libro (id_producto, isbn, autor, editorial, anio_publicacion) 
VALUES (4, '978-0553293357', 'Isaac Asimov', 'Bantam Books', 1951);
INSERT INTO producto_categoria (id_producto, id_categoria) VALUES (4, 2);
INSERT INTO producto_imagen (id_imagen, id_producto, imagen_url, orden, es_principal) 
OVERRIDING SYSTEM VALUE VALUES (4, 4, 'https://images.example.com/fundacion.jpg', 1, TRUE);

-- Libro 5: Cien años de soledad
INSERT INTO producto (id_producto, tipo_producto, nombre, descripcion, precio, stock, estado, descuento) 
OVERRIDING SYSTEM VALUE VALUES (5, 'libro', 'Cien años de soledad', 'La historia de la familia Buendía.', 16500.00, 12, 'activo', 0.00);
INSERT INTO libro (id_producto, isbn, autor, editorial, anio_publicacion) 
VALUES (5, '978-0307474728', 'Gabriel García Márquez', 'Sudamericana', 1967);
INSERT INTO producto_categoria (id_producto, id_categoria) VALUES (5, 1);
INSERT INTO producto_imagen (id_imagen, id_producto, imagen_url, orden, es_principal) 
OVERRIDING SYSTEM VALUE VALUES (5, 5, 'https://images.example.com/cien-anos.jpg', 1, TRUE);

COMMIT;