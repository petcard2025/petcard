// RUTAS DE AUTENTICACION - Login, registro, recuperacion
const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

// Login normal (clientes)
router.post('/login', authController.loginLimiter, authController.login)

// Login para admin/veterinario (acceso al panel)
router.post('/login-admin', authController.loginLimiter, authController.loginAdmin)

// Solicitar recuperacion de contraseña
router.post('/forgot-password', authController.forgotPasswordLimiter, authController.forgotPassword)

// Restablecer contraseña con token
router.post('/reset-password', authController.resetPassword)

module.exports = router