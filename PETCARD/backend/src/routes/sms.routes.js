// RUTAS DE SMS - Envio de mensajes de texto
const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middlewares/auth')
const smsController = require('../controllers/sms.controller')

// Enviar SMS personalizado (admin)
router.post('/enviar', verifyToken, verifyAdmin, smsController.sendSMS)

// Confirmar cita por SMS (admin)
router.post('/confirmar-cita', verifyToken, verifyAdmin, smsController.confirmAppointmentSMS)

// Recordatorio de vacuna por SMS (admin)
router.post('/recordatorio-vacuna', verifyToken, verifyAdmin, smsController.vaccineReminderSMS)

module.exports = router