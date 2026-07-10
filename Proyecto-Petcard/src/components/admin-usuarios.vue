<script setup>
import { ref, onMounted } from 'vue'
import { API_URL } from '../api'

const usuarios = ref([])
const cargando = ref(true)
const error = ref('')
const editando = ref(null)
const formEdit = ref({ Nombre: '', Rol: '' })

const token = () => localStorage.getItem('petcard_token')

const cargarUsuarios = async () => {
  cargando.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    if (!res.ok) throw new Error('No se pudo cargar la lista de usuarios')
    usuarios.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

const abrirEdicion = (usuario) => {
  editando.value = usuario.ID_usuario
  formEdit.value = { Nombre: usuario.Nombre, Rol: usuario.Rol }
}

const cancelarEdicion = () => {
  editando.value = null
}

const guardarEdicion = async (id) => {
  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify(formEdit.value)
    })
    if (!res.ok) throw new Error('No se pudo actualizar el usuario')
    editando.value = null
    await cargarUsuarios()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(cargarUsuarios)
</script>

<template>
  <div class="container" style="padding: 2rem 1rem;">
    <h1>Gestión de Usuarios</h1>
    <p class="auth-sub">Aquí puedes ver todos los usuarios registrados y editar su nombre o rol. No es posible ver ni modificar correos, teléfonos ni contraseñas.</p>

    <div v-if="error" class="error-msg">{{ error }}</div>
    <div v-if="cargando">Cargando usuarios...</div>

    <table v-else class="table" style="width:100%; border-collapse: collapse; margin-top: 1rem;">
      <thead>
        <tr style="text-align:left; border-bottom: 2px solid #eee;">
          <th style="padding: .6rem;">ID</th>
          <th style="padding: .6rem;">Nombre</th>
          <th style="padding: .6rem;">Rol</th>
          <th style="padding: .6rem;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in usuarios" :key="u.ID_usuario" style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: .6rem;">{{ u.ID_usuario }}</td>

          <td style="padding: .6rem;">
            <template v-if="editando === u.ID_usuario">
              <input v-model="formEdit.Nombre" class="form-control" />
            </template>
            <template v-else>{{ u.Nombre }}</template>
          </td>

          <td style="padding: .6rem;">
            <template v-if="editando === u.ID_usuario">
              <select v-model="formEdit.Rol" class="form-control">
                <option value="administrador">administrador</option>
                <option value="veterinario">veterinario</option>
                <option value="cliente">cliente</option>
              </select>
            </template>
            <template v-else>{{ u.Rol }}</template>
          </td>

          <td style="padding: .6rem;">
            <template v-if="editando === u.ID_usuario">
              <button class="btn btn-primary btn-sm" @click="guardarEdicion(u.ID_usuario)">Guardar</button>
              <button class="btn btn-outline-white btn-sm" @click="cancelarEdicion">Cancelar</button>
            </template>
            <template v-else>
              <button class="btn btn-outline-white btn-sm" @click="abrirEdicion(u)">Editar</button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>