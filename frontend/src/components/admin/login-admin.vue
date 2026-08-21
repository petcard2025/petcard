<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { loginAPI, API_URL } from '../../api'

const router = useRouter()

const formData = reactive({
  correo: '',
  contrasena: '',
  recordar: false
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

const handleLogin = async () => {
  console.log("ESTOY EN LOGIN ADMIN")

  errorMessage.value = ''
  successMessage.value = ''


  const correo = formData.correo.trim()
  const contrasena = formData.contrasena

  if (!correo) {
    errorMessage.value = 'Por favor ingresa tu correo electrónico.'
    return
  }
  if (!contrasena) {
    errorMessage.value = 'Por favor ingresa tu contraseña.'
    return
  }

  isLoading.value = true

  try {
    const response = await loginAPI.loginAdmin(correo, contrasena)
    console.log("RESPUESTA:", response)
console.log("ROL:", response.usuario?.Rol)

    if (response && response.token) {
      const rol = response.usuario.Rol?.toLowerCase()

      // Solo admin y veterinario pueden entrar por aquí
      if (rol !== 'administrador' && rol !== 'admin' && rol !== 'veterinario') {
        errorMessage.value = 'Esta cuenta no tiene permisos de acceso al panel.'
        isLoading.value = false
        return
      }

      localStorage.setItem('petcard_usuario_actual', JSON.stringify(response.usuario))
      localStorage.setItem('petcard_admin_actual', JSON.stringify(response.usuario))

      if (formData.recordar) {
        localStorage.setItem('petcard_admin_recordado', JSON.stringify(response.usuario))
      }

      // Redirigir según rol
      if (rol === 'veterinario') {
        successMessage.value = `¡Bienvenido Dr. ${response.usuario.Nombre}! Redirigiendo...`
        setTimeout(() => router.push('/veterinario-inicio'), 1500)
      } else {
        successMessage.value = `¡Bienvenido Admin ${response.usuario.Nombre}! Redirigiendo...`
        setTimeout(() => router.push('/admin-inicio'), 1500)
      }

    } else if (response && response.error) {
      errorMessage.value = response.error
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error al conectar con el servidor. Intenta más tarde.'
  } finally {
    isLoading.value = false
  }
}

const togglePassword = () => { showPassword.value = !showPassword.value }
const irARegistro = () => router.push('/registro-admin')
const irAlInicio = () => router.push('/inicio')

const openForgotModal = () => {
  showForgotModal.value = true
  forgotEmail.value = ''
  resetToken.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  modalStep.value = 'email'
  message.value = ''
}
const closeForgotModal = () => { showForgotModal.value = false }

const requestReset = async () => {
  if (!forgotEmail.value.trim()) { message.value = 'Ingresa tu correo electrónico'; return }
  message.value = 'Enviando solicitud...'
  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Correo: forgotEmail.value.trim() })
    })
    const data = await response.json()
    if (response.ok) {
      message.value = `Token generado: ${data.token}\n\nCopia este token para resetear tu contraseña.`
      modalStep.value = 'reset'
    } else {
      message.value = data.error || 'Error al solicitar reset'
    }
  } catch { message.value = 'Error de conexión' }
}

const resetPassword = async () => {
  if (!resetToken.value.trim() || !newPassword.value || !confirmPassword.value) {
    message.value = 'Completa todos los campos'; return
  }
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Las contraseñas no coinciden'; return
  }
  if (newPassword.value.length < 6) {
    message.value = 'La contraseña debe tener al menos 6 caracteres'; return
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
      setTimeout(() => closeForgotModal(), 2000)
    } else {
      message.value = data.error || 'Error al resetear contraseña'
    }
  } catch { message.value = 'Error de conexión' }
}

/* ───────── Efecto 3D parallax para el gatito de bienvenida ───────── */
const petStage = ref(null)
const petTilt = reactive({ x: 0, y: 0 })

const onStageMove = (e) => {
  const el = petStage.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width - 0.5
  const py = (e.clientY - rect.top) / rect.height - 0.5
  petTilt.y = px * 18
  petTilt.x = -py * 14
}

const onStageLeave = () => {
  petTilt.x = 0
  petTilt.y = 0
}
</script>

<template>
  <nav class="navbar">
    <a href="javascript:void(0)" @click="irAlInicio" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z"
        fill="currentColor" opacity=".15"/>
      </svg>
      PETCARD
    </a>
  </nav>

  <main class="auth-wrapper">

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

      <span class="floatie f1">🩺</span>
      <span class="floatie f2">🐾</span>
      <span class="floatie f3">💉</span>
      <span class="floatie f4">🐾</span>
      <span class="floatie f5">✨</span>
      <span class="floatie f6">🩺</span>

      <div
        class="pet-3d"
        :style="{ transform: `rotateX(${petTilt.x}deg) rotateY(${petTilt.y}deg)` }"
      >
        <svg viewBox="0 0 400 400" class="pet-svg">
          <defs>
            <radialGradient id="groundA" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(0,0,0,0.3)"/>
              <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
            </radialGradient>
            <linearGradient id="catBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#cbd5ff"/>
              <stop offset="100%" stop-color="#7c8cf8"/>
            </linearGradient>
            <linearGradient id="catEar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#5b6ee6"/>
              <stop offset="100%" stop-color="#4a5cd6"/>
            </linearGradient>
          </defs>

          <ellipse class="shadow" cx="200" cy="345" rx="95" ry="16" fill="url(#groundA)"/>

          <g class="dog-bob">
            <!-- cola -->
            <path class="tail" d="M 268 245 Q 335 230 325 165" fill="none" stroke="#7c8cf8" stroke-width="20" stroke-linecap="round"/>

            <!-- cuerpo -->
            <ellipse cx="195" cy="270" rx="76" ry="58" fill="url(#catBody)"/>

            <!-- patas -->
            <rect x="150" y="305" width="18" height="38" rx="9" fill="#7c8cf8"/>
            <rect x="227" y="305" width="18" height="38" rx="9" fill="#6577f0"/>

            <!-- cabeza -->
            <g class="head-wiggle">
              <!-- orejas triangulares de gato -->
              <path class="ear ear-left" d="M 132 130 L 150 95 L 168 138 Z" fill="url(#catEar)"/>
              <path class="ear ear-right" d="M 224 138 L 244 95 L 262 130 Z" fill="url(#catEar)"/>
              <path d="M 138 124 L 150 105 L 160 128 Z" fill="#ffb6c8" opacity=".8"/>
              <path d="M 233 128 L 244 105 L 256 124 Z" fill="#ffb6c8" opacity=".8"/>

              <!-- gorro de veterinario -->
              <rect x="170" y="100" width="52" height="16" rx="4" fill="#fff"/>
              <rect x="190" y="92" width="14" height="14" fill="#fff"/>
              <rect x="184" y="97" width="26" height="6" fill="#22c1a3"/>

              <circle cx="196" cy="180" r="74" fill="url(#catBody)"/>

              <!-- hocico -->
              <ellipse cx="196" cy="206" rx="32" ry="22" fill="#eef1ff"/>
              <path d="M 196 200 L 190 210 L 202 210 Z" fill="#2b2960"/>

              <!-- mejillas -->
              <circle cx="153" cy="200" r="9" fill="#ffb6c8" opacity=".7"/>
              <circle cx="239" cy="200" r="9" fill="#ffb6c8" opacity=".7"/>

              <!-- bigotes -->
              <path d="M 150 200 q -30 -4 -42 2" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
              <path d="M 150 210 q -30 6 -42 12" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
              <path d="M 242 200 q 30 -4 42 2" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
              <path d="M 242 210 q 30 6 42 12" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>

              <!-- ojos -->
              <g class="eyes">
                <ellipse cx="167" cy="168" rx="8" ry="10" fill="#2b2960"/>
                <ellipse cx="225" cy="168" rx="8" ry="10" fill="#2b2960"/>
                <circle cx="170" cy="164" r="2.4" fill="#fff"/>
                <circle cx="228" cy="164" r="2.4" fill="#fff"/>
              </g>

              <!-- boca -->
              <path d="M 196 208 Q 196 220 184 216" fill="none" stroke="#2b2960" stroke-width="3" stroke-linecap="round"/>
              <path d="M 196 208 Q 196 220 208 216" fill="none" stroke="#2b2960" stroke-width="3" stroke-linecap="round"/>
            </g>
          </g>

          <!-- estetoscopio -->
          <path d="M 150 250 Q 196 290 242 250" fill="none" stroke="#22c1a3" stroke-width="6" stroke-linecap="round"/>
          <circle cx="196" cy="288" r="9" fill="#1aa68a"/>
        </svg>
      </div>

      <div class="hero-caption">
        <h2>Panel Administrativo 🩺</h2>
        <p>Acceso exclusivo para el equipo veterinario y administradores de PetCard.</p>
      </div>
    </div>

    <!-- ───────── Panel derecho: formulario ───────── -->
    <div class="form-side">
      <div class="auth-card card">

        <h1 class="auth-title">Iniciar Sesión</h1>
        <p class="auth-sub">
          Ingresa a tu cuenta de PetCard para gestionar el cuidado de tus mascotas
        </p>

        <div class="error-msg" v-if="errorMessage">{{ errorMessage }}</div>
        <div class="success-msg" v-if="successMessage">{{ successMessage }}</div>

        <div class="form-group">
          <label>Correo Electrónico</label>
          <input type="email" class="form-control" v-model="formData.correo"
          placeholder="tu@ejemplo.com"/>
        </div>

        <div class="form-group">
          <label>Contraseña</label>

          <div class="input-wrapper">
            <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="formData.contrasena"
            placeholder="Tu contraseña"/>

            <button type="button" class="input-icon" @click="togglePassword">
              👁
            </button>
          </div>
        </div>

        <div class="remember-row">
          <label class="checkbox-group">
            <input type="checkbox" v-model="formData.recordar"/> Recordarme
          </label>
          <a href="javascript:void(0)" class="link" @click="openForgotModal">¿Olvidaste tu contraseña?</a>
        </div>

        <button class="btn btn-primary btn-full btn-lg" @click="handleLogin" :disabled="isLoading">
          {{ isLoading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>

        <p class="auth-footer-text">
          ¿No tienes una cuenta?
          <a href="javascript:void(0)" @click="irARegistro" class="link">Regístrate aquí</a>
        </p>

        <div class="divider-text">O continúa con</div>

        <div class="social-row">
          <button class="social-btn">Google</button>
          <button class="social-btn">Facebook</button>
        </div>

      </div>
    </div>
  </main>

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

body { background: #0b1230; display: flex; flex-direction: column; min-height: 100vh; }
.auth-wrapper { flex: 1; display: flex; min-height: calc(100vh - 56px); }

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
  background: linear-gradient(125deg, #1a2c8c, #4a5cd6 35%, #22c1a3 80%, #0fb39c 100%);
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
  opacity: .3;
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

/* ── Gatito 3D interactivo ── */
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

.ear { transform-box: fill-box; animation: earTwitch 3s ease-in-out infinite; }
.ear-left  { transform-origin: bottom left; animation-delay: 0s; }
.ear-right { transform-origin: bottom right; animation-delay: .4s; }
@keyframes earTwitch {
  0%, 90%, 100% { transform: rotate(0deg); }
  95%           { transform: rotate(-6deg); }
}

.tail { transform-origin: 268px 245px; animation: wag 0.7s ease-in-out infinite; }
@keyframes wag {
  0%, 100% { transform: rotate(0deg); }
  50%      { transform: rotate(14deg); }
}

.eyes { animation: blink 5s infinite; }
@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95%           { transform: scaleY(0.1); }
}
.eyes ellipse { transform-box: fill-box; transform-origin: center; }

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
.hero-caption h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: .4rem; font-family: 'Nunito', sans-serif; }
.hero-caption p  { font-size: .92rem; opacity: .92; max-width: 320px; margin: 0 auto; }

/* ════════════ PANEL DERECHO: FORMULARIO ════════════ */
.form-side {
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-card { width: 100%; max-width: 440px; }
.auth-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.5rem; text-align: center; margin-bottom: .25rem; }
.auth-sub { text-align: center; font-size: .875rem; color: var(--muted); margin-bottom: 1.5rem; }
.remember-row { display: flex; justify-content: space-between; align-items: center; font-size: .85rem; margin-top: -.25rem; }
.auth-footer-text { text-align: center; font-size: .85rem; color: var(--muted); margin: 1rem 0 .5rem; }
.footer-simple { background: #111827; text-align: center; padding: 1.25rem 1rem; display: flex; flex-direction: column; align-items: center; gap: .4rem; }
.footer-simple p { font-size: .78rem; color: #6b7280; }

@media (max-width: 900px) {
  .auth-wrapper { flex-direction: column; }
  .hero-side { min-height: 280px; flex: none; padding: 1.5rem 0; }
  .pet-3d { width: 180px; }
  .hero-caption h2 { font-size: 1.25rem; }
  .form-side { padding: 2rem 1rem; }
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