// tests/helpers/notificaciones.js
const nodemailer = require('nodemailer');

const CONFIG = {
  // Destinatarios de alertas críticas
  destinatarios: ['esteban.molina@phinxlab.com'],
  asuntoPrefijo: '🚨 [pipe.store] ',
};

/**
 * Crea el transporter de email.
 * Usamos Gmail como ejemplo — ver README para otros proveedores.
 */
function crearTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, // App Password de Google, no tu contraseña normal
    },
  });
}

/**
 * Envía una notificación de error crítico
 * @param {object} opciones
 * @param {string} opciones.titulo - Asunto del email
 * @param {string} opciones.mensaje - Cuerpo del email
 * @param {string[]} opciones.detalles - Lista de errores encontrados
 */
async function notificarError({ titulo, mensaje, detalles = [] }) {
  const transporter = crearTransporter();

  const listaErrores = detalles
    .map((d, i) => `<li>${i + 1}. ${d}</li>`)
    .join('');

  const html = `
    <h2 style="color: #cc0000;">🚨 Error detectado en pipe.store</h2>
    <p><strong>${mensaje}</strong></p>
    ${detalles.length > 0 ? `
      <h3>Detalle:</h3>
      <ul>${listaErrores}</ul>
    ` : ''}
    <hr/>
    <p style="color: #666; font-size: 12px;">
      Generado automáticamente por Playwright Smoke Tests<br/>
      Fecha: ${new Date().toLocaleString('es-AR')}
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"Smoke Tests pipe.store" <${process.env.MAIL_USER}>`,
      to: CONFIG.destinatarios.join(','),
      subject: CONFIG.asuntoPrefijo + titulo,
      html,
    });
    console.log(`📧 Notificación enviada: ${titulo}`);
  } catch (error) {
    console.error(`❌ Error enviando notificación: ${error.message}`);
  }
}

module.exports = { notificarError };