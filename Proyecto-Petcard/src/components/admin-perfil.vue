<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion } = useAuth()

// ===== GUARD DE SEGURIDAD =====
onMounted(() => {
  const token = localStorage.getItem('petcard_token')
  const usuarioStr = localStorage.getItem('petcard_usuario_actual')
  let usuario = null
  try { usuario = usuarioStr ? JSON.parse(usuarioStr) : null } catch {}
  if (!token && !usuario) {
    router.push('/login-admin')
    return
  }
  const rol = usuario?.Rol
  if (rol !== 'Admin') {
    router.push('/inicio')
  }
})
const API = 'http://localhost:3001/api/usuarios'

const editando = ref(false)
const guardando = ref(false)
const adminActual = ref({ Nombre: '', Correo: '', Telefono: '' })

onMounted(() => {
  if (usuarioLogueado.value) {
    adminActual.value = {
      ID_usuario: usuarioLogueado.value.ID_usuario,
      Nombre: usuarioLogueado.value.Nombre || '',
      Correo: usuarioLogueado.value.Correo || '',
      Telefono: usuarioLogueado.value.Telefono || ''
    }
  }
})

async function guardarPerfil() {
  guardando.value = true
  try {
    const res = await fetch(`${API}/${adminActual.value.ID_usuario}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminActual.value)
    })
    if (!res.ok) throw new Error()
    editando.value = false
    alert('Perfil actualizado correctamente.')
  } catch {
    alert('Error al guardar el perfil.')
  } finally {
    guardando.value = false
  }
}

function toggleEdicion() {
  if (editando.value) guardarPerfil()
  else editando.value = true
}
</script>

<template>
  <nav class="navbar">
    <router-link to="/admin-inicio" class="nav-logo">
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
      <span style="color:white;margin-right:1rem;font-weight:500;">{{ isAuthenticated ? usuarioLogueado?.Nombre : 'Admin' }}</span>
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="perfil-banner" style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;padding:2rem;display:flex;align-items:center;gap:1.5rem;margin-bottom:2rem;">
      <div style="width:72px;height:72px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <svg width="40" height="40" fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div style="flex:1;">
        <h2 style="color:white;margin:0;font-size:1.5rem;">{{ adminActual.Nombre }}</h2>
        <p style="color:rgba(255,255,255,.8);margin:.25rem 0 0;">Administrador — PetCard</p>
      </div>
      <div style="display:flex;gap:.5rem;">
        <button class="btn btn-outline-white btn-sm" @click="toggleEdicion" :disabled="guardando">
          {{ editando ? (guardando ? 'Guardando...' : '💾 Guardar') : '📝 Editar' }}
        </button>
      </div>
    </div>

    <div class="card" style="padding:1.5rem;border-radius:12px;background:white;box-shadow:0 2px 8px rgba(0,0,0,.08);">
      <div class="card-title" style="font-size:1.1rem;font-weight:700;margin-bottom:1.25rem;">Información Personal</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div>
          <label style="font-weight:600;font-size:.85rem;color:#555;display:block;margin-bottom:.35rem;">Nombre completo</label>
          <input class="form-control" type="text" v-model="adminActual.Nombre" :disabled="!editando"
            style="width:100%;padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;box-sizing:border-box;background:var(--bg,#fff);" />
        </div>
        <div>
          <label style="font-weight:600;font-size:.85rem;color:#555;display:block;margin-bottom:.35rem;">Correo electrónico</label>
          <input class="form-control" type="email" v-model="adminActual.Correo" :disabled="!editando"
            style="width:100%;padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-weight:600;font-size:.85rem;color:#555;display:block;margin-bottom:.35rem;">Teléfono</label>
          <input class="form-control" type="text" v-model="adminActual.Telefono" :disabled="!editando"
            style="width:100%;padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-weight:600;font-size:.85rem;color:#555;display:block;margin-bottom:.35rem;">Estado</label>
          <div style="padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;color:green;font-weight:600;">✅ Activo</div>
        </div>
      </div>
    </div>

    <footer class="footer" style="margin-top:2rem;">
      <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
    </footer>
  </div>
</template>