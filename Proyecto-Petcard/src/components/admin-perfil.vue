<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()

// --- ESTADO (Variables reactivas) ---
const adminActual = ref({
  nombre: 'Administrador',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  id: 'admin_001'
})

const editando = ref(false)
const ADMIN_SESION_KEY = 'petcard_admin_sesion'

// --- LÓGICA ---
onMounted(() => {
  const sesion = localStorage.getItem(ADMIN_SESION_KEY)
  if (sesion) {
    adminActual.value = JSON.parse(sesion)
  } else {
    // Si no hay sesión, podrías redirigir: router.push('/login-admin')
    console.log("No hay sesión activa")
  }
})

const toggleEdicion = () => {
  if (editando.value) {
    // Guardar cambios
    localStorage.setItem(ADMIN_SESION_KEY, JSON.stringify(adminActual.value))
    alert('✅ Perfil actualizado correctamente')
  }
  editando.value = !editando.value
}

const cerrarSesion = () => {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    localStorage.removeItem(ADMIN_SESION_KEY)
    router.push('/') // O a tu página de login
  }
}
</script>

<template>
  <nav class="navbar">
    <router-link to="/admin" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/admin-alimentacion">Alimentación</router-link></li>
      <li><router-link to="/admin-carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/admin-notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/admin-servicios">Servicios</router-link></li>
      <li><router-link to="/admin-citas">Citas</router-link></li>
    </ul>
    <div class="nav-actions">
      <span style="color: white; margin-right: 1rem; font-weight: 500;">{{ adminActual.nombre }}</span>
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="perfil-banner">
      <div class="perfil-avatar">
        <svg width="40" height="40" fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div class="perfil-info">
        <h2>{{ adminActual.nombre }} {{ adminActual.apellido }}</h2>
        <p>Rol: Administrador de PetCard</p>
      </div>
      <div class="perfil-banner-actions">
        <button class="btn btn-outline-white btn-sm" @click="toggleEdicion">
          {{ editando ? '💾 Guardar' : '📝 Editar' }}
        </button>
        <button class="btn btn-outline-white btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-title">Información Personal</div>
        <div class="form-row">
          <div class="form-group">
            <label>Nombre</label>
            <input class="form-control" type="text" v-model="adminActual.nombre" :disabled="!editando"/>
          </div>
          <div class="form-group">
            <label>Apellido</label>
            <input class="form-control" type="text" v-model="adminActual.apellido" :disabled="!editando"/>
          </div>
        </div>
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input class="form-control" type="email" v-model="adminActual.email" :disabled="!editando"/>
        </div>
        <div class="form-group">
          <label>Dirección</label>
          <input class="form-control" type="text" v-model="adminActual.direccion" :disabled="!editando"/>
        </div>
      </div>

      <div class="sidebar">
        <div class="card">
          <div class="card-title">Estado del Sistema</div>
          <p>ID: <strong>{{ adminActual.id }}</strong></p>
          <p>Estado: <strong style="color: green;">Activo</strong></p>
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
    </footer>
  </div>
</template>

<style scoped>
/* Tu CSS aquí */
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.perfil-banner { background: #34495e; color: white; padding: 2rem; border-radius: 12px; display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem; }
.two-col { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 1rem; }
.form-control { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
.form-control:disabled { background: #f9f9f9; }
</style>