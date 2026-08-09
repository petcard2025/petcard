// CONTROLADOR DE ADMINISTRADORES - Lista de administradores
const db = require('../config/database')

// OBTENER TODOS LOS ADMINISTRADORES - Con sus datos de usuario
async function getAdmins(req, res) {
  db.query(
    `SELECT a.ID_administrador, a.Cargo, a.Area, a.Permisos, u.Nombre, u.Correo
     FROM administrador a JOIN usuario u ON a.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
}

module.exports = { getAdmins }