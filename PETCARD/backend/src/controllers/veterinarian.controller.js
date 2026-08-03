// CONTROLADOR DE VETERINARIOS - Lista de veterinarios
const db = require('../config/database')

// OBTENER TODOS LOS VETERINARIOS - Con sus datos de usuario
async function getVeterinarians(req, res) {
  db.query(
    `SELECT v.ID_veterinario, v.Cargo, v.Especialidad, u.Nombre, u.Correo, u.Telefono
     FROM veterinario v JOIN usuario u ON v.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
}

module.exports = { getVeterinarians }