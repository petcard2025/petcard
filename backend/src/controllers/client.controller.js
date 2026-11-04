// CONTROLADOR DE CLIENTES - Gestion de clientes (relacion usuario-cliente)
const db = require('../config/database')

// OBTENER TODOS LOS CLIENTES - Solo admin
async function getClients(req, res) {
  db.query(
    `SELECT c.ID_cliente, c.Direccion, u.Nombre, u.Correo, u.Telefono
     FROM cliente c JOIN usuario u ON c.ID_usuario = u.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    }
  )
}

// CREAR CLIENTE - Vincula un usuario como cliente
async function createClient(req, res) {
  const { Direccion, ID_usuario } = req.body
  db.query('INSERT INTO cliente (Direccion, ID_usuario) VALUES (?,?)', [Direccion, ID_usuario], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ ID_cliente: result.insertId, Direccion, ID_usuario })
  })
}

// OBTENER CLIENTE POR USUARIO - Busca cliente por ID de usuario
async function getClientByUser(req, res) {
  db.query('SELECT * FROM cliente WHERE ID_usuario=?', [req.params.id_usuario], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
}

module.exports = { getClients, createClient, getClientByUser }