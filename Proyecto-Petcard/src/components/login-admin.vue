<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { loginAPI } from '../api'

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

const handleLogin = async () => {
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
    const response = await loginAPI.loginUsuario(correo, contrasena)
    
    if (response && response.message === 'Login exitoso') {
      // Verificar que sea administrador
      if (response.usuario.Rol !== 'administrador') {
        errorMessage.value = 'Esta cuenta no tiene permisos de administrador.'
        isLoading.value = false
        return
      }

      successMessage.value = `¡Bienvenido Admin ${response.usuario.Nombre}! Redirigiendo...`
      localStorage.setItem('petcard_usuario_actual', JSON.stringify(response.usuario))
      localStorage.setItem('petcard_admin_actual', JSON.stringify(response.usuario))

      if (formData.recordar) {
        localStorage.setItem('petcard_admin_recordado', JSON.stringify(response.usuario))
      }

      setTimeout(() => {
        router.push('/admin-inicio')
      }, 1500)
    } else if (response && response.error) {
      errorMessage.value = response.error
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error al conectar con el servidor. Intenta más tarde.'
    console.error('Error de login:', error)
  } finally {
    isLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const irARegistro = () => {
  router.push('/registro-admin')
}

const irAlInicio = () => {
  router.push('/inicio')
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
        <a href="javascript:void(0)" class="link">¿Olvidaste tu contraseña?</a>
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

</style>