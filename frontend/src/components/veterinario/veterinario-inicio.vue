<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { API_URL } from '../../api.js'

const { usuarioLogueado, cerrarSesion } = useAuth()
const API = API_URL

// ── Estado ────────────────────────────────────────────────────
const citas = ref([])
const cargando = ref(false)
const error = ref('')

// Fecha de hoy en formato YYYY-MM-DD para comparar con la BD
const hoy = new Date().toISOString().slice(0, 10)

// ── Carga de datos ────────────────────────────────────────────
onMounted(cargarCitas)

async function cargarCitas() {
  cargando.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('petcard_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${API}/citas`, { headers })
    if (!res.ok) throw new Error()
    const todas = await res.json()

    // Filtrar solo las del veterinario logueado (por nombre o ID)
    const idVet = usuarioLogueado.value?.ID_veterinario
    const nombreVet = usuarioLogueado.value?.Nombre

    citas.value = todas.filter(c => {
      if (idVet) return c.ID_veterinario === idVet
      return c.Nombre_veterinario === nombreVet
    })
  } catch {
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

// ── Computed stats ────────────────────────────────────────────
const citasHoy = computed(() =>
  citas.value.filter(c => c.Fecha?.slice(0, 10) === hoy)
)

const citasPendientes = computed(() =>
  citas.value.filter(c => !c.Observaciones && c.Fecha?.slice(0, 10) >= hoy)
)

const citasConfirmadas = computed(() =>
  citas.value.filter(c => !!c.Observaciones)
)

const proximasCitas = computed(() =>
  citas.value
    .filter(c => c.Fecha?.slice(0, 10) >= hoy)
    .sort((a, b) => {
      const da = `${a.Fecha?.slice(0, 10)} ${a.Hora}`
      const db = `${b.Fecha?.slice(0, 10)} ${b.Hora}`
      return da.localeCompare(db)
    })
    .slice(0, 6)
)

function badgeClass(cita) {
  return cita.Observaciones ? 'badge badge-green' : 'badge badge-yellow'
}

function estadoLabel(cita) {
  return cita.Observaciones ? 'Confirmada' : 'Pendiente'
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '-'
  const [y, m, d] = fechaStr.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function esHoy(fechaStr) {
  return fechaStr?.slice(0, 10) === hoy
}

const fechaLarga = computed(() =>
  new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const iniciales = computed(() => {
  const n = usuarioLogueado.value?.Nombre || 'Veterinario'
  return n.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
})
</script>

<template>
  <nav class="navbar">
    <router-link to="/veterinario-inicio" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/>
        <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/>
      </svg>
      PETCARD
    </router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/veterinario-inicio" class="active">Inicio</router-link></li>
      <li><router-link to="/veterinario-citas">Mis Citas</router-link></li>
      <li><router-link to="/veterinario-alimentacion">Alimentación</router-link></li>
    </ul>
    <div class="nav-actions" style="margin-left:auto;">
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <div class="vet-wrapper">

    <!-- ── Banner de bienvenida tipo panel clínico ── -->
    <section class="vet-banner">
      <div class="vet-banner-id">
        <div class="vet-avatar">{{ iniciales }}</div>
        <div>
          <div class="vet-eyebrow">PANEL VETERINARIO</div>
          <h1 class="vet-banner-name">Dr(a). {{ usuarioLogueado?.Nombre || 'Veterinario' }}</h1>
          <p class="vet-banner-date">{{ fechaLarga }}</p>
        </div>
      </div>
      <router-link to="/veterinario-citas" class="btn btn-primary">
        Ver mis citas
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </router-link>
    </section>

    <div v-if="error" class="vet-alert">⚠️ {{ error }}</div>

    <!-- ── Tarjetas de estadísticas con icono ── -->
    <section class="vet-stats">
      <div class="vet-stat-card">
        <div class="vet-stat-icon vet-stat-icon--blue">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/></svg>
        </div>
        <div>
          <div class="vet-stat-value">{{ citasHoy.length }}</div>
          <div class="vet-stat-label">Citas hoy</div>
        </div>
      </div>

      <div class="vet-stat-card">
        <div class="vet-stat-icon vet-stat-icon--yellow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <div class="vet-stat-value">{{ citasPendientes.length }}</div>
          <div class="vet-stat-label">Pendientes</div>
        </div>
      </div>

      <div class="vet-stat-card">
        <div class="vet-stat-icon vet-stat-icon--green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <div class="vet-stat-value">{{ citasConfirmadas.length }}</div>
          <div class="vet-stat-label">Confirmadas</div>
        </div>
      </div>

      <div class="vet-stat-card">
        <div class="vet-stat-icon vet-stat-icon--purple">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke-linecap="round"/></svg>
        </div>
        <div>
          <div class="vet-stat-value">{{ citas.length }}</div>
          <div class="vet-stat-label">Total asignadas</div>
        </div>
      </div>
    </section>

    <!-- ── Próximas citas en formato lista clínica ── -->
    <section class="vet-section">
      <div class="vet-section-head">
        <h2>Próximas citas</h2>
        <router-link to="/veterinario-citas" class="link">Ver todas</router-link>
      </div>

      <div v-if="cargando" class="vet-empty">Cargando citas...</div>
      <div v-else-if="proximasCitas.length === 0" class="vet-empty">No tienes citas próximas asignadas.</div>

      <ul v-else class="vet-timeline">
        <li v-for="cita in proximasCitas" :key="cita.ID_cita" class="vet-timeline-item" :class="{ 'is-today': esHoy(cita.Fecha) }">
          <div class="vet-timeline-date">
            <span class="vet-timeline-day">{{ formatFecha(cita.Fecha).slice(0, 2) }}</span>
            <span class="vet-timeline-month">{{ formatFecha(cita.Fecha).slice(3, 5) }}</span>
          </div>
          <div class="vet-timeline-body">
            <div class="vet-timeline-top">
              <span class="vet-timeline-mascota">{{ cita.Nombre_mascota }}</span>
              <span :class="badgeClass(cita)">{{ estadoLabel(cita) }}</span>
            </div>
            <div class="vet-timeline-meta">{{ cita.Nombre_servicio }} · {{ cita.Hora }} · {{ cita.Nombre_cliente }}</div>
            <div class="vet-timeline-obs" v-if="cita.Observaciones">"{{ cita.Observaciones }}"</div>
          </div>
        </li>
      </ul>
    </section>

    <footer class="footer" style="margin-top:2.5rem;">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="nav-logo" style="color:#fff;display:flex;">PetCard</span>
          <p>Comprometidos con brindar toda la atención profesional.</p>
        </div>
        <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta General</a></li><li><a href="#">Vacunación</a></li></ul></div>
        <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p></div>
        <div class="footer-col"><h4>Horarios</h4><p>Lun - Vie: 8:00 AM - 7:00 PM</p></div>
      </div>
      <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
    </footer>
  </div>
</template>

<style scoped>
.vet-wrapper {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

/* ── Banner ── */
.vet-banner {
  background: linear-gradient(120deg, var(--purple-dark), var(--purple) 60%, var(--purple-light));
  border-radius: var(--radius-lg);
  padding: 1.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  color: var(--white);
  box-shadow: 0 8px 24px rgba(37,99,235,.22);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.vet-banner-id { display: flex; align-items: center; gap: 1rem; }
.vet-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(255,255,255,.18);
  border: 1.5px solid rgba(255,255,255,.35);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.1rem;
  flex-shrink: 0;
}
.vet-eyebrow {
  font-size: .72rem; font-weight: 800; letter-spacing: .08em;
  opacity: .8; margin-bottom: .15rem;
}
.vet-banner-name {
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.4rem;
  margin-bottom: .15rem;
}
.vet-banner-date { font-size: .85rem; opacity: .85; text-transform: capitalize; }
.vet-banner .btn-primary {
  background: var(--white); color: var(--purple-dark);
  font-weight: 800; white-space: nowrap;
}
.vet-banner .btn-primary:hover { background: #f3f4f6; }

.vet-alert {
  background: var(--red-bg); color: var(--red);
  padding: .75rem 1rem; border-radius: var(--radius-sm);
  margin-bottom: 1.25rem; font-size: .9rem;
}

/* ── Stats ── */
.vet-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.vet-stat-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: .9rem;
  transition: box-shadow .2s, transform .2s;
}
.vet-stat-card:hover { box-shadow: var(--card-shadow); transform: translateY(-2px); }
.vet-stat-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.vet-stat-icon--blue   { background: var(--purple-bg); color: var(--purple); }
.vet-stat-icon--yellow { background: var(--yellow-bg); color: var(--yellow); }
.vet-stat-icon--green  { background: var(--green-bg); color: var(--green); }
.vet-stat-icon--purple { background: #ede9fe; color: #6d28d9; }
.vet-stat-value { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.5rem; line-height: 1.1; color: var(--text); }
.vet-stat-label { font-size: .8rem; color: var(--muted); margin-top: .1rem; }

/* ── Sección ── */
.vet-section { margin-bottom: 1rem; }
.vet-section-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.vet-section-head h2 {
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--text);
}
.vet-empty {
  text-align: center; padding: 2.5rem 1rem; color: var(--muted);
  background: var(--white); border: 1px dashed var(--border); border-radius: var(--radius-lg);
}

/* ── Timeline de citas ── */
.vet-timeline { list-style: none; display: flex; flex-direction: column; gap: .65rem; }
.vet-timeline-item {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: .9rem 1.1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: border-color .2s;
}
.vet-timeline-item:hover { border-color: var(--purple-light); }
.vet-timeline-item.is-today { border-left: 3px solid var(--purple); }

.vet-timeline-date {
  flex-shrink: 0;
  width: 48px;
  text-align: center;
  border-right: 1px solid var(--border);
  padding-right: 1rem;
}
.vet-timeline-day { display: block; font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.2rem; color: var(--purple); }
.vet-timeline-month { display: block; font-size: .7rem; color: var(--muted); text-transform: uppercase; }

.vet-timeline-body { flex: 1; min-width: 0; }
.vet-timeline-top { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; margin-bottom: .25rem; }
.vet-timeline-mascota { font-weight: 700; color: var(--text); }
.vet-timeline-meta { font-size: .85rem; color: var(--text-secondary); }
.vet-timeline-obs { font-size: .82rem; color: var(--green); font-style: italic; margin-top: .25rem; }

@media (max-width: 640px) {
  .vet-banner { padding: 1.25rem 1.25rem; }
  .vet-timeline-date { display: none; }
}
</style>