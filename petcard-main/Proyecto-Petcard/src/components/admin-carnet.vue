<template>
  <nav class="navbar">
    <router-link to="/admin-inicio" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/admin-alimentacion">Alimentación</router-link></li>
      <li><router-link to="/admin-carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/admin-notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/admin-servicios">Servicios</router-link></li>
      <li><router-link to="/admin-citas">Citas</router-link></li>
    </ul>
    <div class="nav-actions">
      <span style="color: white; margin-right: 1rem; font-weight: 500;">{{ isAuthenticated ? usuarioLogueado?.Nombre : 'Admin' }}</span>
      <router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" title="Ver Perfil" style="text-decoration:none;display:inline-block;">👤</router-link>
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>
  
  <div class="admin-container">
    <!-- Filtros -->
    <div class="admin-header">
      <div class="admin-controls">
        <input
          v-model="buscarTexto"
          id="input-buscar"
          type="text"
          placeholder="Buscar mascota o vacuna..."
          class="form-control"
        />
        <select v-model="filtroEstado" id="select-filtro" class="form-select">
          <option value="Todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Completada">Completada</option>
        </select>
        <button @click="abrirModalNuevo" id="btn-nuevo-registro" class="btn btn-primary">
          Nuevo Registro
        </button>
      </div>
    </div>

    <!-- Grid de registros -->
    <div class="cards-grid-2">
      <div v-if="registrosFiltrados.length === 0" class="empty-state">
        No hay registros que mostrar
      </div>
      <div
        v-for="registro in registrosFiltrados"
        :key="registro.id"
        class="admin-card"
      >
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">{{ registro.mascota }}</div>
            <div class="admin-card-tipo">{{ registro.tipo }} - {{ registro.raza }}</div>
          </div>
          <span class="badge" :class="getEstadoClass(registro.estado)">
            {{ registro.estado }}
          </span>
        </div>

        <div class="admin-card-body">
          <div class="detail">{{ registro.vacuna }}</div>
          <div class="admin-card-meta">Lote: {{ registro.lote }}</div>
          <div class="admin-card-meta">Aplicada: {{ registro.aplicada }}</div>
          <div class="admin-card-meta">Próxima: {{ registro.proxima }}</div>
          <div class="admin-card-meta">Veterinario: {{ registro.veterinario }}</div>
        </div>

        <div class="admin-card-actions">
          <button @click="abrirModalEditar(registro)" class="btn btn-primary btn-sm">
            Editar
          </button>
          <button @click="eliminarRegistro(registro.id)" class="btn btn-danger btn-sm">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <ModalRegistro
      v-if="modalAbierto"
      :registro-editar="registroEditando"
      @guardar="guardarRegistro"
      @cancelar="cerrarModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import ModalRegistro from './ModalRegistro.vue'

const { usuarioLogueado, isAuthenticated, cerrarSesion } = useAuth()

// Estado reactivo
const registros = ref([])
const buscarTexto = ref('')
const filtroEstado = ref('Todos')
const modalAbierto = ref(false)
const registroEditando = ref(null)

// Computed para registros filtrados
const registrosFiltrados = computed(() => {
  return registros.value.filter(registro => {
    const coincideBusqueda =
      registro.mascota.toLowerCase().includes(buscarTexto.value.toLowerCase()) ||
      registro.vacuna.toLowerCase().includes(buscarTexto.value.toLowerCase())
    
    const coincideFiltro = filtroEstado.value === 'Todos' || registro.estado === filtroEstado.value
    
    return coincideBusqueda && coincideFiltro
  })
})

// Watch para filtrado reactivo
watch([buscarTexto, filtroEstado], () => {
  // El filtrado se hace automáticamente via computed
})

// Métodos
const getEstadoClass = (estado) => {
  return {
    'badge-pendiente': estado === 'Pendiente',
    'badge-completada': estado === 'Completada'
  }
}

const eliminarRegistro = (id) => {
  if (confirm('¿Eliminar este registro?')) {
    registros.value = registros.value.filter(r => r.id !== id)
  }
}

const abrirModalNuevo = () => {
  registroEditando.value = null
  modalAbierto.value = true
}

const abrirModalEditar = (registro) => {
  registroEditando.value = { ...registro }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  registroEditando.value = null
}

const guardarRegistro = (datos) => {
  // Validar campos requeridos
  if (!datos.mascota || !datos.tipo || !datos.raza || !datos.vacuna || 
      !datos.lote || !datos.aplicada || !datos.proxima || !datos.veterinario) {
    alert('Debes completar todos los campos')
    return
  }

  // Verificar duplicados (solo para nuevos registros)
  if (!registroEditando.value) {
    const repetido = registros.value.some(r => 
      r.mascota.toLowerCase() === datos.mascota.toLowerCase()
    )
    if (repetido) {
      alert('Ya existe un registro con ese nombre de mascota')
      return
    }
  }

  if (registroEditando.value) {
    // Editar registro existente
    const index = registros.value.findIndex(r => r.id === registroEditando.value.id)
    if (index !== -1) {
      registros.value[index] = { ...datos, id: registroEditando.value.id }
    }
  } else {
    // Nuevo registro
    registros.value.push({
      id: registros.value.length + 1,
      ...datos
    })
  }

  cerrarModal()
}

// Cargar datos iniciales (puedes cargar desde API)
const cargarRegistrosIniciales = () => {
  // Ejemplo de datos iniciales
  registros.value = [
    {
      id: 1,
      mascota: 'Firulais',
      tipo: 'Perro',
      raza: 'Golden Retriever',
      vacuna: 'Antirrábica',
      lote: 'ABC123',
      aplicada: '2024-01-15',
      proxima: '2025-01-15',
      veterinario: 'Dr. López',
      estado: 'Completada'
    }
  ]
}

// Inicialización
cargarRegistrosIniciales()
</script>

<style scoped>
.admin-container {
  padding: 20px;
}

.admin-header {
  margin-bottom: 20px;
}

.admin-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.form-control, .form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.cards-grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.admin-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;
}

.admin-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.admin-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.admin-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.admin-card-tipo {
  color: #666;
  font-size: 14px;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-pendiente {
  background: #fff3cd;
  color: #856404;
}

.badge-completada {
  background: #d4edda;
  color: #155724;
}

.admin-card-body {
  margin-bottom: 16px;
}

.detail {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.admin-card-meta {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.admin-card-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

/* Navbar styles */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0.85rem 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-logo svg {
  width: 24px;
  height: 24px;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-links li a {
  text-decoration: none;
  color: white;
  font-weight: 600;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-links li a:hover,
.nav-links li a.active {
  background: rgba(255, 255, 255, 0.2);
}

.nav-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-outline-white {
  background: transparent;
  color: white;
  border: 1px solid white;
  cursor: pointer;
  border-radius: 8px;
  padding: 0.55rem 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-danger {
  background-color: #dc3545;
  border: 1px solid #dc3545;
  cursor: pointer;
  border-radius: 8px;
  padding: 0.55rem 0.95rem;
  font-weight: 600;
  color: white;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #c82333;
}

.btn-sm {
  font-size: 0.8rem;
  padding: 0.4rem 0.7rem;
}


</style>