const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// CONEXION
const db = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'petcard'
})

db.connect(err => {
  if (err) { 
    console.error('ERROR conectando a MySQL:', err.message)
    console.error('Asegúrate que MySQL esté corriendo en XAMPP')
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

app.post('/api/usuarios', (req, res) => {
  const { Nombre, Correo, Telefono, Contrasena, Rol } = req.body
  if (!Nombre || !Correo || !Contrasena || !Rol) return res.status(400).json({ error: 'Faltan campos obligatorios' })
  db.query(
    'INSERT INTO usuario (Nombre, Correo, Telefono, Contrasena, Rol) VALUES (?,?,?,?,?)',
    [Nombre, Correo, Telefono, Contrasena, Rol],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_usuario: result.insertId, Nombre, Correo, Telefono, Rol })
    }
  )
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
app.post('/api/login', (req, res) => {
  const { Correo, Contrasena } = req.body
  db.query(
    'SELECT ID_usuario, Nombre, Correo, Telefono, Rol FROM usuario WHERE Correo=? AND Contrasena=?',
    [Correo, Contrasena],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      if (results.length === 0) return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
      res.json({ message: 'Login exitoso', usuario: results[0] })
    }
  )
})

// CLIENTES
app.get('/api/clientes', (req, res) => {
  db.query(
    `SELECT c.ID_cliente, c.Direccion, u.Nombre, u.Correo, u.Telefono
     FROM cliente c
     JOIN usuario u ON c.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

app.post('/api/clientes', (req, res) => {
  const { Direccion, ID_usuario } = req.body
  db.query(
    'INSERT INTO cliente (Direccion, ID_usuario) VALUES (?,?)',
    [Direccion, ID_usuario],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_cliente: result.insertId, Direccion, ID_usuario })
    }
  )
})

// MASCOTAS
app.get('/api/mascotas', (req, res) => {
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

app.get('/api/mascotas/cliente/:id_cliente', (req, res) => {
  db.query(
    'SELECT * FROM mascota WHERE ID_cliente=?',
    [req.params.id_cliente],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

app.post('/api/mascotas', (req, res) => {
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

app.put('/api/mascotas/:id', (req, res) => {
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

app.delete('/api/mascotas/:id', (req, res) => {
  db.query('DELETE FROM mascota WHERE ID_mascota=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Mascota eliminada' })
  })
})

// VETERINARIOS
app.get('/api/veterinarios', (req, res) => {
  db.query(
    `SELECT v.ID_veterinario, v.Cargo, v.Especialidad, u.Nombre, u.Correo, u.Telefono
     FROM veterinario v
     JOIN usuario u ON v.ID_usuario = u.ID_usuario`,
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
    `SELECT ci.ID_cita, ci.Fecha, ci.Hora, ci.Motivo, ci.Observaciones,
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

app.post('/api/citas', (req, res) => {
  const { ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones } = req.body
  db.query(
    'INSERT INTO cita (ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones) VALUES (?,?,?,?,?,?,?,?)',
    [ID_cliente, ID_mascota, ID_servicio, ID_veterinario, Fecha, Hora, Motivo, Observaciones],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_cita: result.insertId, ...req.body })
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
  db.query(
    'SELECT * FROM carnetvacunas WHERE ID_mascota=?',
    [req.params.id_mascota],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

app.post('/api/vacunas', (req, res) => {
  const { ID_mascota, ID_servicio, Nombre_vacuna, Laboratorio, Lote, Fecha_aplicacion, Proxima_dosis, Reacciones, Estado, Observaciones } = req.body
  db.query(
    'INSERT INTO carnetvacunas (ID_mascota, ID_servicio, Nombre_vacuna, Laboratorio, Lote, Fecha_aplicacion, Proxima_dosis, Reacciones, Estado, Observaciones) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [ID_mascota, ID_servicio, Nombre_vacuna, Laboratorio, Lote, Fecha_aplicacion, Proxima_dosis, Reacciones, Estado, Observaciones],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_carnetVacunas: result.insertId, ...req.body })
    }
  )
})

app.put('/api/vacunas/:id', (req, res) => {
  const { Nombre_vacuna, Laboratorio, Lote, Fecha_aplicacion, Proxima_dosis, Reacciones, Estado, Observaciones } = req.body
  db.query(
    'UPDATE carnetvacunas SET Nombre_vacuna=?, Laboratorio=?, Lote=?, Fecha_aplicacion=?, Proxima_dosis=?, Reacciones=?, Estado=?, Observaciones=? WHERE ID_carnetVacunas=?',
    [Nombre_vacuna, Laboratorio, Lote, Fecha_aplicacion, Proxima_dosis, Reacciones, Estado, Observaciones, req.params.id],
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
  db.query(
    'SELECT * FROM planalimentacion WHERE ID_mascota=?',
    [req.params.id_mascota],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
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

app.post('/api/notificaciones', (req, res) => {
  const { ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal } = req.body
  db.query(
    'INSERT INTO notificacion (ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio) VALUES (?,?,?,?,?,NOW())',
    [ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_notificacion: result.insertId, ...req.body })
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
     FROM administrador a
     JOIN usuario u ON a.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
})

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('✓ Servidor corriendo en http://localhost:' + PORT)
  console.log('✓ Listo para recibir peticiones en http://localhost:' + PORT + '/api/usuarios')
})