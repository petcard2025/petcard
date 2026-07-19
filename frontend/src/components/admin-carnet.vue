<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { vacunasAPI, mascotasAPI, serviciosAPI } from '../api'

const vacunas = ref([])
const mascotas = ref([])
const servicios = ref([])
const cargando = ref(true)
const error = ref('')

const buscarTexto = ref('')
const filtroEstado = ref('Todos')

const mostrarModalNuevo = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const vacunaSeleccionada = ref(null)
const vacunaAEliminar = ref(null)
const guardando = ref(false)

const formVacio = () => ({
  ID_mascota: '', ID_servicio: '', Nombre_vacuna: '', Lote: '',
  Fecha_aplicacion: '', Proxima_dosis: '', Estado: 'Pendiente', Observaciones: ''
})
const nuevaVacuna = ref(formVacio())

onMounted(cargarTodo)

async function cargarTodo() {
  cargando.value = true
  error.value = ''
  try {
    const [v, m, s] = await Promise.all([
      vacunasAPI.obtener(),
      mascotasAPI.obtener(),
      serviciosAPI.obtener()
    ])
    vacunas.value = v
    mascotas.value = m
    servicios.value = s
  } catch (e) {
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

const registrosFiltrados = computed(() => {
  return vacunas.value.filter(r => {
    const texto = `${r.Nombre_mascota || ''} ${r.Nombre_vacuna || ''}`.toLowerCase()
    const coincideBusqueda = texto.includes(buscarTexto.value.toLowerCase())
    const coincideFiltro = filtroEstado.value === 'Todos' || r.Estado === filtroEstado.value
    return coincideBusqueda && coincideFiltro
  })
})

function getEstadoClass(estado) {
  if (estado === 'Completada' || estado === 'Aplicada') return 'badge badge-green'
  if (estado === 'Pendiente') return 'badge badge-yellow'
  return 'badge badge-gray'
}

function abrirModalNuevo() {
  nuevaVacuna.value = formVacio()
  mostrarModalNuevo.value = true
}

function abrirModalEditar(registro) {
  vacunaSeleccionada.value = {
    ...registro,
    Fecha_aplicacion: registro.Fecha_aplicacion ? String(registro.Fecha_aplicacion).slice(0, 10) : '',
    Proxima_dosis: registro.Proxima_dosis ? String(registro.Proxima_dosis).slice(0, 10) : ''
  }
  mostrarModalEditar.value = true
}

async function guardarNuevaVacuna() {
  if (!nuevaVacuna.value.ID_mascota || !nuevaVacuna.value.Nombre_vacuna) {
    alert('Selecciona la mascota e ingresa el nombre de la vacuna.')
    return
  }
  guardando.value = true
  try {
    await vacunasAPI.crear(nuevaVacuna.value)
    await cargarTodo()
    mostrarModalNuevo.value = false
  } catch (e) {
    alert('Error al crear el registro: ' + e.message)
  } finally {
    guardando.value = false
  }
}

async function guardarEdicion() {
  guardando.value = true
  try {
    await vacunasAPI.actualizar(vacunaSeleccionada.value.ID_carnetVacunas, vacunaSeleccionada.value)
    await cargarTodo()
    mostrarModalEditar.value = false
  } catch (e) {
    alert('Error al guardar los cambios: ' + e.message)
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(registro) {
  vacunaAEliminar.value = registro
  mostrarModalEliminar.value = true
}

async function eliminarRegistro() {
  try {
    await vacunasAPI.eliminar(vacunaAEliminar.value.ID_carnetVacunas)
    await cargarTodo()
    mostrarModalEliminar.value = false
  } catch (e) {
    alert('Error al eliminar el registro: ' + e.message)
  }
}
</script>

<template>
  <AdminLayout title="Carnet de Vacunas" subtitle="Registra y consulta las vacunas aplicadas a cada mascota">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="abrirModalNuevo">+ Nuevo Registro</button>
    </template>

    <div v-if="error" class="alert alert-danger"><span>{{ error }}</span></div>

    <div class="search-filter">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="buscarTexto" type="text" placeholder="Buscar mascota o vacuna..." />
      </div>
      <select v-model="filtroEstado" class="filter-select">
        <option value="Todos">Todos</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Completada">Completada</option>
      </select>
    </div>

    <div v-if="cargando" style="text-align:center;padding:2rem;color:#888;">Cargando registros...</div>

    <div v-else class="cards-grid-2">
      <div v-if="registrosFiltrados.length === 0" class="empty-state">No hay registros que mostrar</div>
      <div v-for="registro in registrosFiltrados" :key="registro.ID_carnetVacunas" class="admin-card">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">{{ registro.Nombre_mascota }}</div>
            <div class="admin-card-tipo">{{ registro.Nombre_servicio }}</div>
          </div>
          <span :class="getEstadoClass(registro.Estado)">{{ registro.Estado }}</span>
        </div>
        <div class="admin-card-body">
          <div class="detail">💉 {{ registro.Nombre_vacuna }}</div>
          <div class="admin-card-meta" v-if="registro.Lote">Lote: {{ registro.Lote }}</div>
          <div class="admin-card-meta" v-if="registro.Fecha_aplicacion">Aplicada: {{ String(registro.Fecha_aplicacion).slice(0,10) }}</div>
          <div class="admin-card-meta" v-if="registro.Proxima_dosis">Próxima dosis: {{ String(registro.Proxima_dosis).slice(0,10) }}</div>
          <div class="admin-card-meta" v-if="registro.Observaciones">{{ registro.Observaciones }}</div>
        </div>
        <div class="admin-card-actions">
          <button @click="abrirModalEditar(registro)" class="btn btn-secondary btn-sm">Editar</button>
          <button @click="confirmarEliminar(registro)" class="btn btn-danger btn-sm">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo -->
    <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="mostrarModalNuevo = false">
      <div class="modal">
        <h3>Nuevo Registro de Vacuna</h3>
        <div class="modal-body">
          <label>Mascota</label>
          <select v-model="nuevaVacuna.ID_mascota">
            <option value="" disabled>-- Selecciona mascota --</option>
            <option v-for="m in mascotas" :key="m.ID_mascota" :value="m.ID_mascota">{{ m.Nombre }} ({{ m.Nombre_dueno }})</option>
          </select>
          <label>Servicio relacionado</label>
          <select v-model="nuevaVacuna.ID_servicio">
            <option value="" disabled>-- Selecciona servicio --</option>
            <option v-for="s in servicios" :key="s.ID_servicio" :value="s.ID_servicio">{{ s.Nombre }}</option>
          </select>
          <label>Nombre de la vacuna</label>
          <input v-model="nuevaVacuna.Nombre_vacuna" placeholder="Ej: Antirrábica" />
          <label>Lote</label>
          <input v-model="nuevaVacuna.Lote" />
          <label>Fecha de aplicación</label>
          <input type="date" v-model="nuevaVacuna.Fecha_aplicacion" />
          <label>Próxima dosis</label>
          <input type="date" v-model="nuevaVacuna.Proxima_dosis" />
          <label>Estado</label>
          <select v-model="nuevaVacuna.Estado">
            <option>Pendiente</option>
            <option>Completada</option>
          </select>
          <label>Observaciones</label>
          <textarea v-model="nuevaVacuna.Observaciones" rows="2"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalNuevo = false">Cancelar</button>
          <button class="btn btn-success btn-sm" :disabled="guardando" @click="guardarNuevaVacuna">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal Editar -->
    <div v-if="mostrarModalEditar" class="modal-overlay" @click.self="mostrarModalEditar = false">
      <div class="modal">
        <h3>Editar Registro — {{ vacunaSeleccionada.Nombre_mascota }}</h3>
        <div class="modal-body" v-if="vacunaSeleccionada">
          <label>Nombre de la vacuna</label>
          <input v-model="vacunaSeleccionada.Nombre_vacuna" />
          <label>Lote</label>
          <input v-model="vacunaSeleccionada.Lote" />
          <label>Fecha de aplicación</label>
          <input type="date" v-model="vacunaSeleccionada.Fecha_aplicacion" />
          <label>Próxima dosis</label>
          <input type="date" v-model="vacunaSeleccionada.Proxima_dosis" />
          <label>Estado</label>
          <select v-model="vacunaSeleccionada.Estado">
            <option>Pendiente</option>
            <option>Completada</option>
          </select>
          <label>Observaciones</label>
          <textarea v-model="vacunaSeleccionada.Observaciones" rows="2"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEditar = false">Cancelar</button>
          <button class="btn btn-success btn-sm" :disabled="guardando" @click="guardarEdicion">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
      <div class="modal">
        <h3>¿Eliminar registro?</h3>
        <p>¿Eliminar la vacuna <strong>{{ vacunaAEliminar?.Nombre_vacuna }}</strong> de {{ vacunaAEliminar?.Nombre_mascota }}?</p>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEliminar = false">Cancelar</button>
          <button class="btn btn-danger btn-sm" @click="eliminarRegistro">Eliminar</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.modal-body input, .modal-body select, .modal-body textarea {
  padding: .5rem .75rem; border: 1px solid #ddd; border-radius: 6px; font-size: .95rem; width: 100%; box-sizing: border-box;
}
</style>