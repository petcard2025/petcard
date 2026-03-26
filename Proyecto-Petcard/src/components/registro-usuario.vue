<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'

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
  console.log('📝 handleRegistro llamado')
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

  if (!valid) {
    console.log('❌ Validación fallida')
    return
  }

  isLoading.value = true
  console.log('⏳ Iniciando registro...')

  try {
    console.log('🔗 Haciendo petición POST a: http://localhost:3000/api/usuarios')
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Nombre: formData.nombre.trim(),
        Correo: formData.correo.trim(),
        Telefono: formData.telefono.trim(),
        Contrasena: formData.contrasena,
        Rol: 'cliente'
      })
    })

    console.log('📨 Response status:', response.status)
    const data = await response.json()
    console.log('📦 Response data:', data)

    if (response.ok && data.ID_usuario) {
      successMessage.value = '¡Cuenta creada exitosamente! Redirigiendo...'
      localStorage.setItem('petcard_usuario_actual', JSON.stringify(data))
      console.log('✅ Registro exitoso')

      setTimeout(() => {
        router.push('/inicio')
      }, 1800)
    } else {
      errors.correo = data.error || 'Error al crear la cuenta, intenta de nuevo.'
      console.log('❌ Error:', data.error)
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

const irALoginAdmin = () => {
  router.push('/login-admin')
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

      <p style="margin-top: 1rem; text-align: center; font-size: 0.9rem;">
        <a href="javascript:void(0)" @click="irALoginAdmin" style="color: #764ba2; font-weight: 600; text-decoration: none;">👨‍💼 Acceso de Administrador</a>
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