// RUTAS DE SERVICIOS - CRUD de servicios (solo admin)
const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middlewares/auth')
const serviceController = require('../controllers/service.controller')

// Obtener todos los servicios (publico)
router.get('/', serviceController.getServices)

// Crear servicio (admin)
router.post('/', verifyToken, verifyAdmin, serviceController.createService)

// Actualizar servicio (admin)
router.put('/:id', verifyToken, verifyAdmin, serviceController.updateService)

// Eliminar servicio (admin)
router.delete('/:id', verifyToken, verifyAdmin, serviceController.deleteService)

module.exports = router