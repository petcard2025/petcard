<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { usuariosAPI } from '../../api'

const router = useRouter()

const formData = reactive({
  nombre: '',
  correo: '',
  telefono: '',
  contrasena: '',
  confirm: '',
  terminos: false
})

const errors = reactive({
  nombre: '',
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

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validatePhone = (phone) => {
  return /^\d{7,15}$/.test(phone.replace(/\s/g, ''))
}

const handleRegistro = async () => {
  clearErrors()
  let valid = true

  if (!formData.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio.'
    valid = false
  }
  if (!formData.correo.trim() || !validateEmail(formData.correo)) {
    errors.correo = 'Ingresa un correo válido.'
    valid = false
  }
  if (!formData.telefono.trim() || !validatePhone(formData.telefono)) {
    errors.telefono = 'Ingresa un teléfono válido (solo números).'
    valid = false
  }
  if (!formData.contrasena || formData.contrasena.length < 6) {
    errors.contrasena = 'La contraseña debe tener al menos 6 caracteres.'
    valid = false
  }
  if (formData.contrasena !== formData.confirm) {
    errors.confirm = 'Las contraseñas no coinciden.'
    valid = false
  }
  if (!formData.terminos) {
    errors.terminos = 'Debes aceptar los términos y condiciones.'
    valid = false
  }

  if (!valid) return

  isLoading.value = true

  try {
    // Crear admin en la base de datos
    const nuevoAdmin = {
      Nombre: formData.nombre.trim(),
      Correo: formData.correo.trim(),
      Telefono: formData.telefono.trim(),
      Contrasena: formData.contrasena,
      Rol: 'administrador'
    }

    const response = await usuariosAPI.crear(nuevoAdmin)
    
    if (response && response.ID_usuario) {
      successMessage.value = '¡Cuenta de admin creada exitosamente! Redirigiendo...'
      
      // Guardar datos del admin en localStorage
      localStorage.setItem('petcard_admin_actual', JSON.stringify(response))

      setTimeout(() => {
        router.push('/admin')
      }, 1800)
    } else if (response && response.error) {
      errors.correo = response.error
    }
  } catch (error) {
    errors.correo = error.message || 'Error al crear la cuenta. Intenta de nuevo.'
    console.error('Error de registro:', error)
  } finally {
    isLoading.value = false
  }
}

const irAlLogin = () => {
  router.push('/login-admin')
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
      <h1>Bienvenido a PetCard Admin</h1>
      <p>Registra tu cuenta de administrador y gestiona el sistema.</p>
      <img src="https://images.unsplash.com/photo-1576091160550-112173f7f869?w=500" alt="Admin" class="hero-image">
    </div>

    <div class="auth-right">
      <div class="auth-card card">

        <h2 class="auth-title">Crear Cuenta Admin</h2>

        <div class="success-banner" v-if="successMessage">{{ successMessage }}</div>

        <div class="form-group">
          <label>Nombre Completo</label>
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input type="text" class="form-control" v-model="formData.nombre" placeholder="Tu nombre completo">
          </div>
          <div class="error" v-if="errors.nombre">{{ errors.nombre }}</div>
        </div>

        <div class="form-group">
          <label>Correo</label>
          <div class="input-group">
            <i class="fas fa-envelope"></i>
            <input type="email" class="form-control" v-model="formData.correo" placeholder="correo@ejemplo.com">
          </div>
          <div class="error" v-if="errors.correo">{{ errors.correo }}</div>
        </div>

        <div class="form-group">
          <label>Teléfono</label>
          <div class="input-group">
            <i class="fas fa-phone"></i>
            <input type="tel" class="form-control" v-model="formData.telefono" placeholder="300 000 0000">
          </div>
          <div class="error" v-if="errors.telefono">{{ errors.telefono }}</div>
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input type="password" class="form-control" v-model="formData.contrasena" placeholder="Mínimo 6 caracteres">
          </div>
          <div class="error" v-if="errors.contrasena">{{ errors.contrasena }}</div>
        </div>

        <div class="form-group">
          <label>Confirmar contraseña</label>
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input type="password" class="form-control" v-model="formData.confirm" placeholder="Repite tu contraseña">
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

<style scoped>
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
}

.auth-left p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-image {
  max-width: 300px;
  border-radius: 12px;
}

/* ── Lado derecho ── */
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.auth-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
  margin-top: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.input-group:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group i {
  padding: 0 12px;
  color: #999;
  font-size: 1rem;
}

.form-control {
  flex: 1;
  border: none;
  padding: 12px 0;
  outline: none;
  font-size: 1rem;
  background: transparent;
  font-family: inherit;
}

.form-control::placeholder {
  color: #ccc;
}

.error {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.success-banner {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #c3e6cb;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  color: #333;
  user-select: none;
}

.checkbox-label input {
  margin-right: 0.5rem;
  cursor: pointer;
}

.btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-full {
  width: 100%;
  margin-top: 1rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.auth-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.card {
  background: white;
}

@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }

  .auth-left {
    display: none;
  }

  .auth-card {
    max-width: 100%;
  }
}
</style>
