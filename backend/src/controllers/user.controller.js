// CONTROLADOR DE USUARIOS - CRUD de usuarios (solo admin)
const db = require('../config/database')
const bcrypt = require('bcrypt')
const { validarRegistroCliente } = require('../utils/validators')

const SALT_ROUNDS = 10

// OBTENER TODOS LOS USUARIOS - Solo admin
async function getUsers(req, res) {
  db.query('SELECT ID_usuario, Nombre, Correo, Telefono, Rol FROM usuario', (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
}

// CREAR USUARIO - Registro general (puede ser usado por cualquiera)
async function createUser(req, res) {
  const { Nombre, Apellido, Correo, Telefono, Contrasena, Rol } = req.body
  if (!Nombre || !Correo || !Contrasena || !Rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  // Registro de clientes: validaciones estrictas (el frontend las repite, pero aquí no se pueden saltar)
  if (Rol === 'cliente') {
    const errorValidacion = validarRegistroCliente(req.body)
    if (errorValidacion) return res.status(400).json({ error: errorValidacion })
  }

  const apellido = String(Apellido || '').trim()
  const nombreCompleto = (String(Nombre).trim() + ' ' + apellido).trim()
  try {
    const hashedPassword = await bcrypt.hash(Contrasena, SALT_ROUNDS)
    db.query(
      'INSERT INTO usuario (Nombre, Apellido, Correo, Telefono, Contrasena, Rol) VALUES (?,?,?,?,?,?)',
      [nombreCompleto, apellido || null, Correo, Telefono, hashedPassword, Rol],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ ID_usuario: result.insertId, Nombre: nombreCompleto, Apellido: apellido, Correo, Telefono, Rol })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Error al encriptar la contrasena' })
  }
}

// ACTUALIZAR USUARIO - Solo admin
async function updateUser(req, res) {
  const { Nombre, Rol } = req.body
  db.query(
    'UPDATE usuario SET Nombre=?, Rol=? WHERE ID_usuario=?',
    [Nombre, Rol, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Usuario actualizado' })
    }
  )
}

// ELIMINAR USUARIO - Solo admin
async function deleteUser(req, res) {
  db.query('DELETE FROM usuario WHERE ID_usuario=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Usuario eliminado' })
  })
}

module.exports = { getUsers, createUser, updateUser, deleteUser }