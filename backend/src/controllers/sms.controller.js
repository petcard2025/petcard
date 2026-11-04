// CONTROLADOR DE SMS - Envio de mensajes de texto
const db = require('../config/database')
const { enviarSMS } = require('../services/sms.service')

// ENVIAR SMS PERSONALIZADO - Admin puede enviar SMS a cualquier numero
async function sendSMS(req, res) {
  const { telefono, mensaje } = req.body
  if (!telefono || !mensaje) {
    return res.status(400).json({ error: 'Se requieren telefono y mensaje' })
  }
  const resultado = await enviarSMS(telefono, mensaje)
  if (resultado.success) {
    res.json({ message: 'SMS enviado exitosamente', sid: resultado.sid })
  } else {
    res.status(500).json({ error: 'Error enviando SMS: ' + resultado.error })
  }
}

// CONFIRMAR CITA POR SMS - Envia confirmacion de cita al cliente
async function confirmAppointmentSMS(req, res) {
  const { ID_cita } = req.body
  if (!ID_cita) return res.status(400).json({ error: 'ID_cita requerido' })
  
  db.query(
    `SELECT ci.Fecha, ci.Hora, m.Nombre AS Nombre_mascota,
            u.Nombre AS Nombre_cliente, u.Telefono,
            s.Nombre AS Nombre_servicio, uv.Nombre AS Nombre_veterinario
     FROM cita ci
     JOIN mascota m ON ci.ID_mascota = m.ID_mascota
     JOIN cliente c ON ci.ID_cliente = c.ID_cliente
     JOIN usuario u ON c.ID_usuario = u.ID_usuario
     JOIN servicio s ON ci.ID_servicio = s.ID_servicio
     JOIN veterinario v ON ci.ID_veterinario = v.ID_veterinario
     JOIN usuario uv ON v.ID_usuario = uv.ID_usuario
     WHERE ci.ID_cita = ?`,
    [ID_cita],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      if (results.length === 0) return res.status(404).json({ error: 'Cita no encontrada' })
      
      const cita = results[0]
      if (!cita.Telefono) {
        return res.status(400).json({ error: 'El cliente no tiene telefono registrado' })
      }
      
      const mensaje =
        'PetCard: Hola ' + cita.Nombre_cliente + '! Su cita para ' + cita.Nombre_mascota +
        ' ha sido confirmada. Servicio: ' + cita.Nombre_servicio + '. ' +
        'Fecha: ' + new Date(cita.Fecha).toLocaleDateString('es-CO') + ' a las ' + cita.Hora + '. ' +
        'Veterinario: ' + cita.Nombre_veterinario + '.'
      
      const resultado = await enviarSMS(cita.Telefono, mensaje)
      if (resultado.success) {
        res.json({ message: 'SMS de confirmacion enviado', sid: resultado.sid })
      } else {
        res.status(500).json({ error: 'Error enviando SMS: ' + resultado.error })
      }
    }
  )
}

// RECORDATORIO DE VACUNA POR SMS - Envia recordatorio al cliente
async function vaccineReminderSMS(req, res) {
  const { ID_carnetVacunas } = req.body
  if (!ID_carnetVacunas) {
    return res.status(400).json({ error: 'ID_carnetVacunas requerido' })
  }
  
  db.query(
    `SELECT cv.Nombre_vacuna, cv.Proxima_dosis,
            m.Nombre AS Nombre_mascota,
            u.Nombre AS Nombre_cliente, u.Telefono
     FROM carnetvacunas cv
     JOIN mascota m ON cv.ID_mascota = m.ID_mascota
     JOIN cliente c ON m.ID_cliente = c.ID_cliente
     JOIN usuario u ON c.ID_usuario = u.ID_usuario
     WHERE cv.ID_carnetVacunas = ?`,
    [ID_carnetVacunas],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      if (results.length === 0) return res.status(404).json({ error: 'Vacuna no encontrada' })
      
      const vacuna = results[0]
      if (!vacuna.Telefono) {
        return res.status(400).json({ error: 'El cliente no tiene telefono registrado' })
      }
      
      const mensaje =
        'PetCard: Hola ' + vacuna.Nombre_cliente + '! Recordatorio: ' +
        vacuna.Nombre_mascota + ' tiene pendiente la vacuna "' + vacuna.Nombre_vacuna + '". ' +
        'Proxima dosis: ' + new Date(vacuna.Proxima_dosis).toLocaleDateString('es-CO') + '. ' +
        'No olvides agendar tu cita!'
      
      const resultado = await enviarSMS(vacuna.Telefono, mensaje)
      if (resultado.success) {
        res.json({ message: 'Recordatorio SMS enviado', sid: resultado.sid })
      } else {
        res.status(500).json({ error: 'Error enviando SMS: ' + resultado.error })
      }
    }
  )
}

module.exports = { sendSMS, confirmAppointmentSMS, vaccineReminderSMS }