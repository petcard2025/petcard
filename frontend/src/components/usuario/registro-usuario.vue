<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive, computed } from 'vue'
import { usuariosAPI, clientesAPI } from '../../api.js'
import {
  DOMINIOS_CORREO, soloLetras, soloTelefono, reglasContrasena,
  validarNombrePersona, validarCorreo, validarTelefono, validarContrasena, validarDireccion
} from '../../utils/validators.js'

const router = useRouter()

const formData = reactive({
  nombre: '',
  apellido: '',
  direccion: '',
  correo: '',
  telefono: '',
  contrasena: '',
  confirm: '',
  terminos: false
})

const errors = reactive({
  nombre: '',
  apellido: '',
  direccion: '',
  correo: '',
  telefono: '',
  contrasena: '',
  confirm: '',
  terminos: ''
})

const successMessage = ref('')
const isLoading = ref(false)

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  successMessage.value = ''
}

// ── Filtros en vivo: lo que no se permite ni aparece en el campo ──
const onNombre = (e) => {
  formData.nombre = e.target.value = soloLetras(e.target.value)
  errors.nombre = ''
}
const onApellido = (e) => {
  formData.apellido = e.target.value = soloLetras(e.target.value)
  errors.apellido = ''
}
const onTelefono = (e) => {
  formData.telefono = e.target.value = soloTelefono(e.target.value)
  errors.telefono = ''
}

// ── Correo con sugerencias de dominio al escribir @ ──
const mostrarSugerencias = ref(false)
const indiceSugerencia = ref(-1)

const sugerencias = computed(() => {
  const c = formData.correo
  const pos = c.indexOf('@')
  if (pos === -1) return []
  const usuario = c.slice(0, pos)
  const parcial = c.slice(pos + 1).toLowerCase()
  if (!usuario || parcial.includes('@')) return []
  return DOMINIOS_CORREO
    .filter(d => d.startsWith(parcial) && d !== parcial)
    .map(d => `${usuario}@${d}`)
})

const onCorreo = (e) => {
  formData.correo = e.target.value = e.target.value.replace(/\s/g, '')
  errors.correo = ''
  mostrarSugerencias.value = true
  indiceSugerencia.value = -1
}

const elegirSugerencia = (valor) => {
  formData.correo = valor
  mostrarSugerencias.value = false
  indiceSugerencia.value = -1
}

const onCorreoKeydown = (e) => {
  if (!mostrarSugerencias.value || !sugerencias.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    indiceSugerencia.value = (indiceSugerencia.value + 1) % sugerencias.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    indiceSugerencia.value = (indiceSugerencia.value - 1 + sugerencias.value.length) % sugerencias.value.length
  } else if (e.key === 'Enter' && indiceSugerencia.value >= 0) {
    e.preventDefault()
    elegirSugerencia(sugerencias.value[indiceSugerencia.value])
  } else if (e.key === 'Escape') {
    mostrarSugerencias.value = false
  }
}

// El blur se retrasa un instante para que alcance a registrarse el clic en una sugerencia
const cerrarSugerencias = () => setTimeout(() => { mostrarSugerencias.value = false }, 150)

// ── Contraseña: checklist en vivo ──
const reglas = computed(() => reglasContrasena(formData.contrasena))

const handleRegistro = async () => {
  clearErrors()

  errors.nombre = validarNombrePersona(formData.nombre, 'nombre')
  errors.apellido = validarNombrePersona(formData.apellido, 'apellido')
  errors.direccion = validarDireccion(formData.direccion)
  errors.correo = validarCorreo(formData.correo)
  errors.telefono = validarTelefono(formData.telefono)
  errors.contrasena = validarContrasena(formData.contrasena)
  if (formData.contrasena !== formData.confirm) errors.confirm = 'Las contraseñas no coinciden.'
  if (!formData.terminos) errors.terminos = 'Debes aceptar los términos y condiciones.'

  if (Object.values(errors).some(Boolean)) return

  isLoading.value = true

  try {
    const data = await usuariosAPI.crear({
      Nombre: formData.nombre.trim(),
      Apellido: formData.apellido.trim(),
      Direccion: formData.direccion.trim(),
      Correo: formData.correo.trim(),
      Telefono: formData.telefono,
      Contrasena: formData.contrasena,
      Rol: 'cliente'
    })

    if (data.ID_usuario) {
      try {
        await clientesAPI.crear({ Direccion: formData.direccion.trim(), ID_usuario: data.ID_usuario })
      } catch (clienteError) {
        console.warn('No se pudo crear el cliente automáticamente:', clienteError)
      }

      successMessage.value = '¡Cuenta creada exitosamente! Redirigiendo...'
      localStorage.setItem('petcard_usuario_actual', JSON.stringify(data))

      setTimeout(() => {
        router.push('/inicio')
      }, 1800)
    } else {
      errors.correo = data.error || 'Error al crear la cuenta, intenta de nuevo.'
    }
  } catch (error) {
    errors.correo = error.message || 'Error al conectar con el servidor'
    console.error('🔴 Error:', error)
  } finally {
    isLoading.value = false
  }
}

const irAlLogin = () => {
  router.push('/login-usuario')
}

const irAlInicio = () => {
  router.push('/inicio')
}
</script>

<template>
<nav class="navbar">
  <a href="javascript:void(0)" @click="irAlInicio" class="nav-logo">PETCARD</a>
</nav>

<main class="auth-container">
  <div class="auth-left">
    <h1>Bienvenido a PetCard</h1>
    <p>Registra tu cuenta y comienza a cuidar a tus mascotas de la mejor manera.</p>
    <img src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=500" alt="Mascota feliz" class="hero-image">
  </div>

  <div class="auth-right">
    <div class="auth-card card">

      <h2 class="auth-title">Crear Cuenta</h2>

      <div class="success-banner" v-if="successMessage">{{ successMessage }}</div>

      <div class="form-row">
        <div class="form-group">
          <label>Nombre</label>
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input type="text" class="form-control" :value="formData.nombre" @input="onNombre"
                   maxlength="50" autocomplete="given-name" placeholder="Tu nombre">
          </div>
          <div class="error" v-if="errors.nombre">{{ errors.nombre }}</div>
        </div>

        <div class="form-group">
          <label>Apellido</label>
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input type="text" class="form-control" :value="formData.apellido" @input="onApellido"
                   maxlength="50" autocomplete="family-name" placeholder="Tu apellido">
          </div>
          <div class="error" v-if="errors.apellido">{{ errors.apellido }}</div>
        </div>
      </div>

      <div class="form-group">
        <label>Dirección de la casa</label>
        <div class="input-group">
          <i class="fas fa-home"></i>
          <input type="text" class="form-control" v-model="formData.direccion"
                 maxlength="255" autocomplete="street-address" placeholder="Ej. Calle 10 # 5-20, Soacha"
                 @input="errors.direccion = ''">
        </div>
        <div class="error" v-if="errors.direccion">{{ errors.direccion }}</div>
      </div>

      <div class="form-group">
        <label>Correo</label>
        <div class="input-group email-wrap">
          <i class="fas fa-envelope"></i>
          <input type="text" inputmode="email" class="form-control" :value="formData.correo"
                 @input="onCorreo" @keydown="onCorreoKeydown" @focus="mostrarSugerencias = true" @blur="cerrarSugerencias"
                 autocomplete="off" placeholder="correo@ejemplo.com">
          <ul class="sugerencias" v-if="mostrarSugerencias && sugerencias.length">
            <li v-for="(sug, i) in sugerencias" :key="sug"
                :class="{ activa: i === indiceSugerencia }"
                @mousedown.prevent="elegirSugerencia(sug)">{{ sug }}</li>
          </ul>
        </div>
        <div class="error" v-if="errors.correo">{{ errors.correo }}</div>
      </div>

      <div class="form-group">
        <label>Teléfono</label>
        <div class="input-group">
          <i class="fas fa-phone"></i>
          <input type="tel" inputmode="numeric" class="form-control" :value="formData.telefono" @input="onTelefono"
                 maxlength="10" autocomplete="tel-national" placeholder="3001234567">
        </div>
        <div class="hint" v-if="formData.telefono && formData.telefono.length < 10">{{ formData.telefono.length }}/10 números</div>
        <div class="error" v-if="errors.telefono">{{ errors.telefono }}</div>
      </div>

      <div class="form-group">
        <label>Contraseña</label>
        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input type="password" class="form-control" v-model="formData.contrasena"
                 autocomplete="new-password" placeholder="Crea una contraseña segura"
                 @input="errors.contrasena = ''">
        </div>
        <ul class="reglas">
          <li v-for="r in reglas" :key="r.texto" :class="{ ok: r.ok }">{{ r.ok ? '✓' : '○' }} {{ r.texto }}</li>
        </ul>
        <div class="error" v-if="errors.contrasena">{{ errors.contrasena }}</div>
      </div>

      <div class="form-group">
        <label>Confirmar contraseña</label>
        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input type="password" class="form-control" v-model="formData.confirm"
                 autocomplete="new-password" placeholder="Repite tu contraseña"
                 @input="errors.confirm = ''">
        </div>
        <div class="error" v-if="errors.confirm">{{ errors.confirm }}</div>
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="formData.terminos">
          Acepto términos y condiciones
        </label>
        <div class="error" v-if="errors.terminos">{{ errors.terminos }}</div>
      </div>

      <button class="btn btn-primary btn-full" @click="handleRegistro" :disabled="isLoading">
        {{ isLoading ? 'Registrando...' : 'Crear Cuenta' }}
      </button>

      <p class="auth-footer">
        ¿Ya tienes cuenta? <a href="javascript:void(0)" @click="irAlLogin">Iniciar sesión</a>
      </p>

    </div>
  </div>
</main>
</template>

<style>
/* ============================================================
   registro-usuario.css
   Estilos específicos de la pantalla de Registro de Usuario
   ============================================================ */

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
}

/* ── Navbar ── */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-logo {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.nav-logo:hover {
  opacity: 0.8;
}

/* ── Contenedor principal ── */
.auth-container {
  display: flex;
  min-height: calc(100vh - 60px);
  background: white;
}

/* ── Lado izquierdo ── */
.auth-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.auth-left h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.auth-left p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-image {
  width: 100%;
  max-width: 400px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* ── Lado derecho ── */
.auth-right {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.08);
  padding: 2rem;
  border: none;
}

/* ── Títulos ── */
.auth-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* ── Grupos de formulario ── */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.input-group {
  position: relative;
}

.input-group i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  font-size: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
  background: white;
  color: #333;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 0.5rem;
  cursor: pointer;
  width: 16px;
  height: 16px;
}

/* ── Error messages ── */
.error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.success-banner {
  background: #d4edda;
  color: #155724;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #c3e6cb;
  font-size: 0.9rem;
}

/* ── Botón ── */
.btn {
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-full {
  width: 100%;
}

/* ── Footer del formulario ── */
.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #777;
}

.auth-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* ── Card ── */
.card {
  background: white;
  border: none;
  border-radius: 8px;
}


/* ── Nombre y apellido en una fila ── */
.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
  min-width: 0;
}

/* ── Sugerencias de correo ── */
.email-wrap {
  position: relative;
}

.sugerencias {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  margin: 4px 0 0;
  padding: 0.25rem 0;
  list-style: none;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.sugerencias li {
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #333;
}

.sugerencias li:hover,
.sugerencias li.activa {
  background: rgba(102, 126, 234, 0.12);
  color: #4c5bd4;
}

/* ── Ayudas bajo los campos ── */
.hint {
  color: #888;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.reglas {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  font-size: 0.8rem;
  color: #999;
}

.reglas li.ok {
  color: #27ae60;
}

@media (max-width: 480px) {
  .form-row { flex-direction: column; gap: 0; }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }

  .auth-left {
    min-height: 300px;
  }

  .auth-left h1 {
    font-size: 1.8rem;
  }

  .hero-image {
    max-width: 300px;
  }

  .auth-card {
    padding: 1.5rem;
  }
}
</style>