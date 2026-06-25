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
  const rol = usuario?.Rol
  if (rol !== 'Admin') {
    router.push('/inicio')
  }
})

const API = 'http://localhost:3001/api'

const citas = ref([])
const mascotas = ref([])
const servicios = ref([])
const veterinarios = ref([])
const busqueda = ref('')
const filtroEstado = ref('Todos')
const cargando = ref(false)
const error = ref('')
const mostrarModalNuevo = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const citaSeleccionada = ref(null)
const citaAEliminar = ref(null)

const nuevaCita = ref({
  ID_cliente: '', ID_mascota: '', ID_servicio: '',
  ID_veterinario: '', Fecha: '', Hora: '', Motivo: '', Observaciones: ''
})

onMounted(async () => {
  await cargarCitas()
  await cargarMascotas()
  await cargarServicios()
  await cargarVeterinarios()
})

async function cargarCitas() {
  cargando.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/citas`)
    if (!res.ok) throw new Error()
    citas.value = await res.json()
  } catch {
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

async function cargarMascotas() {
  try {
    const res = await fetch(`${API}/mascotas`)
    mascotas.value = await res.json()
  } catch {}
}

async function cargarServicios() {
  try {
    const res = await fetch(`${API}/servicios`)
    servicios.value = await res.json()
  } catch {}
}

async function cargarVeterinarios() {
  try {
    const res = await fetch(`${API}/veterinarios`)
    veterinarios.value = await res.json()
  } catch {}
}

const citasFiltradas = computed(() => {
  return citas.value.filter(c => {
    const texto = `${c.Nombre_mascota} ${c.Nombre_cliente} ${c.Nombre_servicio}`.toLowerCase()
    const coincide = texto.includes(busqueda.value.toLowerCase())
    const estado = c.Observaciones ? 'Confirmada' : 'Pendiente'
    const coincideEstado = filtroEstado.value === 'Todos' || estado === filtroEstado.value
    return coincide && coincideEstado
  })
})

function estadoCita(cita) {
  return cita.Observaciones ? 'Confirmada' : 'Pendiente'
}

function badgeClass(estado) {
  if (estado === 'Confirmada') return 'badge badge-green'
  if (estado === 'Pendiente') return 'badge badge-yellow'
  return 'badge badge-gray'
}

function abrirEditar(cita) {
  citaSeleccionada.value = { ...cita }
  mostrarModalEditar.value = true
}

async function guardarEdicion() {
  try {
    const res = await fetch(`${API}/citas/${citaSeleccionada.value.ID_cita}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(citaSeleccionada.value)
    })
    if (!res.ok) throw new Error()
    await cargarCitas()
    mostrarModalEditar.value = false
  } catch {
    alert('Error al guardar los cambios.')
  }
}

function confirmarEliminar(cita) {
  citaAEliminar.value = cita
  mostrarModalEliminar.value = true
}

async function eliminarCita() {
  try {
    const res = await fetch(`${API}/citas/${citaAEliminar.value.ID_cita}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    await cargarCitas()
    mostrarModalEliminar.value = false
  } catch {
    alert('Error al eliminar la cita.')
  }
}

async function crearCita() {
  // Buscar ID_cliente desde la mascota seleccionada
  const mascota = mascotas.value.find(m => m.ID_mascota == nuevaCita.value.ID_mascota)
  if (mascota) nuevaCita.value.ID_cliente = mascota.ID_cliente
  try {
    const res = await fetch(`${API}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaCita.value)
    })
    if (!res.ok) throw new Error()
    await cargarCitas()
    nuevaCita.value = { ID_cliente: '', ID_mascota: '', ID_servicio: '', ID_veterinario: '', Fecha: '', Hora: '', Motivo: '', Observaciones: '' }
    mostrarModalNuevo.value = false
  } catch {
    alert('Error al crear la cita.')
  }
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
      <li><router-link to="/admin-citas" class="active">Citas</router-link></li>
    </ul>
    <div class="nav-actions">
      <span style="color:white;margin-right:1rem;font-weight:500;">{{ isAuthenticated ? usuarioLogueado?.Nombre : 'Admin' }}</span>
      <router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" style="text-decoration:none;display:inline-block;">👤</router-link>
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="gestion-header">
      <div>
        <div class="gestion-title">Gestión de Citas</div>
        <div class="gestion-sub">Administra todas las citas veterinarias</div>
      </div>
      <div class="gestion-btns">
        <button class="btn btn-success btn-sm" @click="mostrarModalNuevo = true">+ Nueva Cita</button>
      </div>
    </div>

    <div v-if="error" style="background:#fee2e2;color:#dc2626;padding:.75rem 1rem;border-radius:8px;margin-bottom:1rem;">⚠️ {{ error }}</div>

    <div class="search-filter" style="margin-bottom:1.25rem;">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar por mascota, cliente o servicio..." v-model="busqueda"/>
      </div>
      <select class="filter-select" v-model="filtroEstado">
        <option>Todos</option>
        <option>Confirmada</option>
        <option>Pendiente</option>
      </select>
    </div>

    <div v-if="cargando" style="text-align:center;padding:2rem;color:#888;">Cargando citas...</div>
    <div v-else-if="citasFiltradas.length === 0" style="text-align:center;padding:2rem;color:#888;">No se encontraron citas.</div>

    <div v-else class="cards-grid-2">
      <div class="admin-card" v-for="cita in citasFiltradas" :key="cita.ID_cita">
        <div class="admin-card-header">
          <div>
            <div style="display:flex;gap:.5rem;align-items:center;">
              <span class="admin-card-title">{{ cita.Nombre_mascota }}</span>
              <span :class="badgeClass(estadoCita(cita))">{{ estadoCita(cita).toUpperCase() }}</span>
            </div>
            <div class="admin-card-tipo">{{ cita.Nombre_cliente }}</div>
          </div>
        </div>
        <div class="admin-card-body">
          <div class="detail">{{ cita.Nombre_servicio }}</div>
          <div class="admin-card-meta">con {{ cita.Nombre_veterinario }}</div>
          <div class="admin-card-meta">📅 {{ cita.Fecha?.slice(0,10) }} — 🕐 {{ cita.Hora }}</div>
          <div class="admin-card-meta" v-if="cita.Motivo">Motivo: {{ cita.Motivo }}</div>
          <div class="admin-card-meta" v-if="cita.Observaciones" style="font-style:italic;">"{{ cita.Observaciones }}"</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" @click="abrirEditar(cita)">Editar</button>
          <button class="btn btn-danger btn-sm" @click="confirmarEliminar(cita)">Eliminar</button>
        </div>
      </div>
    </div>

    <footer class="footer" style="margin-top:2rem;">
      <div class="footer-grid">
        <div class="footer-brand"><span class="nav-logo" style="color:#fff;display:flex;">PetCard</span><p>Comprometidos con brindar toda la atención profesional.</p></div>
        <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li></ul></div>
        <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p></div>
        <div class="footer-col"><h4>Horarios</h4><p>Lun - Vie: 8:00 AM - 7:00 PM</p></div>
      </div>
      <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
    </footer>
  </div>

  <!-- Modal Nueva Cita -->
  <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="mostrarModalNuevo = false">
    <div class="modal">
      <h3>Nueva Cita</h3>
      <div class="modal-body">
        <label>Mascota</label>
        <select v-model="nuevaCita.ID_mascota">
          <option value="" disabled>Selecciona mascota</option>
          <option v-for="m in mascotas" :key="m.ID_mascota" :value="m.ID_mascota">{{ m.Nombre }} ({{ m.Especie }})</option>
        </select>
        <label>Servicio</label>
        <select v-model="nuevaCita.ID_servicio">
          <option value="" disabled>Selecciona servicio</option>
          <option v-for="s in servicios" :key="s.ID_servicio" :value="s.ID_servicio">{{ s.Nombre }}</option>
        </select>
        <label>Veterinario</label>
        <select v-model="nuevaCita.ID_veterinario">
          <option value="" disabled>Selecciona veterinario</option>
          <option v-for="v in veterinarios" :key="v.ID_veterinario" :value="v.ID_veterinario">{{ v.Nombre }}</option>
        </select>
        <label>Fecha</label>
        <input type="date" v-model="nuevaCita.Fecha" />
        <label>Hora</label>
        <input type="time" v-model="nuevaCita.Hora" />
        <label>Motivo</label>
        <input v-model="nuevaCita.Motivo" placeholder="Motivo de la cita..." />
        <label>Observaciones</label>
        <textarea v-model="nuevaCita.Observaciones" rows="2"></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalNuevo = false">Cancelar</button>
        <button class="btn btn-success btn-sm" @click="crearCita">Crear</button>
      </div>
    </div>
  </div>

  <!-- Modal Editar Cita -->
  <div v-if="mostrarModalEditar" class="modal-overlay" @click.self="mostrarModalEditar = false">
    <div class="modal">
      <h3>Editar Cita — {{ citaSeleccionada.Nombre_mascota }}</h3>
      <div class="modal-body">
        <label>Servicio</label>
        <select v-model="citaSeleccionada.ID_servicio">
          <option v-for="s in servicios" :key="s.ID_servicio" :value="s.ID_servicio">{{ s.Nombre }}</option>
        </select>
        <label>Veterinario</label>
        <select v-model="citaSeleccionada.ID_veterinario">
          <option v-for="v in veterinarios" :key="v.ID_veterinario" :value="v.ID_veterinario">{{ v.Nombre }}</option>
        </select>
        <label>Fecha</label>
        <input type="date" v-model="citaSeleccionada.Fecha" />
        <label>Hora</label>
        <input type="time" v-model="citaSeleccionada.Hora" />
        <label>Motivo</label>
        <input v-model="citaSeleccionada.Motivo" />
        <label>Observaciones</label>
        <textarea v-model="citaSeleccionada.Observaciones" rows="2"></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalEditar = false">Cancelar</button>
        <button class="btn btn-success btn-sm" @click="guardarEdicion">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal Eliminar -->
  <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
    <div class="modal">
      <h3>¿Eliminar cita?</h3>
      <p>¿Eliminar la cita de <strong>{{ citaAEliminar?.Nombre_mascota }}</strong>? Esta acción no se puede deshacer.</p>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalEliminar = false">Cancelar</button>
        <button class="btn btn-danger btn-sm" @click="eliminarCita">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000; }
.modal { background:white;border-radius:12px;padding:2rem;width:100%;max-width:500px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2); }
.modal h3 { margin:0 0 1rem;font-size:1.2rem;font-weight:700; }
.modal-body { display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.5rem; }
.modal-body label { font-weight:600;font-size:.85rem;color:#555;margin-top:.25rem; }
.modal-body input,.modal-body select,.modal-body textarea { padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;width:100%;box-sizing:border-box; }
.modal-footer { display:flex;gap:.75rem;justify-content:flex-end; }
</style>