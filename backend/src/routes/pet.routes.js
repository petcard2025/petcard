// RUTAS DE MASCOTAS - CRUD de mascotas
const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middlewares/auth')
const petController = require('../controllers/pet.controller')

// Obtener todas las mascotas (admin)
router.get('/', verifyToken, verifyAdmin, petController.getPets)

// Obtener mascotas de un cliente
router.get('/cliente/:id_cliente', verifyToken, petController.getPetsByClient)

// Crear mascota
router.post('/', verifyToken, petController.createPet)

// Actualizar mascota
router.put('/:id', verifyToken, petController.updatePet)

// Desactivar mascota (soft delete)
router.delete('/:id', verifyToken, petController.deletePet)

module.exports = router