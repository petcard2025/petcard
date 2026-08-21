<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { API_URL } from '../../api.js'

const { usuarioLogueado, cerrarSesion } = useAuth()
const API = API_URL

// ── Estado ────────────────────────────────────────────────────
const citas = ref([])
const busqueda = ref('')
const filtroEstado = ref('Todos')
const cargando = ref(false)
const error = ref('')

// Modal para agregar observaciones / confirmar cita
const mostrarModalConfirmar = ref(false)
const mostrarModalDetalle = ref(false)
const citaSeleccionada = ref(null)
const observaciones = ref('')
const guardando = ref(false)
const mensajeExito = ref('')

const hoy = new Date().toISOString().slice(0, 10)

// ── Carga de datos ────────────────────────────────────────────
onMounted(cargarCitas)

async function cargarCitas() {
  cargando.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('petcard_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${API}/citas`, { headers })
    if (!res.ok) throw new Error()
    const todas = await res.json()

    // Filtrar solo las citas de este veterinario
    const idVet = usuarioLogueado.value?.ID_veterinario
    const nombreVet = usuarioLogueado.value?.Nombre

    citas.value = todas.filter(c => {
      if (idVet) return c.ID_veterinario === idVet
      return c.Nombre_veterinario === nombreVet
    })
  } catch {
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

// ── Filtros ───────────────────────────────────────────────────
const citasFiltradas = computed(() => {
  return citas.value
    .filter(c => {
      const texto = `${c.Nombre_mascota} ${c.Nombre_cliente} ${c.Nombre_servicio}`.toLowerCase()
      const coincide = texto.includes(busqueda.value.toLowerCase())

      let estadoCalculado = 'Pendiente'
      if (c.Observaciones) estadoCalculado = 'Confirmada'
      else if (c.Fecha?.slice(0, 10) < hoy) estadoCalculado = 'Pasada'

      const coincideEstado =
        filtroEstado.value === 'Todos' || estadoCalculado === filtroEstado.value

      return coincide && coincideEstado
    })
    .sort((a, b) => {
      const da = `${a.Fecha?.slice(0, 10)} ${a.Hora}`
      const db = `${b.Fecha?.slice(0, 10)} ${b.Hora}`
      return da.localeCompare(db)
    })
})

const totalResultados = computed(() => citasFiltradas.value.length)

// ── Helpers visuales ──────────────────────────────────────────
function estadoCita(cita) {
  if (cita.Observaciones) return 'Confirmada'
  if (cita.Fecha?.slice(0, 10) < hoy) return 'Pasada'
  return 'Pendiente'
}

function badgeClass(estado) {
  if (estado === 'Confirmada') return 'badge badge-green'
  if (estado === 'Pendiente')  return 'badge badge-yellow'
  return 'badge badge-gray'
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '-'
  const [y, m, d] = fechaStr.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function iniciales(nombre) {
  if (!nombre) return '?'
  return nombre.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

// ── Acciones ──────────────────────────────────────────────────
function abrirConfirmar(cita) {
  citaSeleccionada.value = { ...cita }
  observaciones.value = cita.Observaciones || ''
  mensajeExito.value = ''
  mostrarModalConfirmar.value = true
}

function abrirDetalle(cita) {
  citaSeleccionada.value = { ...cita }
  mostrarModalDetalle.value = true
}

async function guardarObservaciones() {
  guardando.value = true
  try {
    const token = localStorage.getItem('petcard_token')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }

    // Actualizar la cita con las observaciones para "confirmarla"
    const res = await fetch(`${API}/citas/${citaSeleccionada.value.ID_cita}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ...citaSeleccionada.value,
        Observaciones: observaciones.value
      })
    })
    if (!res.ok) throw new Error()

    mensajeExito.value = '✅ Cita confirmada y observaciones guardadas.'
    await cargarCitas()

    setTimeout(() => {
      mostrarModalConfirmar.value = false
      mensajeExito.value = ''
    }, 1500)
  } catch {
    alert('Error al guardar las observaciones. Inténtalo de nuevo.')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <nav class="navbar">
    <router-link to="/veterinario-inicio" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/>
        <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/>
      </svg>
      PETCARD
    </router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/veterinario-inicio">Inicio</router-link></li>
      <li><router-link to="/veterinario-citas" class="active">Mis Citas</router-link></li>
      <li><router-link to="/veterinario-alimentacion">Alimentación</router-link></li>
    </ul>
    <div class="nav-actions" style="margin-left:auto;">
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <div class="vet-wrapper">
    <div class="vet-page-head">
      <div>
        <div class="vet-eyebrow">GESTIÓN CLÍNICA</div>
        <h1 class="vet-page-title">Mis Citas</h1>
        <p class="vet-page-sub">Citas asignadas a {{ usuarioLogueado?.Nombre || 'ti' }} · confirma y registra observaciones</p>
      </div>
    </div>

    <div v-if="error" class="vet-alert">⚠️ {{ error }}</div>

    <!-- Panel de filtros -->
    <div class="vet-toolbar">
      <div class="search-wrap" style="flex:1;">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar por mascota, cliente o servicio..." v-model="busqueda"/>
      </div>
      <select class="filter-select" v-model="filtroEstado">
        <option>Todos</option>
        <option>Pendiente</option>
        <option>Confirmada</option>
        <option>Pasada</option>
      </select>
      <span class="vet-resultados">{{ totalResultados }} resultado{{ totalResultados === 1 ? '' : 's' }}</span>
    </div>

    <!-- Tabla de citas -->
    <div class="vet-table-card">
      <div v-if="cargando" class="vet-empty">Cargando tus citas...</div>
      <div v-else-if="citasFiltradas.length === 0" class="vet-empty">No se encontraron citas con ese filtro.</div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Servicio</th>
              <th>Fecha / Hora</th>
              <th>Estado</th>
              <th>Observaciones</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cita in citasFiltradas" :key="cita.ID_cita">
              <td>
                <div class="vet-paciente">
                  <span class="vet-avatar-sm">{{ iniciales(cita.Nombre_mascota) }}</span>
                  <div>
                    <div class="vet-paciente-nombre">{{ cita.Nombre_mascota }}</div>
                    <div class="vet-paciente-dueno">{{ cita.Nombre_cliente }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>{{ cita.Nombre_servicio }}</div>
                <div class="vet-motivo" v-if="cita.Motivo">{{ cita.Motivo }}</div>
              </td>
              <td>
                <div class="vet-fecha">{{ formatFecha(cita.Fecha) }}</div>
                <div class="vet-hora">{{ cita.Hora }}</div>
              </td>
              <td><span :class="badgeClass(estadoCita(cita))">{{ estadoCita(cita) }}</span></td>
              <td>
                <span v-if="cita.Observaciones" class="vet-obs-preview">"{{ cita.Observaciones }}"</span>
                <span v-else class="vet-obs-vacio">Sin registrar</span>
              </td>
              <td>
                <div class="vet-row-actions">
                  <button class="btn btn-secondary btn-sm" @click="abrirDetalle(cita)">Detalle</button>
                  <button
                    class="btn btn-success btn-sm"
                    @click="abrirConfirmar(cita)"
                    :disabled="estadoCita(cita) === 'Pasada'"
                  >
                    {{ cita.Observaciones ? 'Editar' : 'Confirmar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <footer class="footer" style="margin-top:2.5rem;">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="nav-logo" style="color:#fff;display:flex;">PetCard</span>
          <p>Comprometidos con brindar toda la atención profesional.</p>
        </div>
        <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta General</a></li><li><a href="#">Vacunación</a></li></ul></div>
        <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p></div>
        <div class="footer-col"><h4>Horarios</h4><p>Lun - Vie: 8:00 AM - 7:00 PM</p></div>
      </div>
      <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
    </footer>
  </div>

  <!-- ── Modal: Ver detalle ─────────────────────────────────── -->
  <div v-if="mostrarModalDetalle" class="modal-overlay" @click.self="mostrarModalDetalle = false">
    <div class="vet-modal">
      <div class="vet-modal-head">
        <h3>Detalle de la cita</h3>
        <button class="vet-modal-close" @click="mostrarModalDetalle = false">&times;</button>
      </div>
      <div class="vet-modal-body" v-if="citaSeleccionada">
        <div class="vet-detail-row"><span class="vet-detail-label">Mascota</span><span class="vet-detail-value">{{ citaSeleccionada.Nombre_mascota }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Dueño</span><span class="vet-detail-value">{{ citaSeleccionada.Nombre_cliente }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Servicio</span><span class="vet-detail-value">{{ citaSeleccionada.Nombre_servicio }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Fecha</span><span class="vet-detail-value">{{ formatFecha(citaSeleccionada.Fecha) }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Hora</span><span class="vet-detail-value">{{ citaSeleccionada.Hora }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Motivo</span><span class="vet-detail-value">{{ citaSeleccionada.Motivo || '—' }}</span></div>
        <div class="vet-detail-block">
          <span class="vet-detail-label">Observaciones registradas</span>
          <p class="vet-detail-textblock">{{ citaSeleccionada.Observaciones || 'Sin observaciones aún.' }}</p>
        </div>
      </div>
      <div class="vet-modal-foot">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalDetalle = false">Cerrar</button>
        <button
          class="btn btn-success btn-sm"
          @click="() => { mostrarModalDetalle = false; abrirConfirmar(citaSeleccionada) }"
          :disabled="estadoCita(citaSeleccionada) === 'Pasada'"
        >
          Confirmar / Editar
        </button>
      </div>
    </div>
  </div>

  <!-- ── Modal: Confirmar y agregar observaciones ────────────── -->
  <div v-if="mostrarModalConfirmar" class="modal-overlay" @click.self="mostrarModalConfirmar = false">
    <div class="vet-modal">
      <div class="vet-modal-head">
        <h3>Confirmar cita — {{ citaSeleccionada?.Nombre_mascota }}</h3>
        <button class="vet-modal-close" @click="mostrarModalConfirmar = false">&times;</button>
      </div>
      <div class="vet-modal-body">
        <div class="vet-info-box">
          <div><strong>{{ formatFecha(citaSeleccionada?.Fecha) }}</strong> · {{ citaSeleccionada?.Hora }}</div>
          <div>Servicio: <strong>{{ citaSeleccionada?.Nombre_servicio }}</strong></div>
          <div>Motivo: {{ citaSeleccionada?.Motivo || '—' }}</div>
        </div>

        <div class="form-group">
          <label>Observaciones clínicas</label>
          <textarea
            class="form-control"
            v-model="observaciones"
            rows="4"
            placeholder="Anota el diagnóstico, tratamiento, indicaciones o notas de la consulta..."
          ></textarea>
        </div>

        <div v-if="mensajeExito" class="vet-success-inline">{{ mensajeExito }}</div>
      </div>
      <div class="vet-modal-foot">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalConfirmar = false">Cancelar</button>
        <button class="btn btn-success btn-sm" @click="guardarObservaciones" :disabled="guardando">
          {{ guardando ? 'Guardando...' : 'Confirmar y guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vet-wrapper {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

.vet-eyebrow {
  font-size: .72rem; font-weight: 800; letter-spacing: .08em;
  color: var(--purple); margin-bottom: .25rem;
}
.vet-page-head { margin-bottom: 1.5rem; }
.vet-page-title { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.6rem; color: var(--text); margin-bottom: .25rem; }
.vet-page-sub { color: var(--text-secondary); font-size: .9rem; }

.vet-alert {
  background: var(--red-bg); color: var(--red);
  padding: .75rem 1rem; border-radius: var(--radius-sm);
  margin-bottom: 1.25rem; font-size: .9rem;
}

/* ── Toolbar ── */
.vet-toolbar {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.vet-resultados {
  font-size: .82rem;
  color: var(--muted);
  white-space: nowrap;
}

/* ── Tabla ── */
.vet-table-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.vet-empty { text-align: center; padding: 3rem 1rem; color: var(--muted); }

.vet-paciente { display: flex; align-items: center; gap: .65rem; }
.vet-avatar-sm {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--purple-bg); color: var(--purple);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: .75rem;
  flex-shrink: 0;
}
.vet-paciente-nombre { font-weight: 700; color: var(--text); }
.vet-paciente-dueno { font-size: .78rem; color: var(--muted); }

.vet-motivo { font-size: .78rem; color: var(--muted); margin-top: .15rem; }
.vet-fecha { font-weight: 600; color: var(--text); }
.vet-hora { font-size: .78rem; color: var(--muted); }

.vet-obs-preview { font-size: .82rem; color: var(--green); font-style: italic; }
.vet-obs-vacio { font-size: .82rem; color: var(--muted); }

.vet-row-actions { display: flex; gap: .4rem; justify-content: flex-end; }

/* ── Modal refinado ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(17,24,39,.55);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  padding: 1rem;
}
.vet-modal {
  background: var(--white);
  border-radius: var(--radius-lg);
  width: 100%; max-width: 480px; max-height: 88vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 60px rgba(0,0,0,.25);
  overflow: hidden;
}
.vet-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.1rem 1.4rem; border-bottom: 1px solid var(--border);
}
.vet-modal-head h3 { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.05rem; color: var(--text); }
.vet-modal-close { background: none; border: none; font-size: 1.4rem; line-height: 1; color: var(--muted); cursor: pointer; }
.vet-modal-body { padding: 1.4rem; overflow-y: auto; }
.vet-modal-foot { display: flex; gap: .6rem; justify-content: flex-end; padding: 1rem 1.4rem; border-top: 1px solid var(--border); }

.vet-detail-row {
  display: flex; justify-content: space-between; gap: 1rem;
  padding: .55rem 0; border-bottom: 1px solid var(--border);
  font-size: .9rem;
}
.vet-detail-row:last-of-type { border-bottom: none; }
.vet-detail-label { color: var(--muted); font-weight: 600; }
.vet-detail-value { color: var(--text); text-align: right; }
.vet-detail-block { margin-top: .75rem; }
.vet-detail-textblock {
  background: #f9fafb; border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: .65rem .85rem; font-size: .88rem; color: var(--text); margin-top: .35rem;
}

.vet-info-box {
  background: var(--green-bg); color: #166534;
  border-radius: var(--radius-sm);
  padding: .75rem .9rem;
  font-size: .88rem;
  margin-bottom: 1rem;
  display: flex; flex-direction: column; gap: .25rem;
}
.vet-success-inline {
  color: var(--green); font-weight: 700; text-align: center; margin-top: .75rem; font-size: .9rem;
}

@media (max-width: 720px) {
  .vet-table-card { overflow-x: auto; }
  table { min-width: 720px; }
}
</style>