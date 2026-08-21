<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { notificacionesAPI } from '../../api'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion, irALogin, irARegistro } = useAuth()

const categoriaActiva = ref('todas')
const notificaciones = ref([])
const isLoading = ref(false)
const error = ref('')

const categorias = [
  { id: 'todas',        label: 'Todas',         emoji: '🔔' },
  { id: 'cita',        label: 'Citas',          emoji: '📅' },
  { id: 'vacuna',      label: 'Vacunas',        emoji: '💉' },
  { id: 'alimentacion',label: 'Alimentación',   emoji: '🍖' },
  { id: 'medicamentos',label: 'Medicamentos',   emoji: '💊' },
  { id: 'resultados',  label: 'Resultados',     emoji: '📋' }
]

const colorCategoria = (cat) => {
  const map = { cita: 'blue', vacuna: 'green', alimentacion: 'orange', medicamentos: 'purple', resultados: 'yellow' }
  return map[cat] || 'gray'
}

const obtenerCategoria = (mensaje, tipo) => {
  const texto = `${mensaje || ''} ${tipo || ''}`.toLowerCase()
  if (texto.includes('cita')) return 'cita'
  if (texto.includes('vacuna')) return 'vacuna'
  if (texto.includes('aliment')) return 'alimentacion'
  if (texto.includes('medic') || texto.includes('dosis')) return 'medicamentos'
  if (texto.includes('resultado') || texto.includes('analisis')) return 'resultados'
  return 'sistema'
}

const emojiCategoria = (cat) => {
  const map = { cita: '📅', vacuna: '💉', alimentacion: '🍖', medicamentos: '💊', resultados: '📋', sistema: '🔔' }
  return map[cat] || '🔔'
}

const formatDate = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const tiempoRelativo = (fecha) => {
  if (!fecha) return ''
  const diff = Date.now() - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora mismo'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  const dias = Math.floor(hrs / 24)
  return `Hace ${dias} día${dias > 1 ? 's' : ''}`
}

const notificacionesMapeadas = computed(() => {
  if (!usuarioLogueado.value) return []
  return notificaciones.value
    .filter(n => n.ID_usuario === usuarioLogueado.value.ID_usuario)
    .map(n => ({
      ...n,
      categoria: obtenerCategoria(n.Mensaje, n.Tipo),
      leida: !!n.Leida
    }))
})

const notificacionesFiltradas = computed(() => {
  if (categoriaActiva.value === 'todas') return notificacionesMapeadas.value
  return notificacionesMapeadas.value.filter(n => n.categoria === categoriaActiva.value)
})

const noLeidas = computed(() => notificacionesMapeadas.value.filter(n => !n.leida).length)

const conteoCategorias = computed(() => {
  const totals = { todas: 0, cita: 0, vacuna: 0, alimentacion: 0, medicamentos: 0, resultados: 0 }
  notificacionesMapeadas.value.forEach(n => {
    totals.todas += 1
    if (totals[n.categoria] !== undefined) totals[n.categoria] += 1
  })
  return totals
})

const cargarNotificaciones = async () => {
  if (!usuarioLogueado.value) return
  isLoading.value = true
  error.value = ''
  try {
    const data = await notificacionesAPI.obtenerPorUsuario(usuarioLogueado.value.ID_usuario)
    notificaciones.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.message || 'Error al cargar notificaciones'
  } finally {
    isLoading.value = false
  }
}

const marcarLeida = async (notif) => {
  if (notif.leida) return
  try {
    await notificacionesAPI.marcarComoLeida(notif.ID_notificacion)
    const idx = notificaciones.value.findIndex(n => n.ID_notificacion === notif.ID_notificacion)
    if (idx !== -1) notificaciones.value[idx].Leida = 1
  } catch (e) {
    console.error('Error marcando leída:', e)
  }
}

const marcarTodasLeidas = async () => {
  const ids = notificacionesMapeadas.value.filter(n => !n.leida).map(n => n.ID_notificacion)
  if (!ids.length) return
  try {
    await notificacionesAPI.marcarMultiplesComoLeidas(ids)
    notificaciones.value = notificaciones.value.map(n => ({ ...n, Leida: 1 }))
  } catch (e) {
    console.error('Error marcando todas leídas:', e)
  }
}

const eliminarNotif = async (id) => {
  try {
    await notificacionesAPI.eliminar(id)
    notificaciones.value = notificaciones.value.filter(n => n.ID_notificacion !== id)
  } catch (e) {
    console.error('Error eliminando notificación:', e)
  }
}

// ===== GUARD DE SEGURIDAD =====
onMounted(() => {
  const token = localStorage.getItem('petcard_token')
  const usuarioStr = localStorage.getItem('petcard_usuario_actual')
  let usuario = null
  try { usuario = usuarioStr ? JSON.parse(usuarioStr) : null } catch {}
  if (!token && !usuario) { router.push('/login-usuario'); return }
  if (usuario?.Rol === 'Admin') router.push('/admin-inicio')
})

onMounted(() => { cargarNotificaciones() })
</script>

<template>
  <nav class="navbar">
    <router-link to="/notificaciones" class="nav-logo">PETCARD</router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas">Citas</router-link></li>
      <li><router-link to="/alimentacion">Alimentación</router-link></li>
      <li><router-link to="/carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/perfil">Mi Perfil</router-link></li>
      <li><router-link to="/notificaciones" class="active">Notificaciones</router-link></li>
      <li><router-link to="/mis-mascotas">Mis Mascotas</router-link></li>
    </ul>
    <div class="auth-section">
      <template v-if="isAuthenticated">
        <span class="usuario-nombre">{{ usuarioLogueado?.Nombre }}</span>
        <button class="btn-auth btn-logout" @click="cerrarSesion">Cerrar sesión</button>
      </template>
      <template v-else>
        <button class="btn-auth" @click="irALogin">Iniciar sesión</button>
        <button class="btn-auth" @click="irARegistro">Registrarse</button>
      </template>
    </div>
  </nav>

  <div class="page-wrapper" style="margin-top:1.5rem;">
    <div class="notif-page-header">
      <div>
        <h1 class="notif-page-title">🔔 Notificaciones</h1>
        <p class="notif-page-sub">Mantente al día con la salud de tus mascotas</p>
      </div>
      <div class="notif-page-actions">
        <span v-if="noLeidas > 0" class="notif-badge-count">{{ noLeidas }} sin leer</span>
        <button class="btn-mark-all" @click="marcarTodasLeidas" :disabled="noLeidas === 0">
          ✓ Marcar todas como leídas
        </button>
        <button class="btn-refresh" @click="cargarNotificaciones" :disabled="isLoading">🔄</button>
      </div>
    </div>

    <div class="notif-layout">
      <aside class="notif-sidebar">
        <div class="notif-sidebar-card">
          <p class="notif-sidebar-title">Filtrar por tipo</p>
          <ul class="filtros-list">
            <li
              v-for="cat in categorias"
              :key="cat.id"
              class="filtro-item"
              :class="{ active: categoriaActiva === cat.id }"
              @click="categoriaActiva = cat.id"
            >
              <span class="filtro-emoji">{{ cat.emoji }}</span>
              <span>{{ cat.label }}</span>
              <span class="filtro-count">{{ conteoCategorias[cat.id] || 0 }}</span>
            </li>
          </ul>
        </div>
        <div class="notif-sidebar-card">
          <p class="notif-sidebar-title">Resumen</p>
          <div class="stat-row"><span>Total</span><strong>{{ conteoCategorias.todas }}</strong></div>
          <div class="stat-row"><span>Sin leer</span><strong style="color:#ef4444;">{{ noLeidas }}</strong></div>
          <div class="stat-row"><span>Leídas</span><strong style="color:#22c55e;">{{ conteoCategorias.todas - noLeidas }}</strong></div>
        </div>
      </aside>

      <main class="notif-main">
        <div v-if="isLoading" class="notif-empty">
          <span style="font-size:2rem;">⏳</span>
          <p>Cargando notificaciones...</p>
        </div>
        <div v-else-if="error" class="notif-empty" style="color:#ef4444;">
          <span style="font-size:2rem;">⚠️</span>
          <p>{{ error }}</p>
          <button class="btn-refresh-big" @click="cargarNotificaciones">Reintentar</button>
        </div>
        <div v-else-if="!isAuthenticated" class="notif-empty">
          <span style="font-size:2.5rem;">🔐</span>
          <p>Inicia sesión para ver tus notificaciones.</p>
        </div>
        <div v-else-if="notificacionesFiltradas.length === 0" class="notif-empty">
          <span style="font-size:2.5rem;">📭</span>
          <p>No hay notificaciones en esta categoría.</p>
        </div>
        <div v-else class="notif-list">
          <div
            v-for="notif in notificacionesFiltradas"
            :key="notif.ID_notificacion"
            class="notif-item"
            :class="{ 'notif-unread': !notif.leida }"
            @click="marcarLeida(notif)"
          >
            <div class="notif-emoji-icon">{{ emojiCategoria(notif.categoria) }}</div>
            <div class="notif-content">
              <div class="notif-msg">{{ notif.Mensaje }}</div>
              <div class="notif-meta">
                <span class="notif-badge-cat" :class="`badge-${colorCategoria(notif.categoria)}`">
                  {{ notif.Tipo || notif.categoria }}
                </span>
                <span>·</span>
                <span>{{ notif.Canal }}</span>
                <span>·</span>
                <span>{{ tiempoRelativo(notif.Fecha_envio) }}</span>
              </div>
              <div class="notif-date">{{ formatDate(notif.Fecha_envio) }}</div>
            </div>
            <div class="notif-right">
              <span v-if="!notif.leida" class="notif-dot-unread"></span>
              <span v-else class="notif-read-check">✓</span>
              <button class="notif-del-btn" @click.stop="eliminarNotif(notif.ID_notificacion)">🗑</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <footer class="footer" style="margin-top:2rem;">
    <div class="footer-grid">
      <div class="footer-brand"><span class="nav-logo" style="color:#fff;display:flex;">PetCard</span><p>Comprometidos con la salud de tus mascotas.</p></div>
      <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consultas</a></li><li><a href="#">Vacunación</a></li><li><a href="#">Emergencias</a></li></ul></div>
      <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p><p>info@petcard.com</p></div>
      <div class="footer-col"><h4>Horarios</h4><p>Lun–Vie: 8 AM–7 PM</p><p class="footer-emergency">Emergencias 24/7</p></div>
    </div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>
</template>

<style>
.notif-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.notif-page-title { font-size:1.5rem; font-weight:800; color:#0f172a; margin:0; }
.notif-page-sub { color:#64748b; font-size:.875rem; margin:.2rem 0 0; }
.notif-page-actions { display:flex; align-items:center; gap:.6rem; }
.notif-badge-count { background:#ef4444; color:white; font-size:.75rem; font-weight:700; padding:.25rem .65rem; border-radius:99px; }
.btn-mark-all { background:#6366f1; color:white; border:none; border-radius:8px; padding:.5rem 1rem; font-size:.82rem; font-weight:700; cursor:pointer; }
.btn-mark-all:hover { background:#4f46e5; }
.btn-mark-all:disabled { background:#c7d2fe; cursor:not-allowed; }
.btn-refresh { background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px; padding:.5rem .7rem; cursor:pointer; }
.btn-refresh-big { margin-top:.75rem; background:#6366f1; color:white; border:none; border-radius:8px; padding:.5rem 1.25rem; cursor:pointer; font-weight:700; }
.notif-layout { display:grid; grid-template-columns:240px 1fr; gap:1.25rem; align-items:start; }
@media (max-width:720px) { .notif-layout { grid-template-columns:1fr; } }
.notif-sidebar { display:flex; flex-direction:column; gap:.85rem; }
.notif-sidebar-card { background:white; border:1px solid #e2e8f0; border-radius:12px; padding:1rem 1.1rem; box-shadow:0 2px 8px rgba(15,23,42,.05); }
.notif-sidebar-title { font-size:.75rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; margin:0 0 .75rem; }
.filtros-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.2rem; }
.filtro-item { display:flex; align-items:center; gap:.55rem; padding:.5rem .6rem; border-radius:8px; font-size:.875rem; cursor:pointer; color:#334155; transition:background .15s; }
.filtro-item:hover { background:#f8fafc; }
.filtro-item.active { background:#eef2ff; color:#4338ca; font-weight:700; }
.filtro-emoji { font-size:1rem; }
.filtro-count { margin-left:auto; background:#f1f5f9; border-radius:99px; padding:.1rem .45rem; font-size:.72rem; font-weight:700; color:#475569; }
.filtro-item.active .filtro-count { background:#6366f1; color:white; }
.stat-row { display:flex; justify-content:space-between; padding:.35rem 0; font-size:.85rem; color:#64748b; border-bottom:1px solid #f1f5f9; }
.stat-row:last-child { border-bottom:none; }
.notif-empty { text-align:center; padding:3rem 1rem; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:.5rem; background:white; border:1px solid #e2e8f0; border-radius:12px; }
.notif-list { display:flex; flex-direction:column; gap:.6rem; }
.notif-item { display:flex; align-items:flex-start; gap:.85rem; padding:1rem 1.1rem; background:white; border:1.5px solid #e2e8f0; border-radius:12px; cursor:pointer; transition:box-shadow .15s, border-color .15s; }
.notif-item:hover { box-shadow:0 4px 14px rgba(15,23,42,.08); border-color:#c7d2fe; }
.notif-unread { border-left:4px solid #6366f1; background:#fafbff; }
.notif-emoji-icon { font-size:1.5rem; width:40px; height:40px; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-radius:10px; flex-shrink:0; }
.notif-content { flex:1; }
.notif-msg { font-weight:600; font-size:.9rem; color:#0f172a; margin-bottom:.3rem; line-height:1.4; }
.notif-meta { display:flex; align-items:center; gap:.4rem; font-size:.78rem; color:#64748b; margin-bottom:.2rem; }
.notif-date { font-size:.75rem; color:#94a3b8; }
.notif-badge-cat { font-size:.7rem; font-weight:700; padding:.15rem .5rem; border-radius:99px; text-transform:capitalize; }
.badge-blue { background:#eef2ff; color:#4338ca; }
.badge-green { background:#dcfce7; color:#166534; }
.badge-orange { background:#ffedd5; color:#c2410c; }
.badge-purple { background:#ede9fe; color:#5b21b6; }
.badge-yellow { background:#fef9c3; color:#92400e; }
.badge-gray { background:#f3f4f6; color:#374151; }
.notif-right { display:flex; flex-direction:column; align-items:center; gap:.5rem; flex-shrink:0; }
.notif-dot-unread { width:10px; height:10px; background:#6366f1; border-radius:50%; display:block; }
.notif-read-check { color:#22c55e; font-size:.85rem; font-weight:700; }
.notif-del-btn { background:none; border:none; cursor:pointer; font-size:.85rem; opacity:.4; transition:opacity .15s; padding:0; }
.notif-del-btn:hover { opacity:1; }
.usuario-nombre { color:#0f172a; font-weight:600; margin-right:1rem; font-size:.95rem; }
.btn-logout { background-color:#dc3545; border:1px solid #dc3545; }
.btn-logout:hover { background-color:#c82333; border-color:#c82333; }
</style>