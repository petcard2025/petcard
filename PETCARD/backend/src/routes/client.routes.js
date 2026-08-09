// RUTAS DE CLIENTES - Gestion de clientes
const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middlewares/auth')
const clientController = require('../controllers/client.controller')

// Obtener todos los clientes (admin)
router.get('/', verifyToken, verifyAdmin, clientController.getClients)

// Crear cliente (vincula usuario como cliente)
router.post('/', clientController.createClient)

// Obtener cliente por ID de usuario
router.get('/usuario/:id_usuario', verifyToken, clientController.getClientByUser)

module.exports = router