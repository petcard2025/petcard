<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AdminLayout from './AdminLayout.vue'
import CampoOpciones from '../shared/campo-opciones.vue'
import BuscadorLupa from '../shared/buscador-lupa.vue'
import { categoriaDeServicio, motivosCita, observacionesCita } from '../../utils/opcionesClinicas'
import { coincideBusqueda, sugerenciasMascota } from '../../utils/busqueda'
import { API_URL } from '../../api.js'
import {
  FECHA_MAX_CITA, HORAS_CITA, validarFechaCita, validarFechaHoraCita,
  hoyColombia, horaA24, formatHora, construirHoras
} from '../../utils/validators'

// Rango permitido para agendar: desde hoy hasta el 31/12/2026
const fechaMin = hoyColombia()
const fechaMax = FECHA_MAX_CITA
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
const citaSeleccionada = ref(null)
const hoy = hoyColombia()

const TODAS_LAS_HORAS = HORAS_CITA
const ESTADOS = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada']

// Fecha, hora y veterinario con los que se abrio la cita a editar (para saber si se esta reprogramando)
const citaOriginal = ref(null)

const horasDisponiblesNuevo = ref(TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true })))
const cargandoHorasNuevo = ref(false)
const horasDisponiblesEditar = ref(TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true })))
const cargandoHorasEditar = ref(false)

function getToken() {
  return localStorage.getItem('petcard_token')
}

// Lee el mensaje de error que devuelve el servidor (ej. "Esa hora ya pasó...") para mostrarlo tal cual
async function mensajeDeError(res, porDefecto) {
  try {
    const data = await res.json()
    return data.error || porDefecto
  } catch {
    return porDefecto
  }
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

// Una hora se ofrece solo si no la tiene otra cita y no ha pasado ya (si la fecha es hoy).
// Solo se aplica la respuesta mas reciente de cada formulario.
let ultimaConsultaNuevo = 0
async function cargarHorasNuevo() {
  const consulta = ++ultimaConsultaNuevo
  if (!nuevaCita.value.ID_veterinario || !nuevaCita.value.Fecha) {
    horasDisponiblesNuevo.value = construirHoras(nuevaCita.value.Fecha)
    cargandoHorasNuevo.value = false
    return
  }
  cargandoHorasNuevo.value = true
  try {
    const res = await fetch(
      `${API}/citas/horas-ocupadas?ID_veterinario=${nuevaCita.value.ID_veterinario}&Fecha=${nuevaCita.value.Fecha}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    )
    if (!res.ok) throw new Error(await mensajeDeError(res, 'No se pudo consultar la disponibilidad.'))
    const data = await res.json()
    if (consulta !== ultimaConsultaNuevo) return
    horasDisponiblesNuevo.value = construirHoras(nuevaCita.value.Fecha, data.horasOcupadas || [])
    const h = nuevaCita.value.Hora
    if (h && !horasDisponiblesNuevo.value.some(x => x.hora === h && x.disponible)) nuevaCita.value.Hora = ''
  } catch (e) {
    if (consulta !== ultimaConsultaNuevo) return
    // Sin saber la disponibilidad real no se ofrece ninguna hora
    horasDisponiblesNuevo.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: false }))
    nuevaCita.value.Hora = ''
    error.value = e.message || 'No se pudo consultar la disponibilidad.'
  } finally {
    if (consulta === ultimaConsultaNuevo) cargandoHorasNuevo.value = false
  }
}

let ultimaConsultaEditar = 0
async function cargarHorasEditar() {
  const consulta = ++ultimaConsultaEditar
  if (!citaSeleccionada.value?.ID_veterinario || !citaSeleccionada.value?.Fecha) {
    horasDisponiblesEditar.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true }))
    cargandoHorasEditar.value = false
    return
  }
  cargandoHorasEditar.value = true
  try {
    const fechaSolo = String(citaSeleccionada.value.Fecha).slice(0, 10)
    const res = await fetch(
      `${API}/citas/horas-ocupadas?ID_veterinario=${citaSeleccionada.value.ID_veterinario}&Fecha=${fechaSolo}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    )
    if (!res.ok) throw new Error(await mensajeDeError(res, 'No se pudo consultar la disponibilidad.'))
    const data = await res.json()
    if (consulta !== ultimaConsultaEditar) return
    let lista = construirHoras(fechaSolo, data.horasOcupadas || [])

    // Si no se cambia ni el veterinario ni el dia, la hora de ESTA misma cita siempre se puede conservar
    // (aunque ya haya pasado, o aparezca "ocupada" por la propia cita).
    const o = citaOriginal.value
    const mismaAgenda = o && String(o.ID_veterinario) === String(citaSeleccionada.value.ID_veterinario) && o.Fecha === fechaSolo
    if (mismaAgenda) {
      const horaOriginal = horaA24(o.Hora)
      lista = lista.map(i => (horaA24(i.hora) === horaOriginal ? { ...i, disponible: true } : i))
    }
    horasDisponiblesEditar.value = lista
  } catch (e) {
    if (consulta !== ultimaConsultaEditar) return
    horasDisponiblesEditar.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: false }))
    error.value = e.message || 'No se pudo consultar la disponibilidad.'
  } finally {
    if (consulta === ultimaConsultaEditar) cargandoHorasEditar.value = false
  }
}

watch(() => nuevaCita.value.ID_veterinario, cargarHorasNuevo)
watch(() => nuevaCita.value.Fecha, cargarHorasNuevo)
watch(() => citaSeleccionada.value?.ID_veterinario, cargarHorasEditar)
watch(() => citaSeleccionada.value?.Fecha, cargarHorasEditar)

// Una cita es "anterior" si su fecha ya pasó. Esas no salen en la lista principal:
// solo aparecen cuando se busca por texto o se elige un estado en el filtro.
function esAnterior(cita) {
  return String(cita.Fecha || '').slice(0, 10) < hoy
}

const buscando = computed(() => busqueda.value.trim() !== '' || filtroEstado.value !== 'Todos')

// Esta vista busca por mascota y cliente (y servicio)
const sugerenciasBusqueda = computed(() =>
  sugerenciasMascota(citas.value, c => c.Nombre_mascota, c => c.Nombre_cliente)
)

// Motivos y observaciones de opción múltiple según el servicio elegido
const categoriaDe = (idServicio) =>
  categoriaDeServicio(servicios.value.find(s => String(s.ID_servicio) === String(idServicio)))
const motivosNuevo = computed(() => motivosCita(categoriaDe(nuevaCita.value.ID_servicio)))
const observacionesNuevo = computed(() => observacionesCita(categoriaDe(nuevaCita.value.ID_servicio)))
const motivosEdicion = computed(() => motivosCita(categoriaDe(citaSeleccionada.value?.ID_servicio)))
const observacionesEdicion = computed(() => observacionesCita(categoriaDe(citaSeleccionada.value?.ID_servicio)))

const citasFiltradas = computed(() => {
  return citas.value
    .filter(c => {
      const coincide = coincideBusqueda(busqueda.value, c.Nombre_mascota, c.Nombre_cliente, c.Nombre_servicio)
      const coincideEstado = filtroEstado.value === 'Todos' || estadoCita(c) === filtroEstado.value
      const visible = buscando.value || !esAnterior(c)
      return coincide && coincideEstado && visible
    })
    // Las citas recién creadas primero (ID más alto = creada más recientemente)
    .sort((a, b) => Number(b.ID_cita) - Number(a.ID_cita))
})

const anterioresOcultas = computed(() => buscando.value ? 0 : citas.value.filter(esAnterior).length)

// Estado guardado en la cita ("pendiente" -> "Pendiente"). Es el que se edita y se envía al servidor.
function estadoBase(cita) {
  const e = String(cita.Estado || 'Pendiente').toLowerCase()
  return ESTADOS.find(x => x.toLowerCase() === e) || (e === 'completa' ? 'Completada' : 'Pendiente')
}

// Estado que se muestra: una cita Pendiente/Confirmada cuya fecha ya pasó se ve como "Vencida".
function estadoCita(cita) {
  const e = estadoBase(cita)
  if ((e === 'Pendiente' || e === 'Confirmada') && esAnterior(cita)) return 'Vencida'
  return e
}

function badgeClass(estado) {
  if (estado === 'Confirmada') return 'badge badge-green'
  if (estado === 'Pendiente') return 'badge badge-yellow'
  if (estado === 'Cancelada') return 'badge badge-red'
  return 'badge badge-gray'
}

function abrirEditar(cita) {
  const fecha = String(cita.Fecha).slice(0, 10)
  citaSeleccionada.value = { ...cita, Fecha: fecha, Estado: estadoBase(cita) }
  citaOriginal.value = { Fecha: fecha, Hora: cita.Hora, ID_veterinario: cita.ID_veterinario }
  mostrarModalEditar.value = true
  cargarHorasEditar()
}

function abrirNuevo() {
  nuevaCita.value = { ID_cliente: '', ID_mascota: '', ID_servicio: '', ID_veterinario: '', Fecha: '', Hora: '', Motivo: '', Observaciones: '' }
  horasDisponiblesNuevo.value = TODAS_LAS_HORAS.map(h => ({ hora: h, disponible: true }))
  mostrarModalNuevo.value = true
}

async function guardarEdicion() {
  const c = citaSeleccionada.value
  const o = citaOriginal.value
  const cambiaFecha = !!o && c.Fecha !== o.Fecha
  const mueveHorario = !!o && (cambiaFecha || horaA24(c.Hora) !== horaA24(o.Hora))

  // Una fecha ya vencida se tolera solo si la cita no se mueve; nunca posterior al 31/12/2026
  const errFecha = validarFechaCita(c.Fecha, { permitirPasado: !cambiaFecha })
  if (errFecha) {
    alert(errFecha)
    return
  }
  // Si se reprograma para hoy, la hora no puede haber pasado ya
  if (mueveHorario) {
    const errHora = validarFechaHoraCita(c.Fecha, c.Hora)
    if (errHora) {
      alert(errHora)
      await cargarHorasEditar()
      return
    }
  }
  try {
    const res = await fetch(`${API}/citas/${c.ID_cita}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      // Solo los campos editables (antes se enviaba el objeto completo, con nombres y datos de solo lectura)
      body: JSON.stringify({
        ID_servicio: c.ID_servicio,
        ID_veterinario: c.ID_veterinario,
        Fecha: c.Fecha,
        Hora: c.Hora,
        Motivo: c.Motivo,
        Observaciones: c.Observaciones,
        Estado: c.Estado
      })
    })
    if (!res.ok) throw new Error(await mensajeDeError(res, 'Error al guardar los cambios.'))
    await cargarCitas()
    mostrarModalEditar.value = false
  } catch (e) {
    alert(e.message || 'Error al guardar los cambios.')
  }
}

async function crearCita() {
  const errFecha = validarFechaCita(nuevaCita.value.Fecha)
  if (errFecha) {
    alert(errFecha)
    return
  }
  // Si es hoy, la hora elegida no puede haber pasado ya (ej. son las 8:01 y eligio las 8:00)
  const errHora = validarFechaHoraCita(nuevaCita.value.Fecha, nuevaCita.value.Hora)
  if (errHora) {
    alert(errHora)
    nuevaCita.value.Hora = ''
    await cargarHorasNuevo()
    return
  }
  const mascota = mascotas.value.find(m => m.ID_mascota == nuevaCita.value.ID_mascota)
  if (mascota) nuevaCita.value.ID_cliente = mascota.ID_cliente
  try {
    const res = await fetch(`${API}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(nuevaCita.value)
    })
    if (!res.ok) throw new Error(await mensajeDeError(res, 'No se pudo crear la cita.'))
    await cargarCitas()
    nuevaCita.value = { ID_cliente: '', ID_mascota: '', ID_servicio: '', ID_veterinario: '', Fecha: '', Hora: '', Motivo: '', Observaciones: '' }
    mostrarModalNuevo.value = false
  } catch (e) {
    // Antes fallaba en silencio: ahora se dice por que (horario ocupado, hora pasada, etc.)
    nuevaCita.value.Hora = ''
    await cargarHorasNuevo()
    alert(e.message || 'No se pudo crear la cita.')
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
      <BuscadorLupa v-model="busqueda" :sugerencias="sugerenciasBusqueda" placeholder="Buscar por mascota, cliente o servicio..." />
      <select class="filter-select" v-model="filtroEstado">
        <option>Todos</option>
        <option>Pendiente</option>
        <option>Confirmada</option>
        <option>Completada</option>
        <option>Cancelada</option>
        <option>Vencida</option>
      </select>
    </div>

    <div v-if="anterioresOcultas > 0" style="font-size:.82rem;color:#64748b;margin:-.25rem 0 .75rem;">
      Mostrando las citas de hoy en adelante, las más recientes primero. Hay {{ anterioresOcultas }} cita{{ anterioresOcultas === 1 ? '' : 's' }} anterior{{ anterioresOcultas === 1 ? '' : 'es' }} que se ven al buscar.
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
          <div class="admin-card-meta">📅 {{ cita.Fecha?.slice(0,10) }} — 🕐 {{ formatHora(cita.Hora) }}</div>
          <div class="admin-card-meta" v-if="cita.Motivo">Motivo: {{ cita.Motivo }}</div>
          <div class="admin-card-meta" v-if="cita.Observaciones" style="font-style:italic;">"{{ cita.Observaciones }}"</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" @click="abrirEditar(cita)">Editar</button>
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
            <option v-for="m in mascotas" :key="m.ID_mascota" :value="m.ID_mascota">{{ m.Nombre }} ({{ m.Especie }}) — {{ m.Nombre_dueno }}</option>
          </select>
          <label>Servicio</label>
          <select v-model="nuevaCita.ID_servicio" @change="nuevaCita.Motivo = ''; nuevaCita.Observaciones = ''">
            <option value="" disabled>Selecciona servicio</option>
            <option v-for="s in servicios" :key="s.ID_servicio" :value="s.ID_servicio">{{ s.Nombre }}</option>
          </select>
          <label>Veterinario</label>
          <select v-model="nuevaCita.ID_veterinario">
            <option value="" disabled>Selecciona veterinario</option>
            <option v-for="v in veterinarios" :key="v.ID_veterinario" :value="v.ID_veterinario">{{ v.Nombre }}</option>
          </select>
          <label>Fecha</label>
          <input type="date" v-model="nuevaCita.Fecha" :min="fechaMin" :max="fechaMax" />

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
          <CampoOpciones v-model="nuevaCita.Motivo" :options="motivosNuevo" placeholder="-- Selecciona el motivo de la cita --" />
          <label>Observaciones</label>
          <CampoOpciones v-model="nuevaCita.Observaciones" multiple separador=" | " :options="observacionesNuevo" placeholder="Selecciona las observaciones (opcional)" />
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
          <input type="date" v-model="citaSeleccionada.Fecha" :max="fechaMax" />

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

          <label>Estado</label>
          <select v-model="citaSeleccionada.Estado">
            <option v-for="e in ESTADOS" :key="e" :value="e">{{ e }}</option>
          </select>
          <label>Motivo</label>
          <CampoOpciones v-model="citaSeleccionada.Motivo" :options="motivosEdicion" placeholder="-- Selecciona el motivo de la cita --" />
          <label>Observaciones</label>
          <CampoOpciones v-model="citaSeleccionada.Observaciones" multiple separador=" | " :options="observacionesEdicion" placeholder="Selecciona las observaciones (opcional)" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEditar = false">Cancelar</button>
          <button class="btn btn-success btn-sm" :disabled="!citaSeleccionada.Hora" @click="guardarEdicion">Guardar</button>
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