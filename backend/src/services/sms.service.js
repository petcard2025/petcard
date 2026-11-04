const twilio = require('twilio')

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// NORMALIZAR TELEFONO - Convierte a formato internacional (+57)
function normalizarTelefono(telefono) {
  let num = telefono.toString().replace(/[\s\-().]/g, '')
  if (num.startsWith('+57')) {
    const digitos = num.slice(3)
    if (digitos.length === 10) return num
    return num
  }
  if (num.startsWith('57') && num.length === 12) return '+' + num
  if (num.length === 10) return '+57' + num
  if (num.startsWith('0') && num.length === 11) return '+57' + num.slice(1)
  if (num.startsWith('+')) return num
  return '+57' + num
}

// ENVIAR SMS - Envia un mensaje de texto
async function enviarSMS(telefono, mensaje) {
  try {
    const telefonoFormateado = normalizarTelefono(telefono)
    console.log('Enviando SMS a:', telefono, '->', telefonoFormateado)
    const message = await twilioClient.messages.create({
      body: mensaje,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: telefonoFormateado
    })
    console.log('SMS enviado. SID:', message.sid)
    return { success: true, sid: message.sid, to: telefonoFormateado }
  } catch (error) {
    console.error('Error enviando SMS:', error.message)
    return { success: false, error: error.message }
  }
}

module.exports = { enviarSMS, normalizarTelefono }