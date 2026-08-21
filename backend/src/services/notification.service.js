// SERVICIO DE NOTIFICACIONES - Crea notificaciones en BD y envía SMS
const db = require('../config/database')
const { enviarSMS } = require('./sms.service')

// CREAR NOTIFICACION AUTOMATICA - Guarda en BD y opcionalmente envía SMS
async function crearNotificacionAutomatica(ID_usuario, mensaje, tipo, canal = 'Sistema') {
  return new Promise((resolve) => {
    db.query(
      'INSERT INTO notificacion (ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio) VALUES (?,?,?,?,?,NOW())',
      [ID_usuario, 1, mensaje, tipo, canal],
      async (err, result) => {
        if (err) {
          console.error('Error creando notificacion automatica:', err.message)
          return resolve({ success: false })
        }
        console.log('Notificacion automatica creada (ID:', result.insertId, ') -> Usuario', ID_usuario)
        
        // Si el canal es SMS, enviar mensaje de texto
        if (canal === 'SMS') {
          db.query('SELECT Telefono FROM usuario WHERE ID_usuario = ?', [ID_usuario], async (errU, rows) => {
            if (!errU && rows.length > 0 && rows[0].Telefono) {
              await enviarSMS(rows[0].Telefono, mensaje)
            }
            resolve({ success: true, ID_notificacion: result.insertId })
          })
        } else {
          resolve({ success: true, ID_notificacion: result.insertId })
        }
      }
    )
  })
}

module.exports = { crearNotificacionAutomatica }