// RUTAS DE VETERINARIOS - Lista de veterinarios
const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/auth')
const veterinarianController = require('../controllers/veterinarian.controller')

// Obtener todos los veterinarios
router.get('/', verifyToken, veterinarianController.getVeterinarians)

module.exports = router