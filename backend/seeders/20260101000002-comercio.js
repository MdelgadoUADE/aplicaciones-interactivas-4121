'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // comercio.id_comercio también es GENERATED ALWAYS AS IDENTITY,
    // así que usamos el mismo patrón de OVERRIDING SYSTEM VALUE + setval
    // que en el seeder de categorías.
    await queryInterface.sequelize.query(`
      INSERT INTO comercio (id_comercio, nombre, descripcion, direccion, telefono, horarios)
      OVERRIDING SYSTEM VALUE
      VALUES (
        1,
        'MaxiLibrerías Central',
        'Tu librería de confianza',
        'Av. Siempre Viva 742',
        '555-1234',
        'Lunes a Viernes de 09:00 a 18:00'
      );
    `);

    await queryInterface.sequelize.query(`
      SELECT setval(
        pg_get_serial_sequence('comercio', 'id_comercio'),
        (SELECT MAX(id_comercio) FROM comercio)
      );
    `);

    // red_social.id_red_social también es GENERATED ALWAYS AS IDENTITY.
    // Nota: tipo en minúsculas ('instagram', no 'Instagram'), para que
    // coincida con el criterio del api.yaml y no dependa de mayúsculas
    // al filtrar/mostrar iconos en el frontend.
    await queryInterface.sequelize.query(`
      INSERT INTO red_social (id_red_social, id_comercio, tipo, url)
      OVERRIDING SYSTEM VALUE
      VALUES
        (1, 1, 'instagram', 'https://instagram.com/maxilibros'),
        (2, 1, 'facebook', 'https://facebook.com/maxilibros'),
        (3, 1, 'twitter', 'https://twitter.com/maxilibros');
    `);

    await queryInterface.sequelize.query(`
      SELECT setval(
        pg_get_serial_sequence('red_social', 'id_red_social'),
        (SELECT MAX(id_red_social) FROM red_social)
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    // Primero red_social (depende de comercio vía FK), después comercio.
    await queryInterface.bulkDelete('red_social', null, {});
    await queryInterface.bulkDelete('comercio', null, {});
  },
};