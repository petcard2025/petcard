// RUTAS DE USUARIOS - CRUD de usuarios (solo admin)
const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middlewares/auth')
const userController = require('../controllers/user.controller')

// Obtener todos los usuarios (admin)
router.get('/', verifyToken, verifyAdmin, userController.getUsers)

// Crear usuario (registro publico)
router.post('/', userController.createUser)

// Actualizar usuario (admin)
router.put('/:id', verifyToken, verifyAdmin, userController.updateUser)

// Eliminar usuario (admin)
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser)

module.exports = router