// CONTROLADOR DE CITAS - Gestion de citas (clientes, veterinarios, admin)
//
// Permisos:
//   - cliente:      ve y crea solo sus citas; solo puede CANCELAR las suyas.
//   - veterinario:  ve y modifica solo las citas que tiene asignadas.
//   - administrador: ve y modifica todas.
const db = require('../config/database')
const { crearEventoCalendar } = require('../services/google-calendar.service')
const notifSync = require('../services/notification-sync')(db)
const {
  validarFechaCita,
  validarHoraCita,
  validarFechaHoraCita,
  normalizarHora,
  citaYaPaso
} = require('../utils/validators')

const { crearNotificacionAutomatica } = require('../services/notification.service')

const ESTADOS = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada']
const MSG_HORARIO_OCUPADO = 'El veterinario ya tiene una cita agendada en esa fecha y hora.'

// Una cita cancelada libera su horario: no cuenta como ocupada
const NO_CANCELADA = "(Estado IS NULL OR Estado <> 'Cancelada')"

// ---------- Utilidades ----------

// db.query con promesas
function consultar(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)))
  })
}

const rolDe = (req) => String(req.usuario?.Rol || '').toLowerCase()
const esAdmin = (req) => rolDe(req) === 'administrador'
const esVeterinario = (req) => rolDe(req) === 'veterinario'

// "pendiente" -> "Pendiente". Devuelve null si no es un estado valido.
function normalizarEstado(valor) {
  const e = String(valor ?? '').trim().toLowerCase()
  return ESTADOS.find((x) => x.toLowerCase() === e) || null
}

const soloFecha = (valor) => String(valor || '').slice(0, 10)

// ¿El veterinario ya tiene una cita ACTIVA a esa fecha y hora?
// Se compara en JavaScript con la hora normalizada, porque en la base de datos las
// horas pueden estar guardadas como "08:00 AM", "08:00:00" o "08:00" segun quien
// las creo. (Las canceladas no cuentan.)
async function horarioOcupado(ID_veterinario, Fecha, Hora, excluirIdCita = null) {
  const filas = await consultar(
    `SELECT ID_cita, Hora FROM cita WHERE ID_veterinario = ? AND Fecha = ? AND ${NO_CANCELADA}`,
    [ID_veterinario, Fecha]
  )
  return filas.some((f) => Number(f.ID_cita) !== Number(excluirIdCita) && normalizarHora(f.Hora) === Hora)
}

// Traduce errores de la base de datos a respuestas claras
function responderError(res, err) {
  if (err && err.code === '23505') return res.status(409).json({ error: MSG_HORARIO_OCUPADO }) // unique_violation
  if (err && err.code === '23503') return res.status(400).json({ error: 'El servicio, veterinario o mascota indicado no existe.' }) // foreign_key_violation
  return res.status(500).json({ error: err.message })
}

// Busca una cita y comprueba que el usuario tenga permiso sobre ella.
// Devuelve la cita, o null (y ya respondio con 404/403).
async function obtenerCitaConPermiso(req, res) {
  const filas = await consultar(
    `SELECT ci.*, c.ID_usuario AS ID_usuario_cliente
     FROM cita ci
     JOIN cliente c ON ci.ID_cliente = c.ID_cliente
     WHERE ci.ID_cita = ?`,
    [req.params.id]
  )
  if (filas.length === 0) {
    res.status(404).json({ error: 'Cita no encontrada' })
    return null
  }
  const cita = filas[0]

  if (esAdmin(req)) return cita
  if (esVeterinario(req)) {
    if (cita.ID_veterinario !== req.veterinario?.ID_veterinario) {
      res.status(403).json({ error: 'No puedes modificar citas de otro veterinario.' })
      return null
    }
    return cita
  }
  // Cliente: solo sus propias citas
  if (Number(cita.ID_usuario_cliente) !== Number(req.usuario.ID_usuario)) {
    res.status(403).json({ error: 'No puedes modificar citas de otro cliente.' })
    return null
  }
  return cita
}

// Avisa al veterinario cuando una cita suya se cancela (no bloquea la respuesta)
async function notificarCancelacionAlVeterinario(cita) {
  try {
    const filas = await consultar(
      `SELECT v.ID_usuario, m.Nombre AS Nombre_mascota
       FROM veterinario v
       JOIN mascota m ON m.ID_mascota = ?
       WHERE v.ID_veterinario = ?`,
      [cita.ID_mascota, cita.ID_veterinario]
    )
    if (filas.length === 0) return
    const { ID_usuario, Nombre_mascota } = filas[0]
    const mensaje = 'Cita cancelada: ' + (Nombre_mascota || 'una mascota') + ' el ' + soloFecha(cita.Fecha) + ' a las ' + (normalizarHora(cita.Hora) || cita.Hora) + '.'
    await crearNotificacionAutomatica(ID_usuario, mensaje, 'cita', 'Sistema')
  } catch (e) {
    console.error('Error notificando cancelacion de cita:', e.message)
  }
}

// ---------- Endpoints ----------

// OBTENER CITAS - Admin ve todas, veterinario las suyas, cliente las suyas
async function getAppointments(req, res) {
  try {
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
    if (esVeterinario(req)) {
      if (!req.veterinario) return res.status(403).json({ error: 'No se encontro perfil de veterinario asociado.' })
      sql += ' WHERE ci.ID_veterinario = ?'
      params.push(req.veterinario.ID_veterinario)
    } else if (!esAdmin(req)) {
      // Cliente: solo las citas de sus propias cuentas de cliente
      sql += ' WHERE c.ID_usuario = ?'
      params.push(req.usuario.ID_usuario)
    }
    sql += ' ORDER BY ci.Fecha DESC, ci.Hora DESC'

    res.json(await consultar(sql, params))
  } catch (err) {
    responderError(res, err)
  }
}

// OBTENER HORAS OCUPADAS - Para evitar doble agendamiento (las canceladas no cuentan)
async function getHorasOcupadas(req, res) {
  try {
    const { ID_veterinario, Fecha } = req.query
    if (!ID_veterinario || !Fecha) {
      return res.status(400).json({ error: 'Se requieren ID_veterinario y Fecha' })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(Fecha))) {
      return res.status(400).json({ error: 'La fecha no es valida.' })
    }
    const filas = await consultar(
      `SELECT Hora FROM cita WHERE ID_veterinario = ? AND Fecha = ? AND ${NO_CANCELADA}`,
      [ID_veterinario, Fecha]
    )
    res.json({ horasOcupadas: filas.map((r) => r.Hora) })
  } catch (err) {
    responderError(res, err)
  }
}

// CREAR CITA - Cliente (para sus mascotas) o administrador
async function createAppointment(req, res) {
  try {
    if (esVeterinario(req)) {
      return res.status(403).json({ error: 'Los veterinarios no pueden agendar citas.' })
    }

    const ID_mascota = Number(req.body.ID_mascota)
    const ID_servicio = Number(req.body.ID_servicio)
    const ID_veterinario = Number(req.body.ID_veterinario)
    if (![ID_mascota, ID_servicio, ID_veterinario].every(Number.isInteger)) {
      return res.status(400).json({ error: 'Faltan datos de la cita (mascota, servicio o veterinario).' })
    }

    // Fecha y hora: rango permitido, horario de atencion y que no haya pasado ya
    const Fecha = soloFecha(req.body.Fecha)
    const Hora = normalizarHora(req.body.Hora)
    const errValidacion = validarFechaCita(Fecha) || validarHoraCita(Hora) || validarFechaHoraCita(Fecha, Hora)
    if (errValidacion) return res.status(400).json({ error: errValidacion })

    // La mascota define el cliente: un cliente solo puede agendar para sus mascotas
    const duenos = await consultar(
      `SELECT m.ID_cliente, c.ID_usuario
       FROM mascota m
       JOIN cliente c ON c.ID_cliente = m.ID_cliente
       WHERE m.ID_mascota = ? AND m.Estado = 'activo'`,
      [ID_mascota]
    )
    if (duenos.length === 0) return res.status(404).json({ error: 'Mascota no encontrada.' })
    if (!esAdmin(req) && Number(duenos[0].ID_usuario) !== Number(req.usuario.ID_usuario)) {
      return res.status(403).json({ error: 'Solo puedes agendar citas para tus propias mascotas.' })
    }
    const ID_cliente = duenos[0].ID_cliente

    // Verificar si el horario ya esta ocupado (las canceladas no cuentan)
    if (await horarioOcupado(ID_veterinario, Fecha, Hora)) {
      return res.status(409).json({ error: MSG_HORARIO_OCUPADO })
    }

    const { Motivo, Observaciones } = req.body
    const result = await consultar(
      'INSERT INTO cita (ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones) VALUES (?,?,?,?,?,?,?,?)',
      [ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones]
    )
    const ID_cita = result.insertId
    const cita = { ID_cita, ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones }

    // Crear la notificacion enlazada a la cita (y esperar a que termine)
    try {
      await notifSync.sincronizarCita(ID_cita)
    } catch (notifError) {
      console.error('Error creando notificacion de cita:', notifError.message)
    }

    // Crear evento en Google Calendar
    try {
      const googleEventId = await crearEventoCalendar({ Fecha, Hora, Motivo, Observaciones })
      await consultar('UPDATE cita SET Google_Event_ID=? WHERE ID_cita=?', [googleEventId, ID_cita])
      res.json({ ...cita, googleEventId })
    } catch (calError) {
      console.error('Error Google Calendar:', calError.message)
      res.json({ ...cita, calendarError: calError.message })
    }
  } catch (err) {
    responderError(res, err)
  }
}

// ACTUALIZAR CITA - Veterinario solo sus citas, admin todas (los clientes solo pueden cancelar)
async function updateAppointment(req, res) {
  try {
    if (!esAdmin(req) && !esVeterinario(req)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar citas.' })
    }
    const actual = await obtenerCitaConPermiso(req, res)
    if (!actual) return

    // Lo que no venga en la peticion se conserva
    const pick = (nuevo, anterior) => (nuevo === undefined ? anterior : nuevo)

    const ID_servicio = pick(req.body.ID_servicio, actual.ID_servicio)
    // Un veterinario no puede reasignar la cita a otro veterinario
    const ID_veterinario = esVeterinario(req) ? actual.ID_veterinario : pick(req.body.ID_veterinario, actual.ID_veterinario)
    const Fecha = soloFecha(pick(req.body.Fecha, actual.Fecha))
    const Hora = normalizarHora(pick(req.body.Hora, actual.Hora))
    const Motivo = pick(req.body.Motivo, actual.Motivo)
    const Observaciones = pick(req.body.Observaciones, actual.Observaciones)

    let Estado = actual.Estado
    if (req.body.Estado !== undefined) {
      Estado = normalizarEstado(req.body.Estado)
      if (!Estado) return res.status(400).json({ error: 'Estado no valido. Usa: ' + ESTADOS.join(', ') + '.' })
    }

    const fechaCambio = Fecha !== soloFecha(actual.Fecha)
    const horaCambio = Hora !== normalizarHora(actual.Hora)
    const vetCambio = Number(ID_veterinario) !== Number(actual.ID_veterinario)

    // Siempre: la fecha no puede pasar del limite (una fecha ya vencida solo se tolera si no cambia)
    const errFecha = validarFechaCita(Fecha, { permitirPasado: !fechaCambio })
    if (errFecha) return res.status(400).json({ error: errFecha })

    // Si se reprograma, la nueva hora debe ser un horario valido y no haber pasado.
    // (Si la hora no cambia no se revisa, para no bloquear citas antiguas con otras horas.)
    if (horaCambio || fechaCambio) {
      if (!Hora) return res.status(400).json({ error: 'La hora de la cita no es valida.' })
      if (horaCambio) {
        const errHora = validarHoraCita(Hora)
        if (errHora) return res.status(400).json({ error: errHora })
      }
      const errPasada = validarFechaHoraCita(Fecha, Hora)
      if (errPasada) return res.status(400).json({ error: errPasada })
    }

    // Si se reprograma o se reactiva, no puede chocar con otra cita del veterinario
    const reactiva = actual.Estado === 'Cancelada' && Estado !== 'Cancelada'
    if ((fechaCambio || horaCambio || vetCambio || reactiva) && Estado !== 'Cancelada') {
      if (await horarioOcupado(ID_veterinario, Fecha, Hora, actual.ID_cita)) {
        return res.status(409).json({ error: MSG_HORARIO_OCUPADO })
      }
    }

    await consultar(
      'UPDATE cita SET ID_servicio=?, ID_veterinario=?, Fecha=?, Hora=?, Motivo=?, Observaciones=?, Estado=? WHERE ID_cita=?',
      [ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones, Estado, actual.ID_cita]
    )

    try { await notifSync.sincronizarCita(actual.ID_cita) } catch (e) { console.error('Sync notificacion cita:', e.message) }
    if (Estado === 'Cancelada' && actual.Estado !== 'Cancelada' && !esVeterinario(req)) {
      notificarCancelacionAlVeterinario(actual)
    }
    res.json({ message: 'Cita actualizada' })
  } catch (err) {
    responderError(res, err)
  }
}

// ACTUALIZAR PARCIALMENTE CITA - Solo Estado y Observaciones.
// Lista cerrada de campos: antes se armaba el SQL con los nombres que enviaba el cliente.
async function patchAppointment(req, res) {
  try {
    const { Estado: estadoBruto, Observaciones, ...otros } = req.body || {}
    const extra = Object.keys(otros)
    if (extra.length > 0) {
      return res.status(400).json({ error: 'Campo no permitido: ' + extra.join(', ') + '. Solo se puede cambiar Estado u Observaciones.' })
    }
    if (estadoBruto === undefined && Observaciones === undefined) {
      return res.status(400).json({ error: 'No hay campos para actualizar' })
    }

    const actual = await obtenerCitaConPermiso(req, res)
    if (!actual) return

    let Estado
    if (estadoBruto !== undefined) {
      Estado = normalizarEstado(estadoBruto)
      if (!Estado) return res.status(400).json({ error: 'Estado no valido. Usa: ' + ESTADOS.join(', ') + '.' })
    }

    // El cliente solo puede cancelar sus citas pendientes o confirmadas que aun no han pasado
    if (!esAdmin(req) && !esVeterinario(req)) {
      if (Observaciones !== undefined || Estado !== 'Cancelada') {
        return res.status(403).json({ error: 'Solo puedes cancelar tus citas.' })
      }
      const estadoActual = normalizarEstado(actual.Estado) || 'Pendiente'
      if (estadoActual !== 'Pendiente' && estadoActual !== 'Confirmada') {
        return res.status(409).json({ error: 'Esta cita ya esta ' + estadoActual.toLowerCase() + ' y no se puede cancelar.' })
      }
      if (citaYaPaso(actual.Fecha, actual.Hora)) {
        return res.status(400).json({ error: 'No puedes cancelar una cita que ya paso.' })
      }
    }

    const sets = []
    const valores = []
    if (Estado !== undefined) { sets.push('Estado=?'); valores.push(Estado) }
    if (Observaciones !== undefined) { sets.push('Observaciones=?'); valores.push(Observaciones) }
    valores.push(actual.ID_cita)

    await consultar('UPDATE cita SET ' + sets.join(', ') + ' WHERE ID_cita=?', valores)

    try { await notifSync.sincronizarCita(actual.ID_cita) } catch (e) { console.error('Sync notificacion cita:', e.message) }
    if (Estado === 'Cancelada' && actual.Estado !== 'Cancelada' && !esVeterinario(req)) {
      notificarCancelacionAlVeterinario(actual)
    }
    res.json({ message: 'Cita actualizada parcialmente' })
  } catch (err) {
    responderError(res, err)
  }
}

// ELIMINAR CITA - Solo admin
async function deleteAppointment(req, res) {
  try {
    await consultar('DELETE FROM cita WHERE ID_cita=?', [req.params.id])
    try { await notifSync.quitar('cita', req.params.id) } catch (e) { console.error('Sync notificacion cita:', e.message) }
    res.json({ message: 'Cita eliminada' })
  } catch (err) {
    responderError(res, err)
  }
}

module.exports = {
  getAppointments,
  getHorasOcupadas,
  createAppointment,
  updateAppointment,
  patchAppointment,
  deleteAppointment
}
