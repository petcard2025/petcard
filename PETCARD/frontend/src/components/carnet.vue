<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { mascotasAPI, clientesAPI, vacunasAPI } from '../api.js'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion, irALogin, irARegistro } = useAuth()

const pets = ref([])
const selectedId = ref(null)
const showModal = ref(false)
const clienteActual = ref(null)
const vacunas = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

// Formulario para agregar vacuna
const vacForm = reactive({
  Nombre_vacuna: '',
  Fecha_aplicacion: '',
  Proxima_dosis: '',
  Lote: '',
  Observaciones: '',
  Estado: 'Completo'
})

function resetVacForm() {
  Object.assign(vacForm, {
    Nombre_vacuna: '',
    Fecha_aplicacion: '',
    Proxima_dosis: '',
    Lote: '',
    Observaciones: '',
    Estado: 'Completo'
  })
}

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
  if (!fecha) return '—'
  // Extraer solo la parte de la fecha YYYY-MM-DD para evitar desfase de zona horaria
  const soloFecha = String(fecha).split('T')[0]
  const [anio, mes, dia] = soloFecha.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function obtenerFechaNacimiento(fecha) {
  if (!fecha) return '—'
  const soloFecha = String(fecha).split('T')[0]
  const [anio, mes, dia] = soloFecha.split('-').map(Number)
  const d = new Date(anio, mes - 1, dia)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

function especieRaza(tipo = '') {
  const parts = tipo.split('•')
  return { especie: parts[0]?.trim() || '', raza: parts[1]?.trim() || '' }
}

async function cargarCliente() {
  if (!usuarioLogueado.value) return
  try {
    const clientes = await clientesAPI.obtenerPorUsuario(usuarioLogueado.value.ID_usuario)
    clienteActual.value = clientes[0] || null
  } catch (error) {
    console.error('Error al cargar cliente:', error)
    errorMessage.value = 'No se pudo cargar la información del cliente.'
    clienteActual.value = null
  }
}

async function crearClienteSiNoExiste() {
  if (!usuarioLogueado.value) return null
  if (clienteActual.value) return clienteActual.value

  try {
    const cliente = await clientesAPI.crear({ ID_usuario: usuarioLogueado.value.ID_usuario, Direccion: '' })
    clienteActual.value = cliente
    return cliente
  } catch (error) {
    console.error('Error creando cliente:', error)
    errorMessage.value = 'No se pudo crear el cliente asociado.'
    return null
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
  resetVacForm()
  showModal.value = true
}

function cerrarModal() {
  showModal.value = false
}

async function guardarVacuna() {
  if (!vacForm.Nombre_vacuna.trim()) {
    alert('El nombre de la vacuna es requerido')
    return
  }
  if (!selectedId.value) {
    alert('Selecciona una mascota primero')
    return
  }
  try {
    await vacunasAPI.crear({
      ID_mascota: selectedId.value,
      ID_servicio: 2,
      Nombre_vacuna: vacForm.Nombre_vacuna.trim(),
      Fecha_aplicacion: vacForm.Fecha_aplicacion || null,
      Proxima_dosis: vacForm.Proxima_dosis || null,
      Lote: vacForm.Lote,
      Observaciones: vacForm.Observaciones,
      Estado: vacForm.Estado
    })
    showModal.value = false
    await cargarVacunas(selectedId.value)
  } catch (error) {
    console.error('Error guardando vacuna:', error)
    alert('Error al guardar vacuna: ' + error.message)
  }
}

function imprimir() {
  window.print()
}

function abrirVacunas(pet) {
  selectedId.value = pet.ID_mascota
  router.push({ path: '/citas', query: { mascota: pet.ID_mascota } })
}

// ===== GUARD DE SEGURIDAD =====
onMounted(() => {
  const token = localStorage.getItem('petcard_token')
  const usuarioStr = localStorage.getItem('petcard_usuario_actual')
  let usuario = null
  try { usuario = usuarioStr ? JSON.parse(usuarioStr) : null } catch {}
  if (!token && !usuario) {
    router.push('/login-usuario')
    return
  }
  const rol = usuario?.Rol
  if (rol === 'Admin') {
    router.push('/admin-inicio')
  }
})

onMounted(async () => {
  await cargarCliente()
  if (!clienteActual.value) {
    await crearClienteSiNoExiste()
  }
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
      <template v-if="isAuthenticated">
        <span class="usuario-nombre">{{ usuarioLogueado?.Nombre }}</span>
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
              💉 Agregar Vacuna
            </button>
          </div>
          <p style="font-size:.85rem; color:var(--muted); margin-bottom:.75rem;">
            Elige tu mascota para ver el carnet de vacunas
          </p>
          <select class="form-control" v-model="selectedId" style="max-width:220px;">
            <option disabled value="">{{ pets.length ? 'Elige una mascota' : 'No hay mascotas registradas' }}</option>
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
          <div class="info-row"><span>Mascota:</span><strong>{{ selectedPet ? selectedPet.Nombre : '—' }}</strong></div>
          <div class="info-row"><span>Especie:</span><strong>{{ selectedPet ? selectedPet.Especie : '—' }}</strong></div>
          <div class="info-row"><span>Raza:</span><strong>{{ selectedPet ? selectedPet.Raza : '—' }}</strong></div>
          <div class="info-row"><span>ID:</span><strong>{{ selectedPet ? selectedPet.ID_mascota : '—' }}</strong></div>
          <div class="info-row"><span>Fecha de nacimiento:</span><strong>{{ obtenerFechaNacimiento(selectedPet?.Fecha_nacimiento) }}</strong></div>
          <div class="info-row"><span>Próxima cita:</span><strong>{{ proximas.length ? obtenerFechaTexto(proximas[0].Proxima_dosis) : '—' }}</strong></div>
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

  <!-- MODAL AGREGAR VACUNA -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="vac-modal">

        <!-- Header -->
        <div class="vac-modal-header">
          <div class="vac-modal-icon">💉</div>
          <div>
            <div class="vac-modal-title">Agregar Vacuna</div>
            <div class="vac-modal-sub">Registra una nueva vacuna para <strong>{{ selectedPet?.Nombre || 'tu mascota' }}</strong></div>
          </div>
          <button class="vac-modal-close" @click="cerrarModal">✕</button>
        </div>

        <!-- Body -->
        <div class="vac-modal-body">

          <!-- Nombre vacuna -->
          <div class="vac-field">
            <label class="vac-label">Nombre de la vacuna <span class="vac-required">*</span></label>
            <div class="vac-input-wrap">
              <input
                class="vac-input"
                list="vacunas-list-modal"
                v-model="vacForm.Nombre_vacuna"
                placeholder="Ej: Antirrábica, Parvovirus..."
                autocomplete="off"
              />
              <datalist id="vacunas-list-modal">
                <option value="Antirrábica" />
                <option value="Triple Felina" />
                <option value="Parvovirus" />
                <option value="Moquillo" />
                <option value="Leptospirosis" />
                <option value="Bordetella" />
                <option value="Rabia" />
                <option value="Leucemia Felina" />
                <option value="Panleucopenia" />
                <option value="Calicivirus" />
                <option value="Rinotraqueitis" />
                <option value="Hepatitis Infecciosa" />
                <option value="Parainfluenza" />
                <option value="Coronavirus" />
              </datalist>
            </div>
          </div>

          <!-- Fechas -->
          <div class="vac-row-2">
            <div class="vac-field">
              <label class="vac-label">
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Fecha de aplicación
              </label>
              <input class="vac-input" type="date" v-model="vacForm.Fecha_aplicacion" />
            </div>
            <div class="vac-field">
              <label class="vac-label">
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Próxima dosis
              </label>
              <input class="vac-input" type="date" v-model="vacForm.Proxima_dosis" />
            </div>
          </div>

          <!-- Lote y Estado -->
          <div class="vac-row-2">
            <div class="vac-field">
              <label class="vac-label">Lote / Serie</label>
              <input class="vac-input" v-model="vacForm.Lote" placeholder="Ej: A-1234" />
            </div>
            <div class="vac-field">
              <label class="vac-label">Estado</label>
              <select class="vac-input" v-model="vacForm.Estado">
                <option value="Aplicada">✅ Aplicada</option>
                <option value="Proxima">🔔 Próxima</option>
                <option value="Atrasada">⚠️ Atrasada</option>
              </select>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="vac-field">
            <label class="vac-label">Observaciones / Reacciones</label>
            <textarea
              class="vac-input vac-textarea"
              v-model="vacForm.Observaciones"
              placeholder="Ej: Sin reacciones adversas. Aplicada en clínica veterinaria..."
            ></textarea>
          </div>

        </div>

        <!-- Footer -->
        <div class="vac-modal-footer">
          <button class="vac-btn-cancel" @click="cerrarModal">Cancelar</button>
          <button
            class="vac-btn-save"
            @click="guardarVacuna"
            :disabled="!vacForm.Nombre_vacuna.trim()"
            :class="{ 'vac-btn-disabled': !vacForm.Nombre_vacuna.trim() }"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            Guardar Vacuna
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

/* ══ MODAL VACUNA ══ */
.vac-modal {
  background: #fff;
  border-radius: 18px;
  width: 92%;
  max-width: 480px;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
  overflow: hidden;
  animation: vacSlide .28s ease;
}

@keyframes vacSlide {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.vac-modal-header {
  display: flex;
  align-items: center;
  gap: .85rem;
  padding: 1.25rem 1.4rem 1rem;
  border-bottom: 1px solid #e8edf3;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}

.vac-modal-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
  flex-shrink: 0;
}

.vac-modal-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  color: #14532d;
}

.vac-modal-sub {
  font-size: .78rem;
  color: #166534;
  margin-top: .1rem;
}

.vac-modal-close {
  margin-left: auto;
  background: rgba(0,0,0,.07);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: .85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .15s;
}

.vac-modal-close:hover { background: rgba(0,0,0,.14); }

.vac-modal-body {
  padding: 1.25rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vac-field {
  display: flex;
  flex-direction: column;
  gap: .35rem;
}

.vac-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .85rem;
}

.vac-label {
  font-size: .78rem;
  font-weight: 700;
  color: #374151;
  display: flex;
  align-items: center;
  gap: .3rem;
  letter-spacing: .3px;
  text-transform: uppercase;
}

.vac-required { color: #dc2626; }

.vac-input {
  width: 100%;
  padding: .6rem .85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: .9rem;
  font-family: inherit;
  color: #1e293b;
  background: #f8fafc;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
  outline: none;
}

.vac-input:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34,197,94,.12);
  background: #fff;
}

.vac-textarea {
  min-height: 80px;
  resize: vertical;
  line-height: 1.55;
}

.vac-modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: .75rem;
  padding: 1rem 1.4rem 1.3rem;
  border-top: 1px solid #e8edf3;
}

.vac-btn-cancel {
  background: #f1f5f9;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  padding: .6rem 1.2rem;
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}

.vac-btn-cancel:hover { background: #e2e8f0; }

.vac-btn-save {
  display: flex;
  align-items: center;
  gap: .4rem;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  border: none;
  border-radius: 9px;
  padding: .6rem 1.35rem;
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .2s, transform .15s;
  box-shadow: 0 3px 10px rgba(22,163,74,.25);
}

.vac-btn-save:hover { opacity: .92; transform: translateY(-1px); }

.vac-btn-disabled {
  opacity: .45 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

</style>
