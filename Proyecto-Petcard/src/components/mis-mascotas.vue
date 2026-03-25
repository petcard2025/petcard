<template>
  <div class="page-container">
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
    <button class="btn-auth" @click="alert('Login no configurado aún')">Iniciar sesión</button>
    <button class="btn-auth" @click="alert('Registro no configurado aún')">Registrarse</button>
  </div>
</nav>

    <!-- Grid de mascotas -->
    <div class="mascotas-grid">
      <div
        v-for="pet in pets"
        :key="pet.id"
        class="mascota-card card"
        style="cursor:pointer"
        @click.self="openDetail(pet)"
      >
        <div class="mascota-top">
          <div class="mascota-avatar" style="background:#fef3c7;">{{ pet.avatar || '🐶' }}</div>
          <div class="mascota-info">
            <div class="mascota-nombre">{{ pet.nombre }}</div>
            <div class="mascota-tipo">{{ pet.tipo }}</div>
          </div>
          <div class="mascota-actions">
            <button class="btn-icon" title="Editar" @click.stop="openEditForm(pet)">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon" title="Eliminar" @click.stop="deletePet(pet.id)">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="mascota-datos" @click="openDetail(pet)">
          <div class="dato-item">Peso: <strong>{{ pet.peso }}</strong></div>
          <div class="dato-item">Color: <strong>{{ pet.color }}</strong></div>
          <div class="dato-item">Última visita: <strong>{{ pet.ultima }}</strong></div>
        </div>
        <div class="microchip-tag" @click="openDetail(pet)">Microchip: {{ pet.microchip }}</div>

        <div class="mascota-btns">
          <button class="btn btn-secondary btn-sm" @click.stop="openVaccineEditor(pet)">Vacunas</button>
          <button class="btn btn-primary btn-sm" @click.stop="goToCita(pet.id)">Cita</button>
        </div>
      </div>
    </div>

    <!-- Botón agregar -->
    <button id="btn-agregar-mascota" class="btn btn-primary" @click="openAddForm">
      Agregar mascota
    </button>

    <!-- ── MODAL: detalle ── -->
    <div v-if="detailPet" class="modal-overlay" @click.self="detailPet = null">
      <div class="modal-box" style="width:520px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;">
          <h2 style="margin:0">{{ detailPet.nombre }}</h2>
          <div style="display:flex;gap:.5rem">
            <button class="btn btn-outline-primary" @click="printDetail">Imprimir</button>
            <button class="btn btn-primary" @click="downloadPdf(detailPet)">Descargar PDF</button>
            <button class="btn btn-outline-primary" @click="detailPet = null">Cerrar</button>
          </div>
        </div>
        <div style="display:flex;gap:1rem;">
          <div style="flex:1">
            <div v-for="(label, key) in detailFields" :key="key" style="margin-bottom:.5rem;">
              <div style="font-weight:700;margin-bottom:.25rem">{{ label }}</div>
              <div>{{ detailPet[key] }}</div>
            </div>
          </div>
          <div style="width:140px;text-align:center;">
            <div style="font-size:48px">{{ detailPet.avatar || '🐶' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL: agregar / editar ── -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-box" style="width:420px;">
        <h3 style="margin-top:0;margin-bottom:1rem;">{{ isEditing ? 'Editar Mascota' : 'Agregar Mascota' }}</h3>

        <!-- Avatar selector -->
        <label style="display:block;font-weight:700;margin-bottom:.5rem;">Avatar</label>
        <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:.5rem;margin-bottom:1rem;">
          <button
            v-for="emoji in avatarOptions"
            :key="emoji"
            type="button"
            :style="{
              padding:'.5rem',
              border: formData.avatar === emoji ? '2px solid #3b82f6' : '2px solid #ddd',
              background: formData.avatar === emoji ? '#f0f9ff' : 'transparent',
              borderRadius:'6px',
              fontSize:'1.5rem',
              cursor:'pointer'
            }"
            @click="formData.avatar = emoji"
          >{{ emoji }}</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:.75rem;">
          <input class="form-control" placeholder="Nombre"       v-model="formData.nombre" />
          <select class="form-control" v-model="formData.tipo">
            <option disabled value="">Tipo / Raza</option>
            <option>Perro</option>
            <option>Gato</option>
            <option>Loro</option>
            <option>Conejo</option>
            <option>Hamster</option>
            <option>Canario</option>
            <option>Pez</option>
          </select>
          <input class="form-control" placeholder="Peso"         v-model="formData.peso" />
          <input class="form-control" placeholder="Color"        v-model="formData.color" />
          <input class="form-control" type="date"                v-model="formData.ultima" />
          <input class="form-control" placeholder="Microchip"    v-model="formData.microchip" />
        </div>

        <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem;">
          <button class="btn btn-outline-primary" @click="showForm = false">Cancelar</button>
          <button class="btn btn-primary" @click="savePet">{{ isEditing ? 'Guardar' : 'Agregar' }}</button>
        </div>
      </div>
    </div>

    <!-- ── MODAL: vacunas ── -->
    <div v-if="vacPet" class="modal-overlay" @click.self="vacPet = null">
      <div class="modal-box" style="width:720px;max-height:90vh;overflow:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;">
          <h3 style="margin:0">Vacunas — {{ vacPet.nombre }}</h3>
          <button class="btn btn-outline-primary" @click="vacPet = null">Cerrar</button>
        </div>

        <!-- Lista de vacunas -->
        <div v-if="!vacPet.vacunas || vacPet.vacunas.length === 0" style="color:var(--muted)">
          No hay vacunas registradas.
        </div>
        <table v-else style="width:100%;border-collapse:collapse;font-size:.875rem;">
          <thead>
            <tr>
              <th>Estado</th><th>Vacuna</th><th>Programada</th><th>Aplicada</th>
              <th>Lote</th><th>Observaciones</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(v, idx) in vacPet.vacunas" :key="idx">
              <td>{{ v.estado === 'aplicada' ? '✓' : v.estado === 'atrasada' ? '✖' : '⚠' }}</td>
              <td><input class="form-control" v-model="v.nombre" /></td>
              <td><input class="form-control" type="date" v-model="v.fechaProgramada" /></td>
              <td><input class="form-control" type="date" v-model="v.fechaAplicada" @change="recalcEstado(v)" /></td>
              <td><input class="form-control" v-model="v.lote" /></td>
              <td><input class="form-control" v-model="v.observaciones" /></td>
              <td style="white-space:nowrap;display:flex;gap:.25rem;">
                <button class="btn btn-primary btn-sm" @click="saveVac(idx)">Guardar</button>
                <button class="btn btn-outline-primary btn-sm" @click="toggleVac(idx)">
                  {{ v.estado === 'aplicada' ? 'Desmarcar' : 'Marcar aplicada' }}
                </button>
                <button class="btn btn-outline-danger btn-sm" @click="deleteVac(idx)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        <!-- Agregar vacuna -->
        <div style="display:flex;gap:.5rem;align-items:center;margin-top:.5rem;flex-wrap:wrap;">
          <input class="form-control" placeholder="Vacuna (ej. Antirrábica)" v-model="newVac.nombre" style="flex:1;min-width:160px;" />
          <input class="form-control" type="date" v-model="newVac.fechaProgramada" style="max-width:150px;" />
          <input class="form-control" type="date" v-model="newVac.fechaAplicada" style="max-width:150px;" />
          <input class="form-control" placeholder="Lote" v-model="newVac.lote" style="max-width:120px;" />
          <button class="btn btn-primary" @click="addVac">Agregar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ── Constantes ──────────────────────────────────────────────
const STORAGE_KEY = 'pc_pets_v1'

const avatarOptions = [
  '🐶', '🐱', '🦜', '🐰', '🐹', '🐢', '🐠'
]

const detailFields = {
  tipo: 'Tipo',
  peso: 'Peso',
  color: 'Color',
  ultima: 'Última visita',
  microchip: 'Microchip'
}

// ── Estado reactivo ─────────────────────────────────────────
const pets = ref(loadPets())

// Modal detalle
const detailPet = ref(null)

// Modal formulario
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const formData = reactive({
  nombre: '', tipo: '', peso: '', color: '',
  ultima: '', microchip: '', avatar: '🐶'
})

// Modal vacunas
const vacPet = ref(null)
const newVac = reactive({ nombre: '', fechaProgramada: '', fechaAplicada: '', lote: '' })

// ── LocalStorage ────────────────────────────────────────────
function loadPets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function savePets(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  pets.value = [...list]
}

function getPetById(id) {
  return pets.value.find(p => p.id === id)
}

// ── CRUD mascotas ────────────────────────────────────────────
function openAddForm() {
  isEditing.value = false
  editingId.value = null
  Object.assign(formData, { nombre:'', tipo:'', peso:'', color:'', ultima:'', microchip:'', avatar:'🐶' })
  showForm.value = true
}

function openEditForm(pet) {
  isEditing.value = true
  editingId.value = pet.id
  Object.assign(formData, { ...pet })
  showForm.value = true
}

function savePet() {
  if (!formData.nombre.trim()) {
    alert('Nombre es requerido')
    return
  }

  const list = loadPets()

  if (isEditing.value) {
    const idx = list.findIndex(p => p.id === editingId.value)
    if (idx > -1) {
      list[idx] = { ...list[idx], ...formData }
      savePets(list)
    }
  } else {
    list.push({ id: 'p_' + Date.now(), vacunas: [], ...formData })
    savePets(list)
  }

  showForm.value = false
}

function deletePet(id) {
  if (!confirm('¿Eliminar esta mascota?')) return
  savePets(loadPets().filter(p => p.id !== id))
}

// ── Detalle / navegación ─────────────────────────────────────
function openDetail(pet) {
  detailPet.value = { ...pet }
}

function goToCita(id) {
  router.push({ path: '/citas', query: { mascota: id } })
}

// ── Vacunas ──────────────────────────────────────────────────
function openVaccineEditor(pet) {
  // Cargamos desde storage para tener los datos más actualizados
  const fresh = getPetById(pet.id)
  vacPet.value = fresh ? reactive({ ...fresh, vacunas: [...(fresh.vacunas || [])] }) : null
  Object.assign(newVac, { nombre:'', fechaProgramada:'', fechaAplicada:'', lote:'' })
}

function calcEstado(v) {
  if (v.fechaAplicada) return 'aplicada'
  if (v.fechaProgramada && new Date(v.fechaProgramada) < new Date()) return 'atrasada'
  return 'proxima'
}

function recalcEstado(v) {
  v.estado = calcEstado(v)
}

function saveVac(idx) {
  recalcEstado(vacPet.value.vacunas[idx])
  persistVacunas()
}

function toggleVac(idx) {
  const v = vacPet.value.vacunas[idx]
  if (v.estado === 'aplicada') {
    v.estado = 'proxima'
  } else {
    v.estado = 'aplicada'
    if (!v.fechaAplicada) v.fechaAplicada = new Date().toISOString().slice(0, 10)
  }
  persistVacunas()
}

function deleteVac(idx) {
  if (!confirm('¿Eliminar vacuna?')) return
  vacPet.value.vacunas.splice(idx, 1)
  persistVacunas()
}

function addVac() {
  if (!newVac.nombre.trim()) {
    alert('Nombre de vacuna requerido')
    return
  }
  if (!vacPet.value.vacunas) vacPet.value.vacunas = []
  vacPet.value.vacunas.push({
    nombre: newVac.nombre,
    fechaProgramada: newVac.fechaProgramada,
    fechaAplicada: newVac.fechaAplicada,
    lote: newVac.lote,
    observaciones: '',
    estado: calcEstado(newVac)
  })
  Object.assign(newVac, { nombre:'', fechaProgramada:'', fechaAplicada:'', lote:'' })
  persistVacunas()
}

function persistVacunas() {
  const list = loadPets()
  const idx = list.findIndex(p => p.id === vacPet.value.id)
  if (idx > -1) {
    list[idx] = { ...list[idx], vacunas: vacPet.value.vacunas }
    savePets(list)
  }
}

// ── Imprimir / PDF ───────────────────────────────────────────
function printDetail() {
  if (!detailPet.value) return
  const w = window.open('', '_blank')
  if (!w) { alert('El navegador bloqueó la ventana de impresión.'); return }
  const pet = detailPet.value
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${pet.nombre}</title></head><body>
    <h1>${pet.nombre}</h1>
    <p>Tipo: ${pet.tipo}</p><p>Peso: ${pet.peso}</p><p>Color: ${pet.color}</p>
    <p>Última visita: ${pet.ultima}</p><p>Microchip: ${pet.microchip}</p>
  </body></html>`)
  w.document.close()
  setTimeout(() => w.print(), 300)
}

async function downloadPdf(pet) {
  try {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    let y = 40
    doc.setFontSize(18); doc.text(pet.nombre || 'Mascota', 40, y); y += 28
    doc.setFontSize(12)
    doc.text('Tipo: '          + (pet.tipo    || ''), 40, y); y += 18
    doc.text('Peso: '          + (pet.peso    || ''), 40, y); y += 18
    doc.text('Color: '         + (pet.color   || ''), 40, y); y += 18
    doc.text('Última visita: ' + (pet.ultima  || ''), 40, y); y += 18
    doc.text('Microchip: '     + (pet.microchip || ''), 40, y)
    doc.save((pet.nombre || 'mascota') + '.pdf')
  } catch (err) {
    console.error(err)
    alert('No se pudo generar el PDF. Usa Imprimir para guardar como PDF.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-box {
  max-width: 95%;
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}
.mascota-top {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-bottom: .5rem;
}
.mascota-actions {
  margin-left: auto;
  display: flex;
  gap: .25rem;
}
.mascota-datos {
  display: flex;
  flex-direction: column;
  gap: .25rem;
  font-size: .875rem;
  margin-bottom: .5rem;
}
.mascota-btns {
  display: flex;
  gap: .5rem;
  margin-top: .75rem;
}
table th, table td {
  padding: .3rem .4rem;
  vertical-align: middle;
}

.page-container {
  max-width: 1160px;
  margin: 1.5rem auto;
  padding: 0 1rem;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-links li a {
  text-decoration: none;
  color: #334155;
  font-weight: 600;
  padding: .4rem .6rem;
  border-radius: 8px;
}

.nav-links li a.active,
.nav-links li a:hover {
  color: #1d4ed8;
  background: #eff6ff;
}

.auth-section {
  display: flex;
  gap: .5rem;
}

.btn-auth, .btn {
  cursor: pointer;
  border: 1px solid #3b82f6;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  padding: .55rem .95rem;
  font-weight: 600;
  transition: all .2s ease;
}

.btn-auth:hover, .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(59,130,246,0.2);
}

.btn-outline-primary {
  background: white;
  color: #1d4ed8;
  border: 1px solid #1d4ed8;
}

.btn-outline-primary:hover {
  background: #eff6ff;
}

.btn-secondary {
  background: #64748b;
  border-color: #64748b;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-sm {
  font-size: .8rem;
  padding: .4rem .7rem;
}

.mascotas-grid {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:1rem;
  margin-bottom: 1.2rem;
}

.mascota-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.06);
  transition: transform .2s ease, box-shadow .2s ease;
}

.mascota-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.15);
}

.mascota-top {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-bottom: .8rem;
}

.mascota-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #fef3c7;
}

.mascota-info {
  display: flex;
  flex-direction: column;
  gap: .15rem;
}

.mascota-nombre {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.mascota-tipo {
  color: #64748b;
  font-size: .85rem;
}

.mascota-actions {
  margin-left: auto;
  display: flex;
  gap: .25rem;
}

.btn-icon {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #334155;
}

.btn-icon:hover {
  background: #f1f5f9;
}

.microchip-tag {
  margin: .6rem 0;
  color: #334155;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  padding: .4rem .6rem;
  border-radius: 8px;
  font-size: .85rem;
}

.mascota-btns {
  display: flex;
  gap: .5rem;
  margin-top: .75rem;
}

#btn-agregar-mascota {
  margin-top: 1rem;
  width: 250px;
}

.modal-box {
  max-width: 95%;
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.25);
}

.form-control {
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: .55rem .7rem;
  background: white;
  color: #0f172a;
  width: 100%;
}

.form-control:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .15);
}
</style>