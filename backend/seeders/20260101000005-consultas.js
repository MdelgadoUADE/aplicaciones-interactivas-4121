'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Estados corregidos respecto al data_seed.sql original: la consigna
    // del TPO pide literalmente "Pendiente, Leída, Respondida" — se usa
    // 'leida' acá, no 'leido' ni 'cerrada' (que no cumplían la consigna
    // ni coincidían entre bbdd_seed.sql y data_seed.sql).
    await queryInterface.sequelize.query(`
      INSERT INTO consulta (id_consulta, nombre, email, telefono, asunto, mensaje, estado)
      OVERRIDING SYSTEM VALUE
      VALUES
        (1, 'Ned Flanders', 'vecinorijillo.religiosillo@springfield-mail.com', '111-2222', 'Disponibilidad de libro', 'Hola, ¿tienen "La Biblia" en stock?', 'pendiente'),
        (2, 'Martin Prince', 'admiradordehawking123@springfield-mail.com', '333-4444', 'Horarios de atención', '¿Abren los sábados?', 'respondida'),
        (3, 'Bart Simpson', 'cometemiscalzones@springfield-mail.com', NULL, 'Pedido especial', '¿Tienen algún libro sobre cómo hacer travesuras sin que te descubran?', 'pendiente'),
        (4, 'Lisa Simpson', 'supersax@springfield-mail.com', '555-6666', 'Devolución', 'Quiero devolver un libro comprado ayer, vino con una página rota.', 'leida'),
        (5, 'Cletus', 'redneck@springfield-mail.com', '777-8888', 'Descuentos', '¿Tienen descuentos por compras grandes en efectivo?', 'pendiente');
    `);

    await queryInterface.sequelize.query(`
      SELECT setval(
        pg_get_serial_sequence('consulta', 'id_consulta'),
        (SELECT MAX(id_consulta) FROM consulta)
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('consulta', null, {});
  },
};