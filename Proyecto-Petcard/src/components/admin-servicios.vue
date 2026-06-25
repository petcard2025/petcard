<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion } = useAuth()

// ===== GUARD DE SEGURIDAD =====
onMounted(() => {
  const token = localStorage.getItem('petcard_token')
  const usuarioStr = localStorage.getItem('petcard_usuario_actual')
  let usuario = null
  try { usuario = usuarioStr ? JSON.parse(usuarioStr) : null } catch {}
  if (!token && !usuario) {
    router.push('/login-admin')
    return
  }
  const rol = usuario?.Rol
  if (rol !== 'Admin') {
    router.push('/inicio')
  }
})
const API = 'http://localhost:3001/api/servicios'

const servicios = ref([])
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')
const mostrarModalNuevo = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const servicioSeleccionado = ref(null)
const servicioAEliminar = ref(null)

const nuevoServicio = ref({ Nombre: '', Descripcion: '', Categoria: '', Precio: '' })

onMounted(cargarServicios)

async function cargarServicios() {
  cargando.value = true
  error.value = ''
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error()
    servicios.value = await res.json()
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
  try {
    const res = await fetch(`${API}/${servicioSeleccionado.value.ID_servicio}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(servicioSeleccionado.value)
    })
    if (!res.ok) throw new Error()
    await cargarServicios()
    mostrarModalEditar.value = false
  } catch { alert('Error al guardar.') }
}

function confirmarEliminar(s) { servicioAEliminar.value = s; mostrarModalEliminar.value = true }

async function eliminarServicio() {
  try {
    const res = await fetch(`${API}/${servicioAEliminar.value.ID_servicio}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    await cargarServicios()
    mostrarModalEliminar.value = false
  } catch { alert('Error al eliminar.') }
}

async function crearServicio() {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoServicio.value)
    })
    if (!res.ok) throw new Error()
    await cargarServicios()
    nuevoServicio.value = { Nombre: '', Descripcion: '', Categoria: '', Precio: '' }
    mostrarModalNuevo.value = false
  } catch { alert('Error al crear el servicio.') }
}
</script>

<template>
  <nav class="navbar">
    <router-link to="/admin-inicio" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/admin-alimentacion">Alimentación</router-link></li>
      <li><router-link to="/admin-carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/admin-notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/admin-servicios" class="active">Servicios</router-link></li>
      <li><router-link to="/admin-citas">Citas</router-link></li>
    </ul>
    <div class="nav-actions">
      <span style="color:white;margin-right:1rem;font-weight:500;">{{ isAuthenticated ? usuarioLogueado?.Nombre : 'Admin' }}</span>
      <router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" style="text-decoration:none;display:inline-block;">👤</router-link>
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="gestion-header">
      <div>
        <div class="gestion-title">Gestión de Servicios</div>
        <div class="gestion-sub">Administra todos los servicios veterinarios disponibles</div>
      </div>
      <div class="gestion-btns">
        <button class="btn btn-success btn-sm" @click="mostrarModalNuevo = true">+ Nuevo Servicio</button>
      </div>
    </div>

    <div v-if="error" style="background:#fee2e2;color:#dc2626;padding:.75rem 1rem;border-radius:8px;margin-bottom:1rem;">⚠️ {{ error }}</div>

    <div class="search-filter" style="margin-bottom:1.25rem;">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar servicios..." v-model="busqueda"/>
      </div>
    </div>

    <div v-if="cargando" style="text-align:center;padding:2rem;color:#888;">Cargando servicios...</div>
    <div v-else-if="serviciosFiltrados.length === 0" style="text-align:center;padding:2rem;color:#888;">No se encontraron servicios.</div>

    <div v-else class="cards-grid-2">
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
          <div style="margin:.5rem 0;"><strong>${{ s.Precio }}</strong></div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" @click="abrirEditar(s)">Editar</button>
          <button class="btn btn-danger btn-sm" @click="confirmarEliminar(s)">Eliminar</button>
        </div>
      </div>
    </div>

    <footer class="footer" style="margin-top:2rem;">
      <div class="footer-grid">
        <div class="footer-brand"><span class="nav-logo" style="color:#fff;display:flex;">PetCard</span><p>Comprometidos con brindar toda la atención profesional.</p></div>
        <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p></div>
        <div class="footer-col"><h4>Horarios</h4><p>Lun - Vie: 8:00 AM - 7:00 PM</p></div>
      </div>
      <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
    </footer>
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
        <button class="btn btn-success btn-sm" @click="crearServicio">Crear</button>
      </div>
    </div>
  </div>

  <!-- Modal Editar -->
  <div v-if="mostrarModalEditar" class="modal-overlay" @click.self="mostrarModalEditar = false">
    <div class="modal">
      <h3>Editar Servicio</h3>
      <div class="modal-body">
        <label>Nombre</label><input v-model="servicioSeleccionado.Nombre" />
        <label>Descripción</label><input v-model="servicioSeleccionado.Descripcion" />
        <label>Categoría</label><input v-model="servicioSeleccionado.Categoria" />
        <label>Precio ($)</label><input type="number" v-model="servicioSeleccionado.Precio" />
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalEditar = false">Cancelar</button>
        <button class="btn btn-success btn-sm" @click="guardarEdicion">Guardar</button>
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
</template>

<style scoped>
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000; }
.modal { background:white;border-radius:12px;padding:2rem;width:100%;max-width:460px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2); }
.modal h3 { margin:0 0 1rem;font-size:1.2rem;font-weight:700; }
.modal-body { display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.5rem; }
.modal-body label { font-weight:600;font-size:.85rem;color:#555;margin-top:.25rem; }
.modal-body input,.modal-body select { padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;width:100%;box-sizing:border-box; }
.modal-footer { display:flex;gap:.75rem;justify-content:flex-end; }
</style>