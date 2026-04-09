<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuarioLogueado: authUsuario, cerrarSesion, irALogin, irARegistro } = useAuth()

const usuarioActual = ref(null)
const enEdicion = ref(false)

const formData = reactive({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  emergencia: ''
})

const goToLogin = () => {
  router.push('/login-usuario')
}

const goToRegistro = () => {
  router.push('/registro-usuario')
}

const cargarUsuario = () => {
  try {
    const usuario = authUsuario?.value || JSON.parse(localStorage.getItem('petcard_usuario_actual') || 'null')
    if (usuario) {
      usuarioActual.value = usuario
      formData.nombre = usuario.Nombre || usuario.nombre || ''
      formData.apellido = usuario.Apellido || usuario.apellido || ''
      formData.email = usuario.Correo || usuario.email || ''
      formData.telefono = usuario.Telefono || usuario.telefono || ''
      formData.direccion = usuario.Direccion || usuario.direccion || ''
      formData.emergencia = usuario.Emergencia || usuario.emergencia || ''
    } else {
      usuarioActual.value = null
    }
  } catch (error) {
    console.error('Error cargando usuario:', error)
  }
}

const toggleEdicion = () => {
  if (enEdicion.value) {
    guardarCambios()
  }
  enEdicion.value = !enEdicion.value
}

const guardarCambios = () => {
  if (!usuarioActual.value) return

  if (!formData.nombre.trim() || !formData.email.trim()) {
    alert('⚠️ Nombre y email son obligatorios')
    return
  }

  if (!isValidEmail(formData.email)) {
    alert('⚠️ Email no válido')
    return
  }

  usuarioActual.value = {
    ...usuarioActual.value,
    nombre: formData.nombre,
    apellido: formData.apellido,
    email: formData.email,
    telefono: formData.telefono,
    direccion: formData.direccion,
    emergencia: formData.emergencia
  }

  // Actualizar usuario en lista
  const usuarios = JSON.parse(localStorage.getItem('petcard_usuarios') || '[]')
  const index = usuarios.findIndex(u => u.documento === usuarioActual.value.documento && u.tipoDocumento === usuarioActual.value.tipoDocumento)
  if (index !== -1) {
    usuarios[index] = usuarioActual.value
    localStorage.setItem('petcard_usuarios', JSON.stringify(usuarios))
  }

  // Guardar sesión
  localStorage.setItem('petcard_usuario_actual', JSON.stringify(usuarioActual.value))

  enEdicion.value = false
  alert('✅ Perfil actualizado correctamente')
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const irMascotas = () => router.push('/mis-mascotas')
const irCitas = () => router.push('/citas')
const irCarnet = () => router.push('/carnet')
const irNotificaciones = () => router.push('/notificaciones')

onMounted(() => {
  cargarUsuario()
})

watch(authUsuario, () => {
  cargarUsuario()
})
</script>

<template>

     <nav class="navbar">
    <router-link to="/perfil" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas">Citas</router-link></li>
      <li><router-link to="/alimentacion">Alimentación</router-link></li>
      <li><router-link to="/carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/perfil" class="active">Mi Perfil</router-link></li>
      <li><router-link to="/notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/mis-mascotas">Mis Mascotas</router-link></li>
    </ul>
    <div id="auth-section" class="auth-section">
      <template v-if="authUsuario">
        <span class="usuario-nombre">{{ authUsuario.Nombre }}</span>
        <button class="btn-auth btn-logout" @click="cerrarSesion">Cerrar sesión</button>
      </template>
      <template v-else>
        <button class="btn-auth" @click="irALogin">Iniciar sesión</button>
        <button class="btn-auth" @click="irARegistro">Registrarse</button>
      </template>
    </div>
  </nav>

  <div class="page-wrapper">

    <!-- Banner de perfil -->
    <div class="perfil-banner">
      <div class="perfil-avatar">
        <svg width="40" height="40" fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div class="perfil-info">
        <h2>{{ usuarioActual ? formData.nombre + ' ' + formData.apellido : 'Cargando...' }}</h2>
        <p>{{ usuarioActual ? 'Usuario de PetCard' : 'Por favor inicia sesión' }}</p>
      </div>
      <div class="perfil-banner-actions" v-if="usuarioActual">
        <button class="btn btn-outline-white btn-sm" @click="toggleEdicion">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          {{ enEdicion ? 'Guardar' : 'Editar' }}
        </button>
        <button class="btn btn-outline-white btn-sm" @click="cerrarSesion">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Cerrar Sesión
        </button>
      </div>
    </div>

    <div class="two-col">
      <!-- Panel izquierdo -->
      <div class="card">
        <div class="card-title">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Información Personal
        </div>
        <p style="font-size:.85rem; color:var(--muted); margin-bottom:1.25rem;">Gestiona tu información de contacto y datos personales</p>

        <div class="form-row">
          <div class="form-group">
            <label>Nombre</label>
            <input class="form-control" type="text" v-model="formData.nombre" :disabled="!enEdicion"/>
          </div>
          <div class="form-group">
            <label>Apellido</label>
            <input class="form-control" type="text" v-model="formData.apellido" :disabled="!enEdicion"/>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input class="form-control" type="email" v-model="formData.email" :disabled="!enEdicion"/>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input class="form-control" type="tel" v-model="formData.telefono" :disabled="!enEdicion"/>
          </div>
        </div>

        <div class="form-group">
          <label>Dirección</label>
          <input class="form-control" type="text" v-model="formData.direccion" :disabled="!enEdicion"/>
        </div>

        <div class="form-group">
          <label>Contacto de Emergencia</label>
          <input class="form-control" type="text" v-model="formData.emergencia" :disabled="!enEdicion"/>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">

        <!-- Acciones Rápidas -->
        <div class="card">
          <div class="card-title">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Acciones Rápidas
          </div>
          <div class="acciones-grid">
            <button class="accion-btn" @click="irMascotas">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              Gestionar Mascotas
            </button>
            <button class="accion-btn" @click="irCitas">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Programar Cita
            </button>
            <button class="accion-btn" @click="irCarnet">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Ver Carnet de Vacunas
            </button>
            <button class="accion-btn" @click="irNotificaciones">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              Configurar Recordatorios
            </button>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="card">
          <div class="card-title" style="font-size:.95rem;">Estadísticas</div>
          <div class="estadistica-row"><span>Mascotas registradas</span><strong>3</strong></div>
          <div class="estadistica-row"><span>Citas programadas</span><strong>2</strong></div>
          <div class="estadistica-row"><span>Vacunas al día</span><strong style="color:var(--green);">100%</strong></div>
          <div class="estadistica-row"><span>Recordatorios activos</span><strong style="color:var(--purple);">5</strong></div>
        </div>

      </div>
    </div>
  </div>

  <!-- FOOTER -->
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
   perfil.css — Pantalla de Perfil (Usuario)
   Requiere: shared.css
   ============================================================ */

/* ── BANNER PERFIL ── */
.perfil-banner {
  background: var(--purple);
  border-radius: var(--radius-lg);
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  color: #fff;
}

.perfil-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.perfil-info { flex: 1; }

.perfil-info h2 {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.2rem;
}

.perfil-info p { opacity: .85; font-size: .85rem; }

.perfil-banner-actions {
  display: flex;
  gap: .5rem;
}

/* ── ACCIONES RÁPIDAS ── */
.acciones-grid {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.accion-btn {
  display: flex;
  align-items: center;
  gap: .6rem;
  width: 100%;
  padding: .65rem .9rem;
  background: #f9fafb;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: .875rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: border-color .2s, background .2s;
}

.accion-btn svg { color: var(--purple); }
.accion-btn:hover { border-color: var(--purple); background: var(--purple-bg); }

/* ── ESTADÍSTICAS ── */
.estadistica-row {
  display: flex;
  justify-content: space-between;
  font-size: .875rem;
  padding: .5rem 0;
  border-bottom: 1px solid var(--border);
}

.estadistica-row:last-child { border-bottom: none; }
.estadistica-row span { color: var(--muted); }

/* ── INPUTS DISABLED ── */
.form-control:disabled {
  background: var(--bg-disabled, #f0f0f0);
  color: var(--muted);
  cursor: not-allowed;
  opacity: 0.7;
}

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