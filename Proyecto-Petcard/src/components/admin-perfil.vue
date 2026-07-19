<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { useAuth } from '../composables/useAuth'
import { usuariosAPI } from '../api'

const { usuarioLogueado } = useAuth()

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
    await usuariosAPI.actualizar(adminActual.value.ID_usuario, adminActual.value)
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
  <AdminLayout title="Mi Perfil" subtitle="Consulta y edita tu información de administrador">
    <div class="perfil-banner">
      <div class="perfil-avatar">
        <svg width="40" height="40" fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div style="flex:1;">
        <h2 style="color:white;margin:0;font-size:1.4rem;">{{ adminActual.Nombre }}</h2>
        <p style="color:rgba(255,255,255,.85);margin:.25rem 0 0;">Administrador — PetCard</p>
      </div>
      <button class="btn btn-outline-white btn-sm" @click="toggleEdicion" :disabled="guardando">
        {{ editando ? (guardando ? 'Guardando...' : '💾 Guardar') : '📝 Editar' }}
      </button>
    </div>

    <div class="card">
      <div class="card-title">Información Personal</div>
      <div class="perfil-grid">
        <div class="form-group">
          <label>Nombre completo</label>
          <input class="form-control" type="text" v-model="adminActual.Nombre" :disabled="!editando" />
        </div>
        <div class="form-group">
          <label>Correo electrónico</label>
          <input class="form-control" type="email" v-model="adminActual.Correo" :disabled="!editando" />
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input class="form-control" type="text" v-model="adminActual.Telefono" :disabled="!editando" />
        </div>
        <div class="form-group">
          <label>Estado</label>
          <div class="estado-activo">✅ Activo</div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.perfil-banner {
  background: linear-gradient(135deg, var(--purple), var(--purple-dark));
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.perfil-avatar {
  width: 72px; height: 72px;
  background: rgba(255,255,255,.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.perfil-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.estado-activo {
  padding: .55rem .85rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: .9rem; color: var(--green); font-weight: 700; background: var(--green-bg);
}
@media (max-width: 640px) {
  .perfil-grid { grid-template-columns: 1fr; }
  .perfil-banner { flex-direction: column; text-align: center; }
}
</style>