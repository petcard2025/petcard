const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const twilio = require('twilio')
const jwt = require('jsonwebtoken')
const https = require('https')
const fs = require('fs')
require('dotenv').config()
 
// ===== JWT - AUTENTICACION POR TOKEN =====
 
const JWT_SECRET = process.env.JWT_SECRET || 'petcard_secret_key_2024'
 
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
 
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' })
  }
 
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token invalido o expirado.' })
  }
}
 
 
// ===== GOOGLE CALENDAR =====
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
  const fechaInicio = new Date(`${cita.Fecha}T${cita.Hora}`)
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
 
// ===== TWILIO - SERVICIO DE SMS =====
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
 
  if (num.startsWith('57') && num.length === 12) {
    return '+' + num
  }
 
  if (num.length === 10) {
    return '+57' + num
  }
 
  if (num.startsWith('0') && num.length === 11) {
    return '+57' + num.slice(1)
  }
 
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
 
// ===== ENCRIPTACION =====
const SALT_ROUNDS = 10
const resetTokens = new Map()
 
const app = express()
app.use(cors())
app.use(express.json())
 
// CONEXION
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
 
// USUARIOS
app.get('/api/usuarios', (req, res) => {
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
 
app.put('/api/usuarios/:id', (req, res) => {
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
 
app.delete('/api/usuarios/:id', (req, res) => {
  db.query('DELETE FROM usuario WHERE ID_usuario=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Usuario eliminado' })
  })
})
 
// LOGIN
app.post('/api/login', async (req, res) => {
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
          { ID_usuario: usuario.ID_usuario, Correo: usuario.Correo, Rol: usuario.Rol },
          JWT_SECRET,
          { expiresIn: '8h' }
        )
 
        res.json({ message: 'Login exitoso', usuario: usuarioSeguro, token })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el login' })
  }
})
 
// FORGOT PASSWORD
app.post('/api/forgot-password', (req, res) => {
  const { Correo } = req.body
  if (!Correo) return res.status(400).json({ error: 'Correo requerido' })
  db.query('SELECT ID_usuario, Nombre FROM usuario WHERE Correo=?', [Correo], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    const usuario = results[0]
    const token = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + 3600000
    resetTokens.set(token, { ID_usuario: usuario.ID_usuario, expires })
    res.json({
      message: 'Token de reset generado.',
      token: token,
      info: 'Usa este token en /api/reset-password con la nueva contrasena'
    })
  })
})
 
// RESET PASSWORD
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
 
// CLIENTES
app.get('/api/clientes', (req, res) => {
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
 
app.get('/api/clientes/usuario/:id_usuario', (req, res) => {
  db.query('SELECT * FROM cliente WHERE ID_usuario=?', [req.params.id_usuario], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})
 
// MASCOTAS
app.get('/api/mascotas', verifyToken, (req, res) => {
  db.query(
    `SELECT m.*, u.Nombre AS Nombre_dueno
     FROM mascota m
     JOIN cliente c ON m.ID_cliente = c.ID_cliente
     JOIN usuario u ON c.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})
 
app.get('/api/mascotas/cliente/:id_cliente', verifyToken, (req, res) => {
  db.query('SELECT * FROM mascota WHERE ID_cliente=?', [req.params.id_cliente], (err, results) => {
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
  db.query('DELETE FROM mascota WHERE ID_mascota=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Mascota eliminada' })
  })
})
 
// VETERINARIOS
app.get('/api/veterinarios', (req, res) => {
  db.query(
    `SELECT v.ID_veterinario, v.Cargo, v.Especialidad, u.Nombre, u.Correo, u.Telefono
     FROM veterinario v JOIN usuario u ON v.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})
 
// SERVICIOS
app.get('/api/servicios', (req, res) => {
  db.query('SELECT * FROM servicio', (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})
 
app.post('/api/servicios', (req, res) => {
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
 
app.put('/api/servicios/:id', (req, res) => {
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
 
app.delete('/api/servicios/:id', (req, res) => {
  db.query('DELETE FROM servicio WHERE ID_servicio=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Servicio eliminado' })
  })
})
 
// CITAS
app.get('/api/citas', (req, res) => {
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
 
app.post('/api/citas', async (req, res) => {
  const { ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones } = req.body
  db.query(
    'INSERT INTO cita (ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones) VALUES (?,?,?,?,?,?,?,?)',
    [ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
 
      const ID_cita = result.insertId
 
      try {
        const googleEventId = await crearEventoCalendar({
          Fecha, Hora, Motivo, Observaciones
        })
        db.query('UPDATE cita SET Google_Event_ID=? WHERE ID_cita=?',
                 [googleEventId, ID_cita])
        res.json({ ID_cita, googleEventId, ...req.body })
      } catch (calError) {
        console.error('Error Google Calendar:', calError.message)
        res.json({ ID_cita, ...req.body, calendarError: calError.message })
      }
    }
  )
})
 
app.put('/api/citas/:id', (req, res) => {
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
 
app.delete('/api/citas/:id', (req, res) => {
  db.query('DELETE FROM cita WHERE ID_cita=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Cita eliminada' })
  })
})
 
// CARNET DE VACUNAS
app.get('/api/vacunas', (req, res) => {
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
 
app.get('/api/vacunas/mascota/:id_mascota', (req, res) => {
  db.query('SELECT * FROM carnetvacunas WHERE ID_mascota=?', [req.params.id_mascota], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})
 
app.post('/api/vacunas', (req, res) => {
  const { ID_mascota, ID_servicio, Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones } = req.body
  db.query(
    'INSERT INTO carnetvacunas (ID_mascota, ID_servicio, Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones) VALUES (?,?,?,?,?,?,?,?)',
    [ID_mascota, ID_servicio, Nombre_vacuna, Lote, Fecha_aplicacion, Proxima_dosis, Estado, Observaciones],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_carnetVacunas: result.insertId, ...req.body })
    }
  )
})
 
app.put('/api/vacunas/:id', (req, res) => {
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
 
app.delete('/api/vacunas/:id', (req, res) => {
  db.query('DELETE FROM carnetvacunas WHERE ID_carnetVacunas=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Vacuna eliminada' })
  })
})
 
// PLAN DE ALIMENTACION
app.get('/api/alimentacion', (req, res) => {
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
 
app.get('/api/alimentacion/mascota/:id_mascota', (req, res) => {
  db.query('SELECT * FROM planalimentacion WHERE ID_mascota=?', [req.params.id_mascota], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})
 
app.post('/api/alimentacion', (req, res) => {
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
 
app.put('/api/alimentacion/:id', (req, res) => {
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
 
app.delete('/api/alimentacion/:id', (req, res) => {
  db.query('DELETE FROM planalimentacion WHERE ID_planAlimentacion=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Plan eliminado' })
  })
})
 
// NOTIFICACIONES
app.get('/api/notificaciones', (req, res) => {
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
 
app.post('/api/notificaciones', async (req, res) => {
  const { ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal } = req.body
 
  db.query(
    'INSERT INTO notificacion (ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio) VALUES (?,?,?,?,?,NOW())',
    [ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
 
      const respuesta = { ID_notificacion: result.insertId, ...req.body, sms_enviado: false }
 
      if (Canal === 'SMS' && ID_usuario) {
        db.query(
          'SELECT Telefono, Nombre FROM usuario WHERE ID_usuario = ?',
          [ID_usuario],
          async (errU, usuarios) => {
            if (!errU && usuarios.length > 0 && usuarios[0].Telefono) {
              const smsResultado = await enviarSMS(usuarios[0].Telefono, Mensaje)
              respuesta.sms_enviado = smsResultado.success
              if (!smsResultado.success) {
                respuesta.sms_error = smsResultado.error
              }
            }
            res.json(respuesta)
          }
        )
      } else {
        res.json(respuesta)
      }
    }
  )
})
 
app.delete('/api/notificaciones/:id', (req, res) => {
  db.query('DELETE FROM notificacion WHERE ID_notificacion=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Notificacion eliminada' })
  })
})
 
// ADMINISTRADOR
app.get('/api/administradores', (req, res) => {
  db.query(
    `SELECT a.ID_administrador, a.Cargo, a.Area, a.Permisos, u.Nombre, u.Correo
     FROM administrador a JOIN usuario u ON a.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})
 
// ===== ENDPOINTS SMS TWILIO =====
 
app.post('/api/sms/enviar', async (req, res) => {
  const { telefono, mensaje } = req.body
  if (!telefono || !mensaje) return res.status(400).json({ error: 'Se requieren telefono y mensaje' })
  const resultado = await enviarSMS(telefono, mensaje)
  if (resultado.success) {
    res.json({ message: 'SMS enviado exitosamente', sid: resultado.sid })
  } else {
    res.status(500).json({ error: 'Error enviando SMS: ' + resultado.error })
  }
})
 
app.post('/api/sms/confirmar-cita', async (req, res) => {
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
 
app.post('/api/sms/recordatorio-vacuna', async (req, res) => {
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
 
// ===== INICIAR SERVIDOR CON HTTPS =====
const PORT = process.env.PORT || 3001

try {
  const sslOptions = {
    key: fs.readFileSync('./cert.key'),
    cert: fs.readFileSync('./cert.crt')
  }
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log('✓ Servidor HTTPS corriendo en https://localhost:' + PORT)
    console.log('✓ Listo para recibir peticiones en https://localhost:' + PORT + '/api/usuarios')
  })
} catch (sslError) {
  console.error('✗ No se pudo cargar el certificado SSL:', sslError.message)
  console.log('⚠ Iniciando en HTTP como fallback en http://localhost:' + PORT)
  app.listen(PORT, () => {
    console.log('✓ Servidor HTTP corriendo en http://localhost:' + PORT)
  })
}