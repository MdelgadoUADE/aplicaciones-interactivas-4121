'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // OJO: id_categoria es GENERATED ALWAYS AS IDENTITY (no "BY DEFAULT"),
    // así que Postgres rechaza cualquier INSERT con un id_categoria
    // explícito salvo que se use OVERRIDING SYSTEM VALUE. bulkInsert()
    // no soporta esa cláusula, así que acá usamos SQL crudo en su lugar.
    await queryInterface.sequelize.query(`
      INSERT INTO categoria (id_categoria, nombre, descripcion)
      OVERRIDING SYSTEM VALUE
      VALUES
        (1, 'Novela', 'Obras de ficción narrativa'),
        (2, 'Ciencia Ficción', 'Literatura especulativa y futurista'),
        (3, 'Papelería', 'Artículos de oficina y escolares');
    `);

    // Reseteamos la secuencia de autoincremento para que el próximo
    // INSERT (uno hecho por la app, no por este seeder) continúe desde
    // el máximo id_categoria insertado acá, y no choque con estos IDs
    // fijos (mismo problema que viste con test-connection.js).
    await queryInterface.sequelize.query(`
      SELECT setval(
        pg_get_serial_sequence('categoria', 'id_categoria'),
        (SELECT MAX(id_categoria) FROM categoria)
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categoria', null, {});
  },
};