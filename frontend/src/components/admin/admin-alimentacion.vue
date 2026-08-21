<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'

const API = 'https://localhost:3001/api'
const headersAuth = () => ({ Authorization: `Bearer ${localStorage.getItem('petcard_token')}` })

const busqueda = ref('')
const filtroEstado = ref('Todos')
const mostrarModal = ref(false)
const mostrarModalEliminar = ref(false)
const planSeleccionado = ref(null)
const planAEliminar = ref(null)
const mostrarModalNuevo = ref(false)
const cargando = ref(false)
const error = ref('')

const mascotas = ref([])
const servicios = ref([])
const planes = ref([])

const nuevoPlan = ref({
  ID_mascota: '', ID_servicio: '', Tipo_dieta: '', Frecuencia: '',
  Calorias: '', Horario: '', Alergias: '', Suplementos: '', Comidas: '',
  Fecha_inicio: '', Fecha_fin: '', Observaciones: '', Diagnostico: '',
  Revision_nutricional: 'Pendiente'
})

onMounted(async () => {
  await cargarPlanes()
  await cargarMascotas()
  await cargarServicios()
})

async function cargarPlanes() {
  cargando.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/alimentacion`, { headers: headersAuth() })
    if (!res.ok) throw new Error()
    planes.value = await res.json()
  } catch (e) {
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

async function cargarMascotas() {
  try {
    const res = await fetch(`${API}/mascotas`, { headers: headersAuth() })
    mascotas.value = await res.json()
  } catch (e) {}
}

async function cargarServicios() {
  try {
    const res = await fetch(`${API}/servicios`, { headers: headersAuth() })
    servicios.value = await res.json()
  } catch (e) {}
}

const planesFiltrados = computed(() => {
  return planes.value.filter(p => {
    const nombre = (p.Nombre_mascota || '').toLowerCase()
    const dieta = (p.Tipo_dieta || '').toLowerCase()
    const coincideBusqueda = nombre.includes(busqueda.value.toLowerCase()) || dieta.includes(busqueda.value.toLowerCase())
    const estado = p.Revision_nutricional || ''
    const coincideEstado = filtroEstado.value === 'Todos' || estado === filtroEstado.value
    return coincideBusqueda && coincideEstado
  })
})

function abrirEditar(plan) { planSeleccionado.value = { ...plan }; mostrarModal.value = true }

async function guardarEdicion() {
  try {
    const res = await fetch(`${API}/alimentacion/${planSeleccionado.value.ID_planAlimentacion}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headersAuth() },
      body: JSON.stringify(planSeleccionado.value)
    })
    if (!res.ok) throw new Error()
    await cargarPlanes()
    mostrarModal.value = false
  } catch (e) {
    alert('Error al guardar los cambios.')
  }
}

function confirmarEliminar(plan) { planAEliminar.value = plan; mostrarModalEliminar.value = true }

async function eliminarPlan() {
  try {
    const res = await fetch(`${API}/alimentacion/${planAEliminar.value.ID_planAlimentacion}`, {
      method: 'DELETE', headers: headersAuth()
    })
    if (!res.ok) throw new Error()
    await cargarPlanes()
    mostrarModalEliminar.value = false
    planAEliminar.value = null
  } catch (e) {
    alert('Error al eliminar el plan.')
  }
}

async function agregarPlan() {
  if (!nuevoPlan.value.ID_mascota || !nuevoPlan.value.ID_servicio) {
    alert('Selecciona la mascota y el servicio.')
    return
  }
  try {
    const res = await fetch(`${API}/alimentacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headersAuth() },
      body: JSON.stringify(nuevoPlan.value)
    })
    if (!res.ok) throw new Error()
    await cargarPlanes()
    nuevoPlan.value = {
      ID_mascota: '', ID_servicio: '', Tipo_dieta: '', Frecuencia: '',
      Calorias: '', Horario: '', Alergias: '', Suplementos: '', Comidas: '',
      Fecha_inicio: '', Fecha_fin: '', Observaciones: '', Diagnostico: '',
      Revision_nutricional: 'Pendiente'
    }
    mostrarModalNuevo.value = false
  } catch (e) {
    alert('Error al crear el plan.')
  }
}

function badgeClass(estado) {
  if (estado === 'Activo') return 'badge badge-green'
  if (estado === 'Pendiente') return 'badge badge-yellow'
  return 'badge badge-gray'
}
</script>

<template>
  <AdminLayout title="Planes de Alimentación" subtitle="Administra todos los planes de alimentación de las mascotas">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="mostrarModalNuevo = true">+ Nuevo Plan</button>
    </template>

    <div class="search-filter">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar por mascota o dieta..." v-model="busqueda" />
      </div>
      <select class="filter-select" v-model="filtroEstado">
        <option>Todos</option>
        <option>Activo</option>
        <option>Pendiente</option>
      </select>
    </div>

    <div v-if="cargando" style="text-align:center; padding: 2rem; color: #888;">Cargando planes...</div>
    <div v-else-if="error" class="alert alert-danger"><span>{{ error }}</span></div>
    <div v-else-if="planesFiltrados.length === 0" class="empty-state">No se encontraron planes.</div>

    <div class="cards-grid-2" v-else>
      <div class="admin-card" v-for="plan in planesFiltrados" :key="plan.ID_planAlimentacion">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">{{ plan.Nombre_mascota }}</div>
            <div class="admin-card-tipo">{{ plan.Nombre_servicio }}</div>
          </div>
          <span :class="badgeClass(plan.Revision_nutricional)">
            {{ (plan.Revision_nutricional || 'Pendiente').toUpperCase() }}
          </span>
        </div>
        <div class="admin-card-body">
          <div class="detail">{{ plan.Tipo_dieta }}</div>
          <div class="admin-card-meta" v-if="plan.Calorias">{{ plan.Calorias }} cal • {{ plan.Frecuencia }}</div>
          <div class="admin-card-meta" v-if="plan.Fecha_inicio">Inicio: {{ plan.Fecha_inicio?.slice(0,10) }}</div>
          <div class="admin-card-meta" v-if="plan.Observaciones">{{ plan.Observaciones }}</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" @click="abrirEditar(plan)">Editar</button>
          <button class="btn btn-danger btn-sm" @click="confirmarEliminar(plan)">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Editar -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal">
        <h3>Editar Plan de Alimentación</h3>
        <div class="modal-body">
          <label>Tipo de dieta</label>
          <input v-model="planSeleccionado.Tipo_dieta" />
          <label>Frecuencia</label>
          <input v-model="planSeleccionado.Frecuencia" />
          <label>Calorías</label>
          <input v-model="planSeleccionado.Calorias" />
          <label>Horario</label>
          <input v-model="planSeleccionado.Horario" />
          <label>Alergias</label>
          <input v-model="planSeleccionado.Alergias" />
          <label>Suplementos</label>
          <input v-model="planSeleccionado.Suplementos" />
          <label>Fecha inicio</label>
          <input type="date" v-model="planSeleccionado.Fecha_inicio" />
          <label>Fecha fin</label>
          <input type="date" v-model="planSeleccionado.Fecha_fin" />
          <label>Observaciones</label>
          <input v-model="planSeleccionado.Observaciones" />
          <label>Estado</label>
          <select v-model="planSeleccionado.Revision_nutricional">
            <option>Activo</option>
            <option>Pendiente</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModal = false">Cancelar</button>
          <button class="btn btn-success btn-sm" @click="guardarEdicion">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
      <div class="modal">
        <h3>¿Eliminar plan?</h3>
        <p>¿Estás seguro que deseas eliminar el plan de <strong>{{ planAEliminar?.Nombre_mascota }}</strong>? Esta acción no se puede deshacer.</p>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEliminar = false">Cancelar</button>
          <button class="btn btn-danger btn-sm" @click="eliminarPlan">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Plan -->
    <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="mostrarModalNuevo = false">
      <div class="modal">
        <h3>Nuevo Plan de Alimentación</h3>
        <div class="modal-body">
          <label>Mascota</label>
          <select v-model="nuevoPlan.ID_mascota">
            <option value="">-- Selecciona mascota --</option>
            <option v-for="m in mascotas" :key="m.ID_mascota" :value="m.ID_mascota">{{ m.Nombre }}</option>
          </select>
          <label>Servicio</label>
          <select v-model="nuevoPlan.ID_servicio">
            <option value="">-- Selecciona servicio --</option>
            <option v-for="s in servicios" :key="s.ID_servicio" :value="s.ID_servicio">{{ s.Nombre }}</option>
          </select>
          <label>Tipo de dieta</label>
          <input v-model="nuevoPlan.Tipo_dieta" />
          <label>Frecuencia</label>
          <input v-model="nuevoPlan.Frecuencia" />
          <label>Calorías</label>
          <input v-model="nuevoPlan.Calorias" />
          <label>Horario</label>
          <input v-model="nuevoPlan.Horario" />
          <label>Alergias</label>
          <input v-model="nuevoPlan.Alergias" />
          <label>Suplementos</label>
          <input v-model="nuevoPlan.Suplementos" />
          <label>Fecha inicio</label>
          <input type="date" v-model="nuevoPlan.Fecha_inicio" />
          <label>Fecha fin</label>
          <input type="date" v-model="nuevoPlan.Fecha_fin" />
          <label>Observaciones</label>
          <input v-model="nuevoPlan.Observaciones" />
          <label>Estado</label>
          <select v-model="nuevoPlan.Revision_nutricional">
            <option>Activo</option>
            <option>Pendiente</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalNuevo = false">Cancelar</button>
          <button class="btn btn-success btn-sm" @click="agregarPlan">Agregar</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.modal-body input, .modal-body select {
  padding: 0.5rem 0.75rem; border: 1px solid #ddd;
  border-radius: 6px; font-size: 0.95rem; width: 100%; box-sizing: border-box;
}
</style>