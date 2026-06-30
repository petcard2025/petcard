<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { loginAPI, API_URL } from '../api'

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

body { background: #f8fafc; display: flex; flex-direction: column; min-height: 100vh; }
.auth-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; }
.auth-card { width: 100%; max-width: 480px; }
.auth-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.5rem; text-align: center; margin-bottom: .25rem; }
.auth-sub { text-align: center; font-size: .875rem; color: var(--muted); margin-bottom: 1.5rem; }
.remember-row { display: flex; justify-content: space-between; align-items: center; font-size: .85rem; margin-top: -.25rem; }
.auth-footer-text { text-align: center; font-size: .85rem; color: var(--muted); margin: 1rem 0 .5rem; }
.footer-simple { background: #111827; text-align: center; padding: 1.25rem 1rem; display: flex; flex-direction: column; align-items: center; gap: .4rem; }
.footer-simple p { font-size: .78rem; color: #6b7280; }

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