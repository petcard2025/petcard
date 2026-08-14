<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
})

const router = useRouter()
const route = useRoute()
const { usuarioLogueado, isAuthenticated, cerrarSesion } = useAuth()

const sidebarAbierto = ref(false)

// ===== GUARD DE SEGURIDAD (centralizado para todas las vistas admin) =====
onMounted(() => {
  const token = localStorage.getItem('petcard_token')
  const usuarioStr = localStorage.getItem('petcard_usuario_actual')
  let usuario = null
  try { usuario = usuarioStr ? JSON.parse(usuarioStr) : null } catch {}
  if (!token && !usuario) {
    router.push('/login-admin')
    return
  }
  const rol = usuario?.Rol?.toLowerCase()
  if (rol !== 'administrador' && rol !== 'admin') {
    router.push('/inicio')
  }
})

const menu = [
  { to: '/admin-inicio',         label: 'Inicio',       icon: 'home' },
  { to: '/admin-citas',          label: 'Citas',         icon: 'calendar' },
  { to: '/admin-mascotas',       label: 'Mascotas',      icon: 'paw' },
  { to: '/admin-carnet',         label: 'Carnet de Vacunas', icon: 'shield' },
  { to: '/admin-alimentacion',   label: 'Alimentación',  icon: 'bowl' },
  { to: '/admin-servicios',      label: 'Servicios',     icon: 'heart' },
  { to: '/admin-notificaciones', label: 'Notificaciones',icon: 'bell' },
  { to: '/admin-usuarios',       label: 'Usuarios',      icon: 'users' },
]

const esRutaActiva = (to) => route.path === to

const iniciales = computed(() => {
  const n = usuarioLogueado.value?.Nombre || 'Admin'
  return n.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
})

function cerrarSidebarMovil() {
  sidebarAbierto.value = false
}
</script>

<template>
  <div class="admin-shell">
    <!-- Overlay móvil -->
    <div v-if="sidebarAbierto" class="admin-overlay" @click="cerrarSidebarMovil"></div>

    <!-- SIDEBAR -->
    <aside class="admin-sidebar" :class="{ 'is-open': sidebarAbierto }">
      <div class="admin-sidebar-brand">
        <router-link to="/admin-inicio" class="admin-brand-link" @click="cerrarSidebarMovil">
          <span class="admin-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".2"/>
              <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>
              <path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <div>
            <div class="admin-brand-title">PETCARD</div>
            <div class="admin-brand-sub">Panel Admin</div>
          </div>
        </router-link>
      </div>

      <nav class="admin-nav">
        <router-link
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          class="admin-nav-item"
          :class="{ active: esRutaActiva(item.to) }"
          @click="cerrarSidebarMovil"
        >
          <span class="admin-nav-icon">
            <svg v-if="item.icon==='home'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
            <svg v-else-if="item.icon==='calendar'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <svg v-else-if="item.icon==='paw'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5.5" cy="9" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19.5" cy="9" r="2"/><path d="M12 11c-3 0-6.5 2.3-6.5 5.6 0 1.9 1.6 3.1 3.4 3.1 1.2 0 2-0.6 3.1-0.6s1.9 0.6 3.1 0.6c1.8 0 3.4-1.2 3.4-3.1C18.5 13.3 15 11 12 11z"/></svg>
            <svg v-else-if="item.icon==='shield'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
            <svg v-else-if="item.icon==='bowl'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11h18a9 9 0 01-18 0z"/><path d="M7 11V8a2 2 0 012-2"/><path d="M12 11V6"/><path d="M17 11V8a2 2 0 00-2-2"/></svg>
            <svg v-else-if="item.icon==='heart'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <svg v-else-if="item.icon==='bell'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <svg v-else-if="item.icon==='users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="admin-sidebar-footer">
        <router-link to="/admin-perfil" class="admin-user-card" @click="cerrarSidebarMovil">
          <span class="admin-avatar">{{ iniciales }}</span>
          <div class="admin-user-info">
            <div class="admin-user-name">{{ isAuthenticated ? usuarioLogueado?.Nombre : 'Admin' }}</div>
            <div class="admin-user-role">Administrador</div>
          </div>
        </router-link>
        <button class="admin-logout-btn" @click="cerrarSesion" title="Cerrar sesión">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="admin-main">
      <header class="admin-topbar">
        <button class="admin-hamburger" @click="sidebarAbierto = !sidebarAbierto" aria-label="Abrir menú">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="admin-topbar-titles">
          <h1 class="admin-page-title">{{ title }}</h1>
          <p v-if="subtitle" class="admin-page-sub">{{ subtitle }}</p>
        </div>
        <div class="admin-topbar-actions">
          <slot name="actions"></slot>
        </div>
      </header>

      <main class="admin-content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ── SIDEBAR ── */
.admin-sidebar {
  width: 250px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #1e2a52 0%, #14213d 100%);
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 300;
  transition: transform .25s ease;
}

.admin-sidebar-brand {
  padding: 1.35rem 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.admin-brand-link {
  display: flex;
  align-items: center;
  gap: .65rem;
  color: #fff;
}

.admin-brand-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.admin-brand-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.05rem;
  letter-spacing: .5px;
  color: #fff;
}

.admin-brand-sub { font-size: .72rem; color: #93a2c7; font-weight: 600; }

.admin-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem .75rem;
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .65rem .85rem;
  border-radius: 10px;
  font-size: .88rem;
  font-weight: 600;
  color: #b7c2e0;
  transition: background .15s, color .15s;
}

.admin-nav-icon { display: flex; align-items: center; opacity: .85; flex-shrink: 0; }

.admin-nav-item:hover {
  background: rgba(255,255,255,.06);
  color: #fff;
}

.admin-nav-item.active {
  background: linear-gradient(135deg, var(--purple), var(--purple-dark));
  color: #fff;
  box-shadow: 0 4px 12px rgba(37,99,235,.35);
}

.admin-sidebar-footer {
  padding: 1rem .9rem 1.15rem;
  border-top: 1px solid rgba(255,255,255,.08);
  display: flex;
  flex-direction: column;
  gap: .6rem;
}

.admin-user-card {
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .5rem .5rem;
  border-radius: 10px;
  transition: background .15s;
}
.admin-user-card:hover { background: rgba(255,255,255,.06); }

.admin-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-light), var(--purple));
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800;
  font-size: .78rem;
  flex-shrink: 0;
}

.admin-user-name { font-size: .82rem; font-weight: 700; color: #fff; line-height: 1.2; }
.admin-user-role { font-size: .72rem; color: #93a2c7; }

.admin-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  background: rgba(220,38,38,.12);
  color: #fca5a5;
  border: 1px solid rgba(220,38,38,.3);
  border-radius: 10px;
  padding: .55rem;
  font-size: .82rem;
  font-weight: 700;
  transition: background .15s;
}
.admin-logout-btn:hover { background: rgba(220,38,38,.25); color: #fff; }

/* ── MAIN ── */
.admin-main {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 1rem 1.75rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.admin-hamburger {
  display: none;
  background: none;
  border: none;
  color: var(--text);
  padding: .3rem;
}

.admin-topbar-titles { flex: 1; min-width: 0; }

.admin-page-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.3rem;
  color: var(--text);
  margin: 0;
}

.admin-page-sub {
  font-size: .85rem;
  color: var(--muted);
  margin: .15rem 0 0;
}

.admin-topbar-actions { display: flex; gap: .6rem; align-items: center; flex-shrink: 0; }

.admin-content {
  padding: 1.75rem;
  flex: 1;
}

.admin-overlay {
  display: none;
}

/* ── RESPONSIVE ── */
@media (max-width: 960px) {
  .admin-sidebar {
    transform: translateX(-100%);
    box-shadow: 0 0 30px rgba(0,0,0,.3);
  }
  .admin-sidebar.is-open { transform: translateX(0); }
  .admin-main { margin-left: 0; }
  .admin-hamburger { display: flex; }
  .admin-overlay {
    display: block;
    position: fixed; inset: 0;
    background: rgba(0,0,0,.45);
    z-index: 250;
  }
  .admin-content { padding: 1.1rem; }
  .admin-topbar { padding: .85rem 1rem; }
}
</style>