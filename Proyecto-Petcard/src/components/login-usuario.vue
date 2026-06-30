<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { loginAPI, API_URL } from '../api.js'

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
</script>

<template>
  <nav class="navbar">
    <a href="javascript:void(0)" @click="irAlInicio" class="nav-logo">PETCARD</a>
  </nav>

  <div class="login-wrapper">
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
      background: #fff;
    }

    .login-wrapper {
      flex: 1;
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

    @media (max-width: 768px) {
      .login-wrapper { padding: 30px 16px; }
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