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
const routes = [
  { path: '/', component: Inicio },
  { path: '/inicio', component: Inicio },
  { path: '/servicios', component: Servicios },
  { path: '/citas', component: Citas },
  { path: '/carnet', component: Carnet },
  { path: '/alimentacion', component: Alimentacion },
  { path: '/notificaciones', component: Notificaciones },
  { path: '/perfil', component: Perfil },
  { path: '/admin', component: AdminInicio },
  { path: '/admin-inicio', component: AdminInicio },
  { path: '/admin-citas', component: AdminCitas },
  { path: '/admin-carnet', component: AdminCarnet },
  { path: '/admin-alimentacion', component: AdminAlimentacion },
  { path: '/admin-notificaciones', component: AdminNotificaciones },
  { path: '/admin-servicios', component: AdminServicios },
  { path: '/admin-perfil', component: AdminPerfil },
  { path: '/mis-mascotas', component: MisMascotas },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router