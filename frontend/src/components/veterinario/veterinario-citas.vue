<script setup>
import AppFooter from '../shared/AppFooter.vue'
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { API_URL } from '../../api.js'
import { hoyColombia, formatHora } from '../../utils/validators'

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
const toast = ref('')
const mostrarModalCancelar = ref(false)
const accionEnCurso = ref(null)   // ID de la cita que se está actualizando

// Fecha de hoy en Colombia (toISOString() da la fecha UTC: desde las 7 pm ya marcaba "manana")
const hoy = hoyColombia()

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

      const coincideEstado =
        filtroEstado.value === 'Todos' || estadoCita(c) === filtroEstado.value

      return coincide && coincideEstado
    })
    .sort((a, b) => {
      const da = `${a.Fecha?.slice(0, 10)} ${a.Hora}`
      const db = `${b.Fecha?.slice(0, 10)} ${b.Hora}`
      return da.localeCompare(db)
    })
})

const totalResultados = computed(() => citasFiltradas.value.length)

// Pestañas de estado con su contador (se ven todas las citas de cada estado)
const pestanas = ['Todos', 'Pendiente', 'Confirmada', 'Completada', 'Cancelada', 'Pasada']
const etiquetaPestana = { Todos: 'Todas', Pendiente: 'Pendientes', Confirmada: 'Confirmadas', Completada: 'Completadas', Cancelada: 'Canceladas', Pasada: 'Pasadas' }
const conteoPestana = computed(() => {
  const c = Object.fromEntries(pestanas.map(p => [p, 0]))
  for (const cita of citas.value) { c.Todos++; c[estadoCita(cita)]++ }
  return c
})

// ── Helpers visuales ──────────────────────────────────────────
// Estado normalizado del campo Estado ("pendiente" -> "Pendiente")
function estadoBase(cita) {
  const e = String(cita.Estado || 'Pendiente').toLowerCase()
  if (e === 'confirmada') return 'Confirmada'
  if (e === 'completada' || e === 'completa') return 'Completada'
  if (e === 'cancelada') return 'Cancelada'
  return 'Pendiente'
}

// El estado sale del campo Estado. Antes se deducia de si tenia Observaciones, asi que una nota
// escrita por el cliente al agendar la hacia aparecer "Confirmada" aunque nadie la hubiera confirmado.
// "Pasada" = sigue Pendiente/Confirmada pero su fecha ya vencio.
function estadoCita(cita) {
  const e = estadoBase(cita)
  if ((e === 'Pendiente' || e === 'Confirmada') && cita.Fecha?.slice(0, 10) < hoy) return 'Pasada'
  return e
}

function badgeClass(estado) {
  if (estado === 'Confirmada') return 'badge badge-green'
  if (estado === 'Pendiente')  return 'badge badge-yellow'
  if (estado === 'Cancelada')  return 'badge badge-red'
  return 'badge badge-gray'
}

function puedeConfirmar(cita) {
  return ['Pendiente', 'Confirmada'].includes(estadoCita(cita))
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

function mostrarToast(texto) {
  toast.value = texto
  setTimeout(() => { toast.value = '' }, 3500)
}

// Cambia el estado de una cita con un solo clic (PATCH solo del Estado)
async function cambiarEstado(cita, estado, textoOk) {
  accionEnCurso.value = cita.ID_cita
  error.value = ''
  try {
    const token = localStorage.getItem('petcard_token')
    const res = await fetch(`${API}/citas/${cita.ID_cita}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ Estado: estado })
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'No se pudo actualizar la cita.')
    }
    await cargarCitas()
    // Se pasa a la pestaña del nuevo estado para que la cita se vea ahí mismo
    filtroEstado.value = estado
    mostrarToast(textoOk)
  } catch (e) {
    error.value = e.message || 'No se pudo actualizar la cita.'
  } finally {
    accionEnCurso.value = null
  }
}

const confirmarRapido = (cita) => cambiarEstado(cita, 'Confirmada', `✅ Cita de ${cita.Nombre_mascota} confirmada.`)
const completarCita = (cita) => cambiarEstado(cita, 'Completada', `☑️ Cita de ${cita.Nombre_mascota} marcada como completada.`)

function pedirCancelar(cita) {
  citaSeleccionada.value = { ...cita }
  mostrarModalCancelar.value = true
}
async function confirmarCancelacion() {
  const cita = citaSeleccionada.value
  mostrarModalCancelar.value = false
  await cambiarEstado(cita, 'Cancelada', `❌ Cita de ${cita.Nombre_mascota} cancelada.`)
}

async function guardarObservaciones() {
  guardando.value = true
  try {
    const token = localStorage.getItem('petcard_token')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }

    // Guarda las observaciones y deja la cita en estado "Confirmada" (ahora el estado se guarda de verdad).
    // Solo se envian los campos que el servidor acepta, no el objeto completo con nombres de solo lectura.
    const c = citaSeleccionada.value
    const res = await fetch(`${API}/citas/${c.ID_cita}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ID_servicio: c.ID_servicio,
        ID_veterinario: c.ID_veterinario,
        Fecha: c.Fecha,
        Hora: c.Hora,
        Motivo: c.Motivo,
        Observaciones: observaciones.value,
        Estado: estadoBase(c) === 'Pendiente' ? 'Confirmada' : estadoBase(c)
      })
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || '')
    }

    mensajeExito.value = '✅ Cita confirmada y observaciones guardadas.'
    await cargarCitas()
    filtroEstado.value = estadoBase(citaSeleccionada.value) === 'Pendiente' ? 'Confirmada' : filtroEstado.value

    setTimeout(() => {
      mostrarModalConfirmar.value = false
      mensajeExito.value = ''
    }, 1500)
  } catch (e) {
    alert(e.message || 'Error al guardar las observaciones. Inténtalo de nuevo.')
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
      <span class="vet-resultados">{{ totalResultados }} resultado{{ totalResultados === 1 ? '' : 's' }}</span>
    </div>

    <!-- Pestañas por estado -->
    <div class="vet-tabs">
      <button v-for="p in pestanas" :key="p" type="button" class="vet-tab"
              :class="{ activa: filtroEstado === p }" @click="filtroEstado = p">
        {{ etiquetaPestana[p] }}
        <span class="vet-tab-n">{{ conteoPestana[p] }}</span>
      </button>
    </div>

    <div v-if="toast" class="vet-toast">{{ toast }}</div>

    <!-- Tabla de citas -->
    <div class="vet-table-card">
      <div v-if="cargando" class="vet-empty">Cargando tus citas...</div>
      <div v-else-if="citasFiltradas.length === 0" class="vet-empty">No se encontraron citas con ese filtro.</div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Mascota</th>
              <th>Dueño</th>
              <th>Servicio</th>
              <th>Fecha / Hora</th>
              <th>Estado</th>
              <th class="th-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cita in citasFiltradas" :key="cita.ID_cita">
              <td>
                <div class="vet-paciente">
                  <span class="vet-avatar-sm">{{ iniciales(cita.Nombre_mascota) }}</span>
                  <div class="vet-paciente-nombre">{{ cita.Nombre_mascota }}</div>
                </div>
              </td>
              <td>
                <div class="vet-dueno-nombre">{{ cita.Nombre_cliente || '—' }}</div>
              </td>
              <td>
                <div>{{ cita.Nombre_servicio }}</div>
                <div class="vet-motivo" v-if="cita.Motivo && cita.Motivo !== cita.Nombre_servicio">{{ cita.Motivo }}</div>
                <div class="vet-obs-preview" v-if="cita.Observaciones">"{{ cita.Observaciones }}"</div>
              </td>
              <td>
                <div class="vet-fecha">{{ formatFecha(cita.Fecha) }}</div>
                <div class="vet-hora">{{ formatHora(cita.Hora) }}</div>
              </td>
              <td><span :class="badgeClass(estadoCita(cita))">{{ estadoCita(cita) }}</span></td>
              <td>
                <div class="vet-row-actions">
                  <!-- Pendiente: confirmar o cancelar -->
                  <template v-if="estadoCita(cita) === 'Pendiente'">
                    <button class="vet-btn vet-btn-ok" :disabled="accionEnCurso === cita.ID_cita" @click="confirmarRapido(cita)">✓ Confirmar</button>
                    <button class="vet-btn vet-btn-no" :disabled="accionEnCurso === cita.ID_cita" @click="pedirCancelar(cita)">✕ Cancelar</button>
                  </template>
                  <!-- Confirmada: completar o cancelar -->
                  <template v-else-if="estadoCita(cita) === 'Confirmada'">
                    <button class="vet-btn vet-btn-done" :disabled="accionEnCurso === cita.ID_cita" @click="completarCita(cita)">☑ Completar</button>
                    <button class="vet-btn vet-btn-no" :disabled="accionEnCurso === cita.ID_cita" @click="pedirCancelar(cita)">✕ Cancelar</button>
                  </template>
                  <button class="vet-btn vet-btn-ghost" @click="abrirDetalle(cita)">Ver</button>
                  <button v-if="puedeConfirmar(cita)" class="vet-btn vet-btn-ghost" @click="abrirConfirmar(cita)" title="Agregar observaciones">📝 Notas</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <AppFooter />

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
        <div class="vet-detail-row"><span class="vet-detail-label">Hora</span><span class="vet-detail-value">{{ formatHora(citaSeleccionada.Hora) }}</span></div>
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
          Notas / Confirmar
        </button>
      </div>
    </div>
  </div>

  <!-- ── Modal: Cancelar cita ────────────────────────────────── -->
  <div v-if="mostrarModalCancelar" class="modal-overlay" @click.self="mostrarModalCancelar = false">
    <div class="vet-modal" style="max-width:400px;">
      <div class="vet-modal-body" style="text-align:center; padding:1.8rem 1.4rem 1rem;">
        <div style="font-size:2.4rem; margin-bottom:.4rem;">⚠️</div>
        <h3 style="font-family:'Nunito',sans-serif; font-weight:800; margin-bottom:.4rem;">¿Cancelar esta cita?</h3>
        <p style="color:var(--text-secondary); font-size:.9rem;">
          {{ citaSeleccionada?.Nombre_mascota }} · {{ formatFecha(citaSeleccionada?.Fecha) }} · {{ formatHora(citaSeleccionada?.Hora) }}<br>
          El horario quedará libre para otros clientes.
        </p>
      </div>
      <div class="vet-modal-foot" style="justify-content:center;">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalCancelar = false">No, mantenerla</button>
        <button class="btn btn-danger btn-sm" @click="confirmarCancelacion">Sí, cancelar cita</button>
      </div>
    </div>
  </div>

  <!-- ── Modal: Confirmar y agregar observaciones ────────────── -->
  <div v-if="mostrarModalConfirmar" class="modal-overlay" @click.self="mostrarModalConfirmar = false">
    <div class="vet-modal">
      <div class="vet-modal-head">
        <h3>Notas de la cita — {{ citaSeleccionada?.Nombre_mascota }}</h3>
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
          {{ guardando ? 'Guardando...' : (estadoBase(citaSeleccionada || {}) === 'Pendiente' ? 'Confirmar y guardar' : 'Guardar notas') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vet-wrapper {
  max-width: 1100px;
  margin: 2rem auto 0;
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

/* ── Pestañas de estado ── */
.vet-tabs { display: flex; gap: .45rem; flex-wrap: wrap; margin-bottom: 1rem; }
.vet-tab {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: .45rem .9rem; border-radius: 999px;
  border: 1.5px solid var(--border); background: var(--white);
  font-size: .85rem; font-weight: 700; color: var(--text-secondary);
  cursor: pointer; transition: all .15s;
}
.vet-tab:hover { border-color: var(--purple-light); color: var(--purple); }
.vet-tab.activa { background: var(--purple); border-color: var(--purple); color: #fff; }
.vet-tab-n {
  min-width: 20px; padding: 0 .35rem; border-radius: 999px; text-align: center;
  background: #f3f4f6; color: var(--text); font-size: .74rem; line-height: 20px;
}
.vet-tab.activa .vet-tab-n { background: rgba(255,255,255,.25); color: #fff; }

.vet-toast {
  background: var(--green-bg); color: #166534; border: 1px solid #bbf7d0;
  padding: .7rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;
  font-weight: 700; font-size: .9rem;
}
.vet-dueno-nombre { font-weight: 600; color: var(--text); }
.th-acciones { text-align: right; }

/* ── Botones de acción de la cita ── */
.vet-row-actions { flex-wrap: wrap; align-items: center; }
.vet-btn {
  border: 1.5px solid transparent; border-radius: 8px;
  padding: .4rem .75rem; font-size: .8rem; font-weight: 700;
  cursor: pointer; white-space: nowrap; transition: all .15s;
}
.vet-btn:disabled { opacity: .55; cursor: not-allowed; }
.vet-btn-ok   { background: #16a34a; color: #fff; }
.vet-btn-ok:hover:not(:disabled) { background: #15803d; }
.vet-btn-done { background: #2563eb; color: #fff; }
.vet-btn-done:hover:not(:disabled) { background: #1d4ed8; }
.vet-btn-no   { background: #fff; color: #dc2626; border-color: #fecaca; }
.vet-btn-no:hover:not(:disabled) { background: #fef2f2; border-color: #dc2626; }
.vet-btn-ghost { background: #f3f4f6; color: var(--text-secondary); }
.vet-btn-ghost:hover { background: #e5e7eb; }
</style>