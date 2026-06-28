<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { clientesAPI, mascotasAPI, serviciosAPI, veterinariosAPI, citasAPI } from '../api.js'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion, irALogin, irARegistro } = useAuth()

const clienteActual = ref(null)
const mascotas = ref([])
const servicios = ref([])
const veterinarios = ref([])
const citas = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showSuccess = ref(false)
const citaCreada = ref(null)
const showAllCitas = ref(false)
const citaCancelarId = ref(null)
const showConfirmCancel = ref(false)

function estadoBadgeClass(estado) {
  const e = (estado || 'Pendiente').toLowerCase()
  if (e === 'confirmada') return 'badge-green'
  if (e === 'completada' || e === 'completa') return 'badge-gray'
  if (e === 'cancelada') return 'badge-red'
  return 'badge-yellow'
}

function estadoLabel(estado) {
  const e = (estado || 'Pendiente').toLowerCase()
  if (e === 'confirmada') return '✅ Confirmada'
  if (e === 'completada' || e === 'completa') return '☑️ Completada'
  if (e === 'cancelada') return '❌ Cancelada'
  return '🕐 Pendiente'
}

function formatFechaCita(fecha) {
  if (!fecha) return '—'
  const soloFecha = String(fecha).split('T')[0]
  const [y, m, d] = soloFecha.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

function pedirCancelar(idCita) {
  citaCancelarId.value = idCita
  showConfirmCancel.value = true
}

async function confirmarCancelacion() {
  try {
    await citasAPI.actualizar(citaCancelarId.value, { Estado: 'Cancelada' })
    showConfirmCancel.value = false
    citaCancelarId.value = null
    await cargarCitas()
  } catch (e) {
    alert('Error al cancelar la cita: ' + e.message)
  }
}

const form = reactive({
  mascota: '',
  servicio: '',
  veterinario: '',
  fecha: '',
  hora: '',
  notas: ''
})

const horasDisponibles = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM'
]

const fechaMin = ref((() => {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const d = String(hoy.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})())

async function cargarCliente() {
  if (!usuarioLogueado.value?.ID_usuario) return
  try {
    const clientes = await clientesAPI.obtenerPorUsuario(usuarioLogueado.value.ID_usuario)
    clienteActual.value = clientes[0] || null
  } catch (error) {
    console.error('Error al cargar cliente:', error)
    errorMessage.value = 'No se pudo cargar la información del cliente.'
  }
}

async function crearClienteSiNoExiste() {
  if (!usuarioLogueado.value?.ID_usuario) return
  if (clienteActual.value) return
  try {
    const cliente = await clientesAPI.crear({ ID_usuario: usuarioLogueado.value.ID_usuario, Direccion: '' })
    clienteActual.value = cliente
  } catch (error) {
    console.error('Error creando cliente:', error)
    errorMessage.value = 'No se pudo crear el cliente en la base de datos.'
  }
}

async function cargarMascotas() {
  if (!clienteActual.value?.ID_cliente) return
  try {
    mascotas.value = await mascotasAPI.obtenerPorCliente(clienteActual.value.ID_cliente)
    if (mascotas.value.length) {
      form.mascota = mascotas.value[0].ID_mascota
    }
  } catch (error) {
    console.error('Error al cargar mascotas:', error)
    errorMessage.value = 'Error al cargar tus mascotas.'
  }
}

async function cargarServicios() {
  try {
    servicios.value = await serviciosAPI.obtener()
    if (servicios.value.length) {
      form.servicio = servicios.value[0].ID_servicio
    }
  } catch (error) {
    console.error('Error al cargar servicios:', error)
    errorMessage.value = 'Error al cargar los servicios.'
  }
}

async function cargarVeterinarios() {
  try {
    veterinarios.value = await veterinariosAPI.obtener()
    if (veterinarios.value.length) {
      form.veterinario = veterinarios.value[0].ID_veterinario
    }
  } catch (error) {
    console.error('Error al cargar veterinarios:', error)
    errorMessage.value = 'Error al cargar los veterinarios.'
  }
}

async function cargarCitas() {
  if (!clienteActual.value?.ID_cliente) return
  try {
    const todas = await citasAPI.obtener()
    citas.value = todas.filter(cita => cita.ID_cliente === clienteActual.value.ID_cliente)
  } catch (error) {
    console.error('Error al cargar citas:', error)
  }
}

function resetForm() {
  form.mascota = mascotas.value[0]?.ID_mascota || ''
  form.servicio = servicios.value[0]?.ID_servicio || ''
  form.veterinario = veterinarios.value[0]?.ID_veterinario || ''
  form.fecha = ''
  form.hora = ''
  form.notas = ''
}

function validateForm() {
  if (!clienteActual.value) {
    errorMessage.value = 'No se encontró información de cliente.'
    return false
  }
  if (!form.mascota || !form.servicio || !form.veterinario || !form.fecha || !form.hora) {
    errorMessage.value = 'Completa todos los campos obligatorios.'
    return false
  }
  // Validar que la fecha no sea anterior a hoy (usando fecha local, no UTC)
  const [y, m, d] = form.fecha.split('-').map(Number)
  const fechaSeleccionada = new Date(y, m - 1, d)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  if (fechaSeleccionada < hoy) {
    errorMessage.value = 'No puedes agendar una cita en una fecha pasada. Selecciona desde hoy en adelante.'
    return false
  }
  return true
}

async function agendarCita() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) return

  isLoading.value = true

  try {
    const nuevaCita = {
      ID_cliente: clienteActual.value.ID_cliente,
      ID_mascota: Number(form.mascota),
      ID_servicio: Number(form.servicio),
      ID_veterinario: Number(form.veterinario),
      Fecha: form.fecha,
      Hora: form.hora,
      Motivo: servicios.value.find(s => s.ID_servicio === Number(form.servicio))?.Nombre || 'Cita veterinaria',
      Observaciones: form.notas || ''
    }

    await citasAPI.crear(nuevaCita)

    // Guardar datos de la cita para el modal de confirmación
    const mascotaNombre = mascotas.value.find(m => m.ID_mascota === Number(form.mascota))?.Nombre || ''
    const servicioNombre = servicios.value.find(s => s.ID_servicio === Number(form.servicio))?.Nombre || ''
    const vetNombre = veterinarios.value.find(v => v.ID_veterinario === Number(form.veterinario))?.Nombre || ''
    citaCreada.value = {
      mascota: mascotaNombre,
      servicio: servicioNombre,
      veterinario: vetNombre,
      fecha: form.fecha,
      hora: form.hora
    }
    showSuccess.value = true
    successMessage.value = 'Cita registrada con éxito en la base de datos.'
    await cargarCitas()
    resetForm()
  } catch (error) {
    console.error('Error al agendar cita:', error)
    errorMessage.value = error.message || 'Error al registrar la cita.'
  } finally {
    isLoading.value = false
  }
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
  if (!usuarioLogueado.value) {
    router.push('/login-usuario')
    return
  }

  await cargarCliente()
  if (!clienteActual.value) {
    await crearClienteSiNoExiste()
  }
  await cargarMascotas()
  await cargarServicios()
  await cargarVeterinarios()
  await cargarCitas()
  resetForm()
})
</script>

<template>
  <nav class="navbar">
    <router-link to="/citas" class="nav-logo">PETCARD</router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas" class="active">Citas</router-link></li>
      <li><router-link to="/alimentacion">Alimentación</router-link></li>
      <li><router-link to="/carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/perfil">Mi Perfil</router-link></li>
      <li><router-link to="/notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/mis-mascotas">Mis Mascotas</router-link></li>
    </ul>
    <div id="auth-section" class="auth-section">
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

  <div class="hero"><h1>Agendamiento de Citas</h1><p>Programa tu atención veterinaria que tu mascota necesita</p></div>

  <div class="page-wrapper" style="margin-top:2rem;">
    <div class="two-col">
      <div class="card">
        <div class="card-title" style="color:var(--purple);">Agendar Nueva Cita</div>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

        <!-- Sin mascotas registradas -->
        <div v-if="mascotas.length === 0" style="text-align:center; padding:2.5rem 1rem;">
          <div style="font-size:3.5rem; margin-bottom:1rem;">🐾</div>
          <h3 style="color:var(--purple); margin-bottom:.5rem;">¡Aún no tienes mascotas registradas!</h3>
          <p style="color:var(--muted); margin-bottom:1.5rem; font-size:.95rem;">Primero registra una mascota para poder agendar una cita veterinaria.</p>
          <router-link to="/mis-mascotas" class="btn btn-primary" style="display:inline-block; text-decoration:none; padding:.65rem 1.5rem; border-radius:8px;">
            🐶 Registrar mi mascota
          </router-link>
        </div>

        <!-- Formulario (solo si hay mascotas) -->
        <template v-else>
        <div class="form-row">
          <div class="form-group">
            <label>Seleccionar Mascota <span class="req">*</span></label>
            <select class="form-control" v-model="form.mascota">
              <option value="" disabled>Selecciona mascota</option>
              <option v-for="mascota in mascotas" :key="mascota.ID_mascota" :value="mascota.ID_mascota">{{ mascota.Nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Servicio <span class="req">*</span></label>
            <select class="form-control" v-model="form.servicio">
              <option value="" disabled>Seleccionar servicio</option>
              <option v-for="servicio in servicios" :key="servicio.ID_servicio" :value="servicio.ID_servicio">{{ servicio.Nombre }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Fecha <span class="req">*</span></label>
            <input type="date" class="form-control" v-model="form.fecha" :min="fechaMin" />
          </div>
          <div class="form-group">
            <label>Hora <span class="req">*</span></label>
            <select class="form-control" v-model="form.hora">
              <option value="" disabled>Seleccionar hora</option>
              <option v-for="hora in horasDisponibles" :key="hora" :value="hora">{{ hora }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Veterinario <span class="req">*</span></label>
            <select class="form-control" v-model="form.veterinario">
              <option value="" disabled>Seleccionar veterinario</option>
              <option v-for="vet in veterinarios" :key="vet.ID_veterinario" :value="vet.ID_veterinario">{{ vet.Nombre }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Notas adicionales</label>
          <textarea class="form-control" v-model="form.notas" placeholder="Describe los síntomas o información relevante para el veterinario..."></textarea>
        </div>

        <div style="display:flex; gap:1rem; margin-top:1rem;">
          <button class="btn btn-primary btn-full" @click="agendarCita" :disabled="isLoading">{{ isLoading ? 'Guardando...' : 'Agendar Cita' }}</button>
          <router-link to="/perfil" class="btn btn-outline-primary" style="display:inline-block;text-align:center;text-decoration:none;">Ver Perfil</router-link>
        </div>
        </template>
      </div>

      <div class="sidebar">
        <div class="card">
          <div class="card-title" style="color:var(--orange);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Mis Citas
            <span v-if="citas.length" class="citas-count-badge">{{ citas.length }}</span>
          </div>

          <div v-if="citas.length === 0" style="padding:1.5rem 0; text-align:center; color:var(--muted);">
            <div style="font-size:2rem; margin-bottom:.5rem;">📅</div>
            <div style="font-size:.88rem;">Aún no tienes citas agendadas.</div>
          </div>

          <div v-for="cita in (showAllCitas ? citas : citas.slice(0, 3))" :key="cita.ID_cita"
               class="cita-item-card"
               :class="{ 'cita-cancelada': (cita.Estado || '').toLowerCase() === 'cancelada' }">
            <div class="cita-item-top">
              <div class="cita-item-servicio">{{ cita.Nombre_servicio || 'Cita veterinaria' }}</div>
              <span class="badge" :class="estadoBadgeClass(cita.Estado)">{{ estadoLabel(cita.Estado) }}</span>
            </div>
            <div class="cita-item-row">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ formatFechaCita(cita.Fecha) }}
            </div>
            <div class="cita-item-row">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ cita.Hora }}
            </div>
            <div class="cita-item-row">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              <strong>{{ cita.Nombre_mascota }}</strong>
            </div>
            <!-- Botón cancelar solo si está Pendiente o Confirmada -->
            <button
              v-if="['pendiente','confirmada'].includes((cita.Estado || 'pendiente').toLowerCase())"
              class="btn-cancelar-cita"
              @click="pedirCancelar(cita.ID_cita)"
            >
              ✕ Cancelar cita
            </button>
          </div>

          <button v-if="citas.length > 3" class="ver-todas-btn" @click="showAllCitas = !showAllCitas">
            {{ showAllCitas ? '▲ Ver menos' : `Ver todas (${citas.length}) →` }}
          </button>
        </div>

        <div class="card">
          <div class="card-title" style="color:var(--green);">Contacto</div>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:.5rem;">
            <li style="font-size:.83rem; color:var(--muted);">+1 234 567 8901</li>
            <li style="font-size:.83rem; color:var(--muted);">info@petcard.com</li>
            <li style="font-size:.83rem; color:var(--muted);">Lun – Vie: 8:00 AM – 6:00 PM</li>
          </ul>
          <p style="color:var(--red); font-weight:700; font-size:.83rem; margin-top:.5rem;">🔴 Emergencias 24/7</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ MODAL CONFIRMAR CANCELACIÓN ══ -->
  <Teleport to="body">
    <div v-if="showConfirmCancel" class="modal-overlay" @click.self="showConfirmCancel = false">
      <div class="cancel-modal">
        <div class="cancel-modal-icon">⚠️</div>
        <h3 class="cancel-modal-title">¿Cancelar esta cita?</h3>
        <p class="cancel-modal-sub">Esta acción no se puede deshacer. El veterinario será notificado.</p>
        <div class="cancel-modal-btns">
          <button class="vac-btn-cancel" @click="showConfirmCancel = false">No, mantenerla</button>
          <button class="btn-cancelar-confirm" @click="confirmarCancelacion">Sí, cancelar</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ══ MODAL CITA CREADA ══ -->
  <Teleport to="body">
    <div v-if="showSuccess" class="success-overlay" @click.self="showSuccess = false">
      <div class="success-modal">
        <div class="success-confetti">🎉</div>
        <div class="success-check">
          <svg width="52" height="52" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#22c55e" stroke="none"/><polyline points="5 12 10 17 19 7" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h2 class="success-title">¡Tu cita ha sido creada!</h2>
        <p class="success-sub">Hemos registrado tu cita exitosamente. Te esperamos 🐾</p>

        <div v-if="citaCreada" class="success-details">
          <div class="success-detail-row">
            <span>🐶 Mascota</span>
            <strong>{{ citaCreada.mascota }}</strong>
          </div>
          <div class="success-detail-row">
            <span>🩺 Servicio</span>
            <strong>{{ citaCreada.servicio }}</strong>
          </div>
          <div class="success-detail-row">
            <span>👨‍⚕️ Veterinario</span>
            <strong>{{ citaCreada.veterinario }}</strong>
          </div>
          <div class="success-detail-row">
            <span>📅 Fecha</span>
            <strong>{{ new Date(citaCreada.fecha).toLocaleDateString('es-ES', { weekday:'long', day:'2-digit', month:'long', year:'numeric' }) }}</strong>
          </div>
          <div class="success-detail-row">
            <span>🕐 Hora</span>
            <strong>{{ citaCreada.hora }}</strong>
          </div>
        </div>

        <button class="success-btn" @click="showSuccess = false">¡Perfecto, entendido!</button>
        <p class="success-note">Puedes ver tu cita en el panel de <strong>Próximas Citas</strong> →</p>
      </div>
    </div>
  </Teleport>

  <footer class="footer" style="margin-top:2rem;">
    <div class="footer-grid"><div class="footer-brand"><span class="nav-logo" style="color:#fff;display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>PetCard</span><p>Comprometidos con brindar toda la atención profesional que tu mascota.</p></div><div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li><li><a href="#">Cirugías</a></li><li><a href="#">Emergencias</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p><p>info@petcard.com</p><p>Calle Principal 123, Ciudad</p></div><div class="footer-col"><h4>Horarios</h4><p>Lunes - Viernes: 8:00 AM - 7:00 PM</p><p>Sábados: 9:00 AM - 6:00 PM</p><p>Domingos: 10:00 AM - 4:00 PM</p><p class="footer-emergency">Emergencias 24/7</p></div></div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>
</template>

<style>
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

/* ── CITA ITEM CARD ── */
.cita-item-card {
  padding: .75rem 0;
  border-bottom: 1px solid var(--border);
}
.cita-item-card:last-of-type { border-bottom: none; }

.cita-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .4rem;
}

.cita-item-servicio {
  font-weight: 700;
  font-size: .9rem;
  color: var(--dark);
}

.cita-item-row {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .8rem;
  color: var(--muted);
  margin-bottom: .2rem;
}

.cita-item-row svg { flex-shrink: 0; color: var(--purple); }

/* ── MODAL ÉXITO ── */
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn .25s ease;
}

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.success-modal {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem 2rem 2rem;
  max-width: 440px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  animation: slideUp .3s ease;
}

@keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

.success-confetti {
  font-size: 2.8rem;
  margin-bottom: .5rem;
  animation: bounce .6s ease infinite alternate;
}

@keyframes bounce { from { transform: translateY(0) } to { transform: translateY(-8px) } }

.success-check {
  display: flex;
  justify-content: center;
  margin-bottom: 1.1rem;
}

.success-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.6rem;
  color: var(--dark);
  margin: 0 0 .5rem;
  line-height: 1.2;
}

.success-sub {
  color: var(--muted);
  font-size: .95rem;
  margin-bottom: 1.25rem;
}

.success-details {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.success-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .45rem 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: .88rem;
}

.success-detail-row:last-child { border-bottom: none; }
.success-detail-row span { color: var(--muted); }
.success-detail-row strong { color: var(--dark); }

.success-btn {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: .85rem 2.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: opacity .2s;
  margin-bottom: .75rem;
}

.success-btn:hover { opacity: .9; }

.success-note {
  font-size: .8rem;
  color: var(--muted);
  margin: 0;
}

/* ── ESTADOS DE CITAS ── */
.badge-gray { background: #f1f5f9; color: #475569; }
.badge-red  { background: #fee2e2; color: #dc2626; }

.citas-count-badge {
  background: var(--orange);
  color: #fff;
  font-size: .7rem;
  font-weight: 800;
  border-radius: 20px;
  padding: .1rem .45rem;
  margin-left: .3rem;
}

.cita-cancelada { opacity: .52; }

.btn-cancelar-cita {
  display: block;
  width: 100%;
  margin-top: .55rem;
  background: none;
  border: 1.5px solid #fca5a5;
  color: #dc2626;
  border-radius: 7px;
  padding: .35rem;
  font-size: .78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-cancelar-cita:hover { background: #fee2e2; }

.ver-todas-btn {
  display: block;
  width: 100%;
  margin-top: .75rem;
  background: none;
  border: none;
  color: var(--purple);
  font-size: .83rem;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  padding: .35rem 0;
}
.ver-todas-btn:hover { text-decoration: underline; }

/* ── MODAL CANCELAR ── */
.cancel-modal {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 1.75rem;
  max-width: 360px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  animation: slideUp .25s ease;
}
.cancel-modal-icon  { font-size: 2.5rem; margin-bottom: .75rem; }
.cancel-modal-title { font-family:'Nunito',sans-serif; font-weight:800; font-size:1.15rem; color:var(--dark); margin:0 0 .5rem; }
.cancel-modal-sub   { font-size:.85rem; color:var(--muted); margin-bottom:1.4rem; line-height:1.5; }
.cancel-modal-btns  { display:flex; gap:.75rem; justify-content:center; }

.btn-cancelar-confirm {
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 9px;
  padding: .6rem 1.35rem;
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .2s;
}
.btn-cancelar-confirm:hover { opacity: .88; }
</style>