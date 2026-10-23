-- ============================================================================
-- data_seed.sql
-- Equivalente en SQL puro de `npx sequelize-cli db:seed:all` de este proyecto.
-- Sirve para popular una base "simil" con la MISMA estructura que genera
-- backend/bbdd_seed.sql, sin necesidad de Node ni sequelize-cli.
--
-- Requisitos: correr DESPUÉS de bbdd_seed.sql (necesita las tablas creadas).
--
-- Correr con:  psql -U <usuario> -d <base> -f data_seed.sql
--
-- Nota: NO registra nada en la tabla SequelizeData de sequelize-cli. Si en
-- esta base después corren `db:seed:all`, va a re-insertar y chocar con los
-- IDs únicos — usar este script O los seeders, no ambos.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) categoria  (equivale a: seeders/20260101000001-categorias.js)
--    id_categoria es GENERATED ALWAYS AS IDENTITY => OVERRIDING SYSTEM VALUE.
-- ---------------------------------------------------------------------------
INSERT INTO categoria (id_categoria, nombre, descripcion)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Novela', 'Obras de ficción narrativa'),
  (2, 'Ciencia Ficción', 'Literatura especulativa y futurista'),
  (3, 'Papelería', 'Artículos de oficina y escolares');

-- Resetea la secuencia para que el próximo INSERT de la app continúe desde
-- el máximo id_categoria y no choque con estos IDs fijos.
SELECT setval(
  pg_get_serial_sequence('categoria', 'id_categoria'),
  (SELECT MAX(id_categoria) FROM categoria)
);

-- ---------------------------------------------------------------------------
-- 2) comercio + red_social  (seeders/20260101000002-comercio.js)
-- ---------------------------------------------------------------------------
INSERT INTO comercio (id_comercio, nombre, descripcion, direccion, telefono, horarios)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'MaxiLibrerías Central', 'Tu librería de confianza', 'Av. Siempre Viva 742', '555-1234', 'Lunes a Viernes de 09:00 a 18:00');

SELECT setval(
  pg_get_serial_sequence('comercio', 'id_comercio'),
  (SELECT MAX(id_comercio) FROM comercio)
);

-- tipo en minúsculas ('instagram', no 'Instagram') para coincidir con api.yaml.
INSERT INTO red_social (id_red_social, id_comercio, tipo, url)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 1, 'instagram', 'https://instagram.com/maxilibros'),
  (2, 1, 'facebook', 'https://facebook.com/maxilibros'),
  (3, 1, 'twitter', 'https://twitter.com/maxilibros');

SELECT setval(
  pg_get_serial_sequence('red_social', 'id_red_social'),
  (SELECT MAX(id_red_social) FROM red_social)
);

-- ---------------------------------------------------------------------------
-- 3) usuarios  (seeders/20260101000003-usuarios.js)
--    Contraseña de prueba en texto plano: admin123
--    (hash bcrypt cost 10, pre-computado — bcrypt no se puede calcular en
--    SQL puro; este literal es válido para siempre y el login funciona
--    idéntico al seeder).
--    id_usuario es UUID con DEFAULT uuid_generate_v4(); se fija explícito
--    igual que hace el seeder.
-- ---------------------------------------------------------------------------
INSERT INTO usuarios (id_usuario, nombre, apellido, email, telefono, password_hash, rol, direccion)
VALUES
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef',
   'Admin',
   'MaxiLibrerías',
   'admin@maxilibros.com',
   '555-9876',
   '$2b$10$eldFPPWzRvXl7upYp4mkKenn.NulZ4qW6GcD/pUGTlpozVMxY0lgW',
   'admin',
   'Calle Falsa 123');

-- ---------------------------------------------------------------------------
-- 4) producto + libro + producto_categoria + producto_imagen
--    (seeders/20260101000004-productos.js)
--
--    21 libros (con fila en la tabla especializada `libro`) + 3 productos de
--    papelería/accesorios (sin fila en `libro`). Cada producto tiene una
--    fila en producto_categoria y una imagen principal en producto_imagen.
--
--    created_at / updated_at: los primeros 5 libros quedan "viejos" (hace
--    20 días, fuera de la ventana de 7 días del filtro ?novedades=true) y
--    el resto "recientes" (hace 2 días), igual que hace el seeder. Se usa
--    NOW() - INTERVAL para que sea válido cada vez que se corra el script.
-- ---------------------------------------------------------------------------

-- 4a) producto
INSERT INTO producto (id_producto, tipo_producto, nombre, descripcion, precio, stock, estado, descuento, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES
  -- Libros "viejos" (excluidos de novedades)
  (1, 'libro', 'El Hobbit', 'Una aventura inolvidable en la Tierra Media.', 15000.00, 10, 'activo', 10.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (2, 'libro', 'Dune', 'Epopeya de ciencia ficción en el planeta Arrakis.', 18000.00, 5, 'activo', 0.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (3, 'libro', '1984', 'Distopía sobre el totalitarismo.', 12000.00, 0, 'agotado', 0.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (4, 'libro', 'Fundación', 'El imperio galáctico comienza a caer.', 14000.00, 8, 'activo', 5.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (5, 'libro', 'Cien años de soledad', 'La historia de la familia Buendía.', 16500.00, 12, 'activo', 0.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  -- Libros "recientes" (incluidos en novedades)
  (6, 'libro', 'Neuromante', 'La novela que fundó el ciberpunk.', 13500.00, 7, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (7, 'libro', 'Crónica de una muerte anunciada', 'Un asesinato anunciado que nadie evita.', 11000.00, 15, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (8, 'libro', 'Un mundo feliz', 'Distopía sobre el control social mediante el placer.', 12500.00, 9, 'activo', 15.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (9, 'libro', 'Rayuela', 'Novela experimental de lectura no lineal.', 17000.00, 6, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (10, 'libro', 'Yo, Robot', 'Relatos sobre robots y las tres leyes de la robótica.', 13000.00, 11, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (11, 'libro', 'Pedro Páramo', 'Un viaje al pueblo fantasma de Comala.', 10500.00, 4, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (12, 'libro', 'Fahrenheit 451', 'Un futuro donde los libros están prohibidos.', 12800.00, 0, 'agotado', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (13, 'libro', 'La casa de los espíritus', 'Saga familiar atravesada por lo mágico y lo político.', 15500.00, 8, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (14, 'libro', 'El señor de las moscas', 'Un grupo de niños varados descubre su propia naturaleza.', 11500.00, 10, 'activo', 10.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (15, 'libro', 'Solaris', 'Un planeta océano que desafía toda comprensión humana.', 14200.00, 3, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (16, 'libro', 'El túnel', 'La obsesión de un pintor narrada en primera persona.', 9800.00, 6, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (17, 'libro', 'Los futuros peligrosos', 'Relatos breves sobre tecnología y sus consecuencias imprevistas.', 10200.00, 14, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (18, 'libro', 'Ficciones', 'Cuentos que cuestionan la realidad, el tiempo y el infinito.', 12300.00, 9, 'activo', 5.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (19, 'libro', 'La guerra de los mundos', 'La primera gran invasión marciana de la literatura.', 11800.00, 7, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (20, 'libro', 'El amor en los tiempos del cólera', 'Una historia de amor que resiste el paso de las décadas.', 16000.00, 5, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (21, 'libro', 'La máquina del tiempo', 'El primer gran viaje literario a través del tiempo.', 9500.00, 0, 'agotado', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  -- Otros productos (papelería/accesorios, sin tabla libro) — "recientes"
  (22, 'papeleria', 'Cuaderno universitario 100 hojas', 'Cuaderno rayado tapa dura.', 3200.00, 40, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (23, 'papeleria', 'Set de lapiceras Bic x3', 'Lapiceras azul, negro y rojo.', 1500.00, 60, 'activo', 0.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (24, 'accesorio', 'Separadores de libro (pack x5)', 'Separadores ilustrados de metal.', 2800.00, 25, 'activo', 20.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- 4b) libro (especialización de producto; 21 filas, una por libro)
INSERT INTO libro (id_producto, isbn, autor, editorial, anio_publicacion)
VALUES
  (1, '978-0261102217', 'J.R.R. Tolkien', 'HarperCollins', 1937),
  (2, '978-0441172719', 'Frank Herbert', 'Ace Books', 1965),
  (3, '978-0451524935', 'George Orwell', 'Signet Classic', 1949),
  (4, '978-0553293357', 'Isaac Asimov', 'Bantam Books', 1951),
  (5, '978-0307474728', 'Gabriel García Márquez', 'Sudamericana', 1967),
  (6, '978-0441569595', 'William Gibson', 'Ace Books', 1984),
  (7, '978-0307474765', 'Gabriel García Márquez', 'Sudamericana', 1981),
  (8, '978-0060850524', 'Aldous Huxley', 'Harper Perennial', 1932),
  (9, '978-8437604572', 'Julio Cortázar', 'Cátedra', 1963),
  (10, '978-0553294385', 'Isaac Asimov', 'Bantam Books', 1950),
  (11, '978-0802133908', 'Juan Rulfo', 'Grove Press', 1955),
  (12, '978-1451673319', 'Ray Bradbury', 'Simon & Schuster', 1953),
  (13, '978-0525433477', 'Isabel Allende', 'Plaza & Janés', 1982),
  (14, '978-0399501487', 'William Golding', 'Perigee Books', 1954),
  (15, '978-0156027601', 'Stanisław Lem', 'Harcourt', 1961),
  (16, '978-8432217864', 'Ernesto Sábato', 'Seix Barral', 1948),
  (17, '978-8420674421', 'Ray Bradbury', 'Minotauro', 1953),
  (18, '978-8420633106', 'Jorge Luis Borges', 'Alianza Editorial', 1944),
  (19, '978-0451530653', 'H.G. Wells', 'Signet Classic', 1898),
  (20, '978-0307389732', 'Gabriel García Márquez', 'Vintage Español', 1985),
  (21, '978-0141439976', 'H.G. Wells', 'Penguin Classics', 1895);

-- 4c) producto_categoria (relación N:M)
INSERT INTO producto_categoria (id_producto, id_categoria)
VALUES
  (1, 1), (2, 2), (3, 1), (4, 2), (5, 1), (6, 2), (7, 1), (8, 2), (9, 1),
  (10, 2), (11, 1), (12, 2), (13, 1), (14, 1), (15, 2), (16, 1), (17, 2),
  (18, 1), (19, 2), (20, 1), (21, 2),
  (22, 3), (23, 3), (24, 3);

-- 4d) producto_imagen (una imagen principal por producto)
INSERT INTO producto_imagen (id_imagen, id_producto, imagen_url, orden, es_principal)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 1, 'https://images.example.com/el-hobbit.jpg', 1, TRUE),
  (2, 2, 'https://images.example.com/dune.jpg', 1, TRUE),
  (3, 3, 'https://images.example.com/1984.jpg', 1, TRUE),
  (4, 4, 'https://images.example.com/fundacion.jpg', 1, TRUE),
  (5, 5, 'https://images.example.com/cien-anos.jpg', 1, TRUE),
  (6, 6, 'https://images.example.com/neuromante.jpg', 1, TRUE),
  (7, 7, 'https://images.example.com/cronica-muerte.jpg', 1, TRUE),
  (8, 8, 'https://images.example.com/mundo-feliz.jpg', 1, TRUE),
  (9, 9, 'https://images.example.com/rayuela.jpg', 1, TRUE),
  (10, 10, 'https://images.example.com/yo-robot.jpg', 1, TRUE),
  (11, 11, 'https://images.example.com/pedro-paramo.jpg', 1, TRUE),
  (12, 12, 'https://images.example.com/fahrenheit451.jpg', 1, TRUE),
  (13, 13, 'https://images.example.com/casa-espiritus.jpg', 1, TRUE),
  (14, 14, 'https://images.example.com/senor-moscas.jpg', 1, TRUE),
  (15, 15, 'https://images.example.com/solaris.jpg', 1, TRUE),
  (16, 16, 'https://images.example.com/el-tunel.jpg', 1, TRUE),
  (17, 17, 'https://images.example.com/futuros-peligrosos.jpg', 1, TRUE),
  (18, 18, 'https://images.example.com/ficciones.jpg', 1, TRUE),
  (19, 19, 'https://images.example.com/guerra-mundos.jpg', 1, TRUE),
  (20, 20, 'https://images.example.com/amor-tiempos-colera.jpg', 1, TRUE),
  (21, 21, 'https://images.example.com/maquina-tiempo.jpg', 1, TRUE),
  (22, 22, 'https://images.example.com/cuaderno.jpg', 1, TRUE),
  (23, 23, 'https://images.example.com/lapiceras.jpg', 1, TRUE),
  (24, 24, 'https://images.example.com/separadores.jpg', 1, TRUE);

-- Resetear las 2 secuencias tocadas (libro y producto_categoria no tienen
-- secuencia propia: su PK referencia producto / es compuesta).
SELECT setval(
  pg_get_serial_sequence('producto', 'id_producto'),
  (SELECT MAX(id_producto) FROM producto)
);
SELECT setval(
  pg_get_serial_sequence('producto_imagen', 'id_imagen'),
  (SELECT MAX(id_imagen) FROM producto_imagen)
);

-- ---------------------------------------------------------------------------
-- 5) consulta  (seeders/20260101000005-consultas.js)
--    Estados según la consigna del TPO: "Pendiente, Leída, Respondida"
--    (se usa 'leida', no 'leido' ni 'cerrada').
-- ---------------------------------------------------------------------------
INSERT INTO consulta (id_consulta, nombre, email, telefono, asunto, mensaje, estado)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Ned Flanders', 'vecinorijillo.religiosillo@springfield-mail.com', '111-2222', 'Disponibilidad de libro', 'Hola, ¿tienen "La Biblia" en stock?', 'pendiente'),
  (2, 'Martin Prince', 'admiradordehawking123@springfield-mail.com', '333-4444', 'Horarios de atención', '¿Abren los sábados?', 'respondida'),
  (3, 'Bart Simpson', 'cometemiscalzones@springfield-mail.com', NULL, 'Pedido especial', '¿Tienen algún libro sobre cómo hacer travesuras sin que te descubran?', 'pendiente'),
  (4, 'Lisa Simpson', 'supersax@springfield-mail.com', '555-6666', 'Devolución', 'Quiero devolver un libro comprado ayer, vino con una página rota.', 'leida'),
  (5, 'Cletus', 'redneck@springfield-mail.com', '777-8888', 'Descuentos', '¿Tienen descuentos por compras grandes en efectivo?', 'pendiente');

SELECT setval(
  pg_get_serial_sequence('consulta', 'id_consulta'),
  (SELECT MAX(id_consulta) FROM consulta)
);

COMMIT;