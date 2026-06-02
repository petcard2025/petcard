/**
 * Ejemplos Prácticos de Uso de la API de Notificaciones
 * Ejemplos de componentes y composables para usar notificacionesAPI
 */

// ===================================
// 1. COMPOSABLE - useNotificaciones
// ===================================
// Ubicación recomendada: src/composables/useNotificaciones.js

/**
export function useNotificaciones() {
  import { notificacionesAPI } from '@/router/notificaciones.api'
  import { ref, computed } from 'vue'

  const notificaciones = ref([])
  const cargando = ref(false)
  const error = ref(null)

  // Obtener todas las notificaciones
  const cargarNotificaciones = async () => {
    try {
      cargando.value = true
      error.value = null
      notificaciones.value = await notificacionesAPI.obtener()
    } catch (err) {
      error.value = err.message
      console.error('Error al cargar notificaciones:', err)
    } finally {
      cargando.value = false
    }
  }

  // Obtener notificaciones de un usuario
  const cargarNotificacionesUsuario = async (idUsuario) => {
    try {
      cargando.value = true
      error.value = null
      notificaciones.value = await notificacionesAPI.obtenerPorUsuario(idUsuario)
    } catch (err) {
      error.value = err.message
    } finally {
      cargando.value = false
    }
  }

  // Crear notificación
  const crearNotificacion = async (datos) => {
    try {
      const nueva = await notificacionesAPI.crear(datos)
      notificaciones.value.push(nueva)
      return nueva
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Marcar como leída
  const marcarComoLeida = async (id) => {
    try {
      await notificacionesAPI.marcarComoLeida(id)
      const index = notificaciones.value.findIndex(n => n.ID_notificacion === id)
      if (index !== -1) {
        notificaciones.value[index].Leida = true
      }
    } catch (err) {
      error.value = err.message
    }
  }

  // Eliminar notificación
  const eliminarNotificacion = async (id) => {
    try {
      await notificacionesAPI.eliminar(id)
      notificaciones.value = notificaciones.value.filter(n => n.ID_notificacion !== id)
    } catch (err) {
      error.value = err.message
    }
  }

  // Computed: contar no leídas
  const contadorNoLeidas = computed(() => {
    return notificaciones.value.filter(n => !n.Leida).length
  })

  return {
    notificaciones,
    cargando,
    error,
    contadorNoLeidas,
    cargarNotificaciones,
    cargarNotificacionesUsuario,
    crearNotificacion,
    marcarComoLeida,
    eliminarNotificacion
  }
}
*/

// ===================================
// 2. COMPONENTE - Widget de Notificaciones
// ===================================
// Ubicación recomendada: src/components/NotificacionesWidget.vue

/**
<template>
  <div class="notificaciones-widget">
    <!-- Badge con contador -->
    <div class="notification-badge">
      <i class="bell-icon">🔔</i>
      <span v-if="contadorNoLeidas > 0" class="badge-count">
        {{ contadorNoLeidas }}
      </span>
    </div>

    <!-- Dropdown de notificaciones -->
    <div v-if="mostrarDropdown" class="dropdown">
      <div class="dropdown-header">
        <h3>Notificaciones ({{ notificaciones.length }})</h3>
        <button v-if="contadorNoLeidas > 0" @click="marcarTodosComoLeidos">
          Marcar todas como leídas
        </button>
      </div>

      <div v-if="cargando" class="loading">
        Cargando...
      </div>

      <div v-else-if="notificaciones.length === 0" class="empty">
        No hay notificaciones
      </div>

      <div v-else class="notification-list">
        <div 
          v-for="notif in notificaciones" 
          :key="notif.ID_notificacion"
          class="notification-item"
          :class="{ 'no-leida': !notif.Leida }"
        >
          <div class="notification-content">
            <p class="notification-mensaje">{{ notif.Mensaje }}</p>
            <p class="notification-meta">
              {{ notif.Tipo }} • {{ notif.Canal }} • 
              {{ formatearFecha(notif.Fecha_envio) }}
            </p>
          </div>

          <div class="notification-actions">
            <button 
              v-if="!notif.Leida"
              @click="marcarComoLeida(notif.ID_notificacion)"
              class="btn-read"
            >
              ✓
            </button>
            <button 
              @click="eliminarNotificacion(notif.ID_notificacion)"
              class="btn-delete"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div class="dropdown-footer">
        <router-link to="/notificaciones">Ver todas</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { notificacionesAPI } from '@/router/notificaciones.api'
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'NotificacionesWidget',
  props: {
    idUsuario: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const notificaciones = ref([])
    const cargando = ref(false)
    const mostrarDropdown = ref(false)

    const contadorNoLeidas = computed(() => {
      return notificaciones.value.filter(n => !n.Leida).length
    })

    const cargarNotificaciones = async () => {
      try {
        cargando.value = true
        notificaciones.value = await notificacionesAPI.obtenerPorUsuario(props.idUsuario)
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
      } finally {
        cargando.value = false
      }
    }

    const marcarComoLeida = async (id) => {
      try {
        await notificacionesAPI.marcarComoLeida(id)
        const index = notificaciones.value.findIndex(n => n.ID_notificacion === id)
        if (index !== -1) {
          notificaciones.value[index].Leida = true
        }
      } catch (error) {
        console.error('Error al marcar como leída:', error)
      }
    }

    const marcarTodosComoLeidos = async () => {
      const ids = notificaciones.value
        .filter(n => !n.Leida)
        .map(n => n.ID_notificacion)
      
      try {
        await notificacionesAPI.marcarMultiplesComoLeidas(ids)
        notificaciones.value.forEach(n => n.Leida = true)
      } catch (error) {
        console.error('Error al marcar como leídas:', error)
      }
    }

    const eliminarNotificacion = async (id) => {
      try {
        await notificacionesAPI.eliminar(id)
        notificaciones.value = notificaciones.value.filter(n => n.ID_notificacion !== id)
      } catch (error) {
        console.error('Error al eliminar:', error)
      }
    }

    const formatearFecha = (fecha) => {
      const date = new Date(fecha)
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      cargarNotificaciones()
      // Recargar cada 30 segundos
      setInterval(cargarNotificaciones, 30000)
    })

    return {
      notificaciones,
      cargando,
      mostrarDropdown,
      contadorNoLeidas,
      marcarComoLeida,
      marcarTodosComoLeidos,
      eliminarNotificacion,
      formatearFecha
    }
  }
}
</script>

<style scoped>
.notificaciones-widget {
  position: relative;
}

.notification-badge {
  position: relative;
  cursor: pointer;
  font-size: 24px;
}

.badge-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: red;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 400px;
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
}

.dropdown-header {
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
}

.dropdown-header button {
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  font-size: 12px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fafafa;
}

.notification-item.no-leida {
  background: #fffbf0;
  border-left: 3px solid #ff9800;
}

.notification-content {
  flex: 1;
}

.notification-mensaje {
  margin: 0 0 4px 0;
  font-weight: 500;
  font-size: 14px;
}

.notification-meta {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.notification-actions {
  margin-left: 12px;
  display: flex;
  gap: 8px;
}

.notification-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.btn-read {
  color: #4caf50;
}

.btn-delete {
  color: #f44336;
}

.dropdown-footer {
  padding: 12px;
  border-top: 1px solid #eee;
  text-align: center;
}

.dropdown-footer a {
  color: #0066cc;
  text-decoration: none;
}

.loading, .empty {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>
*/

// ===================================
// 3. EJEMPLO - Página de Notificaciones
// ===================================
// Ubicación recomendada: src/components/notificaciones.vue

/**
<template>
  <div class="notificaciones-page">
    <h1>Mis Notificaciones</h1>

    <!-- Filtros -->
    <div class="filters">
      <select v-model="filtroTipo">
        <option value="">Todos los tipos</option>
        <option value="Recordatorio">Recordatorio</option>
        <option value="Confirmación">Confirmación</option>
        <option value="Alerta">Alerta</option>
      </select>

      <select v-model="filtroCanal">
        <option value="">Todos los canales</option>
        <option value="Correo">Correo</option>
        <option value="SMS">SMS</option>
        <option value="Sistema">Sistema</option>
      </select>

      <label>
        <input type="checkbox" v-model="mostrarSoloNoLeidas">
        Solo no leídas ({{ contadorNoLeidas }})
      </label>
    </div>

    <!-- Lista de notificaciones -->
    <div v-if="cargando" class="loading">Cargando...</div>
    
    <div v-else-if="notificacionesFiltradas.length === 0" class="empty">
      No hay notificaciones
    </div>

    <div v-else class="notificaciones-grid">
      <div 
        v-for="notif in notificacionesFiltradas"
        :key="notif.ID_notificacion"
        class="notification-card"
        :class="{ 'no-leida': !notif.Leida }"
      >
        <div class="card-header">
          <span class="tipo-badge" :class="notif.Tipo.toLowerCase()">
            {{ notif.Tipo }}
          </span>
          <span class="canal-badge">{{ notif.Canal }}</span>
          <span class="fecha">{{ formatearFecha(notif.Fecha_envio) }}</span>
        </div>

        <p class="mensaje">{{ notif.Mensaje }}</p>

        <div class="card-actions">
          <button 
            v-if="!notif.Leida"
            @click="marcarComoLeida(notif.ID_notificacion)"
            class="btn btn-success"
          >
            Marcar como leída
          </button>
          <button 
            @click="eliminarNotificacion(notif.ID_notificacion)"
            class="btn btn-danger"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { notificacionesAPI } from '@/router/notificaciones.api'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Notificaciones',
  setup() {
    const route = useRoute()
    const notificaciones = ref([])
    const cargando = ref(false)
    const filtroTipo = ref('')
    const filtroCanal = ref('')
    const mostrarSoloNoLeidas = ref(false)

    const contadorNoLeidas = computed(() => {
      return notificaciones.value.filter(n => !n.Leida).length
    })

    const notificacionesFiltradas = computed(() => {
      return notificaciones.value.filter(notif => {
        const cumpleTipo = !filtroTipo.value || notif.Tipo === filtroTipo.value
        const cumpleCanal = !filtroCanal.value || notif.Canal === filtroCanal.value
        const cumpleLeida = !mostrarSoloNoLeidas.value || !notif.Leida

        return cumpleTipo && cumpleCanal && cumpleLeida
      })
    })

    const cargarNotificaciones = async () => {
      try {
        cargando.value = true
        const idUsuario = route.params.idUsuario || 1
        notificaciones.value = await notificacionesAPI.obtenerPorUsuario(idUsuario)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        cargando.value = false
      }
    }

    const marcarComoLeida = async (id) => {
      try {
        await notificacionesAPI.marcarComoLeida(id)
        const index = notificaciones.value.findIndex(n => n.ID_notificacion === id)
        if (index !== -1) {
          notificaciones.value[index].Leida = true
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    const eliminarNotificacion = async (id) => {
      try {
        await notificacionesAPI.eliminar(id)
        notificaciones.value = notificaciones.value.filter(n => n.ID_notificacion !== id)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      cargarNotificaciones()
    })

    return {
      notificaciones,
      notificacionesFiltradas,
      cargando,
      contadorNoLeidas,
      filtroTipo,
      filtroCanal,
      mostrarSoloNoLeidas,
      marcarComoLeida,
      eliminarNotificacion,
      formatearFecha
    }
  }
}
</script>

<style scoped>
.notificaciones-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filters select,
.filters label {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.notificaciones-grid {
  display: grid;
  gap: 12px;
}

.notification-card {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.notification-card.no-leida {
  border-left: 4px solid #ff9800;
  background: #fffbf0;
}

.card-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tipo-badge,
.canal-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.tipo-badge.recordatorio { background: #e3f2fd; color: #1976d2; }
.tipo-badge.confirmación { background: #e8f5e9; color: #388e3c; }
.tipo-badge.alerta { background: #fff3e0; color: #f57c00; }

.canal-badge {
  background: #f5f5f5;
  color: #666;
}

.fecha {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}

.mensaje {
  margin: 12px 0;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-success {
  background: #4caf50;
  color: white;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
*/

// ===================================
// 4. EJEMPLO - Crear Notificación
// ===================================

/**
async function crearNotificacionRecordatorio() {
  try {
    const notificacion = await notificacionesAPI.crear({
      ID_usuario: 1,
      ID_sistemaCorreo: 1,
      Mensaje: 'Tu mascota Max tiene una cita veterinaria el próximo martes',
      Tipo: 'Recordatorio',
      Canal: 'Correo'
    })
    
    console.log('Notificación creada:', notificacion)
  } catch (error) {
    console.error('Error al crear notificación:', error)
  }
}

// Crear múltiples notificaciones
async function notificarVacunacionProxima() {
  const usuarios = [1, 2, 3, 4, 5]
  const notificaciones = usuarios.map(id => ({
    ID_usuario: id,
    ID_sistemaCorreo: 1,
    Mensaje: 'Es hora de revisar el plan de vacunación de tu mascota',
    Tipo: 'Recordatorio',
    Canal: 'Correo'
  }))

  try {
    const resultado = await notificacionesAPI.crearMultiples(notificaciones)
    console.log('Notificaciones creadas:', resultado)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Obtener estadísticas y mostrar resumen
async function mostrarResumen() {
  try {
    const stats = await notificacionesAPI.obtenerEstadisticas()
    console.log('Total de notificaciones:', stats.total)
    console.log('Leídas:', stats.leidas)
    console.log('No leídas:', stats.no_leidas)
  } catch (error) {
    console.error('Error:', error)
  }
}
*/
