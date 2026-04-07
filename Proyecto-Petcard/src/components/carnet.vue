<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { mascotasAPI, clientesAPI, vacunasAPI } from '../api.js'

const router = useRouter()
const { usuarioLogueado, cerrarSesion, irALogin, irARegistro } = useAuth()

const pets = ref([])
const selectedId = ref(null)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const clienteActual = ref(null)
const vacunas = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const formData = ref({
  Nombre: '',
  Especie: '',
  Raza: '',
  Sexo: 'Macho',
  Fecha_nacimiento: '',
  Peso: '',
  Foto: ''
})

const selectedPet = computed(() => {
  const pet = pets.value.find(p => p.ID_mascota === selectedId.value)
  return pet ? { ...pet, vacunas: vacunas.value } : null
})

const aplicadas = computed(() => vacunas.value.filter(v => v.Estado === 'Completo' || v.Estado === 'aplicada').length)
const pendientes = computed(() => vacunas.value.length - aplicadas.value)
const pct = computed(() => Math.round((aplicadas.value / (vacunas.value.length || 1)) * 100))
const proximas = computed(() => vacunas.value.filter(v => v.Estado !== 'Completo' && v.Estado !== 'aplicada').slice(0, 2))

function estadoColor(estado) {
  return estado === 'Completo' || estado === 'aplicada' ? 'var(--green)' : estado === 'Atrasada' || estado === 'atrasada' ? 'var(--red)' : 'var(--yellow)'
}
function estadoIcono(estado) {
  return estado === 'Completo' || estado === 'aplicada' ? '✓' : estado === 'Atrasada' || estado === 'atrasada' ? '✖' : '⚠'
}
function badgeClass(estado) {
  return estado === 'Atrasada' || estado === 'atrasada' ? 'badge badge-red' : 'badge badge-yellow'
}
function badgeLabel(estado) {
  return estado === 'Atrasada' || estado === 'atrasada' ? 'Atrasada' : estado === 'Proxima' || estado === 'proxima' ? 'Próxima Dosis' : 'Pendiente'
}

function obtenerFechaTexto(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

function especieRaza(tipo = '') {
  const parts = tipo.split('•')
  return { especie: parts[0]?.trim() || '', raza: parts[1]?.trim() || '' }
}

async function cargarCliente() {
  if (!usuarioLogueado.value) return
  try {
    const clientes = await clientesAPI.obtener()
    clienteActual.value = clientes.find(c => c.ID_usuario === usuarioLogueado.value.ID_usuario) || null
  } catch (error) {
    console.error('Error al cargar cliente:', error)
    errorMessage.value = 'No se pudo cargar la información del cliente.'
  }
}

async function cargarMascotas() {
  if (!clienteActual.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const mascotas = await mascotasAPI.obtenerPorCliente(clienteActual.value.ID_cliente)
    pets.value = mascotas
    selectedId.value = mascotas[0]?.ID_mascota || null
    if (selectedId.value) {
      await cargarVacunas(selectedId.value)
    }
  } catch (error) {
    console.error('Error al cargar mascotas:', error)
    errorMessage.value = 'Error al cargar mascotas: ' + error.message
  } finally {
    isLoading.value = false
  }
}

async function cargarVacunas(idMascota) {
  if (!idMascota) return
  try {
    vacunas.value = await vacunasAPI.obtenerPorMascota(idMascota)
  } catch (error) {
    console.error('Error al cargar vacunas:', error)
    vacunas.value = []
  }
}

watch(selectedId, async (nuevoId) => {
  if (nuevoId) {
    await cargarVacunas(nuevoId)
  }
})

function abrirModal() {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    Nombre: '',
    Especie: '',
    Raza: '',
    Sexo: 'Macho',
    Fecha_nacimiento: '',
    Peso: '',
    Foto: ''
  }
  showModal.value = true
}

function cerrarModal() {
  showModal.value = false
}

async function guardarMascota() {
  if (!formData.value.Nombre.trim()) {
    alert('Nombre de mascota requerido')
    return
  }
  if (!clienteActual.value) {
    alert('No se encontró al cliente actual')
    return
  }
  try {
    const datos = {
      ID_cliente: clienteActual.value.ID_cliente,
      Nombre: formData.value.Nombre.trim(),
      Especie: formData.value.Especie,
      Sexo: formData.value.Sexo,
      Fecha_nacimiento: formData.value.Fecha_nacimiento,
      Peso: formData.value.Peso,
      Foto: formData.value.Foto,
      Raza: formData.value.Raza
    }
    if (isEditing.value && editingId.value) {
      await mascotasAPI.actualizar(editingId.value, datos)
    } else {
      await mascotasAPI.crear(datos)
    }
    showModal.value = false
    await cargarMascotas()
  } catch (error) {
    console.error('Error guardando mascota:', error)
    alert('Error al guardar mascota: ' + error.message)
  }
}

function openEditPet(pet) {
  isEditing.value = true
  editingId.value = pet.ID_mascota
  formData.value = {
    Nombre: pet.Nombre || '',
    Especie: pet.Especie || '',
    Raza: pet.Raza || '',
    Sexo: pet.Sexo || 'Macho',
    Fecha_nacimiento: pet.Fecha_nacimiento || '',
    Peso: pet.Peso || '',
    Foto: pet.Foto || ''
  }
  showModal.value = true
}

async function eliminarMascota(id) {
  if (!confirm('¿Eliminar esta mascota?')) return
  try {
    await mascotasAPI.eliminar(id)
    await cargarMascotas()
  } catch (error) {
    console.error('Error eliminando mascota:', error)
    alert('Error al eliminar mascota: ' + error.message)
  }
}

function imprimir() {
  window.print()
}

function abrirVacunas(pet) {
  selectedId.value = pet.ID_mascota
  router.push({ path: '/citas', query: { mascota: pet.ID_mascota } })
}

onMounted(async () => {
  await cargarCliente()
  await cargarMascotas()
})
</script>

<template>
  <nav class="navbar">
    <router-link to="/carnet" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/>
        <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/>
      </svg>
      PETCARD
    </router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas">Citas</router-link></li>
      <li><router-link to="/alimentacion">Alimentación</router-link></li>
      <li><router-link to="/carnet" class="active">Carnet de Vacunas</router-link></li>
      <li><router-link to="/perfil">Mi Perfil</router-link></li>
      <li><router-link to="/notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/mis-mascotas">Mis Mascotas</router-link></li>
    </ul>
    <div class="auth-section">
      <template v-if="usuarioLogueado">
        <span class="usuario-nombre">{{ usuarioLogueado.Nombre }}</span>
        <button class="btn-auth btn-logout" @click="cerrarSesion">Cerrar sesión</button>
      </template>
      <template v-else>
        <button class="btn-auth" @click="irALogin">Iniciar sesión</button>
        <button class="btn-auth" @click="irARegistro">Registrarse</button>
      </template>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="two-col">
      <div>
        <div class="card" style="margin-bottom:1.25rem;">
          <div class="card-title" style="color:var(--purple);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            Seleccionar Mascota
            <button class="btn btn-success btn-sm" style="margin-left:auto;" @click="abrirModal">
              + Agregar Mascota
            </button>
          </div>
          <p style="font-size:.85rem; color:var(--muted); margin-bottom:.75rem;">
            Elige tu mascota para ver el carnet de vacunas
          </p>
          <select class="form-control" v-model="selectedId" style="max-width:220px;">
            <option v-for="pet in pets" :key="pet.ID_mascota" :value="pet.ID_mascota">
              {{ pet.Nombre }} – {{ pet.Especie }}
            </option>
          </select>
        </div>

        <div class="card">
          <div class="vacuna-header">
            <div class="card-title" style="margin-bottom:0; color:#fff;">Carnet de Vacunación</div>
            <div class="vet-info">
              <div>Veterinario: <strong>Dr. José García</strong></div>
              <div>Matrícula: <strong>47789</strong></div>
            </div>
          </div>
          <div class="table-wrapper" style="margin-top:1rem;">
            <table>
              <thead>
                <tr>
                  <th>Estado</th><th>Vacuna</th><th>Fecha Programada</th>
                  <th>Fecha Aplicada</th><th>Lote</th><th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in vacunas" :key="v.ID_carnetVacunas">
                  <td><span class="status-icon" :style="{ color: estadoColor(v.Estado) }">{{ estadoIcono(v.Estado) }}</span></td>
                  <td class="vacuna-nombre" style="color:var(--purple);">{{ v.Nombre_vacuna }}</td>
                  <td>{{ obtenerFechaTexto(v.Proxima_dosis) }}</td>
                  <td>{{ obtenerFechaTexto(v.Fecha_aplicacion) }}</td>
                  <td>{{ v.Lote }}</td>
                  <td>{{ v.Observaciones }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="obs-medicas">
            <h4>Observaciones Médicas:</h4>
            <ul>
              <li v-for="v in vacunas" :key="v.ID_carnetVacunas">{{ v.Nombre_vacuna }}: {{ v.Observaciones }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="card">
          <div class="card-title">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Estado de Vacunación
          </div>
          <div class="pct-display">
            <div class="pct-number">{{ pct }}%</div>
            <div class="pct-label">Carnet de Vacunación</div>
          </div>
          <div class="progress-bar" style="margin-bottom:1rem;">
            <div class="progress-fill yellow" :style="{ width: pct + '%' }"></div>
          </div>
          <div class="vac-stats">
            <div class="vac-stat-row"><span>Aplicadas:</span><strong>{{ aplicadas }}</strong></div>
            <div class="vac-stat-row"><span>Pendientes o demorar:</span><strong>{{ pendientes }}</strong></div>
            <div class="vac-stat-row"><span>Próximas:</span><strong>{{ proximas.length }}</strong></div>
          </div>
        </div>

        <div class="card">
          <div class="card-title" style="color:var(--orange);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Próximas Vacunas
          </div>
          <div class="proxima-vac" v-for="v in proximas" :key="v.ID_carnetVacunas">
            <div class="proxima-vac-header">
              <span class="vacuna-nombre2">{{ v.Nombre_vacuna }}</span>
              <span :class="badgeClass(v.Estado)">{{ badgeLabel(v.Estado) }}</span>
            </div>
            <div style="font-size:.78rem; color:var(--muted);">Próxima: {{ obtenerFechaTexto(v.Proxima_dosis) }}</div>
          </div>
          <p v-if="proximas.length === 0" style="font-size:.85rem; color:var(--muted); margin-top:.5rem;">Sin vacunas pendientes.</p>
          <button class="btn btn-success btn-full" style="margin-top:.75rem;" @click="router.push('/citas')">Agendar Vacunación</button>
        </div>

        <div class="card">
          <div class="card-title" style="color:var(--green);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Información del Carnet
          </div>
          <div class="info-row"><span>Mascota:</span><strong>{{ selectedPet?.Nombre }}</strong></div>
          <div class="info-row"><span>Especie:</span><strong>{{ selectedPet?.Especie }}</strong></div>
          <div class="info-row"><span>Raza:</span><strong>{{ selectedPet?.Raza }}</strong></div>
          <div class="info-row"><span>ID:</span><strong>{{ selectedPet?.ID_mascota }}</strong></div>
          <div class="info-row"><span>Fecha de nacimiento:</span><strong>{{ selectedPet?.Fecha_nacimiento }}</strong></div>
          <div class="info-row"><span>Próxima cita:</span><strong>{{ proximas[0]?.fechaProgramada || '—' }}</strong></div>
          <div style="display:flex; gap:.5rem; margin-top:1rem;">
            <button class="btn btn-secondary btn-sm" style="flex:1;" @click="imprimir">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Descargar PDF
            </button>
            <button class="btn btn-primary btn-sm" style="flex:1;" @click="imprimir">Imprimir Carnet</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL AGREGAR MASCOTA -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-box">
        <div class="modal-header">
          <span style="font-weight:700; font-size:1rem; color:var(--purple);">🐾 Nueva Mascota</span>
          <button class="modal-close" @click="cerrarModal">✕</button>
        </div>
        <div class="modal-body">
          <label class="modal-label">Nombre <span style="color:var(--red)">*</span></label>
          <input class="form-control" v-model="nuevaMascota.nombre" placeholder="Ej: Max" style="margin-bottom:.85rem;" />
          <label class="modal-label">Especie</label>
          <select class="form-control" v-model="nuevaMascota.especie" style="margin-bottom:.85rem;">
            <option value="">Seleccionar...</option>
            <option>Canino</option>
            <option>Felino</option>
            <option>Ave</option>
            <option>Reptil</option>
            <option>Otro</option>
          </select>
          <label class="modal-label">Raza</label>
          <input class="form-control" v-model="nuevaMascota.raza" placeholder="Ej: Golden Retriever" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-success btn-sm" @click="guardarMascota"
            :disabled="!nuevaMascota.nombre.trim()"
            :style="{ opacity: nuevaMascota.nombre.trim() ? 1 : 0.5 }">
            Guardar
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <footer class="footer" style="margin-top:2rem;">
    <div class="footer-grid">
      <div class="footer-brand">
        <span class="nav-logo" style="color:#fff; margin-bottom:.5rem; display:flex;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
            <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/>
          </svg>PetCard
        </span>
        <p>Comprometidos con brindar toda la atención profesional que tu mascota merece.</p>
      </div>
      <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consultas Generales</a></li><li><a href="#">Vacunación</a></li><li><a href="#">Cirugías</a></li><li><a href="#">Emergencias</a></li></ul></div>
      <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p><p>info@petcard.com</p><p>Calle Principal 123, Ciudad</p></div>
      <div class="footer-col"><h4>Horarios</h4><p>Lunes - Viernes: 8:00 AM - 7:00 PM</p><p>Sábados: 9:00 AM - 6:00 PM</p><p>Domingos: 10:00 AM - 4:00 PM</p><p class="footer-emergency">Emergencias 24/7</p></div>
    </div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>
</template>

<style scoped>
.vacuna-header { background:var(--green); color:#fff; padding:.85rem 1rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center; }
.vet-info { text-align:right; font-size:.78rem; opacity:.9; }
.vet-info strong { display:block; font-size:.85rem; }
.vacuna-nombre { font-weight:700; }
.obs-medicas { background:#f9fafb; border-radius:var(--radius-sm); padding:1rem; margin-top:1rem; font-size:.83rem; }
.obs-medicas h4 { font-family:'Nunito',sans-serif; font-weight:800; margin-bottom:.5rem; font-size:.9rem; }
.obs-medicas ul { list-style:disc; padding-left:1.25rem; display:flex; flex-direction:column; gap:.25rem; color:var(--text-secondary); }
.pct-display { text-align:center; margin-bottom:.5rem; }
.pct-number { font-family:'Nunito',sans-serif; font-weight:900; font-size:2.5rem; color:var(--text); }
.pct-label { font-size:.82rem; color:var(--muted); margin-bottom:.5rem; }
.vac-stats { margin-top:.5rem; }
.vac-stat-row { display:flex; justify-content:space-between; font-size:.875rem; padding:.35rem 0; border-bottom:1px solid var(--border); }
.vac-stat-row:last-child { border-bottom:none; }
.vac-stat-row span { color:var(--muted); }
.proxima-vac { padding:.65rem 0; border-bottom:1px solid var(--border); }
.proxima-vac:last-of-type { border-bottom:none; }
.proxima-vac-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.2rem; }
.vacuna-nombre2 { font-weight:700; font-size:.875rem; }
.info-row { display:flex; justify-content:space-between; font-size:.875rem; padding:.4rem 0; border-bottom:1px solid var(--border); }
.info-row:last-of-type { border-bottom:none; }
.info-row span { color:var(--muted); }

/* Modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:1000; }
.modal-box { background:#fff; border-radius:12px; width:100%; max-width:380px; padding:1.5rem; box-shadow:0 8px 32px rgba(0,0,0,.18); }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
.modal-close { background:none; border:none; cursor:pointer; font-size:1rem; color:var(--muted); line-height:1; }
.modal-body { display:flex; flex-direction:column; }
.modal-label { font-size:.82rem; font-weight:600; color:var(--text-secondary,#555); margin-bottom:.3rem; }
.modal-footer { display:flex; justify-content:flex-end; gap:.5rem; margin-top:1.25rem; }

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
