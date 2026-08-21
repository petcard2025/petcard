// CONTROLADOR DE VACUNAS - Gestion de carnet de vacunas
const db = require('../config/database')
const { crearNotificacionAutomatica } = require('../services/notification.service')

// OBTENER TODAS LAS VACUNAS - Con datos de mascota y servicio
async function getVaccines(req, res) {
  db.query(
    `SELECT cv.*, m.Nombre AS Nombre_mascota, s.Nombre AS Nombre_servicio
     FROM carnetvacunas cv
     JOIN mascota m ON cv.ID_mascota = m.ID_mascota
     JOIN servicio s ON cv.ID_servicio = s.ID_servicio`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
}

// OBTENER VACUNAS POR MASCOTA - Historial de vacunacion de una mascota
async function getVaccinesByPet(req, res) {
  db.query('SELECT * FROM carnetvacunas WHERE ID_mascota=?', [req.params.id_mascota], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
}

// REGISTRAR VACUNA - Con notificacion automatica al dueño
async function createVaccine(req, res) {
  const { ID_mascota, ID_servicio, Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones } = req.body
  db.query(
    'INSERT INTO carnetvacunas (ID_mascota, ID_servicio, Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones) VALUES (?,?,?,?,?,?,?,?)',
    [ID_mascota, ID_servicio, Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      
      // Notificar al dueño
      try {
        db.query(
          `SELECT c.ID_usuario, m.Nombre AS Nombre_mascota
           FROM mascota m
           JOIN cliente c ON c.ID_cliente = m.ID_cliente
           WHERE m.ID_mascota = ?`,
          [ID_mascota],
          async (errQ, rows) => {
            if (!errQ && rows.length > 0) {
              const { ID_usuario, Nombre_mascota } = rows[0]
              const fechaAplicada = Fecha_aplicacion ? ' aplicada el ' + Fecha_aplicacion : ''
              const proximaDosis = Proxima_dosis ? '. Proxima dosis: ' + Proxima_dosis : ''
              const mensaje = 'Vacuna "' + Nombre_vacuna + '" registrada para ' + (Nombre_mascota || 'tu mascota') + fechaAplicada + proximaDosis + '.'
              await crearNotificacionAutomatica(ID_usuario, mensaje, 'vacuna', 'Sistema')
            }
          }
        )
      } catch (notifError) {
        console.error('Error creando notificacion de vacuna:', notifError.message)
      }
      res.json({ ID_carnetVacunas: result.insertId, ...req.body })
    }
  )
}

// ACTUALIZAR VACUNA - Edita datos de una vacuna
async function updateVaccine(req, res) {
  const { Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones } = req.body
  db.query(
    'UPDATE carnetvacunas SET Nombre_vacuna=?, Lote=?, Fecha_aplicacion=?, Proxima_dosis=?, Estado=?, Observaciones=? WHERE ID_carnetVacunas=?',
    [Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Vacuna actualizada' })
    }
  )
}

// ELIMINAR VACUNA - Elimina el registro
async function deleteVaccine(req, res) {
  db.query('DELETE FROM carnetvacunas WHERE ID_carnetVacunas=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Vacuna eliminada' })
  })
}

module.exports = { getVaccines, getVaccinesByPet, createVaccine, updateVaccine, deleteVaccine }