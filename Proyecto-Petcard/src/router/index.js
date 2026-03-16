import { createRouter, createWebHistory } from 'vue-router'

import Inicio from '../components/inicio.vue'
import Servicios from '../components/servicios.vue'

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: Inicio
  },
  {
    path: '/servicios',
    name: 'Servicios',
    component: Servicios
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router