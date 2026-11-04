// CONTROLADOR DE AUTENTICACION - Login, registro y recuperacion de contraseña
const db = require('../config/database')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const { enviarCorreoRecuperacion } = require('../../mailer')

const JWT_SECRET = process.env.JWT_SECRET
const SALT_ROUNDS = 10
const resetTokens = new Map()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' }
})

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de recuperacion. Intenta de nuevo en 1 hora.' }
})

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
        if (usuario.Rol !== 'administrador' && usuario.Rol !== 'veterinario') {
          return res.status(403).json({ error: 'Esta cuenta no tiene permisos de acceso al panel.' })
        }
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

    // 🔥 Generar codigo de 6 digitos (facil de copiar)
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 300000 // 5 minutos
    resetTokens.set(codigo, { ID_usuario: usuario.ID_usuario, expires })

    try {
      const resultado = await enviarCorreoRecuperacion(Correo, codigo)
      if (resultado.success) {
        console.log(`Codigo ${codigo} enviado a: ${Correo}`)
      } else {
        console.error('Error enviando correo:', resultado.error)
      }
    } catch (mailError) {
      console.error('Error en el envio de correo:', mailError.message)
    }

    res.json({
      message: 'Si el correo esta registrado, recibiras las instrucciones de recuperacion.'
    })
  })
}

async function resetPassword(req, res) {
  const { Correo, codigo, nuevaContrasena } = req.body
  if (!codigo || !nuevaContrasena) {
    return res.status(400).json({ error: 'Codigo y nueva contrasena requeridos' })
  }
  if (nuevaContrasena.length < 6) {
    return res.status(400).json({ error: 'Contrasena debe tener al menos 6 caracteres' })
  }
  const tokenData = resetTokens.get(codigo)
  if (!tokenData) return res.status(400).json({ error: 'Codigo invalido o expirado' })
  if (Date.now() > tokenData.expires) {
    resetTokens.delete(codigo)
    return res.status(400).json({ error: 'El codigo ha expirado. Solicita uno nuevo.' })
  }

  const actualizarContrasena = () => {
    bcrypt.hash(nuevaContrasena, SALT_ROUNDS)
      .then(hashedPassword => {
        db.query('UPDATE usuario SET Contrasena=? WHERE ID_usuario=?', [hashedPassword, tokenData.ID_usuario], (err) => {
          if (err) return res.status(500).json({ error: err.message })
          resetTokens.delete(codigo)
          res.json({ message: 'Contrasena actualizada exitosamente' })
        })
      })
      .catch(error => {
        res.status(500).json({ error: 'Error al actualizar contrasena' })
      })
  }

  // Si envían Correo, validamos que el código corresponda a ese usuario
  if (Correo) {
    db.query('SELECT ID_usuario FROM usuario WHERE Correo=?', [Correo], (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      if (results.length === 0 || results[0].ID_usuario !== tokenData.ID_usuario) {
        return res.status(400).json({ error: 'El codigo no corresponde a este correo' })
      }
      actualizarContrasena()
    })
  } else {
    actualizarContrasena()
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