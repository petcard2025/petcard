<script setup>
import AppFooter from '../shared/AppFooter.vue'
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { API_URL } from '../../api.js'
import PlanSugerido from '../shared/PlanSugerido.vue'
import { generarPlanes, edadEnMeses, textoEdad, planAPayload, ESPECIES_PLAN, ICONO_ESPECIE } from '../../utils/planesAlimentacion'

const { usuarioLogueado, cerrarSesion } = useAuth()
const API = API_URL

// ── Estado ────────────────────────────────────────────────────
const planes = ref([])
const mascotas = ref([])           // usado solo si es admin (lista completa)
const opcionesAtendidas = ref([])  // usado si es veterinario: pares mascota+servicio que ha atendido
const servicios = ref([])
const busqueda = ref('')
const filtroEstado = ref('Todos')
const cargando = ref(false)
const error = ref('')
const guardando = ref(false)
const mensajeExito = ref('')
const avisoPlanAplicado = ref('')      // banner de éxito tras aplicar un plan sugerido
const mostrarModalAplicar = ref(false)
const aplicando = ref(null)           // { m: mascota, p: plan sugerido }
const errorAplicar = ref('')

const rol = computed(() => (usuarioLogueado.value?.Rol || '').toLowerCase())
const esAdmin = computed(() => rol.value === 'administrador' || rol.value === 'admin')

const mostrarModalNuevo = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const mostrarModalDetalle = ref(false)
const planSeleccionado = ref(null)
const planAEliminar = ref(null)

const planVacio = () => ({
  ID_mascota: '',
  ID_servicio: '',
  Tipo_dieta: '',
  Frecuencia: '',
  Horario: '',
  Calorias: '',
  Alergias: '',
  Suplementos: '',
  Comidas: '',
  Fecha_inicio: '',
  Fecha_fin: '',
  Diagnostico: '',
  Observaciones: '',
  Revision_nutricional: 'Activo'
})

const nuevoPlan = ref(planVacio())

// ── Planes por especie ────────────────────────────────────────
const catalogo = ref([])            // mascotas registradas (con peso y fecha de nacimiento)
const especieActiva = ref('')
const mascotaAbierta = ref(null)    // ID_mascota con los planes desplegados
const errorCatalogo = ref('')

// ── Carga de datos ────────────────────────────────────────────
onMounted(async () => {
  const tareas = [cargarPlanes(), cargarServicios(), cargarCatalogo()]
  if (esAdmin.value) tareas.push(cargarMascotas())
  else tareas.push(cargarOpcionesAtendidas())
  await Promise.all(tareas)
})

async function fetchJson(endpoint, options = {}) {
  const token = localStorage.getItem('petcard_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }
  const res = await fetch(`${API}${endpoint}`, { mode: 'cors', headers, ...options })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
  return data
}

async function cargarPlanes() {
  cargando.value = true
  error.value = ''
  try {
    planes.value = await fetchJson('/alimentacion')
  } catch (e) {
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

async function cargarCatalogo() {
  try {
    catalogo.value = await fetchJson('/mascotas/catalogo')
  } catch (e) {
    errorCatalogo.value = 'No se pudo cargar la lista de mascotas por especie.'
  }
}

async function cargarMascotas() {
  try {
    mascotas.value = await fetchJson('/mascotas')
  } catch (e) {}
}

// El veterinario no puede listar /mascotas (solo Admin). En su lugar,
// derivamos las mascotas+servicios que él mismo ha atendido a partir de sus citas,
// que es exactamente lo que el backend permite crear/editar como plan.
async function cargarOpcionesAtendidas() {
  try {
    const citas = await fetchJson('/citas')
    const vistos = new Set()
    const opciones = []
    for (const c of citas) {
      const clave = `${c.ID_mascota}-${c.ID_servicio}`
      if (vistos.has(clave)) continue
      vistos.add(clave)
      opciones.push({
        ID_mascota: c.ID_mascota,
        Nombre_mascota: c.Nombre_mascota,
        ID_servicio: c.ID_servicio,
        Nombre_servicio: c.Nombre_servicio
      })
    }
    opcionesAtendidas.value = opciones
  } catch (e) {}
}

function seleccionarOpcionAtendida(clave) {
  const [idMascota, idServicio] = clave.split('-')
  nuevoPlan.value.ID_mascota = idMascota
  nuevoPlan.value.ID_servicio = idServicio
}

async function cargarServicios() {
  try {
    servicios.value = await fetchJson('/servicios')
  } catch (e) {}
}

// ── Planes por especie: lógica ────────────────────────────────
const conteoEspecie = computed(() => {
  const c = {}
  for (const e of ESPECIES_PLAN) c[e] = 0
  for (const m of catalogo.value) if (c[m.Especie] !== undefined) c[m.Especie]++
  return c
})

// Mascotas de especies que no manejan planes (Pez, Reptil, Otro...)
const otrasEspecies = computed(() =>
  catalogo.value.filter(m => !ESPECIES_PLAN.includes(m.Especie))
)

const mascotasEspecie = computed(() =>
  catalogo.value.filter(m => m.Especie === especieActiva.value)
)

function elegirEspecie(especie) {
  especieActiva.value = especieActiva.value === especie ? '' : especie
  mascotaAbierta.value = null
}

function alternarMascota(m) {
  mascotaAbierta.value = mascotaAbierta.value === m.ID_mascota ? null : m.ID_mascota
}

const planesDe = (m) => generarPlanes(m)
const edadDe = (m) => textoEdad(edadEnMeses(m.Fecha_nacimiento))

// Plan activo que ya tiene la mascota (para avisarlo en la lista)
function planAsignadoDe(m) {
  return planes.value.find(p => p.ID_mascota === m.ID_mascota && (p.Revision_nutricional || '') === 'Activo') || null
}

// El veterinario solo puede asignar planes a mascotas que ha atendido (regla del backend).
// El administrador puede a cualquiera.
const opcionAtendida = (m) => opcionesAtendidas.value.find(o => o.ID_mascota === m.ID_mascota) || null
const puedeAsignar = (m) => esAdmin.value || !!opcionAtendida(m)

function usarPlanSugerido(m, p) {
  const op = opcionAtendida(m)
  nuevoPlan.value = { ...planVacio(), ...planAPayload(p, m.ID_mascota, op?.ID_servicio) }
  mensajeExito.value = ''
  mostrarModalNuevo.value = true
}

// Aplicar el plan recomendado directamente (sin llenar el formulario):
// se actualiza/crea el plan de la mascota en la base de datos y el usuario lo ve de inmediato.
function pedirAplicarPlan(m, p) {
  aplicando.value = { m, p }
  errorAplicar.value = ''
  mostrarModalAplicar.value = true
}

async function confirmarAplicarPlan() {
  const { m, p } = aplicando.value
  guardando.value = true
  errorAplicar.value = ''
  try {
    const op = opcionAtendida(m)
    const payload = planAPayload(p, m.ID_mascota, op?.ID_servicio)
    const r = await fetchJson('/alimentacion/sugerido', { method: 'POST', body: JSON.stringify(payload) })
    await cargarPlanes()
    mostrarModalAplicar.value = false
    avisoPlanAplicado.value = `✅ Plan "${p.titulo}" ${r.accion === 'creado' ? 'asignado' : 'actualizado'} para ${m.Nombre}. Ya lo ve su dueño en Alimentación.`
    setTimeout(() => { avisoPlanAplicado.value = '' }, 6000)
  } catch (e) {
    errorAplicar.value = e.message || 'No se pudo aplicar el plan.'
  } finally {
    guardando.value = false
  }
}

// Valor que muestra el selector de "mascota atendida" cuando el plan viene prellenado
const claveOpcionActual = computed(() =>
  nuevoPlan.value.ID_mascota && nuevoPlan.value.ID_servicio
    ? `${nuevoPlan.value.ID_mascota}-${nuevoPlan.value.ID_servicio}`
    : ''
)

// ── Filtros ───────────────────────────────────────────────────
const planesFiltrados = computed(() => {
  return planes.value
    .filter(p => {
      const texto = `${p.Nombre_mascota || ''} ${p.Tipo_dieta || ''}`.toLowerCase()
      const coincideBusqueda = texto.includes(busqueda.value.toLowerCase())
      const estado = p.Revision_nutricional || 'Pendiente'
      const coincideEstado = filtroEstado.value === 'Todos' || estado === filtroEstado.value
      return coincideBusqueda && coincideEstado
    })
})

const totalResultados = computed(() => planesFiltrados.value.length)

function badgeClass(estado) {
  if (estado === 'Activo') return 'badge badge-green'
  if (estado === 'Pendiente') return 'badge badge-yellow'
  return 'badge badge-gray'
}

function iniciales(nombre) {
  if (!nombre) return '—'
  return nombre.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

// Normaliza cualquier fecha (ISO completo, Date, etc.) al formato yyyy-MM-dd
// que requieren tanto el <input type="date"> como el backend (columna DATE de MySQL).
function aFechaInput(fecha) {
  if (!fecha) return ''
  return String(fecha).slice(0, 10)
}

// ── Crear ─────────────────────────────────────────────────────
function abrirNuevo() {
  nuevoPlan.value = planVacio()
  mensajeExito.value = ''
  mostrarModalNuevo.value = true
}

async function crearPlan() {
  if (!nuevoPlan.value.ID_mascota || !nuevoPlan.value.Tipo_dieta || !nuevoPlan.value.Frecuencia || !nuevoPlan.value.Calorias) {
    error.value = 'Selecciona la mascota y completa al menos tipo de dieta, frecuencia y calorías.'
    return
  }
  guardando.value = true
  error.value = ''
  try {
    const payload = {
      ...nuevoPlan.value,
      Calorias: Number(nuevoPlan.value.Calorias) || 0,
      Fecha_inicio: aFechaInput(nuevoPlan.value.Fecha_inicio) || null,
      Fecha_fin: aFechaInput(nuevoPlan.value.Fecha_fin) || null
    }
    await fetchJson('/alimentacion', { method: 'POST', body: JSON.stringify(payload) })
    await cargarPlanes()
    mostrarModalNuevo.value = false
  } catch (e) {
    error.value = 'No se pudo crear el plan de alimentación.'
  } finally {
    guardando.value = false
  }
}

// ── Editar ────────────────────────────────────────────────────
function abrirEditar(plan) {
  planSeleccionado.value = {
    ...plan,
    Fecha_inicio: aFechaInput(plan.Fecha_inicio),
    Fecha_fin: aFechaInput(plan.Fecha_fin)
  }
  mensajeExito.value = ''
  mostrarModalEditar.value = true
}

async function guardarEdicion() {
  guardando.value = true
  error.value = ''
  try {
    const payload = {
      ...planSeleccionado.value,
      Calorias: Number(planSeleccionado.value.Calorias) || 0,
      Fecha_inicio: aFechaInput(planSeleccionado.value.Fecha_inicio) || null,
      Fecha_fin: aFechaInput(planSeleccionado.value.Fecha_fin) || null
    }
    await fetchJson(`/alimentacion/${planSeleccionado.value.ID_planAlimentacion}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    await cargarPlanes()
    mostrarModalEditar.value = false
  } catch (e) {
    error.value = 'No se pudo guardar el plan.'
  } finally {
    guardando.value = false
  }
}

// ── Detalle ───────────────────────────────────────────────────
function abrirDetalle(plan) {
  planSeleccionado.value = plan
  mostrarModalDetalle.value = true
}

// ── Eliminar ──────────────────────────────────────────────────
function confirmarEliminar(plan) {
  planAEliminar.value = plan
  mostrarModalEliminar.value = true
}

async function eliminarPlan() {
  guardando.value = true
  try {
    await fetchJson(`/alimentacion/${planAEliminar.value.ID_planAlimentacion}`, { method: 'DELETE' })
    await cargarPlanes()
    mostrarModalEliminar.value = false
    planAEliminar.value = null
  } catch (e) {
    error.value = 'No se pudo eliminar el plan.'
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
      <li><router-link to="/veterinario-citas">Mis Citas</router-link></li>
      <li><router-link to="/veterinario-alimentacion" class="active">Alimentación</router-link></li>
    </ul>
    <div class="nav-actions" style="margin-left:auto;">
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <div class="vet-wrapper">
    <div class="vet-page-head">
      <div>
        <div class="vet-eyebrow">NUTRICIÓN VETERINARIA</div>
        <h1 class="vet-page-title">Planes de Alimentación</h1>
        <p class="vet-page-sub">Crea y administra los planes nutricionales de las mascotas, {{ usuarioLogueado?.Nombre || '' }}</p>
      </div>
      <button class="btn btn-success btn-sm" @click="abrirNuevo">+ Nuevo Plan</button>
    </div>


    <!-- ── Planes por especie ───────────────────────────────── -->
    <section class="ve-panel">
      <div class="ve-panel-head">
        <div>
          <h2 class="ve-panel-title">Planes sugeridos por especie</h2>
          <p class="ve-panel-sub">Elige una especie para ver las mascotas registradas con su peso y edad, y los planes de alimentación sugeridos para cada una.</p>
        </div>
      </div>

      <div v-if="avisoPlanAplicado" class="ve-exito">{{ avisoPlanAplicado }}</div>
      <div v-if="errorCatalogo" class="vet-alert">⚠️ {{ errorCatalogo }}</div>

      <div class="ve-chips">
        <button v-for="e in ESPECIES_PLAN" :key="e" type="button" class="ve-chip"
                :class="{ activo: especieActiva === e }" @click="elegirEspecie(e)">
          <span class="ve-chip-ico">{{ ICONO_ESPECIE[e] }}</span>
          <span>{{ e }}s</span>
          <span class="ve-chip-n">{{ conteoEspecie[e] }}</span>
        </button>
      </div>

      <p v-if="otrasEspecies.length" class="ve-aviso">
        {{ otrasEspecies.length }} {{ otrasEspecies.length === 1 ? 'mascota registrada es' : 'mascotas registradas son' }} de otras especies
        ({{ [...new Set(otrasEspecies.map(m => m.Especie || 'sin especie'))].join(', ') }}) y no tienen planes de alimentación sugeridos.
      </p>

      <div v-if="especieActiva">
        <div v-if="mascotasEspecie.length === 0" class="vet-empty">No hay {{ especieActiva.toLowerCase() }}s registrados todavía.</div>

        <div v-for="m in mascotasEspecie" :key="m.ID_mascota" class="ve-mascota">
          <div class="ve-mascota-head" @click="alternarMascota(m)">
            <span class="vet-avatar-sm">{{ iniciales(m.Nombre) }}</span>
            <div class="ve-mascota-info">
              <div class="ve-mascota-nombre">{{ m.Nombre }}
                <span v-if="planAsignadoDe(m)" class="badge badge-green" style="margin-left:.4rem;">Plan activo</span>
              </div>
              <div class="ve-mascota-meta">{{ m.Raza || m.Especie }} · {{ m.Sexo || '—' }} · Dueño: {{ m.Nombre_dueno || '—' }}</div>
            </div>
            <div class="ve-dato"><span>Peso</span><strong>{{ m.Peso ? m.Peso + ' kg' : '—' }}</strong></div>
            <div class="ve-dato"><span>Edad</span><strong>{{ edadDe(m) }}</strong></div>
            <button type="button" class="btn btn-secondary btn-sm">{{ mascotaAbierta === m.ID_mascota ? 'Ocultar planes' : 'Ver planes' }}</button>
          </div>

          <div v-if="mascotaAbierta === m.ID_mascota" class="ve-planes">
            <div v-if="planesDe(m).aviso && !planesDe(m).planes.length" class="vet-empty">{{ planesDe(m).aviso }}</div>
            <template v-else>
              <p v-if="planesDe(m).aviso" class="ve-aviso">ℹ️ {{ planesDe(m).aviso }}</p>
              <PlanSugerido v-for="p in planesDe(m).planes" :key="p.id" :plan="p">
                <template #acciones>
                  <button v-if="puedeAsignar(m)" type="button" class="btn btn-secondary btn-sm" @click="usarPlanSugerido(m, p)">Personalizar</button>
                  <button type="button" class="btn btn-success btn-sm" @click="pedirAplicarPlan(m, p)">
                    {{ planAsignadoDe(m) ? 'Usar este plan (reemplaza el actual)' : 'Usar este plan' }}
                  </button>
                </template>
              </PlanSugerido>
            </template>
          </div>
        </div>
      </div>
    </section>

    <div v-if="error" class="vet-alert">⚠️ {{ error }}</div>

    <!-- Toolbar -->
    <div class="vet-toolbar">
      <div class="search-wrap" style="flex:1;">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar por mascota o tipo de dieta..." v-model="busqueda"/>
      </div>
      <select class="filter-select" v-model="filtroEstado">
        <option>Todos</option>
        <option>Activo</option>
        <option>Pendiente</option>
      </select>
      <span class="vet-resultados">{{ totalResultados }} resultado{{ totalResultados === 1 ? '' : 's' }}</span>
    </div>

    <!-- Tabla -->
    <div class="vet-table-card">
      <div v-if="cargando" class="vet-empty">Cargando planes de alimentación...</div>
      <div v-else-if="planesFiltrados.length === 0" class="vet-empty">No se encontraron planes con ese filtro.</div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Dieta</th>
              <th>Calorías / Frecuencia</th>
              <th>Periodo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in planesFiltrados" :key="plan.ID_planAlimentacion">
              <td>
                <div class="vet-paciente">
                  <span class="vet-avatar-sm">{{ iniciales(plan.Nombre_mascota) }}</span>
                  <div>
                    <div class="vet-paciente-nombre">{{ plan.Nombre_mascota || 'Mascota' }}</div>
                    <div class="vet-paciente-dueno">{{ plan.Nombre_servicio || 'Sin servicio' }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>{{ plan.Tipo_dieta || '—' }}</div>
                <div class="vet-motivo" v-if="plan.Alergias">Alergias: {{ plan.Alergias }}</div>
              </td>
              <td>
                <div class="vet-fecha">{{ plan.Calorias ? `${plan.Calorias} cal` : '—' }}</div>
                <div class="vet-hora">{{ plan.Frecuencia || '—' }}</div>
              </td>
              <td>
                <div class="vet-fecha">{{ plan.Fecha_inicio ? plan.Fecha_inicio.slice(0,10) : '—' }}</div>
                <div class="vet-hora">{{ plan.Fecha_fin ? plan.Fecha_fin.slice(0,10) : '—' }}</div>
              </td>
              <td><span :class="badgeClass(plan.Revision_nutricional)">{{ (plan.Revision_nutricional || 'Pendiente').toUpperCase() }}</span></td>
              <td>
                <div class="vet-row-actions">
                  <button class="btn btn-secondary btn-sm" @click="abrirDetalle(plan)">Detalle</button>
                  <button class="btn btn-success btn-sm" @click="abrirEditar(plan)">Editar</button>
                  <button v-if="esAdmin" class="btn btn-danger btn-sm" @click="confirmarEliminar(plan)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <AppFooter />

  <!-- ── Modal: Aplicar plan sugerido ───────────────────────── -->
  <div v-if="mostrarModalAplicar && aplicando" class="modal-overlay" @click.self="mostrarModalAplicar = false">
    <div class="vet-modal">
      <div class="vet-modal-head">
        <h3>Usar plan sugerido</h3>
        <button class="vet-modal-close" @click="mostrarModalAplicar = false">&times;</button>
      </div>
      <div class="vet-modal-body">
        <p style="margin-bottom:.75rem;">
          Se asignará <strong>{{ aplicando.p.titulo }}</strong> a <strong>{{ aplicando.m.Nombre }}</strong>
          y el dueño lo verá de inmediato en su pantalla de Alimentación.
        </p>
        <div class="vet-info-box">
          <div>Dieta: <strong>{{ aplicando.p.tipoDieta }}</strong></div>
          <div>{{ aplicando.p.frecuencia }} · {{ aplicando.p.calorias }} kcal/día · {{ aplicando.p.horario }}</div>
        </div>
        <p v-if="planAsignadoDe(aplicando.m)" class="ve-aviso" style="margin-top:.75rem;">
          ⚠️ {{ aplicando.m.Nombre }} ya tiene un plan activo
          ({{ planAsignadoDe(aplicando.m).Tipo_dieta || 'sin nombre' }}). Será reemplazado por este.
        </p>
        <div v-if="errorAplicar" class="vet-alert" style="margin-top:.75rem;">⚠️ {{ errorAplicar }}</div>
      </div>
      <div class="vet-modal-foot">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalAplicar = false">Cancelar</button>
        <button class="btn btn-success btn-sm" :disabled="guardando" @click="confirmarAplicarPlan">
          {{ guardando ? 'Guardando...' : 'Sí, usar este plan' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ── Modal: Nuevo plan ───────────────────────────────────── -->
  <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="mostrarModalNuevo = false">
    <div class="vet-modal">
      <div class="vet-modal-head">
        <h3>Nuevo plan de alimentación</h3>
        <button class="vet-modal-close" @click="mostrarModalNuevo = false">&times;</button>
      </div>
      <div class="vet-modal-body">
        <template v-if="esAdmin">
          <div class="form-group">
            <label>Mascota</label>
            <select class="form-control" v-model="nuevoPlan.ID_mascota">
              <option value="">-- Selecciona mascota --</option>
              <option v-for="m in mascotas" :key="m.ID_mascota" :value="m.ID_mascota">{{ m.Nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Servicio</label>
            <select class="form-control" v-model="nuevoPlan.ID_servicio">
              <option value="">-- Selecciona servicio --</option>
              <option v-for="s in servicios" :key="s.ID_servicio" :value="s.ID_servicio">{{ s.Nombre }}</option>
            </select>
          </div>
        </template>
        <template v-else>
          <div class="form-group">
            <label>Mascota / Servicio atendido</label>
            <select class="form-control" :value="claveOpcionActual" @change="seleccionarOpcionAtendida($event.target.value)">
              <option value="">-- Selecciona una mascota que hayas atendido --</option>
              <option v-for="op in opcionesAtendidas" :key="`${op.ID_mascota}-${op.ID_servicio}`" :value="`${op.ID_mascota}-${op.ID_servicio}`">
                {{ op.Nombre_mascota }} — {{ op.Nombre_servicio }}
              </option>
            </select>
            <p style="font-size:.78rem; color:var(--muted); margin-top:.35rem;">
              Solo puedes crear planes para mascotas y servicios de citas que hayas atendido. Si no encuentras la mascota, primero debes tener una cita registrada con ella.
            </p>
          </div>
        </template>
        <div class="form-group">
          <label>Tipo de dieta</label>
          <input class="form-control" v-model="nuevoPlan.Tipo_dieta" placeholder="Balanceada, especial digestiva..." />
        </div>
        <div class="form-row" style="display:flex; gap:1rem;">
          <div class="form-group" style="flex:1;">
            <label>Frecuencia</label>
            <input class="form-control" v-model="nuevoPlan.Frecuencia" placeholder="2 veces al día" />
          </div>
          <div class="form-group" style="flex:1;">
            <label>Calorías</label>
            <input type="number" class="form-control" v-model="nuevoPlan.Calorias" placeholder="1200" />
          </div>
        </div>
        <div class="form-group">
          <label>Horario</label>
          <input class="form-control" v-model="nuevoPlan.Horario" placeholder="8am - 6pm" />
        </div>
        <div class="form-group">
          <label>Alergias</label>
          <input class="form-control" v-model="nuevoPlan.Alergias" placeholder="Ninguna" />
        </div>
        <div class="form-group">
          <label>Suplementos</label>
          <input class="form-control" v-model="nuevoPlan.Suplementos" placeholder="Vitaminas" />
        </div>
        <div class="form-group">
          <label>Comidas</label>
          <textarea class="form-control" v-model="nuevoPlan.Comidas" placeholder="Desayuno 8:00 400 cal, Almuerzo 1:00 500 cal" rows="2"></textarea>
        </div>
        <div class="form-row" style="display:flex; gap:1rem;">
          <div class="form-group" style="flex:1;">
            <label>Fecha inicio</label>
            <input type="date" class="form-control" v-model="nuevoPlan.Fecha_inicio" />
          </div>
          <div class="form-group" style="flex:1;">
            <label>Fecha fin</label>
            <input type="date" class="form-control" v-model="nuevoPlan.Fecha_fin" />
          </div>
        </div>
        <div class="form-group">
          <label>Diagnóstico nutricional</label>
          <textarea class="form-control" v-model="nuevoPlan.Diagnostico" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>Observaciones</label>
          <textarea class="form-control" v-model="nuevoPlan.Observaciones" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>Estado</label>
          <select class="form-control" v-model="nuevoPlan.Revision_nutricional">
            <option>Activo</option>
            <option>Pendiente</option>
          </select>
        </div>
      </div>
      <div class="vet-modal-foot">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalNuevo = false">Cancelar</button>
        <button class="btn btn-success btn-sm" @click="crearPlan" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Crear plan' }}</button>
      </div>
    </div>
  </div>

  <!-- ── Modal: Editar plan ──────────────────────────────────── -->
  <div v-if="mostrarModalEditar && planSeleccionado" class="modal-overlay" @click.self="mostrarModalEditar = false">
    <div class="vet-modal">
      <div class="vet-modal-head">
        <h3>Editar plan — {{ planSeleccionado.Nombre_mascota }}</h3>
        <button class="vet-modal-close" @click="mostrarModalEditar = false">&times;</button>
      </div>
      <div class="vet-modal-body">
        <div class="form-group">
          <label>Tipo de dieta</label>
          <input class="form-control" v-model="planSeleccionado.Tipo_dieta" />
        </div>
        <div class="form-row" style="display:flex; gap:1rem;">
          <div class="form-group" style="flex:1;">
            <label>Frecuencia</label>
            <input class="form-control" v-model="planSeleccionado.Frecuencia" />
          </div>
          <div class="form-group" style="flex:1;">
            <label>Calorías</label>
            <input type="number" class="form-control" v-model="planSeleccionado.Calorias" />
          </div>
        </div>
        <div class="form-group">
          <label>Horario</label>
          <input class="form-control" v-model="planSeleccionado.Horario" />
        </div>
        <div class="form-group">
          <label>Alergias</label>
          <input class="form-control" v-model="planSeleccionado.Alergias" />
        </div>
        <div class="form-group">
          <label>Suplementos</label>
          <input class="form-control" v-model="planSeleccionado.Suplementos" />
        </div>
        <div class="form-group">
          <label>Comidas</label>
          <textarea class="form-control" v-model="planSeleccionado.Comidas" rows="2"></textarea>
        </div>
        <div class="form-row" style="display:flex; gap:1rem;">
          <div class="form-group" style="flex:1;">
            <label>Fecha inicio</label>
            <input type="date" class="form-control" v-model="planSeleccionado.Fecha_inicio" />
          </div>
          <div class="form-group" style="flex:1;">
            <label>Fecha fin</label>
            <input type="date" class="form-control" v-model="planSeleccionado.Fecha_fin" />
          </div>
        </div>
        <div class="form-group">
          <label>Diagnóstico nutricional</label>
          <textarea class="form-control" v-model="planSeleccionado.Diagnostico" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>Observaciones</label>
          <textarea class="form-control" v-model="planSeleccionado.Observaciones" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>Estado</label>
          <select class="form-control" v-model="planSeleccionado.Revision_nutricional">
            <option>Activo</option>
            <option>Pendiente</option>
          </select>
        </div>
      </div>
      <div class="vet-modal-foot">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalEditar = false">Cancelar</button>
        <button class="btn btn-success btn-sm" @click="guardarEdicion" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar cambios' }}</button>
      </div>
    </div>
  </div>

  <!-- ── Modal: Detalle ──────────────────────────────────────── -->
  <div v-if="mostrarModalDetalle && planSeleccionado" class="modal-overlay" @click.self="mostrarModalDetalle = false">
    <div class="vet-modal">
      <div class="vet-modal-head">
        <h3>Detalle del plan</h3>
        <button class="vet-modal-close" @click="mostrarModalDetalle = false">&times;</button>
      </div>
      <div class="vet-modal-body">
        <div class="vet-detail-row"><span class="vet-detail-label">Mascota</span><span class="vet-detail-value">{{ planSeleccionado.Nombre_mascota }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Servicio</span><span class="vet-detail-value">{{ planSeleccionado.Nombre_servicio || '—' }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Tipo de dieta</span><span class="vet-detail-value">{{ planSeleccionado.Tipo_dieta || '—' }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Frecuencia</span><span class="vet-detail-value">{{ planSeleccionado.Frecuencia || '—' }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Horario</span><span class="vet-detail-value">{{ planSeleccionado.Horario || '—' }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Calorías</span><span class="vet-detail-value">{{ planSeleccionado.Calorias || '—' }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Alergias</span><span class="vet-detail-value">{{ planSeleccionado.Alergias || 'Ninguna' }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Suplementos</span><span class="vet-detail-value">{{ planSeleccionado.Suplementos || '—' }}</span></div>
        <div class="vet-detail-row"><span class="vet-detail-label">Periodo</span><span class="vet-detail-value">{{ (planSeleccionado.Fecha_inicio || '—').toString().slice(0,10) }} — {{ (planSeleccionado.Fecha_fin || '—').toString().slice(0,10) }}</span></div>
        <div class="vet-detail-block">
          <span class="vet-detail-label">Comidas</span>
          <p class="vet-detail-textblock">{{ planSeleccionado.Comidas || 'Sin comidas registradas.' }}</p>
        </div>
        <div class="vet-detail-block">
          <span class="vet-detail-label">Diagnóstico</span>
          <p class="vet-detail-textblock">{{ planSeleccionado.Diagnostico || 'No registrado.' }}</p>
        </div>
        <div class="vet-detail-block">
          <span class="vet-detail-label">Observaciones</span>
          <p class="vet-detail-textblock">{{ planSeleccionado.Observaciones || 'Sin observaciones.' }}</p>
        </div>
      </div>
      <div class="vet-modal-foot">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalDetalle = false">Cerrar</button>
        <button class="btn btn-success btn-sm" @click="() => { mostrarModalDetalle = false; abrirEditar(planSeleccionado) }">Editar</button>
      </div>
    </div>
  </div>

  <!-- ── Modal: Eliminar ─────────────────────────────────────── -->
  <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
    <div class="vet-modal" style="max-width:420px;">
      <div class="vet-modal-head">
        <h3>¿Eliminar plan?</h3>
        <button class="vet-modal-close" @click="mostrarModalEliminar = false">&times;</button>
      </div>
      <div class="vet-modal-body">
        <p>¿Estás seguro que deseas eliminar el plan de alimentación de <strong>{{ planAEliminar?.Nombre_mascota }}</strong>? Esta acción no se puede deshacer.</p>
      </div>
      <div class="vet-modal-foot">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalEliminar = false">Cancelar</button>
        <button class="btn btn-danger btn-sm" @click="eliminarPlan" :disabled="guardando">{{ guardando ? 'Eliminando...' : 'Eliminar' }}</button>
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

.vet-page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.vet-eyebrow {
  font-size: .72rem; font-weight: 800; letter-spacing: .08em;
  color: var(--purple); margin-bottom: .25rem;
}
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

.vet-row-actions { display: flex; gap: .4rem; justify-content: flex-end; flex-wrap: wrap; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(17,24,39,.55);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  padding: 1rem;
}
.vet-modal {
  background: var(--white);
  border-radius: var(--radius-lg);
  width: 100%; max-width: 560px; max-height: 88vh;
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

.vet-modal-body .form-group { margin-bottom: .85rem; }
.vet-modal-body label { display: block; font-size: .82rem; font-weight: 700; color: var(--muted); margin-bottom: .25rem; }

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

@media (max-width: 720px) {
  .vet-table-card { overflow-x: auto; }
  table { min-width: 760px; }
}

/* ── Planes por especie ── */
.ve-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; }
.ve-panel-title { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.15rem; margin: 0 0 .25rem; }
.ve-panel-sub { font-size: .85rem; color: #6b7280; margin: 0 0 1rem; }
.ve-chips { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 1rem; }
.ve-chip { display: inline-flex; align-items: center; gap: .45rem; padding: .5rem .9rem; border: 2px solid #e5e7eb; border-radius: 999px; background: #fff; font-weight: 700; font-size: .9rem; cursor: pointer; font-family: inherit; color: #374151; transition: all .15s; }
.ve-chip:hover { border-color: #a5b4fc; }
.ve-chip.activo { border-color: #667eea; background: #eef2ff; color: #4338ca; }
.ve-chip-ico { font-size: 1.15rem; }
.ve-chip-n { background: #e5e7eb; color: #374151; border-radius: 999px; font-size: .75rem; padding: .05rem .5rem; }
.ve-chip.activo .ve-chip-n { background: #667eea; color: #fff; }
.ve-mascota { border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: .6rem; overflow: hidden; }
.ve-mascota-head { display: flex; align-items: center; gap: 1rem; padding: .75rem 1rem; cursor: pointer; background: #fafafa; flex-wrap: wrap; }
.ve-mascota-head:hover { background: #f3f4f6; }
.ve-mascota-info { flex: 1; min-width: 180px; }
.ve-mascota-nombre { font-weight: 800; color: #111827; }
.ve-mascota-meta { font-size: .78rem; color: #6b7280; }
.ve-dato { text-align: center; min-width: 70px; }
.ve-dato span { display: block; font-size: .7rem; color: #6b7280; }
.ve-dato strong { font-size: .9rem; }
.ve-planes { padding: 1rem; border-top: 1px solid #e5e7eb; }
.ve-aviso { font-size: .8rem; color: #92400e; margin: 0 0 .75rem; }
.ve-sin-permiso { font-size: .75rem; color: #b45309; align-self: center; margin-right: auto; }
.ve-exito {
  background: var(--green-bg); color: #166534; border: 1px solid #bbf7d0;
  padding: .7rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;
  font-weight: 700; font-size: .9rem;
}
</style>