// MIDDLEWARES PARA VETERINARIOS
const db = require('../config/database')

// CARGAR DATOS DEL VETERINARIO - Obtiene perfil del veterinario logueado
function cargarVeterinario(req, res, next) {
  if (req.usuario.Rol !== 'veterinario') return next()
  db.query(
    'SELECT ID_veterinario, Cargo, Especialidad FROM veterinario WHERE ID_usuario = ?',
    [req.usuario.ID_usuario],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      if (rows.length === 0) {
        return res.status(403).json({ error: 'No se encontro perfil de veterinario asociado.' })
      }
      req.veterinario = rows[0]
      next()
    }
  )
}

// VERIFICAR QUIEN ATENDIO LA MASCOTA - Solo puede modificar planes de mascotas que atendio
function verificarVetAtendioMascotaServicio(req, res, next) {
  if (req.usuario.Rol !== 'veterinario') return next()

  const verificar = (idMascota, idServicio) => {
    db.query(
      'SELECT 1 FROM cita WHERE ID_veterinario = ? AND ID_mascota = ? AND ID_servicio = ? LIMIT 1',
      [req.veterinario.ID_veterinario, idMascota, idServicio],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message })
        if (rows.length === 0) {
          return res.status(403).json({
            error: 'Solo puedes modificar planes de alimentacion de mascotas y servicios que has atendido.'
          })
        }
        next()
      }
    )
  }

  // Si es actualizacion (tiene ID), obtener datos del plan primero
  if (req.params.id) {
    db.query(
      'SELECT ID_mascota, ID_servicio FROM planalimentacion WHERE ID_planAlimentacion = ?',
      [req.params.id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message })
        if (rows.length === 0) return res.status(404).json({ error: 'Plan no encontrado' })
        verificar(rows[0].ID_mascota, rows[0].ID_servicio)
      }
    )
    return
  }

  // Si es creacion, los datos vienen en el body
  verificar(req.body.ID_mascota, req.body.ID_servicio)
}

module.exports = { cargarVeterinario, verificarVetAtendioMascotaServicio }