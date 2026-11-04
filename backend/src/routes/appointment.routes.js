// RUTAS DE CITAS - Gestion de citas
const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middlewares/auth')
const { cargarVeterinario } = require('../middlewares/vet-middleware')
const appointmentController = require('../controllers/appointment.controller')

// Obtener citas (admin todas, veterinario solo las suyas)
router.get('/', verifyToken, cargarVeterinario, appointmentController.getAppointments)

// Obtener horas ocupadas (evita doble agendamiento)
router.get('/horas-ocupadas', verifyToken, appointmentController.getHorasOcupadas)

// Crear cita
router.post('/', verifyToken, appointmentController.createAppointment)

// Actualizar cita (veterinario solo sus citas)
router.put('/:id', verifyToken, cargarVeterinario, appointmentController.updateAppointment)

// Actualizar parcialmente (veterinario solo sus citas)
router.patch('/:id', verifyToken, cargarVeterinario, appointmentController.patchAppointment)

// Eliminar cita (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, appointmentController.deleteAppointment)

module.exports = router