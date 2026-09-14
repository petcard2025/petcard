// MAILER - Configuracion de Nodemailer para envio de correos
// ============================================================

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error al conectar con SMTP:', error.message);
  } else {
    console.log('Servidor SMTP listo para enviar correos');
  }
});

async function enviarCorreoRecuperacion(destinatario, codigo) {
  try {
    const mailOptions = {
      from: "PetCard" <${process.env.SMTP_USER}>,
      to: destinatario,
      subject: 'Codigo de recuperacion - PetCard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563EB; margin: 0;">🐾 PetCard</h1>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1A1A2E; margin-top: 0; text-align: center;">Recuperacion de contraseña</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en PetCard.
            </p>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">
              Tu codigo de verificacion es:
            </p>

            <div style="background-color: #EFF6FF; border: 3px solid #2563EB; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
              <span style="font-size: 42px; font-weight: 900; color: #2563EB; letter-spacing: 12px; font-family: 'Courier New', monospace;">${codigo}</span>
            </div>

            <p style="color: #DC2626; font-size: 14px; line-height: 1.6; font-weight: bold; text-align: center;">
              ⏱️ Este codigo es valido por solo <strong>5 MINUTOS</strong>.
            </p>

            <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
              Ingresa este codigo en la aplicacion junto con tu nueva contraseña. Si no solicitaste este cambio, puedes ignorar este correo.
            </p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 25px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © 2026 PetCard. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
      text: Recuperacion de contraseña - PetCard\n\nTu codigo de verificacion es: ${codigo}\n\nESTE CODIGO ES VALIDO POR SOLO 5 MINUTOS.\n\nSi no solicitaste este cambio, ignora este correo.,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  transporter,
  enviarCorreoRecuperacion,
};