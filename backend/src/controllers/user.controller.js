// CONTROLADOR DE USUARIOS - CRUD de usuarios (solo admin)
const db = require('../config/database')
const bcrypt = require('bcrypt')

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
  const { Nombre, Correo, Telefono, Contrasena, Rol } = req.body
  if (!Nombre || !Correo || !Contrasena || !Rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }
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