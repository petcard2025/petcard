<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { notificacionesAPI } from '../api'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion, irALogin, irARegistro } = useAuth()

const categoriaActiva = ref('todas')
const notificaciones = ref([])
const isLoading = ref(false)
const error = ref('')

const categorias = [
  { id: 'todas', label: 'Todas', icon: 'circle' },
  { id: 'citas', label: 'Citas', icon: 'calendar' },
  { id: 'vacunas', label: 'Vacunas', icon: 'shield' },
  { id: 'alimentacion', label: 'Alimentación', icon: 'cup' },
  { id: 'medicamentos', label: 'Medicamentos', icon: 'pill' },
  { id: 'resultados', label: 'Resultados', icon: 'file' }
]

const iconClass = (categoria) => {
  switch (categoria) {
    case 'citas': return 'blue'
    case 'vacunas': return 'yellow'
    case 'alimentacion': return 'orange'
    case 'medicamentos': return 'green'
    case 'resultados': return 'purple'
    default: return 'gray'
  }
}

const obtenerCategoria = (mensaje, tipo) => {
  const texto = `${mensaje || ''} ${tipo || ''}`.toLowerCase()
  if (texto.includes('cita')) return 'citas'
  if (texto.includes('vacuna') || texto.includes('vacunación') || texto.includes('vacun')) return 'vacunas'
  if (texto.includes('aliment')) return 'alimentacion'
  if (texto.includes('medic') || texto.includes('dosis')) return 'medicamentos'
  if (texto.includes('resultado') || texto.includes('análisis') || texto.includes('analisis')) return 'resultados'
  return 'todas'
}

const formatDate = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const notificacionesUsuario = computed(() => {
  if (!usuarioLogueado.value) return []
  return notificaciones.value
    .filter(n => n.ID_usuario === usuarioLogueado.value.ID_usuario)
    .map(n => ({
      ...n,
      categoria: obtenerCategoria(n.Mensaje, n.Tipo),
      read: n.leida || false
    }))
})

const notificacionesFiltradas = computed(() => {
  if (categoriaActiva.value === 'todas') return notificacionesUsuario.value
  return notificacionesUsuario.value.filter(n => n.categoria === categoriaActiva.value)
})

const conteoCategorias = computed(() => {
  const totals = { todas: 0, citas: 0, vacunas: 0, alimentacion: 0, medicamentos: 0, resultados: 0 }
  notificacionesUsuario.value.forEach(n => {
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
    const data = await notificacionesAPI.obtener()
    notificaciones.value = data.map(n => ({
      ...n,
      categoria: obtenerCategoria(n.Mensaje, n.Tipo),
      read: false
    }))
  } catch (err) {
    error.value = err.message || 'Error al cargar las notificaciones'
  } finally {
    isLoading.value = false
  }
}

const marcarTodasLeidas = () => {
  notificaciones.value = notificaciones.value.map(n => ({ ...n, read: true }))
}

const marcarLeida = (id) => {
  notificaciones.value = notificaciones.value.map(n => n.ID_notificacion === id ? { ...n, read: true } : n)
}

const setCategoria = (categoria) => {
  categoriaActiva.value = categoria
}

onMounted(() => {
  cargarNotificaciones()
})
</script>

<template>
  <nav class="navbar">
    <router-link to="/notificaciones" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
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
    <div id="auth-section" class="auth-section">
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

  <div class="page-wrapper">
    <div class="two-col" style="grid-template-columns:260px 1fr;">
      <div class="sidebar">
        <div class="card">
          <div class="card-title">Filtrar por categoría</div>
          <ul class="filtros-list">
            <li
              v-for="item in categorias"
              :key="item.id"
              class="filtro-item"
              :class="{ active: categoriaActiva === item.id }"
              @click="setCategoria(item.id)"
            >
              <svg v-if="item.icon === 'circle'" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
              <svg v-else-if="item.icon === 'calendar'" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <svg v-else-if="item.icon === 'shield'" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <svg v-else-if="item.icon === 'cup'" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
              <svg v-else-if="item.icon === 'pill'" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.5 22l5-16.5m5.5 14l-4.5-16m-8 14.5L3 17"/></svg>
              <svg v-else-if="item.icon === 'file'" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {{ item.label }}
              <span class="filtro-count">{{ conteoCategorias[item.id] || 0 }}</span>
            </li>
          </ul>

          <div class="config-section">
            <div class="card-title" style="font-size:.85rem; margin-bottom:.75rem;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              Configuración
            </div>
            <div class="config-row">
              <span>Notificar por email</span>
              <label class="toggle">
                <input type="checkbox" id="chk-email" checked/>
                <span class="slider"></span>
              </label>
            </div>
            <div class="config-row">
              <span>Marcar todas automáticamente</span>
              <label class="toggle">
                <input type="checkbox" id="chk-auto"/>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL NOTIFICACIONES -->
      <div>
        <div class="notif-header">
          <h2 class="notif-title">Todas las notificaciones</h2>
          <div style="display:flex; align-items:center; gap:.75rem;">
            <button class="btn btn-danger btn-sm" @click="marcarTodasLeidas">Marcar como leídas</button>
            <span class="badge badge-blue">{{ conteoCategorias.todas }} notificaciones</span>
          </div>
        </div>

        <div v-if="!isAuthenticated" class="notif-list">
          <div class="notif-item">
            <div class="notif-body">
              <div class="notif-titulo">Inicia sesión para ver tus notificaciones</div>
              <div class="notif-desc">Accede con tu cuenta para cargar las notificaciones de la base de datos.</div>
            </div>
          </div>
        </div>

        <div v-else class="notif-list">
          <div v-if="isLoading" class="notif-item">
            <div class="notif-body">
              <div class="notif-titulo">Cargando notificaciones...</div>
            </div>
          </div>

          <div v-if="error" class="notif-item">
            <div class="notif-body">
              <div class="notif-titulo">Error</div>
              <div class="notif-desc">{{ error }}</div>
            </div>
          </div>

          <div v-if="!isLoading && notificacionesFiltradas.length === 0" class="notif-item">
            <div class="notif-body">
              <div class="notif-titulo">No hay notificaciones</div>
              <div class="notif-desc">No se encontraron notificaciones para la categoría seleccionada.</div>
            </div>
          </div>

          <div
            v-for="notif in notificacionesFiltradas"
            :key="notif.ID_notificacion"
            class="notif-item"
            :class="{ leida: notif.read }"
            @click="marcarLeida(notif.ID_notificacion)"
          >
            <div :class="['notif-icon', iconClass(notif.categoria)]">
              <svg v-if="notif.categoria === 'citas'" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <svg v-else-if="notif.categoria === 'vacunas'" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <svg v-else-if="notif.categoria === 'alimentacion'" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
              <svg v-else-if="notif.categoria === 'medicamentos'" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.5 22l5-16.5m5.5 14l-4.5-16m-8 14.5L3 17"/></svg>
              <svg v-else-if="notif.categoria === 'resultados'" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <svg v-else width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </div>
            <div class="notif-body">
              <div class="notif-titulo">{{ notif.Mensaje }}</div>
              <div class="notif-desc">{{ notif.Tipo }} • Enviado por {{ notif.Canal }} • {{ formatDate(notif.Fecha_envio) }}</div>
              <div class="notif-tiempo">{{ notif.Nombre_usuario }}</div>
            </div>
            <span class="badge" :class="`badge-${iconClass(notif.categoria)}`">{{ notif.categoria.toUpperCase() }}</span>
            <div class="notif-dots">• • •</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <footer class="footer" style="margin-top:2rem;">
    <div class="footer-grid">
      <div class="footer-brand"><span class="nav-logo" style="color:#fff; margin-bottom:.5rem; display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>PetCard</span><p>Comprometidos con brindar toda la atención profesional que tu mascota.</p></div>
      <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li><li><a href="#">Cirugías</a></li><li><a href="#">Emergencias</a></li></ul></div>
      <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p><p>info@petcard.com</p><p>Calle Principal 123, Ciudad</p></div>
      <div class="footer-col"><h4>Horarios</h4><p>Lunes - Viernes: 8:00 AM - 7:00 PM</p><p>Sábados: 9:00 AM - 6:00 PM</p><p>Domingos: 10:00 AM - 4:00 PM</p><p class="footer-emergency">Emergencias 24/7</p></div>
    </div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>
</template>

<style>
/* ============================================================
   notificaciones.css — Pantalla de Notificaciones (Usuario)
   Requiere: shared.css
   ============================================================ */

/* ── ÍCONO CON PUNTO ── */
.active-notif { position: relative; }
.notif-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: var(--red);
  border-radius: 50%;
  border: 2px solid #fff;
}

/* ── FILTROS ── */
.filtros-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  margin-bottom: 1.25rem;
}

.filtro-item {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .5rem .75rem;
  border-radius: var(--radius-sm);
  font-size: .875rem;
  cursor: pointer;
  transition: background .2s;
  color: var(--text-secondary);
}

.filtro-item:hover { background: var(--bg); }

.filtro-item.active {
  background: var(--purple-bg);
  color: var(--purple);
  font-weight: 700;
}

.filtro-count {
  margin-left: auto;
  background: var(--border);
  border-radius: 99px;
  padding: .1rem .45rem;
  font-size: .75rem;
  font-weight: 700;
}

.filtro-item.active .filtro-count {
  background: var(--purple);
  color: #fff;
}

/* ── CONFIGURACIÓN ── */
.config-section {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .82rem;
  margin-bottom: .65rem;
}

/* Toggle switch */
.toggle {
  position: relative;
  width: 36px;
  height: 20px;
  cursor: pointer;
}

.toggle input { display: none; }

.slider {
  position: absolute;
  inset: 0;
  background: var(--border);
  border-radius: 99px;
  transition: background .2s;
}

.slider::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform .2s;
}

.toggle input:checked + .slider { background: var(--purple); }
.toggle input:checked + .slider::before { transform: translateX(16px); }

/* ── NOTIFICACIONES HEADER ── */
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notif-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
}

/* ── LISTA DE NOTIFICACIONES ── */
.notif-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: .85rem;
  padding: 1rem;
  background: #fff;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  transition: border-color .2s;
}

.notif-item:hover { border-color: #d1d5db; }

.notif-item.leida { opacity: .6; }

.notif-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.notif-icon.blue   { background: var(--purple); }
.notif-icon.yellow { background: var(--yellow); }
.notif-icon.orange { background: var(--orange); }
.notif-icon.green  { background: var(--green); }
.notif-icon.purple { background: #7c3aed; }
.notif-icon.gray   { background: var(--muted); }
.notif-icon.red    { background: var(--red); }

.notif-body { flex: 1; }

.notif-titulo {
  font-weight: 700;
  font-size: .9rem;
  margin-bottom: .2rem;
}

.notif-desc {
  font-size: .82rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: .25rem;
}

.notif-tiempo {
  font-size: .75rem;
  color: var(--muted);
}

.notif-dots {
  color: var(--muted);
  font-size: .85rem;
  cursor: pointer;
  flex-shrink: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: .2rem .55rem;
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-blue { background: #eef2ff; color: #4338ca; }
.badge-yellow { background: #fef9c3; color: #92400e; }
.badge-orange { background: #ffedd5; color: #c2410c; }
.badge-green { background: #dcfce7; color: #166534; }
.badge-purple { background: #ede9fe; color: #5b21b6; }
.badge-gray { background: #f3f4f6; color: #374151; }

/* Usuario logueado */
.usuario-nombre {
  color: #0f172a;
  font-weight: 600;
  margin-right: 1rem;
  font-size: 0.95rem;
}

.btn-logout {
  background-color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-logout:hover {
  background-color: #c82333;
  border-color: #c82333;
}
</style>