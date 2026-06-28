<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion, irALogin, irARegistro } = useAuth()
const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:3001/api'

const mascotas = ref([])
const selectedId = ref('')
const clienteActual = ref(null)
const plan = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const selectedTab = ref('plan')
const nuevaComida = ref({ nombre: '', hora: '', cal: '' })
const nuevoPlan = ref({
  ID_servicio: 1,
  Tipo_dieta: '',
  Frecuencia: '',
  Alergias: '',
  Horario: '',
  Calorias: '',
  Suplementos: '',
  Comidas: '',
  Fecha_inicio: '',
  Fecha_fin: '',
  Observaciones: '',
  Diagnostico: '',
  Revision_nutricional: ''
})
const isEditingPlan = ref(false)

const selectedPet = computed(() => mascotas.value.find(p => p.ID_mascota === selectedId.value) || null)
const planLabel = computed(() => plan.value?.Tipo_dieta ? `Plan: ${plan.value.Tipo_dieta}` : 'Plan actual')
const planItems = computed(() => {
  if (!plan.value || !plan.value.Comidas) return []
  return String(plan.value.Comidas)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
})

const calorias = computed(() => plan.value?.Calorias ?? '—')
const frecuencia = computed(() => plan.value?.Frecuencia ?? '—')
const tipoDieta = computed(() => plan.value?.Tipo_dieta ?? '—')
const suplementos = computed(() => plan.value?.Suplementos ?? '—')
const alergias = computed(() => plan.value?.Alergias ?? 'Ninguna')
const observaciones = computed(() => plan.value?.Observaciones ?? 'Sin observaciones adicionales')
const diagnostico = computed(() => plan.value?.Diagnostico ?? 'No disponible')
const periodo = computed(() => plan.value ? `${plan.value.Fecha_inicio || '—'} — ${plan.value.Fecha_fin || '—'}` : '—')
const petPeso = computed(() => selectedPet.value ? `${selectedPet.value.Peso || '—'} kg` : '—')
const petEdad = computed(() => {
  if (!selectedPet.value?.Fecha_nacimiento) return '—'
  const year = new Date(selectedPet.value.Fecha_nacimiento).getFullYear()
  return `${Math.max(0, new Date().getFullYear() - year)} años`
})
const petRaza = computed(() => selectedPet.value ? selectedPet.value.Raza || selectedPet.value.Especie || '—' : '—')
const petActividad = computed(() => plan.value?.Frecuencia || 'Moderada')

function formatoFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function resetNuevoPlan() {
  nuevoPlan.value = {
    ID_servicio: 1,
    Tipo_dieta: '',
    Frecuencia: '',
    Alergias: '',
    Horario: '',
    Calorias: '',
    Suplementos: '',
    Comidas: '',
    Fecha_inicio: '',
    Fecha_fin: '',
    Observaciones: '',
    Diagnostico: '',
    Revision_nutricional: ''
  }
}

function iniciarEdicionPlan() {
  if (!plan.value) return
  nuevoPlan.value = { ...plan.value }
  isEditingPlan.value = true
}

function cancelarEdicion() {
  resetNuevoPlan()
  isEditingPlan.value = false
}

async function fetchJson(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('petcard_token')
    const response = await fetch(`${API_BASE}${endpoint}`, {
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}) 
      },
      ...options
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || `Error ${response.status}`)
    return data
  } catch (error) {
    console.error('Error en fetch:', error)
    throw error
  }
}
async function cargarCliente() {
  if (!usuarioLogueado.value?.ID_usuario) {
    clienteActual.value = null
    return
  }
  try {
    const clientes = await fetchJson(`/clientes/usuario/${usuarioLogueado.value.ID_usuario}`)
    clienteActual.value = clientes[0] || null
  } catch (error) {
    console.error('Error al cargar cliente:', error)
    errorMessage.value = 'No se pudo cargar la información del cliente.'
    clienteActual.value = null
  }
}

async function crearClienteSiNoExiste() {
  if (!usuarioLogueado.value?.ID_usuario) return null
  try {
    const cliente = await fetchJson('/clientes', {
      method: 'POST',
      body: JSON.stringify({ ID_usuario: usuarioLogueado.value.ID_usuario, Direccion: '' })
    })
    return cliente
  } catch (error) {
    console.error('Error al crear cliente:', error)
    return null
  }
}

async function cargarMascotas() {
  if (!clienteActual.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const mascotasCliente = await fetchJson(`/mascotas/cliente/${clienteActual.value.ID_cliente}`)
    mascotas.value = mascotasCliente
    selectedId.value = mascotasCliente[0]?.ID_mascota || ''
    if (selectedId.value) await cargarPlan(selectedId.value)
  } catch (error) {
    console.error('Error al cargar mascotas:', error)
    errorMessage.value = 'Error al cargar mascotas: ' + error.message
  } finally {
    isLoading.value = false
  }
}

async function cargarPlan(idMascota) {
  if (!idMascota) {
    plan.value = null
    return
  }
  isLoading.value = true
  errorMessage.value = ''
  try {
    const planes = await fetchJson(`/alimentacion/mascota/${idMascota}`)
    plan.value = planes[0] || null
  } catch (error) {
    console.error('Error al cargar plan de alimentación:', error)
    errorMessage.value = 'No se pudo cargar el plan de alimentación: ' + error.message
    plan.value = null
  } finally {
    isLoading.value = false
  }
}

async function guardarPlan() {
  if (!selectedId.value) {
    errorMessage.value = 'Selecciona una mascota primero.'
    return
  }

  if (!nuevoPlan.value.Tipo_dieta || !nuevoPlan.value.Frecuencia || !nuevoPlan.value.Horario || !nuevoPlan.value.Calorias || !nuevoPlan.value.Comidas || !nuevoPlan.value.Fecha_inicio || !nuevoPlan.value.Fecha_fin) {
    errorMessage.value = 'Completa los campos obligatorios del plan antes de guardarlo.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const payload = {
      ID_mascota: selectedId.value,
      ID_servicio: nuevoPlan.value.ID_servicio,
      Tipo_dieta: nuevoPlan.value.Tipo_dieta,
      Frecuencia: nuevoPlan.value.Frecuencia,
      Alergias: nuevoPlan.value.Alergias,
      Horario: nuevoPlan.value.Horario,
      Calorias: Number(nuevoPlan.value.Calorias) || 0,
      Suplementos: nuevoPlan.value.Suplementos,
      Comidas: nuevoPlan.value.Comidas,
      Fecha_inicio: nuevoPlan.value.Fecha_inicio,
      Fecha_fin: nuevoPlan.value.Fecha_fin,
      Observaciones: nuevoPlan.value.Observaciones,
      Diagnostico: nuevoPlan.value.Diagnostico,
      Revision_nutricional: nuevoPlan.value.Revision_nutricional
    }

    if (isEditingPlan.value && plan.value) {
      // Editar plan existente
      await fetchJson(`/alimentacion/${plan.value.ID_planAlimentacion}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      plan.value = { ...payload, ID_planAlimentacion: plan.value.ID_planAlimentacion }
      isEditingPlan.value = false
    } else {
      // Crear nuevo plan
      const response = await fetchJson('/alimentacion', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      plan.value = { ...payload, ID_planAlimentacion: response.ID_planAlimentacion }
    }
    resetNuevoPlan()
  } catch (error) {
    console.error('Error al guardar plan de alimentación:', error)
    errorMessage.value = 'No se pudo guardar el plan de alimentación en la base de datos.'
  } finally {
    isLoading.value = false
  }
}

async function actualizarPlan(updatedPlan) {
  if (!updatedPlan?.ID_planAlimentacion) {
    errorMessage.value = 'No hay plan para actualizar.'
    return
  }
  isLoading.value = true
  errorMessage.value = ''
  try {
    await fetchJson(`/alimentacion/${updatedPlan.ID_planAlimentacion}`, {
      method: 'PUT',
      body: JSON.stringify({
        Tipo_dieta: updatedPlan.Tipo_dieta,
        Frecuencia: updatedPlan.Frecuencia,
        Alergias: updatedPlan.Alergias,
        Horario: updatedPlan.Horario,
        Calorias: updatedPlan.Calorias,
        Suplementos: updatedPlan.Suplementos,
        Comidas: updatedPlan.Comidas,
        Fecha_inicio: updatedPlan.Fecha_inicio,
        Fecha_fin: updatedPlan.Fecha_fin,
        Observaciones: updatedPlan.Observaciones,
        Diagnostico: updatedPlan.Diagnostico,
        Revision_nutricional: updatedPlan.Revision_nutricional
      })
    })
    plan.value = { ...updatedPlan }
  } catch (error) {
    console.error('Error al actualizar plan:', error)
    errorMessage.value = 'No se pudo guardar el plan en la base de datos.'
  } finally {
    isLoading.value = false
  }
}

async function agregarComida() {
  if (!selectedId.value) {
    errorMessage.value = 'Selecciona una mascota primero.'
    return
  }

  if (!nuevaComida.value.nombre || !nuevaComida.value.hora || !nuevaComida.value.cal) {
    errorMessage.value = 'Completa nombre, hora y calorías para agregar la comida.'
    return
  }

  if (!plan.value) {
    errorMessage.value = 'Primero crea un plan de alimentación completo antes de agregar comidas.'
    return
  }

  const actualComidas = planItems.value.slice()
  actualComidas.push(`${nuevaComida.value.nombre} ${nuevaComida.value.hora} ${nuevaComida.value.cal} cal`)

  await actualizarPlan({
    ...plan.value,
    Comidas: actualComidas.join(', ')
  })

  nuevaComida.value = { nombre: '', hora: '', cal: '' }
}

function cambiarTab(tab) {
  selectedTab.value = tab
}

async function initData() {
  errorMessage.value = ''

  if (!usuarioLogueado.value) {
    errorMessage.value = 'Debes iniciar sesión para ver esta sección.'
    return
  }

  await cargarCliente()

  if (!clienteActual.value) {
    clienteActual.value = await crearClienteSiNoExiste()
  }

  await cargarMascotas()
}

watch(usuarioLogueado, async (valor) => {
  if (valor) await initData()
})

watch(selectedId, async (valor) => {
  if (valor) await cargarPlan(valor)
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
  await initData()
})
</script>

<template>

     <nav class="navbar">
    <router-link to="/alimentacion" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas">Citas</router-link></li>
      <li><router-link to="/alimentacion" class="active">Alimentación</router-link></li>
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

  <div class="page-wrapper">
    <div v-if="!isAuthenticated" class="card" style="margin:1.5rem; padding:1.5rem; text-align:center;">
      <h2 style="margin-bottom:1rem;">Necesitas iniciar sesión</h2>
      <p style="margin-bottom:1rem; color:var(--muted);">Inicia sesión para ver tus mascotas y planes de alimentación guardados.</p>
      <button class="btn btn-primary" @click="irALogin">Iniciar sesión</button>
    </div>
    <div v-else class="two-col">

      <!-- PANEL IZQUIERDO -->
      <div>
        <!-- Selector mascota -->
        <div class="card" style="margin-bottom:1.25rem;">
          <div class="card-title" style="color:var(--orange);">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            Seleccionar Mascota
            <span style="margin-left:auto; color:var(--purple); font-weight:700; font-size:.85rem;">{{ planLabel }}</span>
          </div>
          <p style="font-size:.85rem; color:var(--muted); margin-bottom:.75rem;">Elige tu mascota para ver el plan nutricional</p>
          <select class="form-control" v-model="selectedId" style="max-width:220px;">
            <option disabled value="">{{ mascotas.length ? 'Elige una mascota' : 'No hay mascotas registradas' }}</option>
            <option v-for="pet in mascotas" :key="pet.ID_mascota" :value="pet.ID_mascota">
              {{ pet.Nombre }} – {{ pet.Especie || pet.Raza || 'Mascota' }}
            </option>
          </select>
          <div v-if="errorMessage" style="margin-top:.75rem; color:#dc2626; font-size:.9rem;">{{ errorMessage }}</div>
          <div v-if="isLoading" style="margin-top:.75rem; color:#2563eb; font-size:.9rem;">Cargando datos...</div>
        </div>

        <!-- Tabs -->
        <div class="card">
          <div class="tabs" id="tabs">
            <button class="tab" :class="{ active: selectedTab === 'plan' }" @click="cambiarTab('plan')">Plan Nutricional</button>
            <button class="tab" :class="{ active: selectedTab === 'historial' }" @click="cambiarTab('historial')">Historial de Cambios</button>
            <button class="tab" :class="{ active: selectedTab === 'alternativas' }" @click="cambiarTab('alternativas')">Alternativas Recomendadas</button>
          </div>

          <!-- TAB PLAN NUTRICIONAL -->
          <div id="plan-content" v-show="selectedTab === 'plan'">
            <div v-if="!plan" class="card" style="margin-bottom:1rem; padding:1rem; background:#fff5f0; border:1px solid #fde2e2;">
              <h4 style="margin:0 0 .5rem; color:#b91c1c;">Crea tu plan de alimentación desde cero</h4>
              <p style="margin:0 0 1rem; color:#7f1d1d;">Completa todos los campos para guardar el plan en la base de datos.</p>

              <div class="form-group" style="margin-bottom:.75rem;">
                <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Tipo de dieta</label>
                <input type="text" class="form-control" v-model="nuevoPlan.Tipo_dieta" placeholder="Balanceada, especial digestiva, etc." style="font-size:.85rem;" />
              </div>
              <div class="form-group" style="margin-bottom:.75rem;">
                <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Frecuencia</label>
                <input type="text" class="form-control" v-model="nuevoPlan.Frecuencia" placeholder="2 veces al día" style="font-size:.85rem;" />
              </div>
              <div class="form-row" style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:.75rem;">
                <div style="flex:1; min-width:180px;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Horario</label>
                  <input type="text" class="form-control" v-model="nuevoPlan.Horario" placeholder="8am - 6pm" style="font-size:.85rem;" />
                </div>
                <div style="flex:1; min-width:180px;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Calorías</label>
                  <input type="number" class="form-control" v-model="nuevoPlan.Calorias" placeholder="1200" style="font-size:.85rem;" />
                </div>
              </div>
              <div class="form-group" style="margin-bottom:.75rem;">
                <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Alergias</label>
                <input type="text" class="form-control" v-model="nuevoPlan.Alergias" placeholder="Ninguna" style="font-size:.85rem;" />
              </div>
              <div class="form-group" style="margin-bottom:.75rem;">
                <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Suplementos</label>
                <input type="text" class="form-control" v-model="nuevoPlan.Suplementos" placeholder="Vitaminas" style="font-size:.85rem;" />
              </div>
              <div class="form-group" style="margin-bottom:.75rem;">
                <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Comidas</label>
                <textarea class="form-control" v-model="nuevoPlan.Comidas" placeholder="Desayuno 8:00 400 cal, Almuerzo 1:00 500 cal" style="font-size:.85rem; min-height:90px;"></textarea>
              </div>
              <div class="form-row" style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:.75rem;">
                <div style="flex:1; min-width:180px;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Fecha inicio</label>
                  <input type="date" class="form-control" v-model="nuevoPlan.Fecha_inicio" style="font-size:.85rem;" />
                </div>
                <div style="flex:1; min-width:180px;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Fecha fin</label>
                  <input type="date" class="form-control" v-model="nuevoPlan.Fecha_fin" style="font-size:.85rem;" />
                </div>
              </div>
              <div class="form-group" style="margin-bottom:.75rem;">
                <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Diagnóstico nutricional</label>
                <textarea class="form-control" v-model="nuevoPlan.Diagnostico" placeholder="Breve diagnóstico nutricional" style="font-size:.85rem; min-height:70px;"></textarea>
              </div>
              <div class="form-group" style="margin-bottom:.75rem;">
                <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Observaciones</label>
                <textarea class="form-control" v-model="nuevoPlan.Observaciones" placeholder="Observaciones adicionales" style="font-size:.85rem; min-height:70px;"></textarea>
              </div>
              <div class="form-group" style="margin-bottom:.75rem;">
                <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Revisión nutricional</label>
                <textarea class="form-control" v-model="nuevoPlan.Revision_nutricional" placeholder="Revisión o seguimiento" style="font-size:.85rem; min-height:70px;"></textarea>
              </div>
              <button class="btn btn-primary" @click="guardarPlan">Guardar plan completo</button>
            </div>
            <div v-else>
              <div v-if="isEditingPlan" class="card" style="margin-bottom:1rem; padding:1rem; background:#f0f9ff; border:1px solid #bae6fd;">
                <h4 style="margin:0 0 .5rem; color:#0369a1;">Editar plan de alimentación</h4>
                <p style="margin:0 0 1rem; color:#0c4a6e;">Modifica los campos y guarda los cambios en la base de datos.</p>

                <div class="form-group" style="margin-bottom:.75rem;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Tipo de dieta</label>
                  <input type="text" class="form-control" v-model="nuevoPlan.Tipo_dieta" placeholder="Balanceada, especial digestiva, etc." style="font-size:.85rem;" />
                </div>
                <div class="form-group" style="margin-bottom:.75rem;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Frecuencia</label>
                  <input type="text" class="form-control" v-model="nuevoPlan.Frecuencia" placeholder="2 veces al día" style="font-size:.85rem;" />
                </div>
                <div class="form-row" style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:.75rem;">
                  <div style="flex:1; min-width:180px;">
                    <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Horario</label>
                    <input type="text" class="form-control" v-model="nuevoPlan.Horario" placeholder="8am - 6pm" style="font-size:.85rem;" />
                  </div>
                  <div style="flex:1; min-width:180px;">
                    <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Calorías</label>
                    <input type="number" class="form-control" v-model="nuevoPlan.Calorias" placeholder="1200" style="font-size:.85rem;" />
                  </div>
                </div>
                <div class="form-group" style="margin-bottom:.75rem;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Alergias</label>
                  <input type="text" class="form-control" v-model="nuevoPlan.Alergias" placeholder="Ninguna" style="font-size:.85rem;" />
                </div>
                <div class="form-group" style="margin-bottom:.75rem;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Suplementos</label>
                  <input type="text" class="form-control" v-model="nuevoPlan.Suplementos" placeholder="Vitaminas" style="font-size:.85rem;" />
                </div>
                <div class="form-group" style="margin-bottom:.75rem;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Comidas</label>
                  <textarea class="form-control" v-model="nuevoPlan.Comidas" placeholder="Desayuno 8:00 400 cal, Almuerzo 1:00 500 cal" style="font-size:.85rem; min-height:90px;"></textarea>
                </div>
                <div class="form-row" style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:.75rem;">
                  <div style="flex:1; min-width:180px;">
                    <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Fecha inicio</label>
                    <input type="date" class="form-control" v-model="nuevoPlan.Fecha_inicio" style="font-size:.85rem;" />
                  </div>
                  <div style="flex:1; min-width:180px;">
                    <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Fecha fin</label>
                    <input type="date" class="form-control" v-model="nuevoPlan.Fecha_fin" style="font-size:.85rem;" />
                  </div>
                </div>
                <div class="form-group" style="margin-bottom:.75rem;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Diagnóstico nutricional</label>
                  <textarea class="form-control" v-model="nuevoPlan.Diagnostico" placeholder="Breve diagnóstico nutricional" style="font-size:.85rem; min-height:70px;"></textarea>
                </div>
                <div class="form-group" style="margin-bottom:.75rem;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Observaciones</label>
                  <textarea class="form-control" v-model="nuevoPlan.Observaciones" placeholder="Observaciones adicionales" style="font-size:.85rem; min-height:70px;"></textarea>
                </div>
                <div class="form-group" style="margin-bottom:.75rem;">
                  <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Revisión nutricional</label>
                  <textarea class="form-control" v-model="nuevoPlan.Revision_nutricional" placeholder="Revisión o seguimiento" style="font-size:.85rem; min-height:70px;"></textarea>
                </div>
                <div style="display:flex; gap:.5rem;">
                  <button class="btn btn-primary" @click="guardarPlan">Guardar cambios</button>
                  <button class="btn btn-secondary" @click="cancelarEdicion">Cancelar</button>
                </div>
              </div>

              <div v-else>
                <!-- Stats -->
                <div class="stats-row">
                <div class="stat-box orange">
                  <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5z"/></svg>
                  <div class="stat-value">{{ calorias }}</div>
                  <div class="stat-label" style="color:var(--orange);">Calorías Diarias</div>
                </div>
                <div class="stat-box blue">
                  <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                  <div class="stat-value">{{ planItems.length || '—' }}</div>
                  <div class="stat-label" style="color:var(--purple);">Comidas en Plan</div>
                </div>
                <div class="stat-box green">
                  <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <div class="stat-value">{{ frecuencia }}</div>
                  <div class="stat-label" style="color:var(--green);">Frecuencia</div>
                </div>
              </div>
            </div>

          <!-- Alimento recomendado -->
          <div class="alimento-rec">
            <div>
              <div class="alimento-nombre">Plan de dieta: {{ tipoDieta }}</div>
              <div class="alimento-detalle">Horario: {{ plan && plan.Horario ? plan.Horario : 'No definido' }}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:.75rem; color:var(--muted);">Suplementos:</div>
              <div style="font-weight:700; font-size:.85rem;">{{ suplementos }}</div>
            </div>
          </div>

          <!-- Formulario para agregar comidas -->
          <div style="background:#f9fafb; padding:1rem; border-radius:6px; margin-bottom:1.5rem;">
            <h5 style="font-family:'Nunito',sans-serif; font-weight:700; margin:0 0 .75rem; color:var(--dark);">Agregar nuevo horario</h5>
            <div class="form-group" style="margin-bottom:.5rem;">
              <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Nombre</label>
              <input type="text" class="form-control" v-model="nuevaComida.nombre" placeholder="Ej: Desayuno" style="font-size:.85rem;"/>
            </div>
            <div class="form-group" style="margin-bottom:.5rem;">
              <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Hora</label>
              <input type="time" class="form-control" v-model="nuevaComida.hora" style="font-size:.85rem;"/>
            </div>
            <div class="form-group" style="margin-bottom:.75rem;">
              <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Calorías</label>
              <input type="text" class="form-control" v-model="nuevaComida.cal" placeholder="Ej: 400" style="font-size:.85rem;"/>
            </div>
            <button class="btn btn-primary btn-full" @click.prevent="agregarComida">Agregar Comida</button>
          </div>

          <!-- Horarios -->
          <h4 style="font-family:'Nunito',sans-serif; font-weight:800; margin:1.25rem 0 .75rem;">Horarios de Alimentación</h4>
          <div class="comidas-list">
            <template v-if="planItems.length > 0">
              <div class="comida-item" v-for="(item, idx) in planItems" :key="idx">
                <div :class="['comida-icon', idx === 1 ? 'green-ic' : 'gray']">
                  <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div class="comida-name">{{ item }}</div>
                  <div class="comida-hora">{{ plan && plan.Horario ? plan.Horario : 'Horario no definido' }}</div>
                </div>
                <div class="comida-cal">{{ calorias }} cal</div>
                <div class="comida-status" :class="item === planItems[1] ? 'green-check' : ''">
                  <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
              </div>
            </template>
            <div v-else style="color:var(--muted)">No hay plan de comidas registrado para esta mascota.</div>
          </div>

          <!-- Suplementos -->
          <h4 style="font-family:'Nunito',sans-serif; font-weight:800; margin:1.25rem 0 .75rem;">Suplementos</h4>
          <div class="cards-grid-2">
            <div class="suplem-card">
              <div class="suplem-header"><span>{{ suplementos }}</span><span class="badge badge-green">Activo</span></div>
              <p>{{ plan && plan.Frecuencia ? plan.Frecuencia : 'Revisión de frecuencia pendiente' }}</p>
            </div>
            <div class="suplem-card">
              <div class="suplem-header"><span>Plan nutricional</span><span class="badge badge-blue">Registro</span></div>
              <p>{{ periodo }}</p>
            </div>
          </div>

          <!-- Restricciones -->
          <h4 style="font-family:'Nunito',sans-serif; font-weight:800; margin:1.25rem 0 .75rem;">Restricciones Alimentarias</h4>
          <div class="restriccion-item red-border">
            <svg width="16" height="16" fill="none" stroke="#dc2626" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div><div class="rest-nombre" style="color:#dc2626;">{{ alergias }}</div><div class="rest-tipo">Restricción</div></div>
            <span class="badge badge-red" style="margin-left:auto;">Importante</span>
          </div>
          <div class="restriccion-item yellow-border">
            <svg width="16" height="16" fill="none" stroke="#ca8a04" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div><div class="rest-nombre" style="color:#ca8a04;">Diagnóstico</div><div class="rest-tipo">{{ diagnostico }}</div></div>
            <span class="badge badge-yellow" style="margin-left:auto;">Revisión</span>
          </div>

          <!-- Observaciones -->
          <h4 style="font-family:'Nunito',sans-serif; font-weight:800; margin:1.25rem 0 .75rem;">Observaciones</h4>
          <div class="observaciones">{{ observaciones }}</div>
          </div>
          </div><!-- Cierre plan-content -->

          <!-- TAB HISTORIAL DE CAMBIOS -->
          <div id="historial-content" v-show="selectedTab === 'historial'">
            <h5 style="font-family:'Nunito',sans-serif; font-weight:700; margin:0 0 1rem; color:var(--dark);">Cambios Realizados en la Alimentación</h5>
            <div id="historial-list" style="max-height:500px; overflow-y:auto;">
              <div style="color:var(--muted); padding:1rem; text-align:center;">No hay cambios registrados aún.</div>
            </div>
          </div><!-- Cierre historial-content -->

          <!-- TAB PLANES DE ALIMENTACIÓN RECOMENDADOS -->
          <div id="alternativas-content" v-show="selectedTab === 'alternativas'">
            <h5 style="font-family:'Nunito',sans-serif; font-weight:700; margin:0 0 .25rem; color:var(--dark);">Planes de Alimentación Veterinarios</h5>
            <p style="font-size:.82rem; color:var(--muted); margin-bottom:1.25rem;">Planes recomendados por veterinarias especializadas. Solo el administrador puede asignar uno a tu mascota.</p>

            <!-- Plan 1: Mantenimiento Estándar -->
            <div class="plan-rec-card" style="border-left:4px solid var(--green);">
              <div class="plan-rec-header">
                <div>
                  <div class="plan-rec-title">🥗 Plan Mantenimiento Estándar</div>
                  <div class="plan-rec-vet">Clínica Veterinaria del Valle · Adultos sanos</div>
                </div>
                <span class="badge badge-green">Más popular</span>
              </div>
              <div class="plan-rec-grid">
                <div class="plan-rec-item"><span>Tipo de dieta</span><strong>Balanceada completa</strong></div>
                <div class="plan-rec-item"><span>Frecuencia</span><strong>2 veces al día</strong></div>
                <div class="plan-rec-item"><span>Horario</span><strong>7:00 AM · 6:00 PM</strong></div>
                <div class="plan-rec-item"><span>Calorías/día</span><strong>1 200 kcal</strong></div>
                <div class="plan-rec-item"><span>Proteína</span><strong>26 – 30 %</strong></div>
                <div class="plan-rec-item"><span>Grasas</span><strong>12 – 16 %</strong></div>
              </div>
              <div class="plan-rec-comidas">
                <span class="comida-badge">🌅 Desayuno · Croquetas Premium 180 g + agua</span>
                <span class="comida-badge">🌆 Cena · Croquetas Premium 180 g + vegetal cocido</span>
              </div>
              <div class="plan-rec-obs">Sin restricciones específicas. Ideal para mascotas adultas sin patologías. Revisión nutricional cada 6 meses.</div>
            </div>

            <!-- Plan 2: Control de Peso -->
            <div class="plan-rec-card" style="border-left:4px solid var(--orange);">
              <div class="plan-rec-header">
                <div>
                  <div class="plan-rec-title">⚖️ Plan Control de Peso</div>
                  <div class="plan-rec-vet">Centro Veterinario Bienestar Animal · Mascotas con sobrepeso</div>
                </div>
                <span class="badge badge-yellow">Especializado</span>
              </div>
              <div class="plan-rec-grid">
                <div class="plan-rec-item"><span>Tipo de dieta</span><strong>Hipocalórica controlada</strong></div>
                <div class="plan-rec-item"><span>Frecuencia</span><strong>3 veces al día</strong></div>
                <div class="plan-rec-item"><span>Horario</span><strong>8:00 AM · 1:00 PM · 7:00 PM</strong></div>
                <div class="plan-rec-item"><span>Calorías/día</span><strong>800 – 950 kcal</strong></div>
                <div class="plan-rec-item"><span>Proteína</span><strong>30 – 35 %</strong></div>
                <div class="plan-rec-item"><span>Grasas</span><strong>6 – 10 %</strong></div>
              </div>
              <div class="plan-rec-comidas">
                <span class="comida-badge">🌅 Mañana · Alimento Light 120 g + zanahoria rallada</span>
                <span class="comida-badge">☀️ Mediodía · Pollo hervido 80 g sin piel</span>
                <span class="comida-badge">🌆 Noche · Alimento Light 120 g + caldo sin sal</span>
              </div>
              <div class="plan-rec-obs">Sin golosinas entre comidas. Ejercicio diario de 30 min recomendado. Pesaje mensual obligatorio.</div>
            </div>

            <!-- Plan 3: Renal / Digestivo -->
            <div class="plan-rec-card" style="border-left:4px solid var(--purple);">
              <div class="plan-rec-header">
                <div>
                  <div class="plan-rec-title">💊 Plan Soporte Renal y Digestivo</div>
                  <div class="plan-rec-vet">Hospital Veterinario San Francisco · Patologías internas</div>
                </div>
                <span class="badge badge-blue">Prescripción médica</span>
              </div>
              <div class="plan-rec-grid">
                <div class="plan-rec-item"><span>Tipo de dieta</span><strong>Terapéutica baja en fósforo</strong></div>
                <div class="plan-rec-item"><span>Frecuencia</span><strong>3 – 4 veces al día</strong></div>
                <div class="plan-rec-item"><span>Horario</span><strong>Cada 6 horas</strong></div>
                <div class="plan-rec-item"><span>Calorías/día</span><strong>900 – 1 100 kcal</strong></div>
                <div class="plan-rec-item"><span>Proteína</span><strong>14 – 18 % (alta calidad)</strong></div>
                <div class="plan-rec-item"><span>Fósforo</span><strong>&lt; 0.5 %</strong></div>
              </div>
              <div class="plan-rec-comidas">
                <span class="comida-badge">Hill's k/d Kidney Care · ración según peso</span>
                <span class="comida-badge">Royal Canin Renal · alternado según tolerancia</span>
              </div>
              <div class="plan-rec-obs">Requiere diagnóstico previo. Evitar proteínas de origen vegetal. Control de BUN y creatinina cada 3 meses.</div>
            </div>

            <!-- Plan 4: Cachorro / Junior -->
            <div class="plan-rec-card" style="border-left:4px solid #f59e0b;">
              <div class="plan-rec-header">
                <div>
                  <div class="plan-rec-title">🐾 Plan Crecimiento (Cachorros / Junior)</div>
                  <div class="plan-rec-vet">Clínica PetLife · Hasta los 12 meses</div>
                </div>
                <span class="badge badge-yellow">Junior</span>
              </div>
              <div class="plan-rec-grid">
                <div class="plan-rec-item"><span>Tipo de dieta</span><strong>Alta energía / hipercalórica</strong></div>
                <div class="plan-rec-item"><span>Frecuencia</span><strong>4 veces al día</strong></div>
                <div class="plan-rec-item"><span>Horario</span><strong>7 AM · 12 PM · 5 PM · 9 PM</strong></div>
                <div class="plan-rec-item"><span>Calorías/día</span><strong>1 500 – 1 800 kcal</strong></div>
                <div class="plan-rec-item"><span>Proteína</span><strong>28 – 32 %</strong></div>
                <div class="plan-rec-item"><span>Calcio</span><strong>1.2 – 1.8 %</strong></div>
              </div>
              <div class="plan-rec-comidas">
                <span class="comida-badge">🌅 Mañana · Puppy food húmedo 100 g + DHA</span>
                <span class="comida-badge">☀️ Mediodía · Croquetas Junior 120 g</span>
                <span class="comida-badge">🌆 Tarde · Croquetas Junior 120 g + calcio</span>
                <span class="comida-badge">🌙 Noche · Puppy food seco 100 g</span>
              </div>
              <div class="plan-rec-obs">Suplementar con omega-3 para desarrollo neurológico. Transición gradual de 7 días al cambiar de alimento.</div>
            </div>

            <!-- Plan 5: Senior -->
            <div class="plan-rec-card" style="border-left:4px solid #6366f1;">
              <div class="plan-rec-header">
                <div>
                  <div class="plan-rec-title">🏥 Plan Geronto (Senior +7 años)</div>
                  <div class="plan-rec-vet">Clínica Veterinaria Oasis · Mascotas mayores</div>
                </div>
                <span class="badge" style="background:#ede9fe; color:#7c3aed;">Senior</span>
              </div>
              <div class="plan-rec-grid">
                <div class="plan-rec-item"><span>Tipo de dieta</span><strong>Baja en sodio, antiinflamatoria</strong></div>
                <div class="plan-rec-item"><span>Frecuencia</span><strong>2 – 3 veces al día</strong></div>
                <div class="plan-rec-item"><span>Horario</span><strong>8:00 AM · 3:00 PM · 8:00 PM</strong></div>
                <div class="plan-rec-item"><span>Calorías/día</span><strong>1 000 – 1 200 kcal</strong></div>
                <div class="plan-rec-item"><span>Proteína</span><strong>22 – 28 %</strong></div>
                <div class="plan-rec-item"><span>Fibra</span><strong>3 – 5 %</strong></div>
              </div>
              <div class="plan-rec-comidas">
                <span class="comida-badge">Hill's Science Diet Senior · según peso</span>
                <span class="comida-badge">Suplemento glucosamina/condroitina · diario</span>
                <span class="comida-badge">Omega-3 · 1 cápsula diaria</span>
              </div>
              <div class="plan-rec-obs">Evitar alimentos procesados con alto sodio. Control geriátrico anual. Agua fresca disponible siempre.</div>
            </div>

            <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:.85rem 1rem; margin-top:.5rem; font-size:.82rem; color:#0c4a6e;">
              <strong>ℹ️ Nota:</strong> Estos planes son de referencia. El plan activo de tu mascota solo puede ser asignado o modificado por el veterinario administrador de PetCard.
            </div>
          </div><!-- Cierre alternativas-content -->
        </div><!-- Cierre card principal -->

      </div>

      <!-- SIDEBAR -->
      <div class="sidebar">

        <!-- Info mascota -->
        <div class="card">
          <div class="card-title" style="color:var(--purple);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            Información de {{ selectedPet ? selectedPet.Nombre : 'Mascota' }}
          </div>
          <div class="info-row"><span>Peso Actual:</span><strong>{{ petPeso }}</strong></div>
          <div class="info-row"><span>Edad:</span><strong>{{ petEdad }}</strong></div>
          <div class="info-row"><span>Raza:</span><strong>{{ petRaza }}</strong></div>
          <div class="info-row"><span>Actividad:</span><strong>{{ petActividad }}</strong></div>
        </div>

        <!-- Próximas Comidas -->
        <div class="card">
          <div class="card-title" style="color:var(--orange);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Próximas Comidas
          </div>
          <div class="proxima-comida">
            <div>
              <div style="font-weight:700; font-size:.875rem;">Comida 1</div>
              <div style="font-size:.78rem; color:var(--muted);">Próxima: 7:00 AM</div>
            </div>
            <span class="badge badge-red">400 cal</span>
          </div>
          <div class="proxima-comida">
            <div>
              <div style="font-weight:700; font-size:.875rem;">Comida 3</div>
              <div style="font-size:.78rem; color:var(--muted);">Próxima: 7:00 PM</div>
            </div>
            <span class="badge badge-red">400 cal</span>
          </div>
          <button class="btn btn-danger btn-full" style="margin-top:.75rem;" id="btn-marcar-comida">Marcar Comida Completada</button>
        </div>

        <!-- Consumo Nutricional -->
        <div class="card">
          <div class="card-title">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
            Consumo Nutricional
          </div>
          <div class="nutriente">
            <div class="nutriente-header"><span>Proteínas</span><strong>45%</strong></div>
            <div class="progress-bar"><div class="progress-fill" style="width:45%;"></div></div>
            <div style="font-size:.75rem; color:var(--muted);">Recomendado: 40-50%</div>
          </div>
          <div class="nutriente">
            <div class="nutriente-header"><span>Grasas</span><strong>20%</strong></div>
            <div class="progress-bar"><div class="progress-fill green" style="width:20%;"></div></div>
            <div style="font-size:.75rem; color:var(--muted);">Recomendado: 15-25%</div>
          </div>
          <div class="nutriente">
            <div class="nutriente-header"><span>Carbohidratos</span><strong>35%</strong></div>
            <div class="progress-bar"><div class="progress-fill" style="width:35%; background:#9ca3af;"></div></div>
            <div style="font-size:.75rem; color:var(--muted);">Recomendado: 30-40%</div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="footer" style="margin-top:2rem;">
    <div class="footer-grid">
      <div class="footer-brand"><span class="nav-logo" style="color:#fff; margin-bottom:.5rem; display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>PetCard</span><p>Comprometidos con brindar toda la atención profesional que tu mascota.</p></div>
      <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li><li><a href="#">Cirugías</a></li><li><a href="#">Emergencias</a></li></ul></div>
      <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p><p>info@petcard.com</p><p>Calle Principal 123, Ciudad</p></div>
      <div class="footer-col"><h4>Horarios</h4><p>Lunes - Viernes: 8:00 AM - 7:00 PM</p><p>Sábados: 9:00 AM - 6:00 PM</p><p>Domingos: 10:00 AM - 4:00 PM</p><p class="footer-emergency">Emergencias 24/7</p></div>
    </div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>

</template>

<style>

/* ── PLANES RECOMENDADOS ── */
.plan-rec-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 1rem 1.1rem;
  margin-bottom: 1.1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}

.plan-rec-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: .75rem;
  gap: .5rem;
}

.plan-rec-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: .95rem;
  color: var(--dark);
  margin-bottom: .15rem;
}

.plan-rec-vet {
  font-size: .75rem;
  color: var(--muted);
}

.plan-rec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: .4rem .75rem;
  margin-bottom: .75rem;
}

.plan-rec-item {
  display: flex;
  flex-direction: column;
  font-size: .8rem;
}

.plan-rec-item span { color: var(--muted); font-size: .72rem; }
.plan-rec-item strong { font-weight: 700; color: var(--dark); }

.plan-rec-comidas {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  margin-bottom: .65rem;
}

.comida-badge {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: .25rem .65rem;
  font-size: .75rem;
  color: var(--text-secondary);
}

.plan-rec-obs {
  font-size: .78rem;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: .55rem;
  line-height: 1.55;
}

.tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
  margin-bottom: 1.25rem;
  gap: .25rem;
}

.tab {
  background: none;
  border: none;
  padding: .6rem 1rem;
  font-size: .85rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color .2s, border-color .2s;
}

.tab.active {
  color: var(--purple);
  border-bottom-color: var(--purple);
}

.tab:hover { color: var(--purple); }

/* ── STATS ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.stat-box {
  border-radius: var(--radius);
  padding: 1.25rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .4rem;
}

.stat-box.orange { background: #fff7ed; color: var(--orange); }
.stat-box.blue   { background: var(--purple-bg); color: var(--purple); }
.stat-box.green  { background: var(--green-bg); color: var(--green); }

.stat-value {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.4rem;
}

.stat-label {
  font-size: .75rem;
  font-weight: 700;
}

/* ── ALIMENTO RECOMENDADO ── */
.alimento-rec {
  background: #eff6ff;
  border-radius: var(--radius-sm);
  border: 1px solid #bfdbfe;
  padding: .85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: .85rem;
}

.alimento-nombre {
  font-weight: 700;
  color: var(--purple);
  margin-bottom: .2rem;
}

.alimento-detalle { color: var(--muted); font-size: .78rem; }

/* ── COMIDAS LIST ── */
.comidas-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin-bottom: 1rem;
}

.comida-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .65rem .85rem;
  border-bottom: 1px solid var(--border);
}

.comida-item:last-child { border-bottom: none; }

.comida-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comida-icon.gray      { background: #f3f4f6; color: var(--muted); }
.comida-icon.green-ic  { background: var(--green-bg); color: var(--green); }

.comida-name {
  font-weight: 700;
  font-size: .875rem;
}

.comida-hora {
  font-size: .78rem;
  color: var(--muted);
}

.comida-cal {
  margin-left: auto;
  font-size: .82rem;
  font-weight: 700;
  color: var(--muted);
}

.comida-status {
  color: var(--muted);
  display: flex;
}

.comida-status.green-check { color: var(--green); }

/* ── SUPLEMENTOS ── */
.suplem-card {
  background: var(--green-bg);
  border: 1px solid #86efac;
  border-radius: var(--radius-sm);
  padding: .75rem;
  font-size: .82rem;
}

.suplem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  margin-bottom: .25rem;
  color: var(--green);
}

/* ── RESTRICCIONES ── */
.restriccion-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .65rem .85rem;
  border-radius: var(--radius-sm);
  margin-bottom: .5rem;
  border-left: 3px solid;
}

.red-border    { background: var(--red-bg);    border-left-color: var(--red); }
.yellow-border { background: var(--yellow-bg); border-left-color: var(--yellow); }

.rest-nombre { font-weight: 700; font-size: .875rem; }
.rest-tipo   { font-size: .75rem; color: var(--muted); }

/* ── OBSERVACIONES ── */
.observaciones {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-sm);
  padding: .85rem;
  font-size: .85rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ── SIDEBAR INFO ── */
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: .875rem;
  padding: .45rem 0;
  border-bottom: 1px solid var(--border);
}

.info-row:last-child { border-bottom: none; }
.info-row span { color: var(--muted); }

/* ── PRÓXIMAS COMIDAS ── */
.proxima-comida {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .6rem 0;
  border-bottom: 1px solid var(--border);
}

.proxima-comida:last-of-type { border-bottom: none; }

/* ── NUTRIENTE ── */
.nutriente {
  margin-bottom: 1rem;
}

.nutriente-header {
  display: flex;
  justify-content: space-between;
  font-size: .85rem;
  margin-bottom: .3rem;
}

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