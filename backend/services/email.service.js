// services/email.service.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true solo si usás el puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Envía un email de recuperación de contraseña.
 * @param {string} destinatario - email del usuario
 * @param {string} tokenPlano - token en texto plano (NO el hash guardado en la DB)
 */
async function enviarEmailRecuperacion(destinatario, tokenPlano) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${tokenPlano}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: destinatario,
    subject: 'Recuperación de contraseña — Maxilibros',
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Hacé clic en el siguiente enlace (válido por 30 minutos):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si no solicitaste este cambio, podés ignorar este mensaje.</p>
    `,
  });
}

/**
 * Envía una notificación al comercio cuando llega una consulta nueva
 * (funcionalidad extra: "Envío de correos desde el formulario de contacto").
 */
async function enviarNotificacionConsulta(consulta) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_COMERCIO || process.env.EMAIL_USER,
    subject: `Nueva consulta: ${consulta.asunto}`,
    html: `
      <p><strong>De:</strong> ${consulta.nombre} (${consulta.email})</p>
      <p><strong>Teléfono:</strong> ${consulta.telefono || 'No especificado'}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${consulta.mensaje}</p>
    `,
  });
}

module.exports = {
  enviarEmailRecuperacion,
  enviarNotificacionConsulta,
};