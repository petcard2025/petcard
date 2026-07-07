<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion } = useAuth()

// ===== GUARD DE SEGURIDAD =====
onMounted(() => {
  const token = localStorage.getItem('petcard_token')
  const usuarioStr = localStorage.getItem('petcard_usuario_actual')
  let usuario = null
  try { usuario = usuarioStr ? JSON.parse(usuarioStr) : null } catch {}
  if (!token && !usuario) {
    router.push('/login-admin')
    return
  }
  const rol = usuario?.Rol?.toLowerCase()
  if (rol !== 'administrador' && rol !== 'admin') {
    router.push('/inicio')
  }
})

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

function abrirEditar(plan) {
  planSeleccionado.value = { ...plan }
  mostrarModal.value = true
}

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

function confirmarEliminar(plan) {
  planAEliminar.value = plan
  mostrarModalEliminar.value = true
}

async function eliminarPlan() {
  try {
    const res = await fetch(`${API}/alimentacion/${planAEliminar.value.ID_planAlimentacion}`, {
      method: 'DELETE',
      headers: headersAuth()
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
  <nav class="navbar">
    <router-link to="/admin-inicio" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/>
        <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/>
      </svg>
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
      <span style="color: white; margin-right: 1rem; font-weight: 500;">
        {{ isAuthenticated ? usuarioLogueado?.Nombre : 'Admin' }}
      </span>
      <router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" title="Ver Perfil" style="text-decoration:none;display:inline-block;">👤</router-link>
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="gestion-header">
      <div>
        <div class="gestion-title">Gestión de Planes de Alimentación</div>
        <div class="gestion-sub">Administra todos los planes de alimentación de las mascotas</div>
      </div>
      <div class="gestion-btns">
        <button class="btn btn-success btn-sm" @click="mostrarModalNuevo = true">+ Nuevo Plan</button>
      </div>
    </div>

    <div class="search-filter" style="margin-bottom:1.25rem;">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar por mascota o dieta..." v-model="busqueda"/>
      </div>
      <select class="filter-select" v-model="filtroEstado">
        <option>Todos</option>
        <option>Activo</option>
        <option>Pendiente</option>
      </select>
    </div>

    <div v-if="cargando" style="text-align:center; padding: 2rem; color: #888;">Cargando planes...</div>
    <div v-else-if="error" style="text-align:center; padding: 2rem; color: red;">{{ error }}</div>
    <div v-else-if="planesFiltrados.length === 0" style="text-align:center; padding: 2rem; color: #888;">
      No se encontraron planes.
    </div>

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

    <footer class="footer" style="margin-top:2rem;">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="nav-logo" style="color:#fff;display:flex;">PetCard</span>
          <p>Comprometidos con brindar toda la atención profesional.</p>
        </div>
        <div class="footer-col">
          <h4>Servicios</h4>
          <ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li></ul>
        </div>
        <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p></div>
        <div class="footer-col"><h4>Horarios</h4><p>Lun - Vie: 8:00 AM - 7:00 PM</p></div>
      </div>
      <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
    </footer>
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
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: white; border-radius: 12px; padding: 2rem;
  width: 100%; max-width: 480px; max-height: 85vh;
  overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal h3 { margin: 0 0 1rem; font-size: 1.2rem; font-weight: 700; }
.modal-body { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
.modal-body label { font-weight: 600; font-size: 0.85rem; color: #555; margin-top: 0.25rem; }
.modal-body input, .modal-body select {
  padding: 0.5rem 0.75rem; border: 1px solid #ddd;
  border-radius: 6px; font-size: 0.95rem;
}
.modal-footer { display: flex; gap: 0.75rem; justify-content: flex-end; }
</style>