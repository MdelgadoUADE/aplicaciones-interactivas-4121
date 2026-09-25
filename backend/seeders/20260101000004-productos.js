'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Array de datos: cada objeto es un libro completo. Agregar más
    // productos a futuro es simplemente sumar un objeto acá, no repetir
    // bloques de INSERT.
    const libros = [
      { nombre: 'El Hobbit', descripcion: 'Una aventura inolvidable en la Tierra Media.', precio: 15000.00, stock: 10, estado: 'activo', descuento: 10.00, categoriaId: 1, isbn: '978-0261102217', autor: 'J.R.R. Tolkien', editorial: 'HarperCollins', anio: 1937, imagen: 'https://images.example.com/el-hobbit.jpg' },
      { nombre: 'Dune', descripcion: 'Epopeya de ciencia ficción en el planeta Arrakis.', precio: 18000.00, stock: 5, estado: 'activo', descuento: 0.00, categoriaId: 2, isbn: '978-0441172719', autor: 'Frank Herbert', editorial: 'Ace Books', anio: 1965, imagen: 'https://images.example.com/dune.jpg' },
      { nombre: '1984', descripcion: 'Distopía sobre el totalitarismo.', precio: 12000.00, stock: 0, estado: 'agotado', descuento: 0.00, categoriaId: 1, isbn: '978-0451524935', autor: 'George Orwell', editorial: 'Signet Classic', anio: 1949, imagen: 'https://images.example.com/1984.jpg' },
      { nombre: 'Fundación', descripcion: 'El imperio galáctico comienza a caer.', precio: 14000.00, stock: 8, estado: 'activo', descuento: 5.00, categoriaId: 2, isbn: '978-0553293357', autor: 'Isaac Asimov', editorial: 'Bantam Books', anio: 1951, imagen: 'https://images.example.com/fundacion.jpg' },
      { nombre: 'Cien años de soledad', descripcion: 'La historia de la familia Buendía.', precio: 16500.00, stock: 12, estado: 'activo', descuento: 0.00, categoriaId: 1, isbn: '978-0307474728', autor: 'Gabriel García Márquez', editorial: 'Sudamericana', anio: 1967, imagen: 'https://images.example.com/cien-anos.jpg' },
      { nombre: 'Neuromante', descripcion: 'La novela que fundó el ciberpunk.', precio: 13500.00, stock: 7, estado: 'activo', descuento: 0.00, categoriaId: 2, isbn: '978-0441569595', autor: 'William Gibson', editorial: 'Ace Books', anio: 1984, imagen: 'https://images.example.com/neuromante.jpg' },
      { nombre: 'Crónica de una muerte anunciada', descripcion: 'Un asesinato anunciado que nadie evita.', precio: 11000.00, stock: 15, estado: 'activo', descuento: 0.00, categoriaId: 1, isbn: '978-0307474765', autor: 'Gabriel García Márquez', editorial: 'Sudamericana', anio: 1981, imagen: 'https://images.example.com/cronica-muerte.jpg' },
      { nombre: 'Un mundo feliz', descripcion: 'Distopía sobre el control social mediante el placer.', precio: 12500.00, stock: 9, estado: 'activo', descuento: 15.00, categoriaId: 2, isbn: '978-0060850524', autor: 'Aldous Huxley', editorial: 'Harper Perennial', anio: 1932, imagen: 'https://images.example.com/mundo-feliz.jpg' },
      { nombre: 'Rayuela', descripcion: 'Novela experimental de lectura no lineal.', precio: 17000.00, stock: 6, estado: 'activo', descuento: 0.00, categoriaId: 1, isbn: '978-8437604572', autor: 'Julio Cortázar', editorial: 'Cátedra', anio: 1963, imagen: 'https://images.example.com/rayuela.jpg' },
      { nombre: 'Yo, Robot', descripcion: 'Relatos sobre robots y las tres leyes de la robótica.', precio: 13000.00, stock: 11, estado: 'activo', descuento: 0.00, categoriaId: 2, isbn: '978-0553294385', autor: 'Isaac Asimov', editorial: 'Bantam Books', anio: 1950, imagen: 'https://images.example.com/yo-robot.jpg' },
      { nombre: 'Pedro Páramo', descripcion: 'Un viaje al pueblo fantasma de Comala.', precio: 10500.00, stock: 4, estado: 'activo', descuento: 0.00, categoriaId: 1, isbn: '978-0802133908', autor: 'Juan Rulfo', editorial: 'Grove Press', anio: 1955, imagen: 'https://images.example.com/pedro-paramo.jpg' },
      { nombre: 'Fahrenheit 451', descripcion: 'Un futuro donde los libros están prohibidos.', precio: 12800.00, stock: 0, estado: 'agotado', descuento: 0.00, categoriaId: 2, isbn: '978-1451673319', autor: 'Ray Bradbury', editorial: 'Simon & Schuster', anio: 1953, imagen: 'https://images.example.com/fahrenheit451.jpg' },
      { nombre: 'La casa de los espíritus', descripcion: 'Saga familiar atravesada por lo mágico y lo político.', precio: 15500.00, stock: 8, estado: 'activo', descuento: 0.00, categoriaId: 1, isbn: '978-0525433477', autor: 'Isabel Allende', editorial: 'Plaza & Janés', anio: 1982, imagen: 'https://images.example.com/casa-espiritus.jpg' },
      { nombre: 'El señor de las moscas', descripcion: 'Un grupo de niños varados descubre su propia naturaleza.', precio: 11500.00, stock: 10, estado: 'activo', descuento: 10.00, categoriaId: 1, isbn: '978-0399501487', autor: 'William Golding', editorial: 'Perigee Books', anio: 1954, imagen: 'https://images.example.com/senor-moscas.jpg' },
      { nombre: 'Solaris', descripcion: 'Un planeta océano que desafía toda comprensión humana.', precio: 14200.00, stock: 3, estado: 'activo', descuento: 0.00, categoriaId: 2, isbn: '978-0156027601', autor: 'Stanisław Lem', editorial: 'Harcourt', anio: 1961, imagen: 'https://images.example.com/solaris.jpg' },
      { nombre: 'El túnel', descripcion: 'La obsesión de un pintor narrada en primera persona.', precio: 9800.00, stock: 6, estado: 'activo', descuento: 0.00, categoriaId: 1, isbn: '978-8432217864', autor: 'Ernesto Sábato', editorial: 'Seix Barral', anio: 1948, imagen: 'https://images.example.com/el-tunel.jpg' },
      { nombre: 'Los futuros peligrosos', descripcion: 'Relatos breves sobre tecnología y sus consecuencias imprevistas.', precio: 10200.00, stock: 14, estado: 'activo', descuento: 0.00, categoriaId: 2, isbn: '978-8420674421', autor: 'Ray Bradbury', editorial: 'Minotauro', anio: 1953, imagen: 'https://images.example.com/futuros-peligrosos.jpg' },
      { nombre: 'Ficciones', descripcion: 'Cuentos que cuestionan la realidad, el tiempo y el infinito.', precio: 12300.00, stock: 9, estado: 'activo', descuento: 5.00, categoriaId: 1, isbn: '978-8420633106', autor: 'Jorge Luis Borges', editorial: 'Alianza Editorial', anio: 1944, imagen: 'https://images.example.com/ficciones.jpg' },
      { nombre: 'La guerra de los mundos', descripcion: 'La primera gran invasión marciana de la literatura.', precio: 11800.00, stock: 7, estado: 'activo', descuento: 0.00, categoriaId: 2, isbn: '978-0451530653', autor: 'H.G. Wells', editorial: 'Signet Classic', anio: 1898, imagen: 'https://images.example.com/guerra-mundos.jpg' },
      { nombre: 'El amor en los tiempos del cólera', descripcion: 'Una historia de amor que resiste el paso de las décadas.', precio: 16000.00, stock: 5, estado: 'activo', descuento: 0.00, categoriaId: 1, isbn: '978-0307389732', autor: 'Gabriel García Márquez', editorial: 'Vintage Español', anio: 1985, imagen: 'https://images.example.com/amor-tiempos-colera.jpg' },
      { nombre: 'La máquina del tiempo', descripcion: 'El primer gran viaje literario a través del tiempo.', precio: 9500.00, stock: 0, estado: 'agotado', descuento: 0.00, categoriaId: 2, isbn: '978-0141439976', autor: 'H.G. Wells', editorial: 'Penguin Classics', anio: 1895, imagen: 'https://images.example.com/maquina-tiempo.jpg' },
    ];

    // Etapa 15 (novedades): el INSERT crudo de más abajo no pasa por
    // Sequelize, así que created_at NO se completa solo con NOW() salvo
    // que lo mandemos explícito — y si lo dejamos vacío, TODOS los
    // productos quedan con el mismo timestamp (el momento del seed) y
    // el filtro ?novedades=true no tiene nada que excluir. Por eso acá
    // generamos una fecha distinta por producto, según su posición en
    // el array: los primeros quedan "viejos" (fuera de la ventana de 7
    // días) y el resto "recientes" (dentro), para poder demostrar el
    // filtro con datos reales apenas se corre el seeder.
    const AHORA = new Date();
    const DIAS_VIEJOS = 20; // fuera de la ventana de "novedades" (7 días)
    const DIAS_RECIENTES = 2; // dentro de la ventana

    function fechaSeed(indice, cantidadViejos) {
      const diasAtras = indice < cantidadViejos ? DIAS_VIEJOS : DIAS_RECIENTES;
      const fecha = new Date(AHORA);
      fecha.setDate(fecha.getDate() - diasAtras);
      return fecha;
    }

    // Productos que NO son libros, para demostrar tipoProducto variado
    // (papeleria/accesorio), sin la especialización de la tabla libro.
    const otrosProductos = [
      { nombre: 'Cuaderno universitario 100 hojas', descripcion: 'Cuaderno rayado tapa dura.', precio: 3200.00, stock: 40, estado: 'activo', descuento: 0.00, tipoProducto: 'papeleria', categoriaId: 3, imagen: 'https://images.example.com/cuaderno.jpg' },
      { nombre: 'Set de lapiceras Bic x3', descripcion: 'Lapiceras azul, negro y rojo.', precio: 1500.00, stock: 60, estado: 'activo', descuento: 0.00, tipoProducto: 'papeleria', categoriaId: 3, imagen: 'https://images.example.com/lapiceras.jpg' },
      { nombre: 'Separadores de libro (pack x5)', descripcion: 'Separadores ilustrados de metal.', precio: 2800.00, stock: 25, estado: 'activo', descuento: 20.00, tipoProducto: 'accesorio', categoriaId: 3, imagen: 'https://images.example.com/separadores.jpg' },
    ];

    const transaction = await queryInterface.sequelize.transaction();

    try {
      let idProducto = 1;
      let idImagen = 1;

      // --- Libros ---
      // Primeros 5 libros del array: created_at "viejo" (excluidos de
      // novedades). Resto: created_at "reciente" (incluidos).
      for (let i = 0; i < libros.length; i++) {
        const libro = libros[i];
        const createdAt = fechaSeed(i, 5);

        await queryInterface.sequelize.query(`
          INSERT INTO producto (id_producto, tipo_producto, nombre, descripcion, precio, stock, estado, descuento, created_at, updated_at)
          OVERRIDING SYSTEM VALUE
          VALUES (:id, 'libro', :nombre, :descripcion, :precio, :stock, :estado, :descuento, :createdAt, :createdAt);
        `, {
          replacements: { id: idProducto, ...libro, createdAt },
          transaction,
        });

        await queryInterface.sequelize.query(`
          INSERT INTO libro (id_producto, isbn, autor, editorial, anio_publicacion)
          VALUES (:id, :isbn, :autor, :editorial, :anio);
        `, {
          replacements: { id: idProducto, isbn: libro.isbn, autor: libro.autor, editorial: libro.editorial, anio: libro.anio },
          transaction,
        });

        await queryInterface.sequelize.query(`
          INSERT INTO producto_categoria (id_producto, id_categoria)
          VALUES (:idProducto, :idCategoria);
        `, {
          replacements: { idProducto, idCategoria: libro.categoriaId },
          transaction,
        });

        await queryInterface.sequelize.query(`
          INSERT INTO producto_imagen (id_imagen, id_producto, imagen_url, orden, es_principal)
          OVERRIDING SYSTEM VALUE
          VALUES (:idImagen, :idProducto, :imagenUrl, 1, TRUE);
        `, {
          replacements: { idImagen, idProducto, imagenUrl: libro.imagen },
          transaction,
        });

        idProducto++;
        idImagen++;
      }

      // --- Otros productos (papelería/accesorios, sin tabla libro) ---
      // Todos quedan con created_at "reciente" (dentro de novedades);
      // ya tenemos suficientes productos "viejos" entre los libros.
      for (let i = 0; i < otrosProductos.length; i++) {
        const producto = otrosProductos[i];
        const createdAt = fechaSeed(i, 0);

        await queryInterface.sequelize.query(`
          INSERT INTO producto (id_producto, tipo_producto, nombre, descripcion, precio, stock, estado, descuento, created_at, updated_at)
          OVERRIDING SYSTEM VALUE
          VALUES (:id, :tipoProducto, :nombre, :descripcion, :precio, :stock, :estado, :descuento, :createdAt, :createdAt);
        `, {
          replacements: { id: idProducto, ...producto, createdAt },
          transaction,
        });

        await queryInterface.sequelize.query(`
          INSERT INTO producto_categoria (id_producto, id_categoria)
          VALUES (:idProducto, :idCategoria);
        `, {
          replacements: { idProducto, idCategoria: producto.categoriaId },
          transaction,
        });

        await queryInterface.sequelize.query(`
          INSERT INTO producto_imagen (id_imagen, id_producto, imagen_url, orden, es_principal)
          OVERRIDING SYSTEM VALUE
          VALUES (:idImagen, :idProducto, :imagenUrl, 1, TRUE);
        `, {
          replacements: { idImagen, idProducto, imagenUrl: producto.imagen },
          transaction,
        });

        idProducto++;
        idImagen++;
      }

      // Resetear las 3 secuencias tocadas en este seeder, ahora que
      // sabemos cuál fue el último ID usado en cada una.
      await queryInterface.sequelize.query(
        `SELECT setval(pg_get_serial_sequence('producto', 'id_producto'), (SELECT MAX(id_producto) FROM producto));`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `SELECT setval(pg_get_serial_sequence('producto_imagen', 'id_imagen'), (SELECT MAX(id_imagen) FROM producto_imagen));`,
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    // El orden importa por las FKs, aunque haya ON DELETE CASCADE:
    // borramos explícito de la tabla "hija" hacia la "padre" por claridad.
    await queryInterface.bulkDelete('producto_imagen', null, {});
    await queryInterface.bulkDelete('producto_categoria', null, {});
    await queryInterface.bulkDelete('libro', null, {});
    await queryInterface.bulkDelete('producto', null, {});
  },
};