<script setup>
import PageHero from '../shared/PageHero.vue'
import { HERO_IMAGENES } from '../../utils/imagenesModulos'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { mascotasAPI, clientesAPI, vacunasAPI, citasAPI } from '../../api.js'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion, irALogin, irARegistro } = useAuth()

const pets = ref([])
const selectedId = ref(null)
const clienteActual = ref(null)
const vacunas = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const selectedPet = computed(() => {
  const pet = pets.value.find(p => p.ID_mascota === selectedId.value)
  return pet ? { ...pet, vacunas: vacunas.value } : null
})

const normEstado = (e) => String(e || '').trim().toLowerCase()
const esAplicada = (e) => ['aplicada', 'completo', 'completa', 'completada'].includes(normEstado(e))
const esAtrasada = (e) => normEstado(e) === 'atrasada'

const aplicadas = computed(() => vacunas.value.filter(v => esAplicada(v.Estado)).length)
const pendientes = computed(() => vacunas.value.length - aplicadas.value)
const pct = computed(() => vacunas.value.length ? Math.round((aplicadas.value / vacunas.value.length) * 100) : 0)
const proximas = computed(() => vacunas.value.filter(v => !esAplicada(v.Estado)).slice(0, 2))

function estadoColor(estado) {
  return esAplicada(estado) ? 'var(--green)' : esAtrasada(estado) ? 'var(--red)' : '#ca8a04'
}
function estadoIcono(estado) {
  return esAplicada(estado) ? '✓' : esAtrasada(estado) ? '✖' : '⚠'
}
function estadoTexto(estado) {
  return esAplicada(estado) ? 'Aplicada' : esAtrasada(estado) ? 'Atrasada' : 'Pendiente'
}
function badgeClass(estado) {
  return esAtrasada(estado) ? 'badge badge-red' : 'badge badge-yellow'
}
function badgeLabel(estado) {
  return esAtrasada(estado) ? 'Atrasada' : normEstado(estado) === 'proxima' ? 'Próxima Dosis' : 'Pendiente'
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

function calcularEdad(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = String(fecha).split('T')[0].split('-').map(Number)
  if (!anio) return '—'
  const hoy = new Date()
  let anios = hoy.getFullYear() - anio
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) anios--
  if (anios < 0) return '—'
  if (anios === 0) return 'Menos de 1 año'
  return anios === 1 ? '1 año' : `${anios} años`
}

const idCarnet = computed(() => selectedPet.value ? 'PET-' + String(selectedPet.value.ID_mascota).padStart(6, '0') : '—')
const propietario = computed(() => {
  const u = usuarioLogueado.value || {}
  const nombre = `${u.Nombre || ''} ${u.Apellido || ''}`.trim()
  return { nombre: nombre || 'Sin nombre', telefono: u.Telefono || '—', correo: u.Correo || '—' }
})
const observacionesVacunas = computed(() => vacunas.value.filter(v => v.Observaciones && String(v.Observaciones).trim()))

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

// Descargar PDF / Imprimir: usa la hoja del carnet (diseño del PDF de la app) y
// el navegador la imprime o la guarda como PDF.
function imprimir() {
  if (!selectedPet.value) return
  const tituloOriginal = document.title
  document.title = `Carnet-${selectedPet.value.Nombre || 'mascota'}`
  const restaurar = () => { document.title = tituloOriginal; window.removeEventListener('afterprint', restaurar) }
  window.addEventListener('afterprint', restaurar)
  window.print()
}

function abrirVacunas(pet) {
  selectedId.value = pet.ID_mascota
  router.push({ path: '/citas', query: { mascota: pet.ID_mascota } })
}

// ===== PRÓXIMA CITA DE LA MASCOTA =====
// Muestra la cita más cercana que la mascota seleccionada tiene pendiente
// (Pendiente o Confirmada, de hoy en adelante). Las canceladas/completadas no cuentan.
const citasMascota = ref([])

const horaA24 = (horaStr) => {
  if (!horaStr) return '00:00'
  const str = String(horaStr).trim()
  const ampm = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (ampm) {
    let h = parseInt(ampm[1], 10)
    const ap = ampm[3].toUpperCase()
    if (ap === 'PM' && h !== 12) h += 12
    if (ap === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${ampm[2]}`
  }
  const [h, m] = str.split(':')
  return `${String(h).padStart(2, '0')}:${m || '00'}`
}

const horaTexto = (horaStr) => {
  const [h, m] = horaA24(horaStr).split(':').map(Number)
  const ap = h >= 12 ? 'PM' : 'AM'
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`
}

const proximaCita = computed(() => {
  const ahora = new Date()
  const p = (n) => String(n).padStart(2, '0')
  const ahoraKey = `${ahora.getFullYear()}-${p(ahora.getMonth() + 1)}-${p(ahora.getDate())} ${p(ahora.getHours())}:${p(ahora.getMinutes())}`
  return citasMascota.value
    .filter(c => !['cancelada', 'completada', 'completa'].includes(String(c.Estado || 'Pendiente').trim().toLowerCase()))
    .map(c => ({ ...c, _key: `${String(c.Fecha).split('T')[0]} ${horaA24(c.Hora)}` }))
    .filter(c => c._key >= ahoraKey)
    .sort((a, b) => a._key.localeCompare(b._key))[0] || null
})

const proximaCitaTexto = computed(() => {
  const c = proximaCita.value
  if (!c) return '—'
  return `${obtenerFechaTexto(c.Fecha)} · ${horaTexto(c.Hora)}`
})

async function cargarCitasMascota() {
  if (!selectedId.value || !clienteActual.value?.ID_cliente) { citasMascota.value = []; return }
  try {
    const todas = await citasAPI.obtener()
    citasMascota.value = todas.filter(c =>
      c.ID_mascota === selectedId.value && c.ID_cliente === clienteActual.value.ID_cliente
    )
  } catch (error) {
    console.error('Error al cargar citas de la mascota:', error)
  }
}

watch(selectedId, cargarCitasMascota)

// Se actualiza sola si agendas/cancelas una cita (cada 10 s y al volver a la pestaña)
let temporizadorCitas = null
const refrescarCitasAlVolver = () => { if (!document.hidden) cargarCitasMascota() }
onMounted(() => {
  temporizadorCitas = setInterval(cargarCitasMascota, 10000)
  document.addEventListener('visibilitychange', refrescarCitasAlVolver)
})
onUnmounted(() => {
  clearInterval(temporizadorCitas)
  document.removeEventListener('visibilitychange', refrescarCitasAlVolver)
})

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

  <PageHero titulo="Carnet de Vacunas" :imagen="HERO_IMAGENES.carnet">Consulta el historial de vacunación y las próximas dosis de tu mascota</PageHero>

  <div class="page-wrapper carnet-web">
    <div class="carnet-col">

      <!-- Selector de mascota -->
      <div class="card" style="margin-bottom:1rem;">
        <div class="card-title" style="color:var(--purple);">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          Seleccionar Mascota
        </div>
        <p style="font-size:.85rem; color:var(--muted); margin-bottom:.75rem;">Elige tu mascota para ver el carnet de vacunas</p>
        <select class="form-control" v-model="selectedId" style="max-width:260px;">
          <option disabled value="">{{ pets.length ? 'Elige una mascota' : 'No hay mascotas registradas' }}</option>
          <option v-for="pet in pets" :key="pet.ID_mascota" :value="pet.ID_mascota">{{ pet.Nombre }} – {{ pet.Especie }}</option>
        </select>
      </div>

      <p v-if="errorMessage" class="carnet-error">⚠️ {{ errorMessage }}</p>

      <!-- Header verde -->
      <div class="carnet-header">
        <div class="carnet-header-icon">
          <svg width="22" height="22" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path d="M18 2l4 4"/><path d="M17 7l3-3"/><path d="M19 9l-8.7 8.7a2.12 2.12 0 01-3 0l-.99-.99a2.12 2.12 0 010-3L15 5"/><path d="M9 11l4 4"/><path d="M5 19l-3 3"/></svg>
        </div>
        <div>
          <div class="carnet-header-title">Carnet de Vacunación</div>
          <div class="carnet-header-sub">{{ selectedPet ? `${selectedPet.Nombre} · ${selectedPet.Especie}` : 'Selecciona una mascota' }}</div>
        </div>
      </div>

      <!-- Tabla (Estado · Vacuna · Aplicada · Próxima) -->
      <div class="carnet-box">
        <p v-if="!vacunas.length" class="carnet-vacio">Sin vacunas registradas todavía.</p>
        <div v-else class="table-wrapper">
          <table class="carnet-table">
            <thead>
              <tr><th>Estado</th><th>Vacuna</th><th>Aplicada</th><th>Próxima</th></tr>
            </thead>
            <tbody>
              <tr v-for="v in vacunas" :key="v.ID_carnetVacunas">
                <td><span class="status-icon" :style="{ color: estadoColor(v.Estado) }">{{ estadoIcono(v.Estado) }}</span></td>
                <td class="vacuna-nombre">{{ v.Nombre_vacuna || '—' }}</td>
                <td>{{ obtenerFechaTexto(v.Fecha_aplicacion) }}</td>
                <td>{{ obtenerFechaTexto(v.Proxima_dosis) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Observaciones médicas -->
      <div class="obs-medicas">
        <h4>Observaciones Médicas:</h4>
        <p v-if="!observacionesVacunas.length" class="obs-vacio">Sin observaciones registradas.</p>
        <ul v-else>
          <li v-for="v in observacionesVacunas" :key="v.ID_carnetVacunas">{{ v.Nombre_vacuna }}: {{ v.Observaciones }}</li>
        </ul>
      </div>

      <!-- Estado de vacunación -->
      <div class="carnet-box">
        <div class="carnet-box-title">Estado de Vacunación</div>
        <div class="estado-row">
          <div>
            <div class="pct-number">{{ pct }}%</div>
            <div class="pct-label">Completado</div>
          </div>
          <div class="progress-bar" style="flex:1;">
            <div class="progress-fill yellow" :style="{ width: pct + '%' }"></div>
          </div>
        </div>
        <div class="mini-stats">
          <div><strong style="color:#16a34a;">{{ aplicadas }}</strong><span>Aplicadas</span></div>
          <div><strong style="color:#ca8a04;">{{ pendientes }}</strong><span>Pendientes</span></div>
          <div><strong style="color:#2563eb;">{{ proximas.length }}</strong><span>Próximas</span></div>
        </div>
      </div>

      <!-- Próximas vacunas -->
      <div class="carnet-box">
        <div class="carnet-box-title" style="color:var(--orange);">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Próximas Vacunas
        </div>
        <div class="proxima-vac" v-for="v in proximas" :key="v.ID_carnetVacunas">
          <div class="proxima-vac-header">
            <span class="vacuna-nombre2">{{ v.Nombre_vacuna }}</span>
            <span :class="badgeClass(v.Estado)">{{ badgeLabel(v.Estado) }}</span>
          </div>
          <div style="font-size:.78rem; color:var(--muted);">Próxima: {{ obtenerFechaTexto(v.Proxima_dosis) }}</div>
        </div>
        <p v-if="!proximas.length" class="obs-vacio">Sin vacunas pendientes.</p>
        <button class="btn btn-success btn-full" style="margin-top:.75rem;" @click="router.push('/citas')">Agendar Vacunación</button>
      </div>

      <!-- Información del carnet -->
      <div class="carnet-box">
        <div class="carnet-box-title" style="color:var(--green);">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Información del Carnet
        </div>
        <div class="info-row"><span>Mascota:</span><strong>{{ selectedPet ? selectedPet.Nombre : '—' }}</strong></div>
        <div class="info-row"><span>Especie:</span><strong>{{ selectedPet ? selectedPet.Especie : '—' }}</strong></div>
        <div class="info-row"><span>Raza:</span><strong>{{ selectedPet ? selectedPet.Raza : '—' }}</strong></div>
        <div class="info-row"><span>ID:</span><strong>{{ selectedPet ? selectedPet.ID_mascota : '—' }}</strong></div>
        <div class="info-row"><span>Fecha de nacimiento:</span><strong>{{ obtenerFechaNacimiento(selectedPet?.Fecha_nacimiento) }}</strong></div>
        <div class="info-row"><span>Próxima cita:</span><strong>{{ proximaCitaTexto }}</strong></div>
      </div>

      <!-- Botones PDF / Imprimir -->
      <div class="carnet-actions">
        <button class="btn btn-primary" :disabled="!selectedPet" @click="imprimir">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Descargar PDF
        </button>
        <button class="btn btn-secondary" :disabled="!selectedPet" @click="imprimir">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimir
        </button>
      </div>
    </div>
  </div>

  <!-- HOJA DEL PDF (solo se ve al imprimir / guardar como PDF) -->
  <div v-if="selectedPet" class="pdf-sheet">
    <div class="pdf-head">
      <div class="pdf-logo">PC</div>
      <div>
        <div class="pdf-brand">PETCARD</div>
        <div class="pdf-brand-sub">Carnet Digital de Mascota</div>
      </div>
      <div class="pdf-valid">VÁLIDO</div>
    </div>

    <div class="pdf-pet">
      <div class="pdf-photo">
        <img v-if="selectedPet.Foto" :src="selectedPet.Foto" alt="" />
        <span v-else>PET</span>
      </div>
      <div style="flex:1;">
        <div class="pdf-pet-name">{{ selectedPet.Nombre }}</div>
        <div class="pdf-pet-sub">{{ selectedPet.Especie }} · {{ selectedPet.Raza }}</div>
        <div class="pdf-datos">
          <div><small>EDAD</small><b>{{ calcularEdad(selectedPet.Fecha_nacimiento) }}</b></div>
          <div><small>PESO</small><b>{{ selectedPet.Peso != null && selectedPet.Peso !== '' ? selectedPet.Peso + ' kg' : '—' }}</b></div>
          <div><small>SEXO</small><b>{{ selectedPet.Sexo || '—' }}</b></div>
          <div><small>ID CARNET</small><b>{{ idCarnet }}</b></div>
        </div>
      </div>
    </div>

    <div class="pdf-owner">
      <small>PROPIETARIO</small>
      <div class="pdf-owner-name">{{ propietario.nombre }}</div>
      <div class="pdf-owner-contact"><span>{{ propietario.telefono }}</span><span>{{ propietario.correo }}</span></div>
    </div>

    <div class="pdf-section">VACUNAS REGISTRADAS</div>
    <div v-if="!vacunas.length" class="pdf-empty">No hay vacunas registradas para esta mascota.</div>
    <table v-else class="pdf-table">
      <thead><tr><th>VACUNA</th><th>LOTE</th><th>APLICADA</th><th>PRÓXIMA</th><th>ESTADO</th></tr></thead>
      <tbody>
        <tr v-for="v in vacunas" :key="'pdf' + v.ID_carnetVacunas">
          <td>{{ v.Nombre_vacuna || 'Sin nombre' }}</td>
          <td>{{ v.Lote || '—' }}</td>
          <td>{{ obtenerFechaTexto(v.Fecha_aplicacion) }}</td>
          <td>{{ obtenerFechaTexto(v.Proxima_dosis) }}</td>
          <td>{{ estadoTexto(v.Estado) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pdf-footer">
      <span>© {{ new Date().getFullYear() }} PetCard</span>
      <span>Documento oficial generado por PetCard</span>
    </div>
  </div>

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
      <div class="footer-col"><h4>Horarios</h4><p>Lunes - Viernes: 8:00 AM - 7:00 PM</p><p>Sábados: 9:00 AM - 6:00 PM</p><p>Domingos: 10:00 AM - 4:00 PM</p></div>
    </div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>
</template>

<style scoped>
/* ===== Carnet (diseño de la app Android adaptado a web) ===== */
.carnet-web .carnet-col { max-width: 820px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
.carnet-web .carnet-col > .card { margin-bottom: 0 !important; }
.carnet-error { background:#fee2e2; color:#b91c1c; border-radius:12px; padding:.75rem 1rem; font-size:.85rem; }

.carnet-header { background:#10b981; border-radius:14px; padding:.9rem 1.1rem; display:flex; align-items:center; gap:.85rem; color:#fff; }
.carnet-header-icon { width:44px; height:44px; border-radius:12px; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.carnet-header-title { font-family:'Nunito',sans-serif; font-weight:800; font-size:1.05rem; }
.carnet-header-sub { font-size:.85rem; opacity:.92; margin-top:.1rem; }

.carnet-box { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:1rem; }
.carnet-box-title { font-family:'Nunito',sans-serif; font-weight:800; font-size:.95rem; margin-bottom:.75rem; display:flex; align-items:center; gap:.4rem; }
.carnet-vacio { text-align:center; color:var(--muted); font-size:.85rem; padding:.9rem 0; }

.carnet-table { width:100%; border-collapse:collapse; }
.carnet-table thead th { background:#1d4ed8; color:#fff; font-size:.78rem; font-weight:700; text-align:left; padding:.6rem .75rem; }
.carnet-table tbody td { padding:.6rem .75rem; font-size:.88rem; border-bottom:1px solid #f1f5f9; color:#111827; }
.carnet-table tbody tr:last-child td { border-bottom:none; }
.status-icon { font-weight:800; font-size:1rem; }
.vacuna-nombre { font-weight:700; color:#3b82f6; }

.obs-medicas { background:#f9fafb; border-radius:12px; padding:1rem; font-size:.85rem; }
.obs-medicas h4 { font-family:'Nunito',sans-serif; font-weight:800; margin-bottom:.5rem; font-size:.9rem; }
.obs-medicas ul { list-style:disc; padding-left:1.25rem; display:flex; flex-direction:column; gap:.25rem; color:var(--text-secondary); }
.obs-vacio { font-size:.85rem; color:var(--muted); }

.estado-row { display:flex; align-items:center; gap:1.25rem; }
.pct-number { font-family:'Nunito',sans-serif; font-weight:900; font-size:1.9rem; color:#0f172a; line-height:1.1; }
.pct-label { font-size:.78rem; color:var(--muted); }
.mini-stats { display:grid; grid-template-columns:repeat(3,1fr); text-align:center; margin-top:1rem; }
.mini-stats strong { display:block; font-size:1.15rem; font-weight:800; }
.mini-stats span { font-size:.75rem; color:var(--muted); }

.proxima-vac { padding:.6rem 0; border-bottom:1px solid var(--border); }
.proxima-vac:last-of-type { border-bottom:none; }
.proxima-vac-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.2rem; }
.vacuna-nombre2 { font-weight:700; font-size:.9rem; }
.info-row { display:flex; justify-content:space-between; font-size:.88rem; padding:.45rem 0; border-bottom:1px solid var(--border); }
.info-row:last-of-type { border-bottom:none; }
.info-row span { color:var(--muted); }

.carnet-actions { display:flex; gap:.75rem; }
.carnet-actions .btn { flex:1; display:flex; align-items:center; justify-content:center; gap:.45rem; padding:.7rem 1rem; }
.carnet-actions .btn:disabled { opacity:.5; cursor:not-allowed; }

/* Usuario logueado */
.usuario-nombre { color:#0f172a; font-weight:600; margin-right:1rem; font-size:.95rem; }
.btn-logout { background-color:#dc3545; border:1px solid #dc3545; }
.btn-logout:hover { background-color:#c82333; border-color:#c82333; }

/* ===== Hoja del PDF (oculta en pantalla) ===== */
.pdf-sheet { display:none; }
</style>

<!-- Impresión / PDF: oculta la página y muestra solo la hoja del carnet -->
<style>
@media print {
  @page { size: A4; margin: 12mm; }
  body * { visibility: hidden !important; }
  .navbar, .footer, .page-wrapper { display: none !important; }
  .pdf-sheet, .pdf-sheet * { visibility: visible !important; }
  .pdf-sheet { display:flex !important; flex-direction:column; gap:16px; position:absolute; left:0; top:0; width:100%; min-height:270mm; font-family:'Nunito','Segoe UI',Arial,sans-serif; color:#1a1a2e; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .pdf-head { display:flex; align-items:center; gap:14px; padding:18px 20px; border-radius:12px; background:linear-gradient(135deg,#2563eb,#1e3a5f); color:#fff; }
  .pdf-logo { width:50px; height:50px; border-radius:12px; background:#fff; color:#2563eb; font-weight:800; font-size:18px; display:flex; align-items:center; justify-content:center; }
  .pdf-brand { font-size:22px; font-weight:800; letter-spacing:1.5px; }
  .pdf-brand-sub { font-size:11px; margin-top:2px; }
  .pdf-valid { margin-left:auto; background:#16a34a; color:#fff; font-size:9px; font-weight:800; letter-spacing:.5px; padding:5px 12px; border-radius:20px; }
  .pdf-pet { display:flex; gap:16px; padding:16px; border-radius:10px; background:#f1f5f9; }
  .pdf-photo { width:90px; height:90px; border-radius:10px; background:#fff; overflow:hidden; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px; color:#64748b; flex-shrink:0; }
  .pdf-photo img { width:100%; height:100%; object-fit:cover; }
  .pdf-pet-name { font-size:22px; font-weight:800; color:#1e3a5f; }
  .pdf-pet-sub { font-size:12px; color:#64748b; margin-top:3px; }
  .pdf-datos { display:flex; flex-wrap:wrap; gap:8px 20px; margin-top:12px; }
  .pdf-datos small { display:block; font-size:8px; font-weight:800; color:#64748b; }
  .pdf-datos b { font-size:11px; color:#1e3a5f; }
  .pdf-owner { border:2px solid #f1f5f9; border-radius:10px; padding:13px 14px; }
  .pdf-owner small { font-size:10px; font-weight:800; color:#64748b; letter-spacing:.5px; }
  .pdf-owner-name { font-size:14px; font-weight:800; color:#1e3a5f; margin-top:6px; }
  .pdf-owner-contact { display:flex; gap:16px; font-size:11px; color:#64748b; margin-top:4px; }
  .pdf-section { font-size:13px; font-weight:800; color:#1e3a5f; margin-bottom:-6px; }
  .pdf-empty { background:#f1f5f9; border-radius:8px; padding:13px; font-size:11px; color:#64748b; }
  .pdf-table { width:100%; border-collapse:collapse; border:1px solid #f1f5f9; }
  .pdf-table th { background:#1e3a5f; color:#fff; font-size:9px; font-weight:800; letter-spacing:.5px; text-align:left; padding:8px; }
  .pdf-table td { font-size:10px; padding:8px; border:1px solid #f1f5f9; }
  .pdf-table tbody tr:nth-child(even) td { background:#f1f5f9; }
  .pdf-table tr { break-inside: avoid; }
  .pdf-footer { margin-top:auto; display:flex; justify-content:space-between; background:#1e3a5f; color:#fff; font-size:9px; padding:10px; border-radius:8px; }
}
</style>
