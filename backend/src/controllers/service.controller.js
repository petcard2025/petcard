// CONTROLADOR DE SERVICIOS - CRUD de servicios (solo admin)
const db = require('../config/database')
const { validarServicio } = require('../utils/validators')

// 23503 = llave foránea en PostgreSQL; ER_ROW_IS_REFERENCED_2 = equivalente en MySQL
const esServicioEnUso = (err) => err.code === '23503' || err.code === 'ER_ROW_IS_REFERENCED_2'

// OBTENER TODOS LOS SERVICIOS - Publico (sin autenticacion)
async function getServices(req, res) {
  db.query('SELECT * FROM servicio', (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
}

// CREAR SERVICIO - Solo admin
async function createService(req, res) {
  const errorServicio = validarServicio(req.body)
  if (errorServicio) return res.status(400).json({ error: errorServicio })
  const { Nombre, Descripcion, Categoria, Precio } = req.body
  db.query(
    'INSERT INTO servicio (Nombre, Descripcion, Categoria, Precio) VALUES (?,?,?,?)',
    [Nombre, Descripcion, Categoria, Precio === undefined || Precio === '' ? null : Precio],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_servicio: result.insertId, ...req.body })
    }
  )
}

// ACTUALIZAR SERVICIO - Solo admin
async function updateService(req, res) {
  const errorServicio = validarServicio(req.body)
  if (errorServicio) return res.status(400).json({ error: errorServicio })
  const { Nombre, Descripcion, Categoria, Precio } = req.body
  db.query(
    'UPDATE servicio SET Nombre=?, Descripcion=?, Categoria=?, Precio=COALESCE(?, Precio) WHERE ID_servicio=?',
    [Nombre, Descripcion, Categoria, Precio === undefined || Precio === '' ? null : Precio, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Servicio actualizado' })
    }
  )
}

// ELIMINAR SERVICIO - Solo admin
async function deleteService(req, res) {
  db.query('DELETE FROM servicio WHERE ID_servicio=?', [req.params.id], (err) => {
    if (err) {
      if (esServicioEnUso(err)) {
        return res.status(409).json({ error: 'No se puede eliminar: el servicio tiene citas, vacunas o planes asociados.' })
      }
      return res.status(500).json({ error: err.message })
    }
    res.json({ message: 'Servicio eliminado' })
  })
}

module.exports = { getServices, createService, updateService, deleteService }