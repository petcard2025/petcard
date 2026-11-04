<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { notificacionesAPI, usuariosAPI } from '../../api'

const notificaciones = ref([])
const usuarios = ref([])
const cargando = ref(true)
const error = ref('')

const busqueda = ref('')
const filtroTipo = ref('Todos')
const filtroLeida = ref('Todas')

const mostrarModalNuevo = ref(false)
const mostrarModalEliminar = ref(false)
const notificacionAEliminar = ref(null)
const enviando = ref(false)

const nuevaNotificacion = ref({ ID_usuario: '', Mensaje: '', Tipo: 'General', Canal: 'Sistema' })

onMounted(cargarTodo)

async function cargarTodo() {
  cargando.value = true
  error.value = ''
  try {
    const [n, u] = await Promise.all([
      notificacionesAPI.obtener(),
      usuariosAPI.obtener()
    ])
    notificaciones.value = n
    usuarios.value = u
  } catch (e) {
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

const tipos = computed(() => {
  const set = new Set(notificaciones.value.map(n => n.Tipo).filter(Boolean))
  return ['Todos', ...set]
})

const notificacionesFiltradas = computed(() => {
  return notificaciones.value
    .filter(n => {
      const texto = `${n.Mensaje} ${n.Nombre_usuario}`.toLowerCase()
      const coincideBusqueda = texto.includes(busqueda.value.toLowerCase())
      const coincideTipo = filtroTipo.value === 'Todos' || n.Tipo === filtroTipo.value
      const coincideLeida =
        filtroLeida.value === 'Todas' ||
        (filtroLeida.value === 'Leídas' && Number(n.Leida) === 1) ||
        (filtroLeida.value === 'No leídas' && Number(n.Leida) !== 1)
      return coincideBusqueda && coincideTipo && coincideLeida
    })
    .sort((a, b) => new Date(b.Fecha_envio) - new Date(a.Fecha_envio))
})

function iconoTipo(tipo) {
  const t = (tipo || '').toLowerCase()
  if (t.includes('cita')) return '📅'
  if (t.includes('vacuna')) return '💉'
  if (t.includes('aliment')) return '🍽️'
  return '🔔'
}

async function marcarLeida(n) {
  try {
    await notificacionesAPI.marcarComoLeida(n.ID_notificacion)
    n.Leida = 1
  } catch (e) {
    alert('No se pudo marcar como leída.')
  }
}

function confirmarEliminar(n) {
  notificacionAEliminar.value = n
  mostrarModalEliminar.value = true
}

async function eliminarNotificacion() {
  try {
    await notificacionesAPI.eliminar(notificacionAEliminar.value.ID_notificacion)
    await cargarTodo()
    mostrarModalEliminar.value = false
  } catch (e) {
    alert('Error al eliminar la notificación: ' + e.message)
  }
}

function abrirNueva() {
  nuevaNotificacion.value = { ID_usuario: '', Mensaje: '', Tipo: 'General', Canal: 'Sistema' }
  mostrarModalNuevo.value = true
}

async function enviarNotificacion() {
  if (!nuevaNotificacion.value.ID_usuario || !nuevaNotificacion.value.Mensaje) {
    alert('Selecciona el usuario y escribe un mensaje.')
    return
  }
  enviando.value = true
  try {
    await notificacionesAPI.crear(nuevaNotificacion.value)
    await cargarTodo()
    mostrarModalNuevo.value = false
  } catch (e) {
    alert('Error al enviar la notificación: ' + e.message)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <AdminLayout title="Notificaciones" subtitle="Consulta y envía notificaciones a los usuarios">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="abrirNueva">+ Nueva Notificación</button>
    </template>

    <div v-if="error" class="alert alert-danger"><span>{{ error }}</span></div>

    <div class="search-filter">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar por mensaje o usuario..." v-model="busqueda" />
      </div>
      <select class="filter-select" v-model="filtroTipo">
        <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
      </select>
      <select class="filter-select" v-model="filtroLeida">
        <option>Todas</option>
        <option>Leídas</option>
        <option>No leídas</option>
      </select>
    </div>

    <div v-if="cargando" style="text-align:center;padding:2rem;color:#888;">Cargando notificaciones...</div>
    <div v-else-if="notificacionesFiltradas.length === 0" class="empty-state">No hay notificaciones que mostrar.</div>

    <div v-else class="notif-list">
      <div class="notif-item" v-for="n in notificacionesFiltradas" :key="n.ID_notificacion" :class="{ leida: Number(n.Leida) === 1 }">
        <div class="notif-icon">{{ iconoTipo(n.Tipo) }}</div>
        <div class="notif-body">
          <div class="notif-top">
            <strong>{{ n.Nombre_usuario }}</strong>
            <span class="badge badge-blue">{{ n.Tipo }}</span>
            <span class="badge badge-gray">{{ n.Canal }}</span>
            <span v-if="Number(n.Leida) !== 1" class="badge badge-yellow">No leída</span>
          </div>
          <p class="notif-msg">{{ n.Mensaje }}</p>
          <span class="notif-fecha">{{ new Date(n.Fecha_envio).toLocaleString('es-CO') }}</span>
        </div>
        <div class="notif-actions">
          <button v-if="Number(n.Leida) !== 1" class="btn btn-secondary btn-sm" @click="marcarLeida(n)">Marcar leída</button>
          <button class="btn btn-danger btn-sm" @click="confirmarEliminar(n)">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Nueva -->
    <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="mostrarModalNuevo = false">
      <div class="modal">
        <h3>Nueva Notificación</h3>
        <div class="modal-body">
          <label>Usuario</label>
          <select v-model="nuevaNotificacion.ID_usuario">
            <option value="" disabled>-- Selecciona usuario --</option>
            <option v-for="u in usuarios" :key="u.ID_usuario" :value="u.ID_usuario">{{ u.Nombre }} ({{ u.Rol }})</option>
          </select>
          <label>Tipo</label>
          <select v-model="nuevaNotificacion.Tipo">
            <option>General</option>
            <option>cita</option>
            <option>vacuna</option>
            <option>alimentacion</option>
          </select>
          <label>Canal</label>
          <select v-model="nuevaNotificacion.Canal">
            <option>Sistema</option>
            <option>SMS</option>
          </select>
          <label>Mensaje</label>
          <textarea v-model="nuevaNotificacion.Mensaje" rows="3" placeholder="Escribe el mensaje..."></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalNuevo = false">Cancelar</button>
          <button class="btn btn-success btn-sm" :disabled="enviando" @click="enviarNotificacion">{{ enviando ? 'Enviando...' : 'Enviar' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
      <div class="modal">
        <h3>¿Eliminar notificación?</h3>
        <p>Esta acción no se puede deshacer.</p>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEliminar = false">Cancelar</button>
          <button class="btn btn-danger btn-sm" @click="eliminarNotificacion">Eliminar</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.notif-list { display: flex; flex-direction: column; gap: .75rem; }

.notif-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: var(--white);
  border: 1px solid var(--border);
  border-left: 4px solid var(--purple);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
  box-shadow: var(--card-shadow);
}
.notif-item.leida { border-left-color: var(--border); opacity: .75; }

.notif-icon { font-size: 1.4rem; line-height: 1; }
.notif-body { flex: 1; min-width: 0; }
.notif-top { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; margin-bottom: .3rem; }
.notif-msg { font-size: .9rem; color: var(--text); margin: .2rem 0 .4rem; }
.notif-fecha { font-size: .75rem; color: var(--muted); }
.notif-actions { display: flex; flex-direction: column; gap: .4rem; flex-shrink: 0; }

.modal-body select, .modal-body textarea {
  padding: .55rem .75rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: .9rem; width: 100%; box-sizing: border-box; font-family: 'Lato', sans-serif;
}
</style>