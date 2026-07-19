<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { API_URL } from '../api.js'
const API = API_URL

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

const TODAS_LAS_HORAS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '02:00 PM', '03:00 PM', '04:00 PM'
]

const horasDisponiblesNuevo = ref(TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true })))
const cargandoHorasNuevo = ref(false)
const horasDisponiblesEditar = ref(TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true })))
const cargandoHorasEditar = ref(false)

function getToken() {
  return localStorage.getItem('petcard_token')
}

function horaA24(horaStr) {
  if (!horaStr) return ''
  const str = String(horaStr).trim()
  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10)
    const m = ampmMatch[2]
    const ap = ampmMatch[3].toUpperCase()
    if (ap === 'PM' && h !== 12) h += 12
    if (ap === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${m}`
  }
  const parts = str.split(':')
  return `${parts[0].padStart(2, '0')}:${parts[1]}`
}

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
    const res = await fetch(`${API}/citas`, { headers: { Authorization: `Bearer ${getToken()}` } })
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
    const res = await fetch(`${API}/mascotas`, { headers: { Authorization: `Bearer ${getToken()}` } })
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
    const res = await fetch(`${API}/veterinarios`, { headers: { Authorization: `Bearer ${getToken()}` } })
    veterinarios.value = await res.json()
  } catch {}
}

async function cargarHorasNuevo() {
  if (!nuevaCita.value.ID_veterinario || !nuevaCita.value.Fecha) {
    horasDisponiblesNuevo.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true }))
    return
  }
  cargandoHorasNuevo.value = true
  try {
    const res = await fetch(
      `${API}/citas/horas-ocupadas?ID_veterinario=${nuevaCita.value.ID_veterinario}&Fecha=${nuevaCita.value.Fecha}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    )
    const data = await res.json()
    const ocupadas24 = (data.horasOcupadas || []).map(horaA24)
    horasDisponiblesNuevo.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: !ocupadas24.includes(horaA24(h)) }))
    if (nuevaCita.value.Hora && ocupadas24.includes(horaA24(nuevaCita.value.Hora))) nuevaCita.value.Hora = ''
  } catch {
    horasDisponiblesNuevo.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true }))
  } finally {
    cargandoHorasNuevo.value = false
  }
}

async function cargarHorasEditar() {
  if (!citaSeleccionada.value?.ID_veterinario || !citaSeleccionada.value?.Fecha) {
    horasDisponiblesEditar.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true }))
    return
  }
  cargandoHorasEditar.value = true
  try {
    const fechaSolo = String(citaSeleccionada.value.Fecha).slice(0, 10)
    const res = await fetch(
      `${API}/citas/horas-ocupadas?ID_veterinario=${citaSeleccionada.value.ID_veterinario}&Fecha=${fechaSolo}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    )
    const data = await res.json()
    let ocupadas24 = (data.horasOcupadas || []).map(horaA24)
    const horaActual24 = horaA24(citaSeleccionada.value.Hora)
    ocupadas24 = ocupadas24.filter(h => h !== horaActual24)
    horasDisponiblesEditar.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: !ocupadas24.includes(horaA24(h)) }))
  } catch {
    horasDisponiblesEditar.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true }))
  } finally {
    cargandoHorasEditar.value = false
  }
}

watch(() => nuevaCita.value.ID_veterinario, cargarHorasNuevo)
watch(() => nuevaCita.value.Fecha, cargarHorasNuevo)
watch(() => citaSeleccionada.value?.ID_veterinario, cargarHorasEditar)
watch(() => citaSeleccionada.value?.Fecha, cargarHorasEditar)

const citasFiltradas = computed(() => {
  return citas.value.filter(c => {
    const texto = `${c.Nombre_mascota} ${c.Nombre_cliente} ${c.Nombre_servicio}`.toLowerCase()
    const coincide = texto.includes(busqueda.value.toLowerCase())
    const estado = c.Observaciones ? 'Confirmada' : 'Pendiente'
    const coincideEstado = filtroEstado.value === 'Todos' || estado === filtroEstado.value
    return coincide && coincideEstado
  })
})

function estadoCita(cita) { return cita.Observaciones ? 'Confirmada' : 'Pendiente' }

function badgeClass(estado) {
  if (estado === 'Confirmada') return 'badge badge-green'
  if (estado === 'Pendiente') return 'badge badge-yellow'
  return 'badge badge-gray'
}

function abrirEditar(cita) {
  citaSeleccionada.value = { ...cita, Fecha: String(cita.Fecha).slice(0, 10) }
  mostrarModalEditar.value = true
  cargarHorasEditar()
}

function abrirNuevo() {
  nuevaCita.value = { ID_cliente: '', ID_mascota: '', ID_servicio: '', ID_veterinario: '', Fecha: '', Hora: '', Motivo: '', Observaciones: '' }
  horasDisponiblesNuevo.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true }))
  mostrarModalNuevo.value = true
}

async function guardarEdicion() {
  try {
    const res = await fetch(`${API}/citas/${citaSeleccionada.value.ID_cita}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(citaSeleccionada.value)
    })
    if (!res.ok) throw new Error()
    await cargarCitas()
    mostrarModalEditar.value = false
  } catch {
    alert('Error al guardar los cambios.')
  }
}

function confirmarEliminar(cita) { citaAEliminar.value = cita; mostrarModalEliminar.value = true }

async function eliminarCita() {
  try {
    const res = await fetch(`${API}/citas/${citaAEliminar.value.ID_cita}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    if (!res.ok) throw new Error()
    await cargarCitas()
    mostrarModalEliminar.value = false
  } catch {
    alert('Error al eliminar la cita.')
  }
}

async function crearCita() {
  const mascota = mascotas.value.find(m => m.ID_mascota == nuevaCita.value.ID_mascota)
  if (mascota) nuevaCita.value.ID_cliente = mascota.ID_cliente
  try {
    const res = await fetch(`${API}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(nuevaCita.value)
    })
    if (!res.ok) throw new Error()
    await cargarCitas()
    nuevaCita.value = { ID_cliente: '', ID_mascota: '', ID_servicio: '', ID_veterinario: '', Fecha: '', Hora: '', Motivo: '', Observaciones: '' }
    mostrarModalNuevo.value = false
  } catch {
    nuevaCita.value.Hora = ''
    await cargarHorasNuevo()
  }
}
</script>

<template>
  <AdminLayout title="Gestión de Citas" subtitle="Administra todas las citas veterinarias">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="abrirNuevo">+ Nueva Cita</button>
    </template>

    <div v-if="error" class="alert alert-danger"><span>{{ error }}</span></div>

    <div class="search-filter">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar por mascota, cliente o servicio..." v-model="busqueda" />
      </div>
      <select class="filter-select" v-model="filtroEstado">
        <option>Todos</option>
        <option>Confirmada</option>
        <option>Pendiente</option>
      </select>
    </div>

    <div v-if="cargando" style="text-align:center;padding:2rem;color:#888;">Cargando citas...</div>
    <div v-else-if="citasFiltradas.length === 0" class="empty-state">No se encontraron citas.</div>

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

          <label>
            Hora
            <span v-if="cargandoHorasNuevo" style="font-weight:400;color:#888;font-size:.78rem;"> Cargando disponibilidad...</span>
          </label>
          <div v-if="!nuevaCita.ID_veterinario || !nuevaCita.Fecha" class="horas-hint">
            Selecciona veterinario y fecha para ver los horarios disponibles
          </div>
          <div v-else class="horas-grid">
            <template v-for="item in horasDisponiblesNuevo" :key="item.hora">
              <button v-if="item.disponible" type="button" class="hora-btn hora-disponible"
                :class="{ 'hora-seleccionada': nuevaCita.Hora === item.hora }" @click="nuevaCita.Hora = item.hora">
                {{ item.hora }}
              </button>
            </template>
            <div v-if="horasDisponiblesNuevo.every(h => !h.disponible)" class="horas-llenas">
              📅 No hay horarios disponibles para este día con este veterinario.
            </div>
          </div>

          <label>Motivo</label>
          <input v-model="nuevaCita.Motivo" placeholder="Motivo de la cita..." />
          <label>Observaciones</label>
          <textarea v-model="nuevaCita.Observaciones" rows="2"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalNuevo = false">Cancelar</button>
          <button class="btn btn-success btn-sm" :disabled="!nuevaCita.Hora" @click="crearCita">Crear</button>
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

          <label>
            Hora
            <span v-if="cargandoHorasEditar" style="font-weight:400;color:#888;font-size:.78rem;"> Cargando disponibilidad...</span>
          </label>
          <div v-if="!citaSeleccionada.ID_veterinario || !citaSeleccionada.Fecha" class="horas-hint">
            Selecciona veterinario y fecha para ver los horarios disponibles
          </div>
          <div v-else class="horas-grid">
            <template v-for="item in horasDisponiblesEditar" :key="item.hora">
              <button v-if="item.disponible" type="button" class="hora-btn hora-disponible"
                :class="{ 'hora-seleccionada': citaSeleccionada.Hora === item.hora }" @click="citaSeleccionada.Hora = item.hora">
                {{ item.hora }}
              </button>
            </template>
            <div v-if="horasDisponiblesEditar.every(h => !h.disponible)" class="horas-llenas">
              📅 No hay otros horarios disponibles para este día con este veterinario.
            </div>
          </div>

          <label>Motivo</label>
          <input v-model="citaSeleccionada.Motivo" />
          <label>Observaciones</label>
          <textarea v-model="citaSeleccionada.Observaciones" rows="2"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEditar = false">Cancelar</button>
          <button class="btn btn-success btn-sm" :disabled="!citaSeleccionada.Hora" @click="guardarEdicion">Guardar</button>
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
  </AdminLayout>
</template>

<style scoped>
.modal-body input, .modal-body select, .modal-body textarea { padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;width:100%;box-sizing:border-box; }

.horas-hint {
  background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 10px;
  padding: .7rem .9rem; font-size: .82rem; color: #64748b; text-align: center;
}
.horas-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: .5rem;
  padding: .75rem; background: #fafbff; border: 1px solid #e7e9f5; border-radius: 10px;
}
.hora-btn { padding: .5rem .4rem; border-radius: 8px; font-size: .82rem; font-weight: 600; cursor: pointer; border: 2px solid transparent; transition: all .15s ease; }
.hora-disponible { background: #fff; border-color: #c7e8d0; color: #15803d; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.hora-disponible:hover { background: #f0fdf4; border-color: #4ade80; transform: translateY(-1px); }
.hora-seleccionada { background: #7c3aed !important; border-color: #7c3aed !important; color: #fff !important; box-shadow: 0 4px 10px rgba(124,58,237,.3); }
.horas-llenas {
  grid-column: 1/-1; text-align: center; padding: .85rem; font-size: .8rem; font-weight: 600; color: #92400e;
  background: linear-gradient(135deg, #fffbeb, #fef3c7); border-radius: 8px; border: 1.5px dashed #fbbf24;
}
</style>