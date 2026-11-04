// CONTROLADOR DE ALIMENTACION - Gestion de planes nutricionales
const db = require('../config/database')

// OBTENER PLANES - Admin ve todos, veterinario solo los que atendio
async function getNutritionPlans(req, res) {
  let sql = `SELECT pa.*, m.Nombre AS Nombre_mascota, s.Nombre AS Nombre_servicio
     FROM planalimentacion pa
     JOIN mascota m ON pa.ID_mascota = m.ID_mascota
     JOIN servicio s ON pa.ID_servicio = s.ID_servicio`
  const params = []
  
  // Si es veterinario, filtrar por mascotas que atendio
  if (req.usuario.Rol === 'veterinario') {
    sql += ` WHERE EXISTS (
      SELECT 1 FROM cita ci WHERE ci.ID_mascota = pa.ID_mascota
      AND ci.ID_servicio = pa.ID_servicio AND ci.ID_veterinario = ?
    )`
    params.push(req.veterinario.ID_veterinario)
  }
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
}

// OBTENER PLANES POR MASCOTA - Historial nutricional de una mascota
async function getNutritionPlansByPet(req, res) {
  db.query('SELECT * FROM planalimentacion WHERE ID_mascota=?', [req.params.id_mascota], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
}

// CREAR PLAN - Solo si el veterinario atendio esa mascota+servicio
async function createNutritionPlan(req, res) {
  const { ID_mascota, ID_servicio, Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional } = req.body
  db.query(
    'INSERT INTO planalimentacion (ID_mascota, ID_servicio, Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [ID_mascota, ID_servicio, Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_planAlimentacion: result.insertId, ...req.body })
    }
  )
}

// ACTUALIZAR PLAN - Solo si el veterinario atendio esa mascota+servicio
async function updateNutritionPlan(req, res) {
  const { Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional } = req.body
  db.query(
    'UPDATE planalimentacion SET Tipo_dieta=?, Frecuencia=?, Alergias=?, Horario=?, Calorias=?, Suplementos=?, Comidas=?, Fecha_inicio=?, Fecha_fin=?, Observaciones=?, Diagnostico=?, Revision_nutricional=? WHERE ID_planAlimentacion=?',
    [Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Plan actualizado' })
    }
  )
}

// ELIMINAR PLAN - Solo admin
async function deleteNutritionPlan(req, res) {
  db.query('DELETE FROM planalimentacion WHERE ID_planAlimentacion=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Plan eliminado' })
  })
}

module.exports = {
  getNutritionPlans,
  getNutritionPlansByPet,
  createNutritionPlan,
  updateNutritionPlan,
  deleteNutritionPlan
}