<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { mascotasAPI, clientesAPI } from '../../api'

const mascotas = ref([])
const clientes = ref([])
const cargando = ref(true)
const error = ref('')

const busqueda = ref('')
const filtroCliente = ref('') // '' = todos
const filtroEspecie = ref('Todas')

const mostrarModalNuevo = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const mascotaSeleccionada = ref(null)
const mascotaAEliminar = ref(null)
const guardando = ref(false)

const formVacio = () => ({
  ID_cliente: '',
  Nombre: '',
  Especie: 'Perro',
  Raza: '',
  Sexo: 'Macho',
  Peso: '',
  Fecha_nacimiento: '',
  Foto: ''
})

const nuevaMascota = ref(formVacio())

onMounted(cargarTodo)

async function cargarTodo() {
  cargando.value = true
  error.value = ''
  try {
    const [mResp, cResp] = await Promise.all([
      mascotasAPI.obtener(),
      clientesAPI.obtener()
    ])
    mascotas.value = mResp
    clientes.value = cResp
  } catch (e) {
    error.value = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
  } finally {
    cargando.value = false
  }
}

const especies = computed(() => {
  const set = new Set(mascotas.value.map(m => m.Especie).filter(Boolean))
  return ['Todas', ...set]
})

const mascotasFiltradas = computed(() => {
  return mascotas.value.filter(m => {
    const texto = `${m.Nombre} ${m.Raza} ${m.Nombre_dueno}`.toLowerCase()
    const coincideBusqueda = texto.includes(busqueda.value.toLowerCase())
    const coincideCliente = !filtroCliente.value || String(m.ID_cliente) === String(filtroCliente.value)
    const coincideEspecie = filtroEspecie.value === 'Todas' || m.Especie === filtroEspecie.value
    return coincideBusqueda && coincideCliente && coincideEspecie
  })
})

function edadDesde(fecha) {
  if (!fecha) return '—'
  const nacimiento = new Date(fecha)
  if (isNaN(nacimiento.getTime())) return '—'
  const hoy = new Date()
  let años = hoy.getFullYear() - nacimiento.getFullYear()
  const m = hoy.getMonth() - nacimiento.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) años--
  if (años <= 0) {
    const meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth())
    return meses <= 1 ? 'Cachorro' : `${meses} meses`
  }
  return `${años} año${años === 1 ? '' : 's'}`
}

function iconoEspecie(especie) {
  const e = (especie || '').toLowerCase()
  if (e.includes('gato')) return '🐱'
  if (e.includes('perro')) return '🐶'
  if (e.includes('ave')) return '🐦'
  if (e.includes('conejo')) return '🐰'
  return '🐾'
}

function abrirNuevo() {
  nuevaMascota.value = formVacio()
  if (clientes.value.length > 0) nuevaMascota.value.ID_cliente = clientes.value[0].ID_cliente
  mostrarModalNuevo.value = true
}

async function crearMascota() {
  if (!nuevaMascota.value.ID_cliente || !nuevaMascota.value.Nombre) {
    alert('Selecciona el dueño e ingresa el nombre de la mascota.')
    return
  }
  guardando.value = true
  try {
    await mascotasAPI.crear(nuevaMascota.value)
    await cargarTodo()
    mostrarModalNuevo.value = false
  } catch (e) {
    alert('Error al crear la mascota: ' + e.message)
  } finally {
    guardando.value = false
  }
}

function abrirEditar(m) {
  mascotaSeleccionada.value = { ...m, Fecha_nacimiento: m.Fecha_nacimiento ? String(m.Fecha_nacimiento).slice(0, 10) : '' }
  mostrarModalEditar.value = true
}

async function guardarEdicion() {
  guardando.value = true
  try {
    await mascotasAPI.actualizar(mascotaSeleccionada.value.ID_mascota, mascotaSeleccionada.value)
    await cargarTodo()
    mostrarModalEditar.value = false
  } catch (e) {
    alert('Error al guardar los cambios: ' + e.message)
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(m) {
  mascotaAEliminar.value = m
  mostrarModalEliminar.value = true
}

async function eliminarMascota() {
  try {
    await mascotasAPI.eliminar(mascotaAEliminar.value.ID_mascota)
    await cargarTodo()
    mostrarModalEliminar.value = false
  } catch (e) {
    alert('Error al eliminar la mascota: ' + e.message)
  }
}
</script>

<template>
  <AdminLayout title="Gestión de Mascotas" subtitle="Consulta las mascotas de cada cliente y registra nuevas">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="abrirNuevo">+ Nueva Mascota</button>
    </template>

    <div v-if="error" class="alert alert-danger"><span>{{ error }}</span></div>

    <div class="search-filter">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar por mascota, raza o dueño..." v-model="busqueda" />
      </div>
      <select class="filter-select" v-model="filtroEspecie">
        <option v-for="e in especies" :key="e" :value="e">{{ e }}</option>
      </select>
      <select class="filter-select" v-model="filtroCliente" style="min-width:180px;">
        <option value="">Todos los dueños</option>
        <option v-for="c in clientes" :key="c.ID_cliente" :value="c.ID_cliente">{{ c.Nombre }}</option>
      </select>
    </div>

    <div v-if="cargando" style="text-align:center;padding:2rem;color:#888;">Cargando mascotas...</div>
    <div v-else-if="mascotasFiltradas.length === 0" class="empty-state">No se encontraron mascotas con esos filtros.</div>

    <div v-else class="cards-grid-3">
      <div class="admin-card" v-for="m in mascotasFiltradas" :key="m.ID_mascota">
        <div class="admin-card-header">
          <div style="display:flex;gap:.6rem;align-items:flex-start;">
            <span style="font-size:1.8rem;line-height:1;">{{ iconoEspecie(m.Especie) }}</span>
            <div>
              <div class="admin-card-title">{{ m.Nombre }}</div>
              <div class="admin-card-tipo">{{ m.Especie }} · {{ m.Raza || 'Sin raza' }}</div>
            </div>
          </div>
          <span class="badge" :class="m.Sexo === 'Hembra' ? 'badge-red' : 'badge-blue'">{{ m.Sexo }}</span>
        </div>
        <div class="admin-card-body">
          <div class="admin-card-meta">👤 Dueño: <strong>{{ m.Nombre_dueno }}</strong></div>
          <div class="admin-card-meta">🎂 Edad: {{ edadDesde(m.Fecha_nacimiento) }}</div>
          <div class="admin-card-meta" v-if="m.Peso">⚖️ Peso: {{ m.Peso }} kg</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" @click="abrirEditar(m)">Editar</button>
          <button class="btn btn-danger btn-sm" @click="confirmarEliminar(m)">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Mascota -->
    <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="mostrarModalNuevo = false">
      <div class="modal">
        <h3>Nueva Mascota</h3>
        <div class="modal-body">
          <label>Dueño (cliente) <span class="req">*</span></label>
          <select v-model="nuevaMascota.ID_cliente">
            <option value="" disabled>-- Selecciona el dueño --</option>
            <option v-for="c in clientes" :key="c.ID_cliente" :value="c.ID_cliente">{{ c.Nombre }} — {{ c.Correo }}</option>
          </select>

          <label>Nombre de la mascota <span class="req">*</span></label>
          <input v-model="nuevaMascota.Nombre" placeholder="Ej: Max" />

          <div class="form-row-modal">
            <div>
              <label>Especie</label>
              <select v-model="nuevaMascota.Especie">
                <option>Perro</option>
                <option>Gato</option>
                <option>Ave</option>
                <option>Conejo</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label>Sexo</label>
              <select v-model="nuevaMascota.Sexo">
                <option>Macho</option>
                <option>Hembra</option>
              </select>
            </div>
          </div>

          <label>Raza</label>
          <input v-model="nuevaMascota.Raza" placeholder="Ej: Labrador" />

          <div class="form-row-modal">
            <div>
              <label>Peso (kg)</label>
              <input type="number" step="0.1" v-model="nuevaMascota.Peso" />
            </div>
            <div>
              <label>Fecha de nacimiento</label>
              <input type="date" v-model="nuevaMascota.Fecha_nacimiento" />
            </div>
          </div>

          <label>Foto (URL, opcional)</label>
          <input v-model="nuevaMascota.Foto" placeholder="https://..." />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalNuevo = false">Cancelar</button>
          <button class="btn btn-success btn-sm" :disabled="guardando" @click="crearMascota">
            {{ guardando ? 'Guardando...' : 'Crear Mascota' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Mascota -->
    <div v-if="mostrarModalEditar" class="modal-overlay" @click.self="mostrarModalEditar = false">
      <div class="modal">
        <h3>Editar Mascota</h3>
        <div class="modal-body" v-if="mascotaSeleccionada">
          <label>Nombre</label>
          <input v-model="mascotaSeleccionada.Nombre" />

          <div class="form-row-modal">
            <div>
              <label>Especie</label>
              <select v-model="mascotaSeleccionada.Especie">
                <option>Perro</option>
                <option>Gato</option>
                <option>Ave</option>
                <option>Conejo</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label>Sexo</label>
              <select v-model="mascotaSeleccionada.Sexo">
                <option>Macho</option>
                <option>Hembra</option>
              </select>
            </div>
          </div>

          <label>Raza</label>
          <input v-model="mascotaSeleccionada.Raza" />

          <div class="form-row-modal">
            <div>
              <label>Peso (kg)</label>
              <input type="number" step="0.1" v-model="mascotaSeleccionada.Peso" />
            </div>
            <div>
              <label>Fecha de nacimiento</label>
              <input type="date" v-model="mascotaSeleccionada.Fecha_nacimiento" />
            </div>
          </div>

          <label>Foto (URL)</label>
          <input v-model="mascotaSeleccionada.Foto" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEditar = false">Cancelar</button>
          <button class="btn btn-success btn-sm" :disabled="guardando" @click="guardarEdicion">
            {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
      <div class="modal">
        <h3>¿Eliminar mascota?</h3>
        <p>¿Deseas dar de baja a <strong>{{ mascotaAEliminar?.Nombre }}</strong>? Podrás seguir consultando su historial, pero dejará de aparecer como mascota activa.</p>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEliminar = false">Cancelar</button>
          <button class="btn btn-danger btn-sm" @click="eliminarMascota">Eliminar</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.form-row-modal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .75rem;
}
.modal-body select,
.modal-body input {
  padding: .55rem .75rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: .9rem;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Lato', sans-serif;
}
.req { color: var(--red); }
</style>