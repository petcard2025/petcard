import { createRouter, createWebHistory } from 'vue-router'
import Inicio from '../components/inicio.vue'
import Servicios from '../components/servicios.vue'

const routes = [
  { path: '/inicio', component: Inicio },
  { path: '/servicios', component: Servicios },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router