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
  // Rutas públicas
  { path: '/',                 component: Inicio },
  { path: '/inicio',           component: Inicio },
  { path: '/servicios',        component: Servicios },
  { path: '/login-usuario',    component: LoginUsuario },
  { path: '/login-admin',      component: LoginAdmin },
  { path: '/registro-usuario', component: RegistroUsuario },
  { path: '/registro-admin',   component: RegistroAdmin },
  { path: '/test-api',         component: TestAPI },

  // Rutas de Cliente / Veterinario
  { path: '/citas',          component: Citas,          meta: { requiresAuth: true, roles: ['Cliente', 'Veterinario'] } },
  { path: '/carnet',         component: Carnet,         meta: { requiresAuth: true, roles: ['Cliente', 'Veterinario'] } },
  { path: '/alimentacion',   component: Alimentacion,   meta: { requiresAuth: true, roles: ['Cliente', 'Veterinario'] } },
  { path: '/notificaciones', component: Notificaciones, meta: { requiresAuth: true, roles: ['Cliente', 'Veterinario'] } },
  { path: '/perfil',         component: Perfil,         meta: { requiresAuth: true, roles: ['Cliente', 'Veterinario'] } },
  { path: '/mis-mascotas',   component: MisMascotas,    meta: { requiresAuth: true, roles: ['Cliente', 'Veterinario'] } },

  // Rutas de Admin
  { path: '/admin',                component: AdminInicio,         meta: { requiresAuth: true, roles: ['Admin'] } },
  { path: '/admin-inicio',         component: AdminInicio,         meta: { requiresAuth: true, roles: ['Admin'] } },
  { path: '/admin-citas',          component: AdminCitas,          meta: { requiresAuth: true, roles: ['Admin'] } },
  { path: '/admin-carnet',         component: AdminCarnet,         meta: { requiresAuth: true, roles: ['Admin'] } },
  { path: '/admin-alimentacion',   component: AdminAlimentacion,   meta: { requiresAuth: true, roles: ['Admin'] } },
  { path: '/admin-notificaciones', component: AdminNotificaciones, meta: { requiresAuth: true, roles: ['Admin'] } },
  { path: '/admin-servicios',      component: AdminServicios,      meta: { requiresAuth: true, roles: ['Admin'] } },
  { path: '/admin-perfil',         component: AdminPerfil,         meta: { requiresAuth: true, roles: ['Admin'] } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ===== GUARD GLOBAL DE SEGURIDAD =====
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const allowedRoles = to.meta.roles

  if (!requiresAuth) return next()

  const token = localStorage.getItem('petcard_token')
  const usuarioStr = localStorage.getItem('petcard_usuario_actual')
  let usuario = null
  try { usuario = usuarioStr ? JSON.parse(usuarioStr) : null } catch {}

  if (!token && !usuario) {
    const esAdmin = allowedRoles && allowedRoles.includes('Admin')
    return next(esAdmin ? '/login-admin' : '/login-usuario')
  }

  const rol = usuario?.Rol
  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(rol?.toLowerCase())) {
    if (rol?.toLowerCase() === 'admin') return next('/admin-inicio')
    return next('/inicio')
  }

  next()
})

export default router