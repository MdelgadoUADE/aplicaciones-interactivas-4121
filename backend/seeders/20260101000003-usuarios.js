'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Contraseña de prueba en texto plano: admin123
    // (documentada acá y en el README/manual de instalación, NUNCA en
    // el código de producción — este es un seeder de datos de prueba,
    // no un usuario real).
    const passwordHash = await bcrypt.hash('admin123', 10);

    // usuarios.id_usuario es UUID con DEFAULT uuid_generate_v4(), así
    // que podríamos omitirlo y dejar que la base lo genere. Igual lo
    // fijamos explícito acá, para poder referenciarlo desde otros
    // seeders si hiciera falta en el futuro (por ejemplo, si más
    // adelante seedeamos algo que dependa de "el usuario admin").
    await queryInterface.sequelize.query(`
      INSERT INTO usuarios (id_usuario, nombre, apellido, email, telefono, password_hash, rol, direccion)
      VALUES (
        'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        'Admin',
        'MaxiLibrerías',
        'admin@maxilibros.com',
        '555-9876',
        :passwordHash,
        'admin',
        'Calle Falsa 123'
      );
    `, {
      replacements: { passwordHash },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  },
};