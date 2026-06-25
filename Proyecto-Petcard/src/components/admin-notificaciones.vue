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
const API = 'http://localhost:3001/api/notificaciones'
const API_USUARIOS = 'http://localhost:3001/api/usuarios'

const notificaciones = ref([])
const usuarios = ref([])
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')
const mostrarModalNuevo = ref(false)
const mostrarModalEliminar = ref(false)
const notifAEliminar = ref(null)

const nuevaNotif = ref({ ID_usuario: '', ID_sistemaCorreo: 1, Mensaje: '', Tipo: 'Recordatorio', Canal: 'App' })

onMounted(async () => {
  await cargarNotificaciones()
  await cargarUsuarios()
})

async function cargarNotificaciones() {
  cargando.value = true
  error.value = ''
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error()
    notificaciones.value = await res.json()
  } catch {
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

async function cargarUsuarios() {
  try {
    const res = await fetch(API_USUARIOS)
    usuarios.value = await res.json()
  } catch {}
}

const notifFiltradas = computed(() =>
  notificaciones.value.filter(n =>
    `${n.Mensaje} ${n.Tipo} ${n.Nombre_usuario}`.toLowerCase().includes(busqueda.value.toLowerCase())
  )
)

function confirmarEliminar(n) { notifAEliminar.value = n; mostrarModalEliminar.value = true }

async function eliminarNotif() {
  try {
    const res = await fetch(`${API}/${notifAEliminar.value.ID_notificacion}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    await cargarNotificaciones()
    mostrarModalEliminar.value = false
  } catch { alert('Error al eliminar.') }
}

async function crearNotificacion() {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaNotif.value)
    })
    if (!res.ok) throw new Error()
    await cargarNotificaciones()
    nuevaNotif.value = { ID_usuario: '', ID_sistemaCorreo: 1, Mensaje: '', Tipo: 'Recordatorio', Canal: 'App' }
    mostrarModalNuevo.value = false
  } catch { alert('Error al crear la notificación.') }
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
      <li><router-link to="/admin-notificaciones" class="active">Notificaciones</router-link></li>
      <li><router-link to="/admin-servicios">Servicios</router-link></li>
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
        <div class="gestion-title">Gestión de Notificaciones</div>
        <div class="gestion-sub">Administra todas las notificaciones del sistema</div>
      </div>
      <div class="gestion-btns">
        <button class="btn btn-success btn-sm" @click="mostrarModalNuevo = true">+ Nueva Notificación</button>
      </div>
    </div>

    <div v-if="error" style="background:#fee2e2;color:#dc2626;padding:.75rem 1rem;border-radius:8px;margin-bottom:1rem;">⚠️ {{ error }}</div>

    <div class="search-filter" style="margin-bottom:1.25rem;">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar notificaciones..." v-model="busqueda"/>
      </div>
    </div>

    <div v-if="cargando" style="text-align:center;padding:2rem;color:#888;">Cargando notificaciones...</div>
    <div v-else-if="notifFiltradas.length === 0" style="text-align:center;padding:2rem;color:#888;">No hay notificaciones.</div>

    <div v-else class="cards-grid-2">
      <div class="admin-card" v-for="n in notifFiltradas" :key="n.ID_notificacion">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">{{ n.Tipo }}</div>
            <div class="admin-card-tipo">Para: {{ n.Nombre_usuario }}</div>
          </div>
          <span class="badge badge-blue">{{ n.Canal }}</span>
        </div>
        <div class="admin-card-body">
          <div class="admin-card-meta" style="margin-top:.5rem;">{{ n.Mensaje }}</div>
          <div class="admin-card-meta" v-if="n.Fecha_envio">📅 {{ n.Fecha_envio?.slice(0,10) }}</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-danger btn-sm" @click="confirmarEliminar(n)">Eliminar</button>
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

  <!-- Modal Nueva Notificación -->
  <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="mostrarModalNuevo = false">
    <div class="modal">
      <h3>Nueva Notificación</h3>
      <div class="modal-body">
        <label>Usuario destinatario</label>
        <select v-model="nuevaNotif.ID_usuario">
          <option value="" disabled>Selecciona usuario</option>
          <option v-for="u in usuarios" :key="u.ID_usuario" :value="u.ID_usuario">{{ u.Nombre }} ({{ u.Correo }})</option>
        </select>
        <label>Tipo</label>
        <select v-model="nuevaNotif.Tipo">
          <option>Recordatorio</option>
          <option>Promoción</option>
          <option>Alerta</option>
          <option>Informativo</option>
        </select>
        <label>Canal</label>
        <select v-model="nuevaNotif.Canal">
          <option>App</option>
          <option>Email</option>
          <option>SMS</option>
        </select>
        <label>Mensaje</label>
        <textarea v-model="nuevaNotif.Mensaje" rows="3" placeholder="Escribe el mensaje..."></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalNuevo = false">Cancelar</button>
        <button class="btn btn-success btn-sm" @click="crearNotificacion">Enviar</button>
      </div>
    </div>
  </div>

  <!-- Modal Eliminar -->
  <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
    <div class="modal">
      <h3>¿Eliminar notificación?</h3>
      <p>¿Eliminar la notificación <strong>"{{ notifAEliminar?.Tipo }}"</strong>? Esta acción no se puede deshacer.</p>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" @click="mostrarModalEliminar = false">Cancelar</button>
        <button class="btn btn-danger btn-sm" @click="eliminarNotif">Eliminar</button>
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
.modal-body input,.modal-body select,.modal-body textarea { padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;width:100%;box-sizing:border-box; }
.modal-footer { display:flex;gap:.75rem;justify-content:flex-end; }
</style>