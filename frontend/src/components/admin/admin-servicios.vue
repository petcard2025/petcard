  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import AdminLayout from './AdminLayout.vue'
  import { serviciosAPI } from '../../api'
  import CampoOpciones from '../shared/campo-opciones.vue'
  import BuscadorLupa from '../shared/buscador-lupa.vue'
  import { CATEGORIAS_SERVICIO, nombresServicio, descripcionesServicio } from '../../utils/opcionesClinicas'
  import { coincideBusqueda, sugerenciasGenericas } from '../../utils/busqueda'

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

  const nuevoServicio = ref({ Nombre: '', Descripcion: '', Categoria: '',   })

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

  const sugerenciasBusqueda = computed(() =>
    sugerenciasGenericas(servicios.value, s => s.Nombre, s => s.Categoria, '🩺')
  )

  const serviciosFiltrados = computed(() =>
    servicios.value.filter(s => coincideBusqueda(busqueda.value, s.Nombre, s.Descripcion, s.Categoria))
  )

  // Nombre y descripción de opción múltiple según la categoría elegida
  const nombresNuevo = computed(() => nombresServicio(nuevoServicio.value.Categoria))
  const descripcionesNuevo = computed(() => descripcionesServicio(nuevoServicio.value.Categoria))
  const nombresEdicion = computed(() => nombresServicio(servicioSeleccionado.value?.Categoria))
  const descripcionesEdicion = computed(() => descripcionesServicio(servicioSeleccionado.value?.Categoria))

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
    if (!nuevoServicio.value.Nombre ) {
      alert('El nombre es obligatorio.')
      return
    }
    guardando.value = true
    try {
      await serviciosAPI.crear(nuevoServicio.value)
      await cargarServicios()
      nuevoServicio.value = { Nombre: '', Descripcion: '', Categoria:  '' }
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
        <BuscadorLupa v-model="busqueda" :sugerencias="sugerenciasBusqueda" placeholder="Buscar servicios..." />
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
            <label>Categoría</label>
            <CampoOpciones v-model="nuevoServicio.Categoria" :options="CATEGORIAS_SERVICIO" placeholder="-- Selecciona la categoría --" />
            <label>Nombre</label>
            <CampoOpciones v-model="nuevoServicio.Nombre" :options="nombresNuevo" placeholder="-- Selecciona el servicio --" />
            <label>Descripción</label>
            <CampoOpciones v-model="nuevoServicio.Descripcion" :options="descripcionesNuevo" placeholder="-- Selecciona la descripción --" />
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
            <label>Categoría</label>
            <CampoOpciones v-model="servicioSeleccionado.Categoria" :options="CATEGORIAS_SERVICIO" placeholder="-- Selecciona la categoría --" />
            <label>Nombre</label>
            <CampoOpciones v-model="servicioSeleccionado.Nombre" :options="nombresEdicion" placeholder="-- Selecciona el servicio --" />
            <label>Descripción</label>
            <CampoOpciones v-model="servicioSeleccionado.Descripcion" :options="descripcionesEdicion" placeholder="-- Selecciona la descripción --" />
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