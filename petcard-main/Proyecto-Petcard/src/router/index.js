import { createRouter, createWebHistory } from 'vue-router'
import Inicio from '../components/inicio.vue'
import Servicios from '../components/servicios.vue'
import Citas from '../components/citas.vue'
import Carnet from '../components/carnet.vue'
import Alimentacion from '../components/alimentacion.vue'
import Notificaciones from '../components/notificaciones.vue'
import Perfil from '../components/perfil.vue'
import AdminInicio from '../components/admin-inicio.vue'
import AdminCitas from '../components/admin-citas.vue'
import AdminCarnet from '../components/admin-carnet.vue'
import AdminAlimentacion from '../components/admin-alimentacion.vue'
import AdminNotificaciones from '../components/admin-notificaciones.vue'
import AdminServicios from '../components/admin-servicios.vue'
import AdminPerfil from '../components/admin-perfil.vue'
import MisMascotas from '../components/mis-mascotas.vue'
import LoginUsuario from '../components/login-usuario.vue'
import LoginAdmin from '../components/login-admin.vue'
import RegistroUsuario from '../components/registro-usuario.vue'
import RegistroAdmin from '../components/registro-admin.vue'
import TestAPI from '../components/test-api.vue'

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
  // SEGURIDAD: requiresAdmin verifica rol en el guard, independiente del frontend
  { path: '/admin',                component: AdminInicio,         meta: { requiresAdmin: true } },
  { path: '/admin-inicio',         component: AdminInicio,         meta: { requiresAdmin: true } },
  { path: '/admin-citas',          component: AdminCitas,          meta: { requiresAdmin: true } },
  { path: '/admin-carnet',         component: AdminCarnet,         meta: { requiresAdmin: true } },
  { path: '/admin-alimentacion',   component: AdminAlimentacion,   meta: { requiresAdmin: true } },
  { path: '/admin-notificaciones', component: AdminNotificaciones, meta: { requiresAdmin: true } },
  { path: '/admin-servicios',      component: AdminServicios,      meta: { requiresAdmin: true } },
  { path: '/admin-perfil',         component: AdminPerfil,         meta: { requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ── Guard global de navegación ───────────────────────────
// SEGURIDAD: verifica sesión y rol antes de cada navegación
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

  if (to.meta.requiresAdmin) {
    // Ruta de admin: debe haber sesión Y ser admin
    if (!estaLogueado) {
      return next('/login-admin')
    }
    if (!esAdmin) {
      // Usuario normal intentando entrar al panel admin → redirigir a inicio
      return next('/inicio')
    }
  } else if (to.meta.requiresAuth) {
    // Ruta privada de usuario: solo necesita estar logueado
    if (!estaLogueado) {
      return next('/login-usuario')
    }
    // Admin intentando entrar a zona de usuario → permitir (pueden usar la app normalmente)
  }

  next()
})

export default router
