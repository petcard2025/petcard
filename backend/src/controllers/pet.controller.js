// CONTROLADOR DE MASCOTAS - CRUD de mascotas
const db = require('../config/database')

// OBTENER TODAS LAS MASCOTAS - Solo admin (activas)
async function getPets(req, res) {
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
}

// CATALOGO PARA PLANES DE ALIMENTACION - veterinarios y administradores
// Devuelve todas las mascotas activas con peso, edad y nombre del dueño (sin contacto).
// Unifica cómo está escrita la especie ("perro", "Hámster", "Cuy"...) para agruparla bien.
const ALIAS_ESPECIE = {
  perro: 'Perro', perros: 'Perro', canino: 'Perro',
  gato: 'Gato', gatos: 'Gato', felino: 'Gato',
  conejo: 'Conejo', conejos: 'Conejo',
  ave: 'Ave', aves: 'Ave', pajaro: 'Ave', loro: 'Ave',
  hamster: 'Hamster', hamsters: 'Hamster',
  cobayo: 'Cobayo', cobayos: 'Cobayo', cobaya: 'Cobayo', cuy: 'Cobayo', cuyo: 'Cobayo', 'conejillo de indias': 'Cobayo'
}
function normalizarEspecie(valor) {
  const clave = String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  return ALIAS_ESPECIE[clave] || String(valor || '').trim()
}
async function getPetsCatalog(req, res) {
  if (!['veterinario', 'administrador'].includes(req.usuario.Rol)) {
    return res.status(403).json({ error: 'Acceso denegado. Solo veterinarios y administradores.' })
  }
  db.query(
    `SELECT m.ID_mascota, m.Nombre, m.Especie, m.Raza, m.Sexo, m.Peso, m.Fecha_nacimiento, u.Nombre AS Nombre_dueno
     FROM mascota m
     LEFT JOIN cliente c ON m.ID_cliente = c.ID_cliente
     LEFT JOIN usuario u ON c.ID_usuario = u.ID_usuario
     WHERE LOWER(TRIM(COALESCE(m.Estado, 'activo'))) <> 'inactivo'
     ORDER BY m.Nombre`,
    [],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results.map(m => ({ ...m, Especie: normalizarEspecie(m.Especie) })))
    }
  )
}

// OBTENER MASCOTAS POR CLIENTE - Mascotas de un cliente especifico
async function getPetsByClient(req, res) {
  db.query('SELECT * FROM mascota WHERE ID_cliente=? AND Estado="activo"', [req.params.id_cliente], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
}

// CREAR MASCOTA - Registra una nueva mascota
async function createPet(req, res) {
  const { ID_cliente, Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso } = req.body
  db.query(
    'INSERT INTO mascota (ID_cliente, Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso) VALUES (?,?,?,?,?,?,?,?)',
    [ID_cliente, Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ID_mascota: result.insertId, ...req.body })
    }
  )
}

// ACTUALIZAR MASCOTA - Edita datos de una mascota
async function updatePet(req, res) {
  const { Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso } = req.body
  db.query(
    'UPDATE mascota SET Fecha_nacimiento=?, Nombre=?, Especie=?, Sexo=?, Foto=?, Raza=?, Peso=? WHERE ID_mascota=?',
    [Fecha_nacimiento, Nombre, Especie, Sexo, Foto, Raza, Peso, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Mascota actualizada' })
    }
  )
}

// ELIMINAR MASCOTA (DESACTIVAR) - Cambia estado a inactivo
async function deletePet(req, res) {
  db.query('UPDATE mascota SET Estado="inactivo" WHERE ID_mascota=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Mascota desactivada' })
  })
}

module.exports = {
  getPetsCatalog, getPets, getPetsByClient, createPet, updatePet, deletePet }