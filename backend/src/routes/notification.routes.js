// RUTAS DE NOTIFICACIONES - Gestion de notificaciones
const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/auth')
const notificationController = require('../controllers/notification.controller')

// IMPORTANTE: las rutas fijas (/estadisticas, /bulk, /usuario/..., /marcar-como-leidas/bulk)
// deben ir ANTES de las que usan /:id, porque Express toma la primera que coincide.
// Si /:id va primero, "estadisticas" y "bulk" se interpretan como un id.

// Obtener todas las notificaciones
router.get('/', verifyToken, notificationController.getNotifications)

// Crear notificacion
router.post('/', verifyToken, notificationController.createNotification)

// Estadisticas globales
router.get('/estadisticas', verifyToken, notificationController.getNotificationStats)

// Marcar multiples como leidas
router.patch('/marcar-como-leidas/bulk', verifyToken, notificationController.markAllAsRead)

// Eliminar multiples notificaciones
router.delete('/bulk', verifyToken, notificationController.deleteBulkNotifications)

// Obtener notificaciones de un usuario
router.get('/usuario/:idUsuario', verifyToken, notificationController.getNotificationsByUser)

// Obtener no leidas de un usuario
router.get('/usuario/:idUsuario/no-leidas', verifyToken, notificationController.getUnreadNotificationsByUser)

// Estadisticas por usuario
router.get('/usuario/:idUsuario/estadisticas', verifyToken, notificationController.getNotificationStatsByUser)

// Eliminar todas las de un usuario
router.delete('/usuario/:idUsuario/todas', verifyToken, notificationController.deleteAllByUser)

// Rutas con /:id (siempre al final)
router.get('/:id', verifyToken, notificationController.getNotificationById)
router.put('/:id', verifyToken, notificationController.updateNotification)
router.delete('/:id', verifyToken, notificationController.deleteNotification)
router.patch('/:id/marcar-como-leida', verifyToken, notificationController.markAsRead)

module.exports = router
