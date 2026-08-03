// CONTROLADOR DE NOTIFICACIONES - Gestion de notificaciones
const db = require('../config/database')
const { enviarSMS } = require('../services/sms.service')

// OBTENER TODAS LAS NOTIFICACIONES
async function getNotifications(req, res) {
  db.query(
    `SELECT n.*, u.Nombre AS Nombre_usuario
     FROM notificacion n
     JOIN usuario u ON n.ID_usuario = u.ID_usuario
     ORDER BY n.Fecha_envio DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
}

// CREAR NOTIFICACION - Manual (admin)
async function createNotification(req, res) {
  const { ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal } = req.body
  db.query(
    'INSERT INTO notificacion (ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio) VALUES (?,?,?,?,?,NOW())',
    [ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      const respuesta = { ID_notificacion: result.insertId, ...req.body, sms_enviado: false }
      // Si es SMS, enviar mensaje de texto
      if (Canal === 'SMS' && ID_usuario) {
        db.query('SELECT Telefono, Nombre FROM usuario WHERE ID_usuario = ?', [ID_usuario], async (errU, usuarios) => {
          if (!errU && usuarios.length > 0 && usuarios[0].Telefono) {
            const smsResultado = await enviarSMS(usuarios[0].Telefono, Mensaje)
            respuesta.sms_enviado = smsResultado.success
            if (!smsResultado.success) respuesta.sms_error = smsResultado.error
          }
          res.json(respuesta)
        })
      } else {
        res.json(respuesta)
      }
    }
  )
}

// ACTUALIZAR NOTIFICACION
async function updateNotification(req, res) {
  const { Mensaje, Tipo, Canal } = req.body
  db.query(
    'UPDATE notificacion SET Mensaje=?, Tipo=?, Canal=? WHERE ID_notificacion=?',
    [Mensaje, Tipo, Canal, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Notificacion actualizada', ID_notificacion: req.params.id })
    }
  )
}

// ELIMINAR NOTIFICACION
async function deleteNotification(req, res) {
  db.query('DELETE FROM notificacion WHERE ID_notificacion=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Notificacion eliminada' })
  })
}

// OBTENER NOTIFICACIONES POR USUARIO
async function getNotificationsByUser(req, res) {
  db.query(
    'SELECT * FROM notificacion WHERE ID_usuario = ? ORDER BY Fecha_envio DESC',
    [req.params.idUsuario],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
}

// OBTENER NOTIFICACIONES NO LEIDAS POR USUARIO
async function getUnreadNotificationsByUser(req, res) {
  db.query(
    'SELECT * FROM notificacion WHERE ID_usuario = ? AND Leida = 0 ORDER BY Fecha_envio DESC',
    [req.params.idUsuario],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
}

// OBTENER NOTIFICACION POR ID
async function getNotificationById(req, res) {
  db.query('SELECT * FROM notificacion WHERE ID_notificacion = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    if (results.length === 0) return res.status(404).json({ error: 'Notificacion no encontrada' })
    res.json(results[0])
  })
}

// MARCAR COMO LEIDA
async function markAsRead(req, res) {
  db.query(
    'UPDATE notificacion SET Leida = 1, Fecha_lectura = NOW() WHERE ID_notificacion = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Notificacion marcada como leida', ID_notificacion: req.params.id })
    }
  )
}

// MARCAR MULTIPLES COMO LEIDAS
async function markAllAsRead(req, res) {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids debe ser un array no vacio' })
  }
  const placeholders = ids.map(() => '?').join(',')
  db.query('UPDATE notificacion SET Leida = 1, Fecha_lectura = NOW() WHERE ID_notificacion IN (' + placeholders + ')', ids, (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ actualizadas: ids.length })
  })
}

// ELIMINAR MULTIPLES NOTIFICACIONES
async function deleteBulkNotifications(req, res) {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids debe ser un array no vacio' })
  }
  const placeholders = ids.map(() => '?').join(',')
  db.query('DELETE FROM notificacion WHERE ID_notificacion IN (' + placeholders + ')', ids, (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ eliminadas: ids.length })
  })
}

// ELIMINAR TODAS LAS NOTIFICACIONES DE UN USUARIO
async function deleteAllByUser(req, res) {
  db.query('DELETE FROM notificacion WHERE ID_usuario = ?', [req.params.idUsuario], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ eliminadas: result.affectedRows })
  })
}

// ESTADISTICAS GLOBALES DE NOTIFICACIONES
async function getNotificationStats(req, res) {
  db.query(
    `SELECT COUNT(*) as total,
     SUM(CASE WHEN Leida = 1 THEN 1 ELSE 0 END) as leidas,
     SUM(CASE WHEN Leida = 0 THEN 1 ELSE 0 END) as no_leidas
     FROM notificacion`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results[0])
    }
  )
}

// ESTADISTICAS DE NOTIFICACIONES POR USUARIO
async function getNotificationStatsByUser(req, res) {
  db.query(
    `SELECT COUNT(*) as total,
     SUM(CASE WHEN Leida = 1 THEN 1 ELSE 0 END) as leidas,
     SUM(CASE WHEN Leida = 0 THEN 1 ELSE 0 END) as no_leidas
     FROM notificacion WHERE ID_usuario = ?`,
    [req.params.idUsuario],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results[0])
    }
  )
}

module.exports = {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotificationsByUser,
  getUnreadNotificationsByUser,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteBulkNotifications,
  deleteAllByUser,
  getNotificationStats,
  getNotificationStatsByUser
}