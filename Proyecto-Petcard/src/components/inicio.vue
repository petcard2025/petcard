<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { clientesAPI, mascotasAPI, citasAPI, vacunasAPI } from '../api.js'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion, irALogin, irARegistro } = useAuth()

const clienteActual = ref(null)
const mascotas = ref([])
const proximaCita = ref(null)
const vacunasPendientes = ref([])
const isLoading = ref(false)

const saludo = computed(() => {
  const hora = new Date().getHours()
  if (hora < 12) return '¡Buenos días'
  if (hora < 18) return '¡Buenas tardes'
  return '¡Buenas noches'
})

const nombreUsuario = computed(() => {
  const nombre = usuarioLogueado.value?.Nombre || ''
  return nombre.split(' ')[0]
})

function formatFecha(fecha) {
  if (!fecha) return '—'
  const soloFecha = String(fecha).split('T')[0]
  const [y, m, d] = soloFecha.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })
}

function formatFechaCorta(fecha) {
  if (!fecha) return '—'
  const soloFecha = String(fecha).split('T')[0]
  const [y, m, d] = soloFecha.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function cargarDatos() {
  if (!usuarioLogueado.value?.ID_usuario) return
  isLoading.value = true
  try {
    const clientes = await clientesAPI.obtenerPorUsuario(usuarioLogueado.value.ID_usuario)
    clienteActual.value = clientes[0] || null
    if (!clienteActual.value) return

    // Mascotas
    mascotas.value = await mascotasAPI.obtenerPorCliente(clienteActual.value.ID_cliente)

    // Próxima cita
    const todasCitas = await citasAPI.obtener()
    const misCitas = todasCitas
      .filter(c => c.ID_cliente === clienteActual.value.ID_cliente)
      .sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha))
    proximaCita.value = misCitas[0] || null

    // Vacunas pendientes de todas las mascotas
    const vacPromises = mascotas.value.map(m =>
      vacunasAPI.obtenerPorMascota(m.ID_mascota).then(vacs =>
        vacs.filter(v => v.Estado !== 'Completo' && v.Estado !== 'aplicada')
            .map(v => ({ ...v, nombreMascota: m.Nombre }))
      )
    )
    const vacResults = await Promise.all(vacPromises)
    vacunasPendientes.value = vacResults.flat().slice(0, 3)
  } catch (e) {
    console.error('Error cargando datos inicio:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (isAuthenticated.value) await cargarDatos()
})
</script>

<template>
  <nav class="navbar">
    <router-link to="/inicio" class="nav-logo">PETCARD</router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio" class="active">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas">Citas</router-link></li>
      <li><router-link to="/alimentacion">Alimentación</router-link></li>
      <li><router-link to="/carnet">Carnet</router-link></li>
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

  <!-- ── HERO con saludo personalizado ── -->
  <section class="hero-inicio">
    <div class="hero-content">
      <template v-if="isAuthenticated">
        <p class="hero-saludo">{{ saludo }}, <strong>{{ nombreUsuario }}</strong>! 👋</p>
        <h1>El bienestar de tus mascotas, todo en un lugar</h1>
        <p>Tienes <strong>{{ mascotas.length }}</strong> mascota{{ mascotas.length !== 1 ? 's' : '' }} registrada{{ mascotas.length !== 1 ? 's' : '' }}. ¿Qué necesitas hoy?</p>
      </template>
      <template v-else>
        <h1>Cuidado Veterinario de Excelencia</h1>
        <p>Gestiona citas, historial médico y toda la información de tus mascotas en un solo lugar.</p>
      </template>
      <div class="hero-btns">
        <router-link to="/citas" class="btn btn-primary btn-lg">📅 Agendar cita</router-link>
        <router-link to="/mis-mascotas" class="btn btn-outline-white btn-lg">🐾 Mis mascotas</router-link>
      </div>
    </div>
  </section>

  <!-- ── RESUMEN PERSONALIZADO (solo si está logueado) ── -->
  <div v-if="isAuthenticated" class="page-wrapper" style="margin-top:2rem;">

    <!-- Accesos rápidos -->
    <div class="accesos-grid">
      <router-link to="/citas" class="acceso-card acceso-purple">
        <div class="acceso-icon">📅</div>
        <div class="acceso-label">Agendar Cita</div>
      </router-link>
      <router-link to="/carnet" class="acceso-card acceso-green">
        <div class="acceso-icon">💉</div>
        <div class="acceso-label">Carnet de Vacunas</div>
      </router-link>
      <router-link to="/alimentacion" class="acceso-card acceso-orange">
        <div class="acceso-icon">🍖</div>
        <div class="acceso-label">Plan Alimentación</div>
      </router-link>
      <router-link to="/mis-mascotas" class="acceso-card acceso-blue">
        <div class="acceso-icon">🐾</div>
        <div class="acceso-label">Mis Mascotas</div>
      </router-link>
    </div>

    <div class="two-col" style="margin-top:1.5rem;">
      <div>

        <!-- Próxima cita -->
        <div class="card" style="margin-bottom:1.25rem;">
          <div class="card-title" style="color:var(--purple);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Tu Próxima Cita
          </div>

          <div v-if="isLoading" style="color:var(--muted); font-size:.88rem; padding:.5rem 0;">Cargando...</div>

          <div v-else-if="!proximaCita" class="resumen-empty">
            <span style="font-size:2rem;">📭</span>
            <p>No tienes citas agendadas.</p>
            <router-link to="/citas" class="btn btn-primary btn-sm" style="text-decoration:none;">Agendar ahora</router-link>
          </div>

          <div v-else class="proxima-cita-card">
            <div class="cita-banner">
              <div class="cita-fecha-grande">{{ formatFecha(proximaCita.Fecha) }}</div>
              <span class="badge badge-yellow">Pendiente</span>
            </div>
            <div class="cita-detalle-row">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ proximaCita.Hora }}
            </div>
            <div class="cita-detalle-row">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              {{ proximaCita.Nombre_mascota }}
            </div>
            <div class="cita-detalle-row">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              {{ proximaCita.Nombre_servicio || 'Cita veterinaria' }}
            </div>
          </div>
        </div>

        <!-- Vacunas pendientes -->
        <div class="card">
          <div class="card-title" style="color:var(--orange);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Vacunas Pendientes
          </div>

          <div v-if="isLoading" style="color:var(--muted); font-size:.88rem; padding:.5rem 0;">Cargando...</div>

          <div v-else-if="vacunasPendientes.length === 0" class="resumen-empty">
            <span style="font-size:2rem;">✅</span>
            <p>¡Todo al día! No hay vacunas pendientes.</p>
          </div>

          <div v-else>
            <div v-for="vac in vacunasPendientes" :key="vac.ID_carnetVacunas" class="vac-pendiente-row">
              <div class="vac-pendiente-dot" :style="{ background: vac.Estado === 'Atrasada' || vac.Estado === 'atrasada' ? 'var(--red)' : 'var(--yellow)' }"></div>
              <div style="flex:1;">
                <div style="font-weight:700; font-size:.88rem;">{{ vac.Nombre_vacuna }}</div>
                <div style="font-size:.78rem; color:var(--muted);">{{ vac.nombreMascota }} · Vence: {{ formatFechaCorta(vac.Proxima_dosis) }}</div>
              </div>
              <span class="badge" :class="(vac.Estado === 'Atrasada' || vac.Estado === 'atrasada') ? 'badge-red' : 'badge-yellow'">
                {{ (vac.Estado === 'Atrasada' || vac.Estado === 'atrasada') ? 'Atrasada' : 'Próxima' }}
              </span>
            </div>
            <router-link to="/carnet" class="btn btn-outline-primary btn-sm btn-full" style="margin-top:.75rem; text-decoration:none; display:block; text-align:center;">Ver carnet completo →</router-link>
          </div>
        </div>

      </div>

      <!-- Sidebar resumen mascotas -->
      <div class="sidebar">
        <div class="card">
          <div class="card-title" style="color:var(--green);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            Mis Mascotas
          </div>

          <div v-if="isLoading" style="color:var(--muted); font-size:.88rem;">Cargando...</div>

          <div v-else-if="mascotas.length === 0" class="resumen-empty">
            <span style="font-size:2rem;">🐾</span>
            <p>Aún no tienes mascotas.</p>
            <router-link to="/mis-mascotas" class="btn btn-primary btn-sm" style="text-decoration:none;">Agregar mascota</router-link>
          </div>

          <div v-else>
            <div v-for="pet in mascotas" :key="pet.ID_mascota" class="mascota-mini-row">
              <div class="mascota-mini-avatar">{{ pet.Especie === 'Gato' || pet.Especie === 'Felino' ? '🐱' : pet.Especie === 'Ave' ? '🐦' : '🐶' }}</div>
              <div>
                <div style="font-weight:700; font-size:.9rem;">{{ pet.Nombre }}</div>
                <div style="font-size:.75rem; color:var(--muted);">{{ pet.Especie }} · {{ pet.Raza || '—' }}</div>
              </div>
              <div style="margin-left:auto; font-size:.78rem; color:var(--muted);">{{ pet.Peso ? pet.Peso + ' kg' : '' }}</div>
            </div>
            <router-link to="/mis-mascotas" class="btn btn-outline-primary btn-sm btn-full" style="margin-top:.75rem; text-decoration:none; display:block; text-align:center;">Gestionar mascotas →</router-link>
          </div>
        </div>

        <!-- Contacto rápido -->
        <div class="card">
          <div class="card-title" style="color:var(--purple);">📞 Contacto Rápido</div>
          <a href="https://wa.me/12345678901" target="_blank" class="whatsapp-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L0 24l6.335-1.51A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.37l-.36-.214-3.713.885.916-3.618-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
            WhatsApp
          </a>
          <div class="contacto-row">📧 info@petcard.com</div>
          <div class="contacto-row">📍 Calle Principal 123</div>
          <div class="contacto-row">🕐 Lun–Vie 8am–7pm · Sáb 9am–6pm</div>
          <div class="contacto-row" style="color:var(--red); font-weight:700;">🔴 Emergencias 24/7</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── VISTA PARA NO LOGUEADOS ── -->
  <div v-else>
    <section class="section" style="background:#fff;">
      <div class="container">
        <h2 class="section-title">Servicios para tu Mascota</h2>
        <div class="cards-grid-3">
          <div class="feature-card card">
            <div class="feature-icon blue" style="font-size:1.8rem;">📅</div>
            <h3>Agendar Citas</h3>
            <p>Programa citas veterinarias fácilmente desde cualquier lugar.</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon green" style="font-size:1.8rem;">💉</div>
            <h3>Carnet de Vacunas</h3>
            <p>Lleva el historial completo de vacunación de tu mascota.</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon purple" style="font-size:1.8rem;">🍖</div>
            <h3>Plan de Alimentación</h3>
            <p>Accede a planes nutricionales diseñados por veterinarios.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="cta-section">
      <h2>¿Tu mascota necesita atención?</h2>
      <p>Regístrate gratis y dale el mejor cuidado.</p>
      <div class="cta-btns">
        <router-link to="/registro-usuario" class="btn btn-primary btn-lg" style="text-decoration:none;">Crear cuenta gratis</router-link>
        <router-link to="/login-usuario" class="btn btn-outline-white btn-lg" style="text-decoration:none;">Iniciar sesión</router-link>
      </div>
    </section>
  </div>

  <footer class="footer">
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>
</template>

<style>
/* ── HERO ── */
.hero-inicio {
  background: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)),
              url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80') center/cover no-repeat;
  min-height: 260px;
  display: flex;
  align-items: center;
  padding: 3rem 2rem;
  color: #fff;
}

.hero-saludo {
  font-size: 1rem;
  opacity: .9;
  margin-bottom: .4rem;
  letter-spacing: .3px;
}

.hero-content { max-width: 560px; }
.hero-content h1 { font-family:'Nunito',sans-serif; font-weight:900; font-size:1.9rem; margin-bottom:.65rem; }
.hero-content p { font-size:.95rem; opacity:.9; margin-bottom:1.4rem; line-height:1.6; }
.hero-btns { display:flex; gap:.75rem; flex-wrap:wrap; }

/* ── ACCESOS RÁPIDOS ── */
.accesos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: .25rem;
}

.acceso-card {
  border-radius: 14px;
  padding: 1.25rem 1rem;
  text-align: center;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  font-weight: 700;
  font-size: .85rem;
  transition: transform .2s, box-shadow .2s;
  border: 1.5px solid transparent;
}

.acceso-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,.1); }

.acceso-purple { background:#f5f3ff; color:#7c3aed; border-color:#ddd6fe; }
.acceso-green  { background:#f0fdf4; color:#15803d; border-color:#bbf7d0; }
.acceso-orange { background:#fff7ed; color:#c2410c; border-color:#fed7aa; }
.acceso-blue   { background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; }

.acceso-icon { font-size: 1.8rem; }
.acceso-label { font-size: .8rem; line-height: 1.2; }

/* ── PRÓXIMA CITA CARD ── */
.proxima-cita-card { margin-top: .5rem; }

.cita-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  border-radius: 10px;
  padding: .9rem 1rem;
  margin-bottom: .75rem;
}

.cita-fecha-grande {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  color: #fff;
  text-transform: capitalize;
}

.cita-detalle-row {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .875rem;
  color: var(--text-secondary);
  padding: .3rem 0;
  border-bottom: 1px solid var(--border);
}
.cita-detalle-row:last-child { border-bottom: none; }
.cita-detalle-row svg { color: var(--purple); flex-shrink: 0; }

/* ── VACUNAS PENDIENTES ── */
.vac-pendiente-row {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .6rem 0;
  border-bottom: 1px solid var(--border);
}
.vac-pendiente-row:last-of-type { border-bottom: none; }

.vac-pendiente-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── MASCOTAS MINI ── */
.mascota-mini-row {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .55rem 0;
  border-bottom: 1px solid var(--border);
}
.mascota-mini-row:last-of-type { border-bottom: none; }

.mascota-mini-avatar {
  font-size: 1.6rem;
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── CONTACTO ── */
.whatsapp-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  background: #25d366;
  color: #fff;
  font-weight: 700;
  font-size: .9rem;
  border-radius: 8px;
  padding: .65rem;
  text-decoration: none;
  margin-bottom: .75rem;
  transition: opacity .2s;
}
.whatsapp-btn:hover { opacity: .88; }

.contacto-row {
  font-size: .82rem;
  color: var(--muted);
  padding: .3rem 0;
  border-bottom: 1px solid var(--border);
}
.contacto-row:last-child { border-bottom: none; }

/* ── EMPTY STATES ── */
.resumen-empty {
  text-align: center;
  padding: 1.25rem .5rem;
  color: var(--muted);
  font-size: .88rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
}

/* ── FEATURE CARDS (no logueado) ── */
.feature-card { text-align:center; padding:2rem 1.5rem; }
.feature-icon { width:60px; height:60px; border-radius:14px; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; }
.feature-icon.blue   { background:#eff6ff; }
.feature-icon.green  { background:#f0fdf4; }
.feature-icon.purple { background:#f5f3ff; }
.feature-card h3 { font-family:'Nunito',sans-serif; font-weight:800; font-size:1rem; margin-bottom:.5rem; }
.feature-card p  { font-size:.85rem; color:var(--text-secondary); line-height:1.6; }

/* ── CTA ── */
.cta-section { background:var(--purple); color:#fff; text-align:center; padding:3rem 1.5rem; }
.cta-section h2 { font-family:'Nunito',sans-serif; font-weight:900; font-size:1.5rem; margin-bottom:.5rem; }
.cta-section p { opacity:.9; margin-bottom:1.5rem; font-size:.95rem; }
.cta-btns { display:flex; gap:.75rem; justify-content:center; flex-wrap:wrap; }

/* ── USUARIO NAVBAR ── */
.usuario-nombre { color: white; font-weight:600; margin-right:1rem; font-size:.95rem; }
.btn-logout { background-color:#dc3545; border:1px solid #dc3545; }
.btn-logout:hover { background-color:#c82333; border-color:#c82333; }

@media (max-width: 768px) {
  .accesos-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
