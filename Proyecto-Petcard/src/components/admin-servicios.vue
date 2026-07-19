<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { serviciosAPI } from '../api'

const servicios = ref([])
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')
const mostrarModalNuevo = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const servicioSeleccionado = ref(null)
const servicioAEliminar = ref(null)
const guardando = ref(false)

const nuevoServicio = ref({ Nombre: '', Descripcion: '', Categoria: '', Precio: '' })

onMounted(cargarServicios)

async function cargarServicios() {
  cargando.value = true
  error.value = ''
  try {
    servicios.value = await serviciosAPI.obtener()
  } catch {
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

const serviciosFiltrados = computed(() =>
  servicios.value.filter(s =>
    `${s.Nombre} ${s.Descripcion} ${s.Categoria}`.toLowerCase().includes(busqueda.value.toLowerCase())
  )
)

function abrirEditar(s) { servicioSeleccionado.value = { ...s }; mostrarModalEditar.value = true }

async function guardarEdicion() {
  guardando.value = true
  try {
    await serviciosAPI.actualizar(servicioSeleccionado.value.ID_servicio, servicioSeleccionado.value)
    await cargarServicios()
    mostrarModalEditar.value = false
  } catch { alert('Error al guardar.') } finally { guardando.value = false }
}

function confirmarEliminar(s) { servicioAEliminar.value = s; mostrarModalEliminar.value = true }

async function eliminarServicio() {
  try {
    await serviciosAPI.eliminar(servicioAEliminar.value.ID_servicio)
    await cargarServicios()
    mostrarModalEliminar.value = false
  } catch { alert('Error al eliminar.') }
}

async function crearServicio() {
  if (!nuevoServicio.value.Nombre || !nuevoServicio.value.Precio) {
    alert('El nombre y el precio son obligatorios.')
    return
  }
  guardando.value = true
  try {
    await serviciosAPI.crear(nuevoServicio.value)
    await cargarServicios()
    nuevoServicio.value = { Nombre: '', Descripcion: '', Categoria: '', Precio: '' }
    mostrarModalNuevo.value = false
  } catch { alert('Error al crear el servicio.') } finally { guardando.value = false }
}
</script>

<template>
  <AdminLayout title="Gestión de Servicios" subtitle="Administra todos los servicios veterinarios disponibles">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="mostrarModalNuevo = true">+ Nuevo Servicio</button>
    </template>

    <div v-if="error" class="alert alert-danger"><span>{{ error }}</span></div>

    <div class="search-filter">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar servicios..." v-model="busqueda" />
      </div>
    </div>

    <div v-if="cargando" style="text-align:center;padding:2rem;color:#888;">Cargando servicios...</div>
    <div v-else-if="serviciosFiltrados.length === 0" class="empty-state">No se encontraron servicios.</div>

    <div v-else class="cards-grid-3">
      <div class="admin-card" v-for="s in serviciosFiltrados" :key="s.ID_servicio">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">{{ s.Nombre }}</div>
            <div class="admin-card-tipo">{{ s.Categoria }}</div>
          </div>
          <span class="badge badge-green">Activo</span>
        </div>
        <div class="admin-card-body">
          <div class="admin-card-meta">{{ s.Descripcion }}</div>
          <div style="margin-top:.6rem;font-size:1.1rem;font-weight:800;color:var(--purple);">${{ s.Precio }}</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" @click="abrirEditar(s)">Editar</button>
          <button class="btn btn-danger btn-sm" @click="confirmarEliminar(s)">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo -->
    <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="mostrarModalNuevo = false">
      <div class="modal">
        <h3>Nuevo Servicio</h3>
        <div class="modal-body">
          <label>Nombre</label><input v-model="nuevoServicio.Nombre" />
          <label>Descripción</label><input v-model="nuevoServicio.Descripcion" />
          <label>Categoría</label><input v-model="nuevoServicio.Categoria" placeholder="Ej: Consulta, Vacunación..." />
          <label>Precio ($)</label><input type="number" v-model="nuevoServicio.Precio" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalNuevo = false">Cancelar</button>
          <button class="btn btn-success btn-sm" :disabled="guardando" @click="crearServicio">{{ guardando ? 'Creando...' : 'Crear' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal Editar -->
    <div v-if="mostrarModalEditar" class="modal-overlay" @click.self="mostrarModalEditar = false">
      <div class="modal">
        <h3>Editar Servicio</h3>
        <div class="modal-body" v-if="servicioSeleccionado">
          <label>Nombre</label><input v-model="servicioSeleccionado.Nombre" />
          <label>Descripción</label><input v-model="servicioSeleccionado.Descripcion" />
          <label>Categoría</label><input v-model="servicioSeleccionado.Categoria" />
          <label>Precio ($)</label><input type="number" v-model="servicioSeleccionado.Precio" />
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
        <h3>¿Eliminar servicio?</h3>
        <p>¿Eliminar <strong>{{ servicioAEliminar?.Nombre }}</strong>? Esta acción no se puede deshacer.</p>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEliminar = false">Cancelar</button>
          <button class="btn btn-danger btn-sm" @click="eliminarServicio">Eliminar</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.modal-body input { padding: .55rem .75rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: .9rem; width: 100%; box-sizing: border-box; }
</style>