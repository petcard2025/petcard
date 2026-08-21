// RUTAS DE ALIMENTACION - Gestion de planes nutricionales
const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middlewares/auth')
const { cargarVeterinario, verificarVetAtendioMascotaServicio } = require('../middlewares/vet-middleware')
const nutritionController = require('../controllers/nutrition.controller')

// Obtener planes (admin todos, veterinario solo los que atendio)
router.get('/', verifyToken, cargarVeterinario, nutritionController.getNutritionPlans)

// Obtener planes de una mascota
router.get('/mascota/:id_mascota', verifyToken, nutritionController.getNutritionPlansByPet)

// Crear plan (veterinario solo si atendio la mascota+servicio)
router.post('/', verifyToken, cargarVeterinario, verificarVetAtendioMascotaServicio, nutritionController.createNutritionPlan)

// Actualizar plan (veterinario solo si atendio la mascota+servicio)
router.put('/:id', verifyToken, cargarVeterinario, verificarVetAtendioMascotaServicio, nutritionController.updateNutritionPlan)

// Eliminar plan (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, nutritionController.deleteNutritionPlan)

module.exports = router