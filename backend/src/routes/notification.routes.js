// RUTAS DE NOTIFICACIONES - Gestion de notificaciones
const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/auth')
const notificationController = require('../controllers/notification.controller')

// Obtener todas las notificaciones
router.get('/', verifyToken, notificationController.getNotifications)

// Crear notificacion
router.post('/', verifyToken, notificationController.createNotification)

// Actualizar notificacion
router.put('/:id', verifyToken, notificationController.updateNotification)

// Eliminar notificacion
router.delete('/:id', verifyToken, notificationController.deleteNotification)

// Obtener notificaciones de un usuario
router.get('/usuario/:idUsuario', verifyToken, notificationController.getNotificationsByUser)

// Obtener no leidas de un usuario
router.get('/usuario/:idUsuario/no-leidas', verifyToken, notificationController.getUnreadNotificationsByUser)

// Obtener notificacion por ID
router.get('/:id', verifyToken, notificationController.getNotificationById)

// Marcar como leida
router.patch('/:id/marcar-como-leida', verifyToken, notificationController.markAsRead)

// Marcar multiples como leidas
router.patch('/marcar-como-leidas/bulk', verifyToken, notificationController.markAllAsRead)

// Eliminar multiples notificaciones
router.delete('/bulk', verifyToken, notificationController.deleteBulkNotifications)

// Eliminar todas las de un usuario
router.delete('/usuario/:idUsuario/todas', verifyToken, notificationController.deleteAllByUser)

// Estadisticas globales
router.get('/estadisticas', verifyToken, notificationController.getNotificationStats)

// Estadisticas por usuario
router.get('/usuario/:idUsuario/estadisticas', verifyToken, notificationController.getNotificationStatsByUser)

module.exports = router