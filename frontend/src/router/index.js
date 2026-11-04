import { createRouter, createWebHistory } from 'vue-router'
import Inicio from '../components/shared/inicio.vue'
import Servicios from '../components/shared/servicios.vue'
import Citas from '../components/usuario/citas.vue'
import Carnet from '../components/usuario/carnet.vue'
import Alimentacion from '../components/usuario/alimentacion.vue'
import Notificaciones from '../components/usuario/notificaciones.vue'
import Perfil from '../components/usuario/perfil.vue'
import AdminInicio from '../components/admin/admin-inicio.vue'
import AdminCitas from '../components/admin/admin-citas.vue'
import AdminCarnet from '../components/admin/admin-carnet.vue'
import AdminAlimentacion from '../components/admin/admin-alimentacion.vue'
import AdminNotificaciones from '../components/admin/admin-notificaciones.vue'
import AdminServicios from '../components/admin/admin-servicios.vue'
import AdminPerfil from '../components/admin/admin-perfil.vue'
import AdminUsuarios from '../components/admin/admin-usuarios.vue'
import AdminMascotas from '../components/admin/admin-mascotas.vue'
import MisMascotas from '../components/usuario/mis-mascotas.vue'
import LoginUsuario from '../components/usuario/login-usuario.vue'
import LoginAdmin from '../components/admin/login-admin.vue'
import RegistroUsuario from '../components/usuario/registro-usuario.vue'
import RegistroAdmin from '../components/admin/registro-admin.vue'
import TestAPI from '../components/shared/test-api.vue'
// ── Vistas del veterinario ────────────────────────────────
import VeterinarioInicio from '../components/veterinario/veterinario-inicio.vue'
import VeterinarioCitas from '../components/veterinario/veterinario-citas.vue'
import VeterinarioAlimentacion from '../components/veterinario/veterinario-alimentacion.vue'

const routes = [
  // ── Rutas públicas ──────────────────────────────────────
  { path: '/',                 component: Inicio },
  { path: '/inicio',           component: Inicio },
  { path: '/servicios',        component: Servicios },
  { path: '/login-usuario',    component: LoginUsuario },
  { path: '/login-admin',      component: LoginAdmin },
  { path: '/registro-usuario', component: RegistroUsuario },
  { path: '/registro-admin',   component: RegistroAdmin },
  { path: '/test-api',         component: TestAPI },

  // ── Rutas privadas de usuario ────────────────────────────
  { path: '/citas',          component: Citas,          meta: { requiresAuth: true } },
  { path: '/carnet',         component: Carnet,         meta: { requiresAuth: true } },
  { path: '/alimentacion',   component: Alimentacion,   meta: { requiresAuth: true } },
  { path: '/notificaciones', component: Notificaciones, meta: { requiresAuth: true } },
  { path: '/perfil',         component: Perfil,         meta: { requiresAuth: true } },
  { path: '/mis-mascotas',   component: MisMascotas,    meta: { requiresAuth: true } },

  // ── Rutas privadas de administrador ─────────────────────
  { path: '/admin',                component: AdminInicio,         meta: { requiresAdmin: true } },
  { path: '/admin-inicio',         component: AdminInicio,         meta: { requiresAdmin: true } },
  { path: '/admin-citas',          component: AdminCitas,          meta: { requiresAdmin: true } },
  { path: '/admin-carnet',         component: AdminCarnet,         meta: { requiresAdmin: true } },
  { path: '/admin-alimentacion',   component: AdminAlimentacion,   meta: { requiresAdmin: true } },
  { path: '/admin-notificaciones', component: AdminNotificaciones, meta: { requiresAdmin: true } },
  { path: '/admin-servicios',      component: AdminServicios,      meta: { requiresAdmin: true } },
  { path: '/admin-perfil',         component: AdminPerfil,         meta: { requiresAdmin: true } },
  { path: '/admin-usuarios',       component: AdminUsuarios,       meta: { requiresAdmin: true } },
  { path: '/admin-mascotas',       component: AdminMascotas,       meta: { requiresAdmin: true } },

  // ── Rutas privadas de veterinario ────────────────────────
  { path: '/veterinario-inicio', component: VeterinarioInicio, meta: { requiresVet: true } },
  { path: '/veterinario-citas',  component: VeterinarioCitas,  meta: { requiresVet: true } },
  { path: '/veterinario-alimentacion', component: VeterinarioAlimentacion, meta: { requiresVet: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ── Guard global de navegación ───────────────────────────
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('petcard_token')
  let usuario = null
  try {
    const raw = localStorage.getItem('petcard_usuario_actual')
    if (raw) usuario = JSON.parse(raw)
  } catch {
    usuario = null
  }

  const estaLogueado = !!(token || usuario)
  const rolUsuario = usuario?.Rol?.toLowerCase()
  const esAdmin = rolUsuario === 'administrador' || rolUsuario === 'admin'
  const esVeterinario = rolUsuario === 'veterinario'

  if (to.meta.requiresAdmin) {
    if (!estaLogueado) return next('/login-admin')
    if (!esAdmin) return next('/inicio')
  } else if (to.meta.requiresVet) {
    if (!estaLogueado) return next('/login-admin')
    if (!esVeterinario && !esAdmin) return next('/inicio')
  } else if (to.meta.requiresAuth) {
    if (!estaLogueado) return next('/login-usuario')
  }

  next()
})

export default router