<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { loginAPI, API_URL } from '../../api.js'

const router = useRouter()

const formData = reactive({
  correo: '',
  contrasena: ''
})

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showForgotModal = ref(false)
const forgotEmail = ref('')
const resetToken = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const modalStep = ref('email')
const message = ref('')
const isResetting = ref(false)

const handleLogin = async () => {
  console.log('📝 handleLogin llamado')
  console.log('Datos:', formData)

  errorMessage.value = ''
  successMessage.value = ''

  const correo = formData.correo.trim()
  const contrasena = formData.contrasena

  if (!correo || !contrasena) {
    errorMessage.value = 'Por favor completa todos los campos.'
    console.log('❌ Campos vacíos')
    return
  }

  isLoading.value = true
  console.log('⏳ Iniciando login...')

  try {
    console.log('🔗 Haciendo petición a la API')
    const data = await loginAPI.loginUsuario(correo, contrasena)

    if (data.message === 'Login exitoso') {
      console.log('✅ Login exitoso')

      // 🆕 Guardar usuario y token en localStorage
      localStorage.setItem('petcard_usuario_actual', JSON.stringify(data.usuario))
      if (data.token) {
        localStorage.setItem('petcard_token', data.token)
      }

      // 🆕 Verificar el rol y redirigir al panel correspondiente
      const rol = data.usuario?.Rol?.toLowerCase()

      if (rol === 'administrador' || rol === 'admin') {
        localStorage.setItem('petcard_admin_actual', JSON.stringify(data.usuario))
        successMessage.value = `¡Bienvenido Admin ${data.usuario.Nombre}! Redirigiendo...`
        setTimeout(() => {
          router.push('/admin-inicio')
        }, 1500)
      } else if (rol === 'veterinario') {
        localStorage.setItem('petcard_admin_actual', JSON.stringify(data.usuario))
        successMessage.value = `¡Bienvenido Dr. ${data.usuario.Nombre}! Redirigiendo...`
        setTimeout(() => {
          router.push('/veterinario-inicio')
        }, 1500)
      } else {
        successMessage.value = `¡Bienvenido/a, ${data.usuario.Nombre}!`
        setTimeout(() => {
          router.push('/inicio')
        }, 1500)
      }
    } else {
      errorMessage.value = data.error || 'Credenciales incorrectas'
      console.log('❌ Error:', data.error)
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error al conectar con el servidor'
    console.error('🔴 Error:', error)
  } finally {
    isLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const irARegistro = () => {
  router.push('/registro-usuario')
}

const irAlInicio = () => {
  router.push('/inicio')
}

const irALoginAdmin = () => {
  router.push('/login-admin')
}

const openForgotModal = () => {
  showForgotModal.value = true
  forgotEmail.value = ''
  resetToken.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  modalStep.value = 'email'
  message.value = ''
}

const closeForgotModal = () => {
  showForgotModal.value = false
}

const requestReset = async () => {
  if (!forgotEmail.value.trim()) {
    message.value = 'Ingresa tu correo electrónico'
    return
  }

  message.value = 'Enviando solicitud...'

  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Correo: forgotEmail.value.trim() })
    })
    const data = await response.json()

    if (response.ok) {
      message.value = 'Si tu correo está registrado, recibirás las instrucciones de recuperación en breve.'
      modalStep.value = 'reset'
    } else {
      message.value = data.error || 'Error al solicitar reset'
    }
  } catch (error) {
    message.value = 'Error de conexión'
  }
}

const resetPassword = async () => {
  if (!resetToken.value.trim() || !newPassword.value || !confirmPassword.value) {
    message.value = 'Completa todos los campos'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Las contraseñas no coinciden'
    return
  }

  if (newPassword.value.length < 6) {
    message.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  message.value = 'Reseteando contraseña...'

  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken.value.trim(), nuevaContrasena: newPassword.value })
    })
    const data = await response.json()

    if (response.ok) {
      message.value = 'Contraseña actualizada exitosamente'
      setTimeout(() => {
        closeForgotModal()
      }, 2000)
    } else {
      message.value = data.error || 'Error al resetear contraseña'
    }
  } catch (error) {
    message.value = 'Error de conexión'
  }
}

/* ───────── Efecto 3D parallax para el perrito de bienvenida ───────── */
const petStage = ref(null)
const petTilt = reactive({ x: 0, y: 0 })

const onStageMove = (e) => {
  const el = petStage.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width - 0.5
  const py = (e.clientY - rect.top) / rect.height - 0.5
  petTilt.y = px * 18   // rotateY
  petTilt.x = -py * 14  // rotateX
}

const onStageLeave = () => {
  petTilt.x = 0
  petTilt.y = 0
}
</script>

<template>
  <nav class="navbar">
    <a href="javascript:void(0)" @click="irAlInicio" class="nav-logo">🐾 PETCARD</a>
  </nav>

  <div class="login-wrapper">

    <!-- ───────── Panel izquierdo: escena animada 3D ───────── -->
    <div
      class="hero-side"
      ref="petStage"
      @mousemove="onStageMove"
      @mouseleave="onStageLeave"
    >
      <div class="hero-blob blob-a"></div>
      <div class="hero-blob blob-b"></div>
      <div class="hero-blob blob-c"></div>

      <span class="floatie f1">🐾</span>
      <span class="floatie f2">🐾</span>
      <span class="floatie f3">🦴</span>
      <span class="floatie f4">🐾</span>
      <span class="floatie f5">🐱</span>
      <span class="floatie f6">🦴</span>

      <div
        class="pet-3d"
        :style="{ transform: `rotateX(${petTilt.x}deg) rotateY(${petTilt.y}deg)` }"
      >
        <svg viewBox="0 0 400 400" class="pet-svg">
          <defs>
            <radialGradient id="ground" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
              <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
            </radialGradient>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffd9a8"/>
              <stop offset="100%" stop-color="#f5a94e"/>
            </linearGradient>
            <linearGradient id="earGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e98b3a"/>
              <stop offset="100%" stop-color="#d6772a"/>
            </linearGradient>
          </defs>

          <ellipse class="shadow" cx="200" cy="345" rx="95" ry="16" fill="url(#ground)"/>

          <g class="dog-bob">
            <!-- cola -->
            <path class="tail" d="M 270 235 Q 330 210 320 160" fill="none" stroke="#f5a94e" stroke-width="22" stroke-linecap="round"/>

            <!-- cuerpo -->
            <ellipse cx="195" cy="270" rx="78" ry="60" fill="url(#bodyGrad)"/>

            <!-- patas -->
            <rect x="150" y="305" width="20" height="40" rx="10" fill="#f5a94e"/>
            <rect x="225" y="305" width="20" height="40" rx="10" fill="#e98b3a"/>

            <!-- cabeza -->
            <g class="head-wiggle">
              <ellipse class="ear ear-left" cx="140" cy="150" rx="26" ry="38" fill="url(#earGrad)"/>
              <ellipse class="ear ear-right" cx="252" cy="150" rx="26" ry="38" fill="url(#earGrad)"/>

              <circle cx="196" cy="180" r="75" fill="url(#bodyGrad)"/>

              <!-- hocico -->
              <ellipse cx="196" cy="208" rx="34" ry="26" fill="#fff3e2"/>
              <ellipse cx="196" cy="206" rx="11" ry="8" fill="#3b2a20"/>

              <!-- mejillas -->
              <circle cx="155" cy="205" r="9" fill="#ffb6a8" opacity=".7"/>
              <circle cx="237" cy="205" r="9" fill="#ffb6a8" opacity=".7"/>

              <!-- ojos -->
              <g class="eyes">
                <circle cx="168" cy="168" r="9" fill="#2b2017"/>
                <circle cx="224" cy="168" r="9" fill="#2b2017"/>
                <circle cx="171" cy="165" r="2.6" fill="#fff"/>
                <circle cx="227" cy="165" r="2.6" fill="#fff"/>
              </g>

              <!-- boca -->
              <path d="M 196 214 Q 196 226 182 222" fill="none" stroke="#3b2a20" stroke-width="3" stroke-linecap="round"/>
              <path d="M 196 214 Q 196 226 210 222" fill="none" stroke="#3b2a20" stroke-width="3" stroke-linecap="round"/>
              <path class="tongue" d="M 196 218 q 6 14 0 20 q -6 -6 0 -20" fill="#ff8b9e"/>
            </g>
          </g>
        </svg>
      </div>

      <div class="hero-caption">
        <h2>¡Hola de nuevo! 🐶</h2>
        <p>Tu mascota te extrañó. Entra y sigue cuidando de ella.</p>
      </div>
    </div>

    <!-- ───────── Panel derecho: formulario ───────── -->
    <div class="form-side">
      <div class="login-box">
        <h1>Bienvenido a PetCard</h1>
        <p class="subtitle">Completa los siguientes campos</p>

        <div class="error-msg" v-if="errorMessage">{{ errorMessage }}</div>
        <div class="success-msg" v-if="successMessage">{{ successMessage }}</div>

        <div class="form-group input-wrapper">
          <input type="email" v-model="formData.correo" placeholder="Correo electrónico *" />
          <button class="input-icon" aria-label="Correo electrónico">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </button>
        </div>

        <div class="form-group input-wrapper">
          <input :type="showPassword ? 'text' : 'password'" v-model="formData.contrasena" placeholder="Contraseña *" />
          <button class="input-icon" @click="togglePassword" aria-label="Mostrar contraseña">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <a href="javascript:void(0)" class="forgot-link" @click="openForgotModal">¿Olvidaste tu Contraseña?</a>

        <button class="btn-ingresar" @click="handleLogin" :disabled="isLoading">
          {{ isLoading ? 'Ingresando...' : 'Ingresar' }}
        </button>

        <p class="create-account">¿No tienes cuenta? <a href="javascript:void(0)" @click="irARegistro">Crear cuenta</a></p>

        <p class="admin-access" style="margin-top: 1rem; text-align: center; font-size: 0.9rem;">
          <a href="javascript:void(0)" @click="irALoginAdmin" style="color: #764ba2; font-weight: 600; text-decoration: none;">👨‍💼 Acceso de Administrador</a>
        </p>
      </div>
    </div>
  </div>

  <!-- Modal Forgot Password -->
  <div v-if="showForgotModal" class="modal-overlay" @click="closeForgotModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Recuperar Contraseña</h3>
        <button class="modal-close" @click="closeForgotModal">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="modalStep === 'email'">
          <p>Ingresa tu correo electrónico para recibir instrucciones de recuperación.</p>
          <input type="email" v-model="forgotEmail" placeholder="Correo electrónico" class="form-control" />
          <button class="btn btn-primary" @click="requestReset" style="width: 100%; margin-top: 1rem;">Enviar Código de Recuperación</button>
        </div>
        <div v-else-if="modalStep === 'reset'">
          <p>Ingresa el código de recuperación y tu nueva contraseña.</p>
          <input type="text" v-model="resetToken" placeholder="Código de recuperación" class="form-control" style="margin-bottom: 1rem;" />
          <input type="password" v-model="newPassword" placeholder="Nueva contraseña" class="form-control" style="margin-bottom: 1rem;" />
          <input type="password" v-model="confirmPassword" placeholder="Confirmar nueva contraseña" class="form-control" style="margin-bottom: 1rem;" />
          <button class="btn btn-primary" @click="resetPassword" style="width: 100%;">Resetear Contraseña</button>
        </div>
        <p v-if="message" style="margin-top: 1rem; color: #666; font-size: 0.9rem;">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0b1230;
}

/* ════════════ LAYOUT GENERAL ════════════ */
.login-wrapper {
  flex: 1;
  display: flex;
  min-height: calc(100vh - 56px);
}

/* ════════════ PANEL IZQUIERDO ANIMADO ════════════ */
.hero-side {
  position: relative;
  flex: 1.1;
  min-height: 420px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(125deg, #5b3df0, #8b5cf6 35%, #f5a94e 75%, #ff8a5c 100%);
  background-size: 300% 300%;
  animation: gradientShift 14s ease infinite;
  perspective: 900px;
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(10px);
  opacity: .35;
  background: radial-gradient(circle at 30% 30%, #fff, transparent 70%);
}
.blob-a { width: 260px; height: 260px; top: -60px; left: -60px; animation: floatBlob 9s ease-in-out infinite; }
.blob-b { width: 180px; height: 180px; bottom: -40px; right: -30px; animation: floatBlob 11s ease-in-out infinite reverse; }
.blob-c { width: 130px; height: 130px; bottom: 30%; left: 5%; animation: floatBlob 7s ease-in-out infinite; }

@keyframes floatBlob {
  0%, 100% { transform: translate(0,0) scale(1); }
  50%      { transform: translate(20px, -25px) scale(1.08); }
}

.floatie {
  position: absolute;
  font-size: 1.6rem;
  opacity: .55;
  animation: riseUp linear infinite;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,.2));
}
.f1 { left: 8%;  font-size: 1.4rem; animation-duration: 9s;  animation-delay: 0s; }
.f2 { left: 22%; font-size: 1.1rem; animation-duration: 12s; animation-delay: 1.5s; }
.f3 { left: 40%; font-size: 1.7rem; animation-duration: 10s; animation-delay: 3s; }
.f4 { left: 65%; font-size: 1.2rem; animation-duration: 13s; animation-delay: .5s; }
.f5 { left: 80%; font-size: 1.5rem; animation-duration: 11s; animation-delay: 2.2s; }
.f6 { left: 50%; font-size: 1rem;   animation-duration: 8s;  animation-delay: 4s; }

@keyframes riseUp {
  0%   { bottom: -10%; opacity: 0; transform: translateX(0) rotate(0deg); }
  10%  { opacity: .6; }
  50%  { transform: translateX(15px) rotate(15deg); }
  90%  { opacity: .5; }
  100% { bottom: 105%; opacity: 0; transform: translateX(-10px) rotate(-10deg); }
}

/* ── Perrito 3D interactivo ── */
.pet-3d {
  position: relative;
  width: min(260px, 60%);
  transform-style: preserve-3d;
  transition: transform .15s ease-out;
  animation: floatPet 4.5s ease-in-out infinite;
  filter: drop-shadow(0 18px 18px rgba(0,0,0,.35));
}

@keyframes floatPet {
  0%, 100% { translate: 0 0; }
  50%      { translate: 0 -14px; }
}

.pet-svg { width: 100%; height: auto; display: block; }

.dog-bob { transform-origin: 200px 270px; animation: dogBreathe 3.6s ease-in-out infinite; }
@keyframes dogBreathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.015); }
}

.head-wiggle { transform-origin: 196px 230px; animation: headWiggle 4.5s ease-in-out infinite; }
@keyframes headWiggle {
  0%, 100% { transform: rotate(0deg); }
  25%      { transform: rotate(-3deg); }
  75%      { transform: rotate(3deg); }
}

.ear { transform-origin: top center; animation: earFlop 2.6s ease-in-out infinite; }
.ear-left  { transform-origin: 140px 118px; animation-name: earFlopLeft; }
.ear-right { transform-origin: 252px 118px; animation-name: earFlopRight; }
@keyframes earFlopLeft {
  0%, 100% { transform: rotate(0deg); }
  50%      { transform: rotate(-10deg); }
}
@keyframes earFlopRight {
  0%, 100% { transform: rotate(0deg); }
  50%      { transform: rotate(10deg); }
}

.tail { transform-origin: 270px 235px; animation: wag 0.6s ease-in-out infinite; }
@keyframes wag {
  0%, 100% { transform: rotate(0deg); }
  50%      { transform: rotate(18deg); }
}

.eyes { animation: blink 5s infinite; }
@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95%           { transform: scaleY(0.1); }
}
.eyes circle { transform-box: fill-box; transform-origin: center; }

.tongue { animation: tongueWag 0.6s ease-in-out infinite; transform-origin: top center; transform-box: fill-box; }
@keyframes tongueWag {
  0%, 100% { transform: rotate(0deg); }
  50%      { transform: rotate(6deg); }
}

.shadow { animation: shadowPulse 4.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes shadowPulse {
  0%, 100% { transform: scale(1); opacity: .8; }
  50%      { transform: scale(.85); opacity: .5; }
}

.hero-caption {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  margin-top: 1.5rem;
  padding: 0 2rem;
  text-shadow: 0 2px 10px rgba(0,0,0,.25);
}
.hero-caption h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: .4rem; }
.hero-caption p  { font-size: .95rem; opacity: .92; max-width: 320px; margin: 0 auto; }

/* ════════════ PANEL DERECHO: FORMULARIO ════════════ */
.form-side {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-box {
  width: 100%;
  max-width: 420px;
}

h1 {
  font-size: 2.4rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  line-height: 1.2;
}

.subtitle {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 16px;
  position: relative;
}

select, input[type="text"], input[type="password"], input[type="email"] {
  width: 100%;
  padding: 16px 48px 16px 18px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'DM Sans', sans-serif;
  color: #333;
  background: #fafafa;
  outline: none;
  appearance: none;
  transition: border-color 0.2s;
}

select:focus, input:focus {
  border-color: blue;
  background: #fff;
}

select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 44px;
  cursor: pointer;
}

select option[value=""] { color: #999; }

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  padding-right: 48px;
}

.input-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #0b62e6;
  display: flex;
  align-items: center;
  padding: 4px;
}

.input-icon:hover { color: #0769da; }

.forgot-link {
  display: block;
  text-align: center;
  color: rgb(20, 78, 202);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  margin: 8px 0 24px;
}
.forgot-link:hover { text-decoration: underline; }

.btn-ingresar {
  width: 100%;
  padding: 15px;
  background: linear-gradient(120deg, #0948d1, #5b3df0);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.25s, transform 0.1s;
  letter-spacing: 0.02em;
}

.btn-ingresar:hover {
  background: linear-gradient(120deg, #0c8dd8, #7c5cf5);
  transform: translateY(-1px);
}

.btn-ingresar.active { background: #0a80e0; }

.create-account {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #555;
}

.create-account a {
  color: #116fdb;
  font-weight: 700;
  text-decoration: none;
}
.create-account a:hover { text-decoration: underline; }

.privacy-link:hover { text-decoration: underline; }

/* Error and success messages */
.error-msg {
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border-left: 4px solid #c33;
}

.success-msg {
  background: #efe;
  color: #3c3;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border-left: 4px solid #3c3;
}

/* Navbar */
.navbar {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.nav-logo {
  color: #0948d1;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

/* Placeholder styling */
::placeholder { color: #aaa; }

@media (max-width: 900px) {
  .login-wrapper { flex-direction: column; }
  .hero-side { min-height: 280px; flex: none; padding: 1.5rem 0; }
  .pet-3d { width: 180px; }
  .hero-caption h2 { font-size: 1.3rem; }
  .form-side { padding: 30px 16px; }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin-bottom: 15px;
  color: #666;
}
</style>