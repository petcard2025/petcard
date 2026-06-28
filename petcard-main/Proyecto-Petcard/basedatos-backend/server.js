const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const twilio = require('twilio')
const jwt = require('jsonwebtoken')
const https = require('https')
const fs = require('fs')
const path = require('path')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

if (!process.env.JWT_SECRET) {
  console.error('FATAL: La variable de entorno JWT_SECRET no esta definida.')
  console.error('Agrega JWT_SECRET=<secreto-largo-y-aleatorio> en tu archivo .env')
  process.exit(1)
}
const JWT_SECRET = process.env.JWT_SECRET

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

function verifyAdmin(req, res, next) {
  if (!req.usuario || req.usuario.Rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' })
  }
  next()
}

const { google } = require('googleapis')

async function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/calendar']
  })
  const authClient = await auth.getClient()
  return google.calendar({ version: 'v3', auth: authClient })
}

async function crearEventoCalendar(cita) {
  const calendar = await getCalendarClient()
  const fechaStr = String(cita.Fecha).substring(0, 10)
  const horaStr  = String(cita.Hora).substring(0, 5)
  const fechaInicio = new Date(`${fechaStr}T${horaStr}:00`)
  if (isNaN(fechaInicio.getTime())) throw new Error(`Fecha/Hora inválida: ${fechaStr} ${horaStr}`)
  const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000)

  const event = {
    summary: `Cita PetCard — ${cita.Nombre_mascota || 'Mascota'}`,
    description: `Motivo: ${cita.Motivo || ''}\nServicio: ${cita.Nombre_servicio || ''}\nObservaciones: ${cita.Observaciones || ''}`,
    start: { dateTime: fechaInicio.toISOString(), timeZone: 'America/Bogota' },
    end:   { dateTime: fechaFin.toISOString(),   timeZone: 'America/Bogota' }
  }

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    resource: event
  })
  return response.data.id
}

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

function normalizarTelefono(telefono) {
  let num = telefono.toString().replace(/[\s\-().]/g, '')
  if (num.startsWith('+57')) {
    const digitos = num.slice(3)
    if (digitos.length === 10) return num
    return num
  }
  if (num.startsWith('57') && num.length === 12) return '+' + num
  if (num.length === 10) return '+57' + num
  if (num.startsWith('0') && num.length === 11) return '+57' + num.slice(1)
  if (num.startsWith('+')) return num
  return '+57' + num
}

async function enviarSMS(telefono, mensaje) {
  try {
    const telefonoFormateado = normalizarTelefono(telefono)
    console.log(`📞 Enviando SMS a: ${telefono} → ${telefonoFormateado}`)
    const message = await twilioClient.messages.create({
      body: mensaje,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: telefonoFormateado
    })
    console.log('✓ SMS enviado. SID:', message.sid)
    return { success: true, sid: message.sid, to: telefonoFormateado }
  } catch (error) {
    console.error('✗ Error enviando SMS:', error.message)
    return { success: false, error: error.message }
  }
}

async function crearNotificacionAutomatica(ID_usuario, mensaje, tipo, canal = 'Sistema') {
  return new Promise((resolve) => {
    db.query(
      'INSERT INTO notificacion (ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio) VALUES (?,?,?,?,?,NOW())',
      [ID_usuario, 1, mensaje, tipo, canal],
      async (err, result) => {
        if (err) {
          console.error('Error creando notificación automática:', err.message)
          return resolve({ success: false })
        }
        console.log(`🔔 Notificación automática creada (ID: ${result.insertId}) → Usuario ${ID_usuario}`)
        if (canal === 'SMS') {
          db.query('SELECT Telefono FROM usuario WHERE ID_usuario = ?', [ID_usuario], async (errU, rows) => {
            if (!errU && rows.length > 0 && rows[0].Telefono) {
              await enviarSMS(rows[0].Telefono, mensaje)
            }
            resolve({ success: true, ID_notificacion: result.insertId })
          })
        } else {
          resolve({ success: true, ID_notificacion: result.insertId })
        }
      }
    )
  })
}

const SALT_ROUNDS = 10
const resetTokens = new Map()

const app = express()

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:5173'
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.use(express.json())

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

const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petcard'
})

db.connect(err => {
  if (err) {
    console.error('ERROR conectando a MySQL:', err.message)
    console.error('Asegurate que MySQL este corriendo en XAMPP')
    return
  }
  console.log('✓ Conectado a MySQL correctamente')
})

// =============================================================
// USUARIOS
// =============================================================
app.get('/api/usuarios', verifyToken, verifyAdmin, (req, res) => {
  db.query('SELECT ID_usuario, Nombre, Correo, Telefono, Rol FROM usuario', (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

app.post('/api/usuarios', async (req, res) => {
  const { Nombre, Correo, Telefono, Contrasena, Rol } = req.body
  if (!Nombre || !Correo || !Contrasena || !Rol) return res.status(400).json({ error: 'Faltan campos obligatorios' })
  try {
    const hashedPassword = await bcrypt.hash(Contrasena, SALT_ROUNDS)
    db.query(
      'INSERT INTO usuario (Nombre, Correo, Telefono, Contrasena, Rol) VALUES (?,?,?,?,?)',
      [Nombre, Correo, Telefono, hashedPassword, Rol],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ ID_usuario: result.insertId, Nombre, Correo, Telefono, Rol })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Error al encriptar la contrasena' })
  }
})

app.put('/api/usuarios/:id', verifyToken, (req, res) => {
  const { Nombre, Correo, Telefono } = req.body
  db.query(
    'UPDATE usuario SET Nombre=?, Correo=?, Telefono=? WHERE ID_usuario=?',
    [Nombre, Correo, Telefono, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Usuario actualizado' })
    }
  )
})

app.delete('/api/usuarios/:id', verifyToken, verifyAdmin, (req, res) => {
  db.query('DELETE FROM usuario WHERE ID_usuario=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Usuario eliminado' })
  })
})

// =============================================================
// LOGIN
// =============================================================
app.post('/api/login', loginLimiter, async (req, res) => {
  const { Correo, Contrasena } = req.body
  try {
    db.query(
      'SELECT ID_usuario, Nombre, Correo, Telefono, Rol, Contrasena FROM usuario WHERE Correo=?',
      [Correo],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        if (results.length === 0) return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        const usuario = results[0]
        let isPasswordValid = false
        const storedPassword = usuario.Contrasena || ''
        if (storedPassword.startsWith('$2')) {
          isPasswordValid = await bcrypt.compare(Contrasena, storedPassword)
        } else {
          isPasswordValid = Contrasena === storedPassword
        }
        if (!isPasswordValid) return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        if (!storedPassword.startsWith('$2')) {
          const newHash = await bcrypt.hash(Contrasena, SALT_ROUNDS)
          db.query('UPDATE usuario SET Contrasena=? WHERE ID_usuario=?', [newHash, usuario.ID_usuario], (err) => {
            if (err) console.error('Error actualizando hash:', err.message)
          })
        }
        const usuarioSeguro = { ID_usuario: usuario.ID_usuario, Nombre: usuario.Nombre, Correo: usuario.Correo, Telefono: usuario.Telefono, Rol: usuario.Rol }
        const token = jwt.sign(
          { ID_usuario: usuario.ID_usuario, Nombre: usuario.Nombre, Correo: usuario.Correo, Rol: usuario.Rol },
          JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        )
        res.json({ message: 'Login exitoso', token, usuario: usuarioSeguro })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el login' })
  }
})

app.post('/api/login-admin', loginLimiter, async (req, res) => {
  const { Correo, Contrasena } = req.body
  try {
    db.query(
      'SELECT ID_usuario, Nombre, Correo, Telefono, Rol, Contrasena FROM usuario WHERE Correo=?',
      [Correo],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        if (results.length === 0) return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        const usuario = results[0]
        let isPasswordValid = false
        const storedPassword = usuario.Contrasena || ''
        if (storedPassword.startsWith('$2')) {
          isPasswordValid = await bcrypt.compare(Contrasena, storedPassword)
        } else {
          isPasswordValid = Contrasena === storedPassword
        }
        if (!isPasswordValid) return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        if (usuario.Rol !== 'administrador') return res.status(403).json({ error: 'Esta cuenta no tiene permisos de administrador.' })
        if (!storedPassword.startsWith('$2')) {
          const newHash = await bcrypt.hash(Contrasena, SALT_ROUNDS)
          db.query('UPDATE usuario SET Contrasena=? WHERE ID_usuario=?', [newHash, usuario.ID_usuario], (err) => {
            if (err) console.error('Error actualizando hash:', err.message)
          })
        }
        const usuarioSeguro = { ID_usuario: usuario.ID_usuario, Nombre: usuario.Nombre, Correo: usuario.Correo, Telefono: usuario.Telefono, Rol: usuario.Rol }
        const token = jwt.sign(
          { ID_usuario: usuario.ID_usuario, Nombre: usuario.Nombre, Correo: usuario.Correo, Rol: usuario.Rol },
          JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        )
        res.json({ message: 'Login admin exitoso', token, usuario: usuarioSeguro })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el login' })
  }
})

// =============================================================
// RECUPERACION DE CONTRASEÑA
// =============================================================
app.post('/api/forgot-password', forgotPasswordLimiter, (req, res) => {
  const { Correo } = req.body
  if (!Correo) return res.status(400).json({ error: 'Correo requerido' })
  db.query('SELECT ID_usuario, Nombre, Telefono FROM usuario WHERE Correo=?', [Correo], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    if (results.length === 0) return res.json({ message: 'Si el correo esta registrado, recibiras las instrucciones de recuperacion.' })
    const usuario = results[0]
    const token = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + 3600000
    resetTokens.set(token, { ID_usuario: usuario.ID_usuario, expires })
    console.log(`[DEV] Token de reset para ${Correo}: ${token}`)
    res.json({ message: 'Si el correo esta registrado, recibiras las instrucciones de recuperacion.', token, info: 'Usa este token en /api/reset-password con la nueva contrasena' })
  })
})

app.post('/api/reset-password', async (req, res) => {
  const { token, nuevaContrasena } = req.body
  if (!token || !nuevaContrasena) return res.status(400).json({ error: 'Token y nueva contrasena requeridos' })
  if (nuevaContrasena.length < 6) return res.status(400).json({ error: 'Contrasena debe tener al menos 6 caracteres' })
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
})

// =============================================================
// CLIENTES
// =============================================================
app.get('/api/clientes', verifyToken, verifyAdmin, (req, res) => {
  db.query(
    `SELECT c.ID_cliente, c.Direccion, u.Nombre, u.Correo, u.Telefono
     FROM cliente c JOIN usuario u ON c.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

app.post('/api/clientes', (req, res) => {
  const { Direccion, ID_usuario } = req.body
  db.query('INSERT INTO cliente (Direccion, ID_usuario) VALUES (?,?)', [Direccion, ID_usuario], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ ID_cliente: result.insertId, Direccion, ID_usuario })
  })
})

app.get('/api/clientes/usuario/:id_usuario', verifyToken, (req, res) => {
  db.query('SELECT * FROM cliente WHERE ID_usuario=?', [req.params.id_usuario], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

// =============================================================
// MASCOTAS
// =============================================================
app.get('/api/mascotas', verifyToken, verifyAdmin, (req, res) => {
  db.query(
    `SELECT m.*, u.Nombre AS Nombre_dueno
     FROM mascota m
     JOIN cliente c ON m.ID_cliente = c.ID_cliente
     JOIN usuario u ON c.ID_usuario = u.ID_usuario
     WHERE m.Estado = 'activo'`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

app.get('/api/mascotas/cliente/:id_cliente', verifyToken, (req, res) => {
  db.query('SELECT * FROM mascota WHERE ID_cliente=? AND Estado="activo"', [req.params.id_cliente], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

app.post('/api/mascotas', verifyToken, (req, res) => {
  const { ID_cliente, Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso } = req.body
  db.query(
    'INSERT INTO mascota (ID_cliente, Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso) VALUES (?,?,?,?,?,?,?,?)',
    [ID_cliente, Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_mascota: result.insertId, ...req.body })
    }
  )
})

app.put('/api/mascotas/:id', verifyToken, (req, res) => {
  const { Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso } = req.body
  db.query(
    'UPDATE mascota SET Fecha_nacimiento=?, Nombre=?, Especie=?, Sexo=?, Foto=?, Raza=?, Peso=? WHERE ID_mascota=?',
    [Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Mascota actualizada' })
    }
  )
})

app.delete('/api/mascotas/:id', verifyToken, (req, res) => {
  db.query('UPDATE mascota SET Estado="inactivo" WHERE ID_mascota=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Mascota desactivada' })
  })
})

// =============================================================
// VETERINARIOS
// =============================================================
app.get('/api/veterinarios', verifyToken, (req, res) => {
  db.query(
    `SELECT v.ID_veterinario, v.Cargo, v.Especialidad, u.Nombre, u.Correo, u.Telefono
     FROM veterinario v JOIN usuario u ON v.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

// =============================================================
// SERVICIOS
// =============================================================
app.get('/api/servicios', (req, res) => {
  db.query('SELECT * FROM servicio', (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

app.post('/api/servicios', verifyToken, verifyAdmin, (req, res) => {
  const { Nombre, Descripcion, Categoria, Precio } = req.body
  db.query(
    'INSERT INTO servicio (Nombre, Descripcion, Categoria, Precio) VALUES (?,?,?,?)',
    [Nombre, Descripcion, Categoria, Precio],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_servicio: result.insertId, ...req.body })
    }
  )
})

app.put('/api/servicios/:id', verifyToken, verifyAdmin, (req, res) => {
  const { Nombre, Descripcion, Categoria, Precio } = req.body
  db.query(
    'UPDATE servicio SET Nombre=?, Descripcion=?, Categoria=?, Precio=? WHERE ID_servicio=?',
    [Nombre, Descripcion, Categoria, Precio, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Servicio actualizado' })
    }
  )
})

app.delete('/api/servicios/:id', verifyToken, verifyAdmin, (req, res) => {
  db.query('DELETE FROM servicio WHERE ID_servicio=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Servicio eliminado' })
  })
})

// =============================================================
// CITAS
// =============================================================
app.get('/api/citas', verifyToken, (req, res) => {
  db.query(
    `SELECT ci.ID_cita, ci.ID_cliente, ci.ID_mascota, ci.ID_servicio, ci.ID_veterinario,
            ci.Fecha, ci.Hora, ci.Motivo, ci.Observaciones,
            m.Nombre AS Nombre_mascota,
            u.Nombre AS Nombre_cliente,
            s.Nombre AS Nombre_servicio,
            uv.Nombre AS Nombre_veterinario
     FROM cita ci
     JOIN mascota m ON ci.ID_mascota = m.ID_mascota
     JOIN cliente c ON ci.ID_cliente = c.ID_cliente
     JOIN usuario u ON c.ID_usuario = u.ID_usuario
     JOIN servicio s ON ci.ID_servicio = s.ID_servicio
     JOIN veterinario v ON ci.ID_veterinario = v.ID_veterinario
     JOIN usuario uv ON v.ID_usuario = uv.ID_usuario
     ORDER BY ci.Fecha DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

// ── NUEVO: Horas ocupadas por veterinario y fecha ────────────
// Debe estar ANTES del POST /api/citas para que Express no confunda la ruta
app.get('/api/citas/horas-ocupadas', verifyToken, (req, res) => {
  const { ID_veterinario, Fecha } = req.query
  if (!ID_veterinario || !Fecha) {
    return res.status(400).json({ error: 'Se requieren ID_veterinario y Fecha' })
  }
  db.query(
    'SELECT Hora FROM cita WHERE ID_veterinario = ? AND Fecha = ?',
    [ID_veterinario, Fecha],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      const horasOcupadas = results.map(r => r.Hora)
      res.json({ horasOcupadas })
    }
  )
})

app.post('/api/citas', verifyToken, async (req, res) => {
  const { ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones } = req.body

  // Verificar conflicto de horario antes de insertar
  db.query(
    'SELECT ID_cita FROM cita WHERE ID_veterinario=? AND Fecha=? AND Hora=?',
    [ID_veterinario, Fecha, Hora],
    async (errCheck, existing) => {
      if (errCheck) return res.status(500).json({ error: errCheck.message })
      if (existing.length > 0) {
        return res.status(409).json({ error: 'El veterinario ya tiene una cita agendada en esa fecha y hora.' })
      }

      db.query(
        'INSERT INTO cita (ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones) VALUES (?,?,?,?,?,?,?,?)',
        [ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones],
        async (err, result) => {
          if (err) return res.status(500).json({ error: err.message })
          const ID_cita = result.insertId

          try {
            db.query(
              `SELECT c.ID_usuario, m.Nombre AS Nombre_mascota, s.Nombre AS Nombre_servicio
               FROM cliente c
               JOIN mascota m ON m.ID_mascota = ?
               JOIN servicio s ON s.ID_servicio = ?
               WHERE c.ID_cliente = ?`,
              [ID_mascota, ID_servicio, ID_cliente],
              async (errQ, rows) => {
                if (!errQ && rows.length > 0) {
                  const { ID_usuario, Nombre_mascota, Nombre_servicio } = rows[0]
                  const mensaje = `✅ Cita agendada para ${Nombre_mascota || 'tu mascota'} — ${Nombre_servicio || Motivo || 'Consulta'} el ${Fecha} a las ${Hora}.`
                  await crearNotificacionAutomatica(ID_usuario, mensaje, 'cita', 'Sistema')
                }
              }
            )
          } catch (notifError) {
            console.error('Error creando notificación de cita:', notifError.message)
          }

          try {
            const googleEventId = await crearEventoCalendar({ Fecha, Hora, Motivo, Observaciones })
            db.query('UPDATE cita SET Google_Event_ID=? WHERE ID_cita=?', [googleEventId, ID_cita])
            res.json({ ID_cita, googleEventId, ...req.body })
          } catch (calError) {
            console.error('Error Google Calendar:', calError.message)
            res.json({ ID_cita, ...req.body, calendarError: calError.message })
          }
        }
      )
    }
  )
})

app.put('/api/citas/:id', verifyToken, (req, res) => {
  const { ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones } = req.body
  db.query(
    'UPDATE cita SET ID_servicio=?, ID_veterinario=?, Fecha=?, Hora=?, Motivo=?, Observaciones=? WHERE ID_cita=?',
    [ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Cita actualizada' })
    }
  )
})

app.patch('/api/citas/:id', verifyToken, (req, res) => {
  const campos = req.body
  const keys = Object.keys(campos)
  if (keys.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' })
  const set = keys.map(k => `${k}=?`).join(', ')
  const values = [...Object.values(campos), req.params.id]
  db.query(`UPDATE cita SET ${set} WHERE ID_cita=?`, values, (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Cita actualizada parcialmente' })
  })
})

app.delete('/api/citas/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM cita WHERE ID_cita=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Cita eliminada' })
  })
})

// =============================================================
// CARNET DE VACUNAS
// =============================================================
app.get('/api/vacunas', verifyToken, (req, res) => {
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
})

app.get('/api/vacunas/mascota/:id_mascota', verifyToken, (req, res) => {
  db.query('SELECT * FROM carnetvacunas WHERE ID_mascota=?', [req.params.id_mascota], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

app.post('/api/vacunas', verifyToken, (req, res) => {
  const { ID_mascota, ID_servicio, Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones } = req.body
  db.query(
    'INSERT INTO carnetvacunas (ID_mascota, ID_servicio, Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones) VALUES (?,?,?,?,?,?,?,?)',
    [ID_mascota, ID_servicio, Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
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
              const fechaAplicada = Fecha_aplicacion ? ` aplicada el ${Fecha_aplicacion}` : ''
              const proximaDosis = Proxima_dosis ? `. Próxima dosis: ${Proxima_dosis}` : ''
              const mensaje = `💉 Vacuna "${Nombre_vacuna}" registrada para ${Nombre_mascota || 'tu mascota'}${fechaAplicada}${proximaDosis}.`
              await crearNotificacionAutomatica(ID_usuario, mensaje, 'vacuna', 'Sistema')
            }
          }
        )
      } catch (notifError) {
        console.error('Error creando notificación de vacuna:', notifError.message)
      }
      res.json({ ID_carnetVacunas: result.insertId, ...req.body })
    }
  )
})

app.put('/api/vacunas/:id', verifyToken, (req, res) => {
  const { Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones } = req.body
  db.query(
    'UPDATE carnetvacunas SET Nombre_vacuna=?, Lote=?, Fecha_aplicacion=?, Proxima_dosis=?, Estado=?, Observaciones=? WHERE ID_carnetVacunas=?',
    [Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Vacuna actualizada' })
    }
  )
})

app.delete('/api/vacunas/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM carnetvacunas WHERE ID_carnetVacunas=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Vacuna eliminada' })
  })
})

// =============================================================
// PLAN DE ALIMENTACION
// =============================================================
app.get('/api/alimentacion', verifyToken, (req, res) => {
  db.query(
    `SELECT pa.*, m.Nombre AS Nombre_mascota, s.Nombre AS Nombre_servicio
     FROM planalimentacion pa
     JOIN mascota m ON pa.ID_mascota = m.ID_mascota
     JOIN servicio s ON pa.ID_servicio = s.ID_servicio`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

app.get('/api/alimentacion/mascota/:id_mascota', verifyToken, (req, res) => {
  db.query('SELECT * FROM planalimentacion WHERE ID_mascota=?', [req.params.id_mascota], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

app.post('/api/alimentacion', verifyToken, (req, res) => {
  const { ID_mascota, ID_servicio, Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional } = req.body
  db.query(
    'INSERT INTO planalimentacion (ID_mascota, ID_servicio, Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [ID_mascota, ID_servicio, Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_planAlimentacion: result.insertId, ...req.body })
    }
  )
})

app.put('/api/alimentacion/:id', verifyToken, (req, res) => {
  const { Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional } = req.body
  db.query(
    'UPDATE planalimentacion SET Tipo_dieta=?, Frecuencia=?, Alergias=?, Horario=?, Calorias=?, Suplementos=?, Comidas=?, Fecha_inicio=?, Fecha_fin=?, Observaciones=?, Diagnostico=?, Revision_nutricional=? WHERE ID_planAlimentacion=?',
    [Tipo_dieta, Frecuencia, Alergias, Horario, Calorias, Suplementos, Comidas, Fecha_inicio, Fecha_fin, Observaciones, Diagnostico, Revision_nutricional, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Plan actualizado' })
    }
  )
})

app.delete('/api/alimentacion/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM planalimentacion WHERE ID_planAlimentacion=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Plan eliminado' })
  })
})

// =============================================================
// NOTIFICACIONES
// =============================================================
app.get('/api/notificaciones', verifyToken, (req, res) => {
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
})

app.post('/api/notificaciones', verifyToken, async (req, res) => {
  const { ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal } = req.body
  db.query(
    'INSERT INTO notificacion (ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio) VALUES (?,?,?,?,?,NOW())',
    [ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      const respuesta = { ID_notificacion: result.insertId, ...req.body, sms_enviado: false }
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
})

app.put('/api/notificaciones/:id', verifyToken, (req, res) => {
  const { Mensaje, Tipo, Canal } = req.body
  db.query(
    'UPDATE notificacion SET Mensaje=?, Tipo=?, Canal=? WHERE ID_notificacion=?',
    [Mensaje, Tipo, Canal, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Notificación actualizada', ID_notificacion: req.params.id })
    }
  )
})

app.delete('/api/notificaciones/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM notificacion WHERE ID_notificacion=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Notificacion eliminada' })
  })
})

app.get('/api/notificaciones/usuario/:idUsuario', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM notificacion WHERE ID_usuario = ? ORDER BY Fecha_envio DESC',
    [req.params.idUsuario],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

app.get('/api/notificaciones/usuario/:idUsuario/no-leidas', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM notificacion WHERE ID_usuario = ? AND Leida = 0 ORDER BY Fecha_envio DESC',
    [req.params.idUsuario],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

app.get('/api/notificaciones/:id', verifyToken, (req, res) => {
  db.query('SELECT * FROM notificacion WHERE ID_notificacion = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    if (results.length === 0) return res.status(404).json({ error: 'Notificación no encontrada' })
    res.json(results[0])
  })
})

app.patch('/api/notificaciones/:id/marcar-como-leida', verifyToken, (req, res) => {
  db.query(
    'UPDATE notificacion SET Leida = 1, Fecha_lectura = NOW() WHERE ID_notificacion = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Notificación marcada como leída', ID_notificacion: req.params.id })
    }
  )
})

app.patch('/api/notificaciones/marcar-como-leidas/bulk', verifyToken, (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids debe ser un array no vacío' })
  const placeholders = ids.map(() => '?').join(',')
  db.query(`UPDATE notificacion SET Leida = 1, Fecha_lectura = NOW() WHERE ID_notificacion IN (${placeholders})`, ids, (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ actualizadas: ids.length })
  })
})

app.delete('/api/notificaciones/bulk', verifyToken, (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids debe ser un array no vacío' })
  const placeholders = ids.map(() => '?').join(',')
  db.query(`DELETE FROM notificacion WHERE ID_notificacion IN (${placeholders})`, ids, (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ eliminadas: ids.length })
  })
})

app.delete('/api/notificaciones/usuario/:idUsuario/todas', verifyToken, (req, res) => {
  db.query('DELETE FROM notificacion WHERE ID_usuario = ?', [req.params.idUsuario], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ eliminadas: result.affectedRows })
  })
})

app.get('/api/notificaciones/estadisticas', verifyToken, (req, res) => {
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
})

app.get('/api/notificaciones/usuario/:idUsuario/estadisticas', verifyToken, (req, res) => {
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
})

// =============================================================
// ADMINISTRADOR
// =============================================================
app.get('/api/administradores', verifyToken, verifyAdmin, (req, res) => {
  db.query(
    `SELECT a.ID_administrador, a.Cargo, a.Area, a.Permisos, u.Nombre, u.Correo
     FROM administrador a JOIN usuario u ON a.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

// =============================================================
// SMS TWILIO
// =============================================================
app.post('/api/sms/enviar', verifyToken, verifyAdmin, async (req, res) => {
  const { telefono, mensaje } = req.body
  if (!telefono || !mensaje) return res.status(400).json({ error: 'Se requieren telefono y mensaje' })
  const resultado = await enviarSMS(telefono, mensaje)
  if (resultado.success) {
    res.json({ message: 'SMS enviado exitosamente', sid: resultado.sid })
  } else {
    res.status(500).json({ error: 'Error enviando SMS: ' + resultado.error })
  }
})

app.post('/api/sms/confirmar-cita', verifyToken, verifyAdmin, async (req, res) => {
  const { ID_cita } = req.body
  if (!ID_cita) return res.status(400).json({ error: 'ID_cita requerido' })
  db.query(
    `SELECT ci.Fecha, ci.Hora, m.Nombre AS Nombre_mascota,
            u.Nombre AS Nombre_cliente, u.Telefono,
            s.Nombre AS Nombre_servicio, uv.Nombre AS Nombre_veterinario
     FROM cita ci
     JOIN mascota m ON ci.ID_mascota = m.ID_mascota
     JOIN cliente c ON ci.ID_cliente = c.ID_cliente
     JOIN usuario u ON c.ID_usuario = u.ID_usuario
     JOIN servicio s ON ci.ID_servicio = s.ID_servicio
     JOIN veterinario v ON ci.ID_veterinario = v.ID_veterinario
     JOIN usuario uv ON v.ID_usuario = uv.ID_usuario
     WHERE ci.ID_cita = ?`,
    [ID_cita],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      if (results.length === 0) return res.status(404).json({ error: 'Cita no encontrada' })
      const cita = results[0]
      if (!cita.Telefono) return res.status(400).json({ error: 'El cliente no tiene telefono registrado' })
      const mensaje =
        `PetCard: Hola ${cita.Nombre_cliente}! Su cita para ${cita.Nombre_mascota} ` +
        `ha sido confirmada. Servicio: ${cita.Nombre_servicio}. ` +
        `Fecha: ${new Date(cita.Fecha).toLocaleDateString('es-CO')} a las ${cita.Hora}. ` +
        `Veterinario: ${cita.Nombre_veterinario}.`
      const resultado = await enviarSMS(cita.Telefono, mensaje)
      if (resultado.success) {
        res.json({ message: 'SMS de confirmacion enviado', sid: resultado.sid })
      } else {
        res.status(500).json({ error: 'Error enviando SMS: ' + resultado.error })
      }
    }
  )
})

app.post('/api/sms/recordatorio-vacuna', verifyToken, verifyAdmin, async (req, res) => {
  const { ID_carnetVacunas } = req.body
  if (!ID_carnetVacunas) return res.status(400).json({ error: 'ID_carnetVacunas requerido' })
  db.query(
    `SELECT cv.Nombre_vacuna, cv.Proxima_dosis,
            m.Nombre AS Nombre_mascota,
            u.Nombre AS Nombre_cliente, u.Telefono
     FROM carnetvacunas cv
     JOIN mascota m ON cv.ID_mascota = m.ID_mascota
     JOIN cliente c ON m.ID_cliente = c.ID_cliente
     JOIN usuario u ON c.ID_usuario = u.ID_usuario
     WHERE cv.ID_carnetVacunas = ?`,
    [ID_carnetVacunas],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      if (results.length === 0) return res.status(404).json({ error: 'Vacuna no encontrada' })
      const vacuna = results[0]
      if (!vacuna.Telefono) return res.status(400).json({ error: 'El cliente no tiene telefono registrado' })
      const mensaje =
        `PetCard: Hola ${vacuna.Nombre_cliente}! Recordatorio: ` +
        `${vacuna.Nombre_mascota} tiene pendiente la vacuna "${vacuna.Nombre_vacuna}". ` +
        `Proxima dosis: ${new Date(vacuna.Proxima_dosis).toLocaleDateString('es-CO')}. ` +
        `No olvides agendar tu cita!`
      const resultado = await enviarSMS(vacuna.Telefono, mensaje)
      if (resultado.success) {
        res.json({ message: 'Recordatorio SMS enviado', sid: resultado.sid })
      } else {
        res.status(500).json({ error: 'Error enviando SMS: ' + resultado.error })
      }
    }
  )
})

// =============================================================
// INICIAR SERVIDOR
// =============================================================
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

if (NODE_ENV === 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en el puerto ${PORT} (HTTP interno)`)
    console.log('IMPORTANTE: verifica que el proxy/hosting este sirviendo HTTPS hacia afuera.')
  })
} else {
  const keyPath = process.env.SSL_KEY_PATH || './certs/cert.key'
  const certPath = process.env.SSL_CERT_PATH || './certs/cert.crt'

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('No se encontraron los certificados SSL de desarrollo.')
    console.error(`Se esperaban en: ${keyPath} y ${certPath}`)
    console.error('Generalos corriendo: npm run certs')
    process.exit(1)
  }

  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  }

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🔒 Servidor HTTPS de desarrollo corriendo en https://localhost:${PORT}`)
    console.log('✓ Listo para recibir peticiones en https://localhost:' + PORT + '/api/usuarios')
  })
}