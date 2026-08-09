// VERIFICACION DE TOKEN Y ROLES
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

// VERIFICAR TOKEN - Protege rutas que requieren autenticacion
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token invalido o expirado.' })
  }
}

// VERIFICAR ADMINISTRADOR - Solo admins pueden pasar
function verifyAdmin(req, res, next) {
  if (!req.usuario || req.usuario.Rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' })
  }
  next()
}

module.exports = { verifyToken, verifyAdmin }