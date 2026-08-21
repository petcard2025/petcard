<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { usuariosAPI } from '../../api'

const usuarios = ref([])
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')
const filtroRol = ref('Todos')

const editando = ref(null)
const formEdit = ref({ Nombre: '', Rol: '' })

const mostrarModalEliminar = ref(false)
const usuarioAEliminar = ref(null)

async function cargarUsuarios() {
  cargando.value = true
  error.value = ''
  try {
    usuarios.value = await usuariosAPI.obtener()
  } catch (e) {
    error.value = e.message || 'No se pudo cargar la lista de usuarios'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarUsuarios)

const usuariosFiltrados = computed(() => {
  return usuarios.value.filter(u => {
    const texto = `${u.Nombre} ${u.Correo}`.toLowerCase()
    const coincideBusqueda = texto.includes(busqueda.value.toLowerCase())
    const coincideRol = filtroRol.value === 'Todos' || u.Rol === filtroRol.value
    return coincideBusqueda && coincideRol
  })
})

function badgeRol(rol) {
  if (rol === 'administrador') return 'badge badge-blue'
  if (rol === 'veterinario') return 'badge badge-green'
  return 'badge badge-gray'
}

const abrirEdicion = (usuario) => {
  editando.value = usuario.ID_usuario
  formEdit.value = { Nombre: usuario.Nombre, Rol: usuario.Rol }
}

const cancelarEdicion = () => { editando.value = null }

const guardarEdicion = async (id) => {
  try {
    await usuariosAPI.actualizar(id, formEdit.value)
    editando.value = null
    await cargarUsuarios()
  } catch (e) {
    error.value = e.message
  }
}

function confirmarEliminar(u) {
  usuarioAEliminar.value = u
  mostrarModalEliminar.value = true
}

async function eliminarUsuario() {
  try {
    await usuariosAPI.eliminar(usuarioAEliminar.value.ID_usuario)
    mostrarModalEliminar.value = false
    await cargarUsuarios()
  } catch (e) {
    alert('Error al eliminar el usuario: ' + e.message)
  }
}
</script>

<template>
  <AdminLayout title="Gestión de Usuarios" subtitle="Consulta y administra el nombre y rol de todos los usuarios">
    <div v-if="error" class="alert alert-danger"><span>{{ error }}</span></div>

    <div class="search-filter">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar por nombre o correo..." v-model="busqueda" />
      </div>
      <select class="filter-select" v-model="filtroRol">
        <option>Todos</option>
        <option value="administrador">administrador</option>
        <option value="veterinario">veterinario</option>
        <option value="cliente">cliente</option>
      </select>
    </div>

    <div v-if="cargando" style="text-align:center;padding:2rem;color:#888;">Cargando usuarios...</div>

    <div v-else class="card" style="padding:0;overflow:hidden;">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuariosFiltrados" :key="u.ID_usuario">
              <td>{{ u.ID_usuario }}</td>
              <td>
                <input v-if="editando === u.ID_usuario" v-model="formEdit.Nombre" class="form-control" style="max-width:200px;" />
                <template v-else>{{ u.Nombre }}</template>
              </td>
              <td>{{ u.Correo }}</td>
              <td>
                <select v-if="editando === u.ID_usuario" v-model="formEdit.Rol" class="form-control" style="max-width:170px;">
                  <option value="administrador">administrador</option>
                  <option value="veterinario">veterinario</option>
                  <option value="cliente">cliente</option>
                </select>
                <span v-else :class="badgeRol(u.Rol)">{{ u.Rol }}</span>
              </td>
              <td>
                <template v-if="editando === u.ID_usuario">
                  <button class="btn btn-primary btn-sm" @click="guardarEdicion(u.ID_usuario)">Guardar</button>
                  <button class="btn btn-secondary btn-sm" @click="cancelarEdicion">Cancelar</button>
                </template>
                <template v-else>
                  <button class="btn btn-secondary btn-sm" @click="abrirEdicion(u)">Editar</button>
                  <button class="btn btn-danger btn-sm" @click="confirmarEliminar(u)">Eliminar</button>
                </template>
              </td>
            </tr>
            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="5" class="empty-state">No se encontraron usuarios.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
      <div class="modal">
        <h3>¿Eliminar usuario?</h3>
        <p>¿Deseas eliminar a <strong>{{ usuarioAEliminar?.Nombre }}</strong>? Esta acción no se puede deshacer.</p>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="mostrarModalEliminar = false">Cancelar</button>
          <button class="btn btn-danger btn-sm" @click="eliminarUsuario">Eliminar</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
td { white-space: nowrap; }
td:nth-child(5) { display: flex; gap: .4rem; }
</style>