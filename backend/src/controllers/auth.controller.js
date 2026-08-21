// CONTROLADOR DE AUTENTICACION - Login, registro y recuperacion de contraseña
const db = require('../config/database')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')

const JWT_SECRET = process.env.JWT_SECRET
const SALT_ROUNDS = 10
const resetTokens = new Map() // Almacena tokens de recuperacion en memoria

// LIMITADORES - Previene ataques de fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // maximo 10 intentos
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' }
})

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // maximo 3 solicitudes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de recuperacion. Intenta de nuevo en 1 hora.' }
})

// LOGIN - Autentica usuario y genera token JWT
async function login(req, res) {
  const { Correo, Contrasena } = req.body
  try {
    db.query(
      'SELECT ID_usuario, Nombre, Correo, Telefono, Rol, Contrasena FROM usuario WHERE Correo=?',
      [Correo],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        if (results.length === 0) {
          return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        }
        const usuario = results[0]
        
        // Verificar contraseña (soporta hash bcrypt o texto plano)
        let isPasswordValid = false
        const storedPassword = usuario.Contrasena || ''
        if (storedPassword.startsWith('$2')) {
          isPasswordValid = await bcrypt.compare(Contrasena, storedPassword)
        } else {
          isPasswordValid = Contrasena === storedPassword
        }
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        }
        
        // Migrar contraseña a bcrypt si esta en texto plano
        if (!storedPassword.startsWith('$2')) {
          const newHash = await bcrypt.hash(Contrasena, SALT_ROUNDS)
          db.query('UPDATE usuario SET Contrasena=? WHERE ID_usuario=?', [newHash, usuario.ID_usuario], (err) => {
            if (err) console.error('Error actualizando hash:', err.message)
          })
        }
        
        // Datos del usuario sin contraseña
        const usuarioSeguro = {
          ID_usuario: usuario.ID_usuario,
          Nombre: usuario.Nombre,
          Correo: usuario.Correo,
          Telefono: usuario.Telefono,
          Rol: usuario.Rol
        }
        
        // Generar token JWT
        const token = jwt.sign(
          {
            ID_usuario: usuario.ID_usuario,
            Nombre: usuario.Nombre,
            Correo: usuario.Correo,
            Rol: usuario.Rol
          },
          JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        )
        res.json({ message: 'Login exitoso', token, usuario: usuarioSeguro })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el login' })
  }
}

// LOGIN ADMIN - Solo para administradores y veterinarios (acceso al panel)
async function loginAdmin(req, res) {
  const { Correo, Contrasena } = req.body
  try {
    db.query(
      'SELECT ID_usuario, Nombre, Correo, Telefono, Rol, Contrasena FROM usuario WHERE Correo=?',
      [Correo],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        if (results.length === 0) {
          return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        }
        const usuario = results[0]
        
        // Verificar contraseña
        let isPasswordValid = false
        const storedPassword = usuario.Contrasena || ''
        if (storedPassword.startsWith('$2')) {
          isPasswordValid = await bcrypt.compare(Contrasena, storedPassword)
        } else {
          isPasswordValid = Contrasena === storedPassword
        }
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        }
        
        // Solo admins y veterinarios pueden acceder al panel
        if (usuario.Rol !== 'administrador' && usuario.Rol !== 'veterinario') {
          return res.status(403).json({ error: 'Esta cuenta no tiene permisos de acceso al panel.' })
        }
        
        // Migrar contraseña si es necesario
        if (!storedPassword.startsWith('$2')) {
          const newHash = await bcrypt.hash(Contrasena, SALT_ROUNDS)
          db.query('UPDATE usuario SET Contrasena=? WHERE ID_usuario=?', [newHash, usuario.ID_usuario], (err) => {
            if (err) console.error('Error actualizando hash:', err.message)
          })
        }
        
        const usuarioSeguro = {
          ID_usuario: usuario.ID_usuario,
          Nombre: usuario.Nombre,
          Correo: usuario.Correo,
          Telefono: usuario.Telefono,
          Rol: usuario.Rol
        }
        
        // Token con expiracion mas corta para admin
        const token = jwt.sign(
          {
            ID_usuario: usuario.ID_usuario,
            Nombre: usuario.Nombre,
            Correo: usuario.Correo,
            Rol: usuario.Rol
          },
          JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        )
        res.json({ message: 'Login admin exitoso', token, usuario: usuarioSeguro })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el login' })
  }
}

// FORGOT PASSWORD - Genera token de recuperacion
async function forgotPassword(req, res) {
  const { Correo } = req.body
  if (!Correo) return res.status(400).json({ error: 'Correo requerido' })
  db.query('SELECT ID_usuario, Nombre, Telefono FROM usuario WHERE Correo=?', [Correo], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    if (results.length === 0) {
      return res.json({
        message: 'Si el correo esta registrado, recibiras las instrucciones de recuperacion.'
      })
    }
    const usuario = results[0]
    // Generar token aleatorio de 32 bytes
    const token = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + 3600000 // 1 hora de validez
    resetTokens.set(token, { ID_usuario: usuario.ID_usuario, expires })
    console.log('[DEV] Token de reset para', Correo, ':', token)
    res.json({
      message: 'Si el correo esta registrado, recibiras las instrucciones de recuperacion.',
      token,
      info: 'Usa este token en /api/reset-password con la nueva contrasena'
    })
  })
}

// RESET PASSWORD - Cambia la contraseña usando el token
async function resetPassword(req, res) {
  const { token, nuevaContrasena } = req.body
  if (!token || !nuevaContrasena) {
    return res.status(400).json({ error: 'Token y nueva contrasena requeridos' })
  }
  if (nuevaContrasena.length < 6) {
    return res.status(400).json({ error: 'Contrasena debe tener al menos 6 caracteres' })
  }
  const tokenData = resetTokens.get(token)
  if (!tokenData) return res.status(400).json({ error: 'Token invalido' })
  if (Date.now() > tokenData.expires) {
    resetTokens.delete(token)
    return res.status(400).json({ error: 'Token expirado' })
  }
  try {
    const hashedPassword = await bcrypt.hash(nuevaContrasena, SALT_ROUNDS)
    db.query('UPDATE usuario SET Contrasena=? WHERE ID_usuario=?', [hashedPassword, tokenData.ID_usuario], (err) => {
      if (err) return res.status(500).json({ error: err.message })
      resetTokens.delete(token)
      res.json({ message: 'Contrasena actualizada exitosamente' })
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar contrasena' })
  }
}

module.exports = {
  login,
  loginAdmin,
  forgotPassword,
  resetPassword,
  loginLimiter,
  forgotPasswordLimiter
}