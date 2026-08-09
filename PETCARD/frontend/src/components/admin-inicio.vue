<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { usuariosAPI, mascotasAPI, citasAPI, serviciosAPI } from '../api'

const cargando = ref(true)
const stats = ref({ usuarios: 0, mascotas: 0, citas: 0, servicios: 0 })
const citasRecientes = ref([])

onMounted(async () => {
  try {
    const [usuarios, mascotas, citas, servicios] = await Promise.all([
      usuariosAPI.obtener().catch(() => []),
      mascotasAPI.obtener().catch(() => []),
      citasAPI.obtener().catch(() => []),
      serviciosAPI.obtener().catch(() => [])
    ])
    stats.value = {
      usuarios: usuarios.length || 0,
      mascotas: mascotas.length || 0,
      citas: citas.length || 0,
      servicios: servicios.length || 0
    }
    citasRecientes.value = [...citas]
      .sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))
      .slice(0, 5)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <AdminLayout title="Panel de Administración" subtitle="Resumen general de la actividad de PetCard">
    <div v-if="cargando" style="text-align:center;padding:3rem;color:#888;">Cargando panel...</div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.usuarios }}</div>
            <div class="stat-label">Usuarios registrados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5.5" cy="9" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19.5" cy="9" r="2"/><path d="M12 11c-3 0-6.5 2.3-6.5 5.6 0 1.9 1.6 3.1 3.4 3.1 1.2 0 2-0.6 3.1-0.6s1.9 0.6 3.1 0.6c1.8 0 3.4-1.2 3.4-3.1C18.5 13.3 15 11 12 11z"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.mascotas }}</div>
            <div class="stat-label">Mascotas activas</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.citas }}</div>
            <div class="stat-label">Citas totales</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.servicios }}</div>
            <div class="stat-label">Servicios activos</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Citas más recientes</div>
        <div v-if="citasRecientes.length === 0" class="empty-state">Aún no hay citas registradas.</div>
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in citasRecientes" :key="c.ID_cita">
                <td>{{ c.Nombre_mascota }}</td>
                <td>{{ c.Nombre_cliente }}</td>
                <td>{{ c.Nombre_servicio }}</td>
                <td>{{ String(c.Fecha).slice(0,10) }}</td>
                <td>{{ c.Hora }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </AdminLayout>
</template>