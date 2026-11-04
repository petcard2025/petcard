// RUTAS DE ADMINISTRADORES - Lista de administradores
const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middlewares/auth')
const adminController = require('../controllers/admin.controller')

// Obtener todos los administradores
router.get('/', verifyToken, verifyAdmin, adminController.getAdmins)

module.exports = router