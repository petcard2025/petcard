// RUTAS DE VACUNAS - Gestion de carnet de vacunas
const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/auth')
const vaccineController = require('../controllers/vaccine.controller')

// Obtener todas las vacunas
router.get('/', verifyToken, vaccineController.getVaccines)

// Obtener vacunas de una mascota
router.get('/mascota/:id_mascota', verifyToken, vaccineController.getVaccinesByPet)

// Registrar vacuna
router.post('/', verifyToken, vaccineController.createVaccine)

// Actualizar vacuna
router.put('/:id', verifyToken, vaccineController.updateVaccine)

// Eliminar vacuna
router.delete('/:id', verifyToken, vaccineController.deleteVaccine)

module.exports = router