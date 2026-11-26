<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import CampoOpciones from '../shared/campo-opciones.vue'
import BuscadorLupa from '../shared/buscador-lupa.vue'
import { opcionesPlan, categoriaDeServicio, horarioCompatible } from '../../utils/opcionesClinicas'
import { coincideBusqueda, sugerenciasMascota } from '../../utils/busqueda'

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

// Esta vista busca solo por mascota (y tipo de dieta)
const sugerenciasBusqueda = computed(() =>
  sugerenciasMascota(planes.value, p => p.Nombre_mascota)
)

const planesFiltrados = computed(() => {
  return planes.value.filter(p => {
    const coincideTexto = coincideBusqueda(busqueda.value, p.Nombre_mascota, p.Tipo_dieta)
    const estado = p.Revision_nutricional || ''
    const coincideEstado = filtroEstado.value === 'Todos' || estado === filtroEstado.value
    return coincideTexto && coincideEstado
  })
})

// ── Opciones de los formularios (según la especie de la mascota y el servicio) ──
const especieDe = (idMascota) =>
  mascotas.value.find(m => String(m.ID_mascota) === String(idMascota))?.Especie || ''
const categoriaDe = (idServicio) =>
  categoriaDeServicio(servicios.value.find(s => String(s.ID_servicio) === String(idServicio)))

const optsNuevo = computed(() => opcionesPlan(
  especieDe(nuevoPlan.value.ID_mascota),
  categoriaDe(nuevoPlan.value.ID_servicio),
  nuevoPlan.value.Frecuencia
))
const optsEdicion = computed(() => {
  const p = planSeleccionado.value
  return p
    ? opcionesPlan(especieDe(p.ID_mascota), categoriaDe(p.ID_servicio), p.Frecuencia)
    : opcionesPlan('', '', '')
})

function cambiarFrecuencia(plan, valor) {
  plan.Frecuencia = valor
  if (!horarioCompatible(plan.Horario, valor)) plan.Horario = ''
}

function abrirEditar(plan) {
  planSeleccionado.value = {
    ...plan,
    Fecha_inicio: plan.Fecha_inicio ? String(plan.Fecha_inicio).slice(0, 10) : '',
    Fecha_fin: plan.Fecha_fin ? String(plan.Fecha_fin).slice(0, 10) : ''
  }
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
      <BuscadorLupa v-model="busqueda" :sugerencias="sugerenciasBusqueda" placeholder="Buscar por mascota o dieta..." />
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
          <CampoOpciones v-model="planSeleccionado.Tipo_dieta" :options="optsEdicion.dietas" placeholder="-- Selecciona el tipo de dieta --" />
          <label>Frecuencia</label>
          <CampoOpciones :model-value="planSeleccionado.Frecuencia" @update:model-value="v => cambiarFrecuencia(planSeleccionado, v)" :options="optsEdicion.frecuencias" placeholder="-- Selecciona la frecuencia --" />
          <label>Calorías</label>
          <input type="number" v-model="planSeleccionado.Calorias" />
          <label>Horario</label>
          <CampoOpciones v-model="planSeleccionado.Horario" :options="optsEdicion.horarios" placeholder="-- Selecciona el horario --" />
          <label>Alergias</label>
          <CampoOpciones v-model="planSeleccionado.Alergias" multiple :exclusivas="['Ninguna conocida']" :options="optsEdicion.alergias" placeholder="Selecciona una o varias" />
          <label>Suplementos</label>
          <CampoOpciones v-model="planSeleccionado.Suplementos" multiple :exclusivas="['Ninguno']" :options="optsEdicion.suplementos" placeholder="Selecciona uno o varios" />
          <label>Comidas</label>
          <CampoOpciones v-model="planSeleccionado.Comidas" multiple separador=" | " :options="optsEdicion.comidas" placeholder="Selecciona las comidas del plan" />
          <label>Fecha inicio</label>
          <input type="date" v-model="planSeleccionado.Fecha_inicio" />
          <label>Fecha fin</label>
          <input type="date" v-model="planSeleccionado.Fecha_fin" />
          <label>Diagnóstico nutricional</label>
          <CampoOpciones v-model="planSeleccionado.Diagnostico" :options="optsEdicion.diagnosticos" placeholder="-- Selecciona el diagnóstico --" />
          <label>Observaciones</label>
          <CampoOpciones v-model="planSeleccionado.Observaciones" multiple separador=" | " :options="optsEdicion.observaciones" placeholder="Selecciona las indicaciones" />
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
          <CampoOpciones v-model="nuevoPlan.Tipo_dieta" :options="optsNuevo.dietas" placeholder="-- Selecciona el tipo de dieta --" />
          <label>Frecuencia</label>
          <CampoOpciones :model-value="nuevoPlan.Frecuencia" @update:model-value="v => cambiarFrecuencia(nuevoPlan, v)" :options="optsNuevo.frecuencias" placeholder="-- Selecciona la frecuencia --" />
          <label>Calorías</label>
          <input type="number" v-model="nuevoPlan.Calorias" />
          <label>Horario</label>
          <CampoOpciones v-model="nuevoPlan.Horario" :options="optsNuevo.horarios" placeholder="-- Selecciona el horario --" />
          <label>Alergias</label>
          <CampoOpciones v-model="nuevoPlan.Alergias" multiple :exclusivas="['Ninguna conocida']" :options="optsNuevo.alergias" placeholder="Selecciona una o varias" />
          <label>Suplementos</label>
          <CampoOpciones v-model="nuevoPlan.Suplementos" multiple :exclusivas="['Ninguno']" :options="optsNuevo.suplementos" placeholder="Selecciona uno o varios" />
          <label>Comidas</label>
          <CampoOpciones v-model="nuevoPlan.Comidas" multiple separador=" | " :options="optsNuevo.comidas" placeholder="Selecciona las comidas del plan" />
          <label>Fecha inicio</label>
          <input type="date" v-model="nuevoPlan.Fecha_inicio" />
          <label>Fecha fin</label>
          <input type="date" v-model="nuevoPlan.Fecha_fin" />
          <label>Diagnóstico nutricional</label>
          <CampoOpciones v-model="nuevoPlan.Diagnostico" :options="optsNuevo.diagnosticos" placeholder="-- Selecciona el diagnóstico --" />
          <label>Observaciones</label>
          <CampoOpciones v-model="nuevoPlan.Observaciones" multiple separador=" | " :options="optsNuevo.observaciones" placeholder="Selecciona las indicaciones" />
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