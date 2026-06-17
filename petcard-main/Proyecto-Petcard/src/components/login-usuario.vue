<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { loginAPI } from '../api.js'

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
      successMessage.value = `¡Bienvenido/a, ${data.usuario.Nombre}!`
      localStorage.setItem('petcard_usuario_actual', JSON.stringify(data.usuario))
      console.log('✅ Login exitoso')

      setTimeout(() => {
        router.push('/inicio')
      }, 1500)
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
    const response = await fetch('https://localhost:3001/api/forgot-password', {
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
    const response = await fetch('https://localhost:3001/api/reset-password', {
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
</script>

<template>
  <nav class="navbar">
    <a href="javascript:void(0)" @click="irAlInicio" class="nav-logo">PETCARD</a>
  </nav>

  <div class="right-panel">
    <div class="form-wrapper">
      <h1>Bienvenido a PetCard</h1>
      <p class="subtitle">Completa los siguientes campos</p>

      <div class="error-msg" v-if="errorMessage">{{ errorMessage }}</div>
      <div class="success-msg" v-if="successMessage">{{ successMessage }}</div>

      <div class="form-group">
        <input type="email" v-model="formData.correo" placeholder="Correo electrónico *" />
      </div>

      <div class="form-group password-wrapper">
        <input :type="showPassword ? 'text' : 'password'" v-model="formData.contrasena" placeholder="Contraseña *" />
        <button class="eye-btn" @click="togglePassword" aria-label="Mostrar contraseña">
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

  <div class="left-panel">
    <div class="illustration-container"></div>
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
      background: #fff;
    }

    .left-panel {
      background: url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80') center/cover no-repeat;
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .illustration-container {
      position: relative;
      width: 420px;
      height: 420px;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      background: #2095f4;
    }
    .blob-1 {
      width: 280px; height: 280px;
      bottom: 60px; right: 60px;
      border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%;
    }
    .blob-2 {
      width: 60px; height: 60px;
      top: 60px; left: 90px;
      opacity: 0.85;
    }
    .blob-3 {
      width: 30px; height: 30px;
      top: 100px; left: 160px;
      opacity: 0.5;
    }

    .family-svg {
      position: absolute;
      bottom: 20px;
      left: 10px;
      width: 400px;
      height: 400px;
    }

    .right-panel {
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 80px;
    }

    .form-wrapper {
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

    select, input[type="text"], input[type="password"] {
      width: 100%;
      padding: 16px 18px;
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

    .password-wrapper {
      position: relative;
    }

    .password-wrapper input {
      padding-right: 48px;
    }

    .eye-btn {
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

    .eye-btn:hover { color: #0769da; }

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
      background: #0948d1;
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
      background: #0c8dd8;
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

    ::placeholder { color: #aaa; }

    @media (max-width: 768px) {
      body { flex-direction: column; }
      .left-panel { width: 100%; height: 300px; }
      .right-panel { width: 100%; padding: 40px 24px; }
    }

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