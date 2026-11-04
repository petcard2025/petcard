// CONTROLADOR DE CITAS - Gestion de citas (clientes, veterinarios, admin)
const db = require('../config/database')
const { crearEventoCalendar } = require('../services/google-calendar.service')
const { crearNotificacionAutomatica } = require('../services/notification.service')

// OBTENER CITAS - Admin ve todas, veterinario solo las suyas
async function getAppointments(req, res) {
  let sql = `SELECT ci.ID_cita, ci.ID_cliente, ci.ID_mascota, ci.ID_servicio, ci.ID_veterinario,
            ci.Fecha, ci.Hora, ci.Motivo, ci.Observaciones, ci.Estado,
            m.Nombre AS Nombre_mascota,
            u.Nombre AS Nombre_cliente,
            s.Nombre AS Nombre_servicio,
            uv.Nombre AS Nombre_veterinario
     FROM cita ci
     JOIN mascota m ON ci.ID_mascota = m.ID_mascota
     JOIN cliente c ON ci.ID_cliente = c.ID_cliente
     JOIN usuario u ON c.ID_usuario = u.ID_usuario
     JOIN servicio s ON ci.ID_servicio = s.ID_servicio
     JOIN veterinario v ON ci.ID_veterinario = v.ID_veterinario
     JOIN usuario uv ON v.ID_usuario = uv.ID_usuario`

  const params = []
  if (req.usuario.Rol === 'veterinario') {
    sql += ' WHERE ci.ID_veterinario = ?'
    params.push(req.veterinario.ID_veterinario)
  }
  sql += ' ORDER BY ci.Fecha DESC'

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
}

// OBTENER HORAS OCUPADAS - Para evitar doble agendamiento
async function getHorasOcupadas(req, res) {
  const { ID_veterinario, Fecha } = req.query
  if (!ID_veterinario || !Fecha) {
    return res.status(400).json({ error: 'Se requieren ID_veterinario y Fecha' })
  }
  db.query(
    'SELECT Hora FROM cita WHERE ID_veterinario = ? AND Fecha = ?',
    [ID_veterinario, Fecha],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      const horasOcupadas = results.map(r => r.Hora)
      res.json({ horasOcupadas })
    }
  )
}

// CREAR CITA - Cliente agenda, con validacion de horario
async function createAppointment(req, res) {
  const { ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones } = req.body

  // Verificar si el horario ya esta ocupado
  db.query(
    'SELECT ID_cita FROM cita WHERE ID_veterinario=? AND Fecha=? AND Hora=?',
    [ID_veterinario, Fecha, Hora],
    async (errCheck, existing) => {
      if (errCheck) return res.status(500).json({ error: errCheck.message })
      if (existing.length > 0) {
        return res.status(409).json({ error: 'El veterinario ya tiene una cita agendada en esa fecha y hora.' })
      }

      // Insertar cita
      db.query(
        'INSERT INTO cita (ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones) VALUES (?,?,?,?,?,?,?,?)',
        [ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones],
        async (err, result) => {
          if (err) return res.status(500).json({ error: err.message })
          const ID_cita = result.insertId

          // Crear notificacion automatica
          try {
            db.query(
              `SELECT c.ID_usuario, m.Nombre AS Nombre_mascota, s.Nombre AS Nombre_servicio
               FROM cliente c
               JOIN mascota m ON m.ID_mascota = ?
               JOIN servicio s ON s.ID_servicio = ?
               WHERE c.ID_cliente = ?`,
              [ID_mascota, ID_servicio, ID_cliente],
              async (errQ, rows) => {
                if (!errQ && rows.length > 0) {
                  const { ID_usuario, Nombre_mascota, Nombre_servicio } = rows[0]
                  const mensaje = 'Cita agendada para ' + (Nombre_mascota || 'tu mascota') + ' — ' + (Nombre_servicio || Motivo || 'Consulta') + ' el ' + Fecha + ' a las ' + Hora + '.'
                  await crearNotificacionAutomatica(ID_usuario, mensaje, 'cita', 'Sistema')
                }
              }
            )
          } catch (notifError) {
            console.error('Error creando notificacion de cita:', notifError.message)
          }

          // Crear evento en Google Calendar
          try {
            const googleEventId = await crearEventoCalendar({ Fecha, Hora, Motivo, Observaciones })
            db.query('UPDATE cita SET Google_Event_ID=? WHERE ID_cita=?', [googleEventId, ID_cita])
            res.json({ ID_cita, googleEventId, ...req.body })
          } catch (calError) {
            console.error('Error Google Calendar:', calError.message)
            res.json({ ID_cita, ...req.body, calendarError: calError.message })
          }
        }
      )
    }
  )
}

// ACTUALIZAR CITA - Veterinario solo sus citas, admin todas
async function updateAppointment(req, res) {
  const { ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones } = req.body

  const ejecutarUpdate = () => {
    db.query(
      'UPDATE cita SET ID_servicio=?, ID_veterinario=?, Fecha=?, Hora=?, Motivo=?, Observaciones=? WHERE ID_cita=?',
      [ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ message: 'Cita actualizada' })
      }
    )
  }

  // Si es veterinario, verificar que la cita sea suya
  if (req.usuario.Rol === 'veterinario') {
    db.query('SELECT ID_veterinario FROM cita WHERE ID_cita = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      if (rows.length === 0) return res.status(404).json({ error: 'Cita no encontrada' })
      if (rows[0].ID_veterinario !== req.veterinario.ID_veterinario) {
        return res.status(403).json({ error: 'No puedes modificar citas de otro veterinario.' })
      }
      ejecutarUpdate()
    })
  } else {
    ejecutarUpdate()
  }
}

// ACTUALIZAR PARCIALMENTE CITA - Para cambiar estado u otros campos
async function patchAppointment(req, res) {
  const campos = req.body
  const keys = Object.keys(campos)
  if (keys.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' })

  const ejecutarPatch = () => {
    const set = keys.map(k => k + '=?').join(', ')
    const values = [...Object.values(campos), req.params.id]
    db.query('UPDATE cita SET ' + set + ' WHERE ID_cita=?', values, (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Cita actualizada parcialmente' })
    })
  }

  // Si es veterinario, verificar que la cita sea suya
  if (req.usuario.Rol === 'veterinario') {
    db.query('SELECT ID_veterinario FROM cita WHERE ID_cita = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      if (rows.length === 0) return res.status(404).json({ error: 'Cita no encontrada' })
      if (rows[0].ID_veterinario !== req.veterinario.ID_veterinario) {
        return res.status(403).json({ error: 'No puedes modificar citas de otro veterinario.' })
      }
      ejecutarPatch()
    })
  } else {
    ejecutarPatch()
  }
}

// ELIMINAR CITA - Solo admin
async function deleteAppointment(req, res) {
  db.query('DELETE FROM cita WHERE ID_cita=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Cita eliminada' })
  })
}

module.exports = {
  getAppointments,
  getHorasOcupadas,
  createAppointment,
  updateAppointment,
  patchAppointment,
  deleteAppointment
}