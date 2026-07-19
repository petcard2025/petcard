import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { parseJwt, isTokenValid } from '../utils/jwt'

export function useAuth() {
  const router = useRouter()
  const usuarioLogueado = ref(null)
  const token = ref(null)
  const isAuthenticated = ref(false)

  const loadSession = () => {
    let t = localStorage.getItem('petcard_token')
    if (t === 'null' || t === 'undefined') {
      localStorage.removeItem('petcard_token')
      t = null
    }
    if (t && isTokenValid(t)) {
      token.value = t
      isAuthenticated.value = true
      const stored = localStorage.getItem('petcard_usuario_actual')
      if (stored) {
        try { usuarioLogueado.value = JSON.parse(stored) } catch { usuarioLogueado.value = null }
      } else {
        const payload = parseJwt(t)
        usuarioLogueado.value = payload
          ? { Nombre: payload.nombre || payload.sub, Rol: payload.rol, ID_veterinario: payload.id_veterinario || payload.id }
          : null
      }
    } else {
      const stored = localStorage.getItem('petcard_usuario_actual')
      if (stored) {
        try {
          usuarioLogueado.value = JSON.parse(stored)
          token.value = null
          isAuthenticated.value = true
        } catch {
          localStorage.removeItem('petcard_usuario_actual')
          localStorage.removeItem('petcard_token')
          token.value = null
          usuarioLogueado.value = null
          isAuthenticated.value = false
        }
      } else {
        localStorage.removeItem('petcard_token')
        token.value = null
        isAuthenticated.value = false
        usuarioLogueado.value = null
      }
    }
  }

  loadSession()
  onMounted(loadSession)

  const setSession = (usuarioObj, jwt) => {
    if (usuarioObj) localStorage.setItem('petcard_usuario_actual', JSON.stringify(usuarioObj))
    if (jwt) {
      localStorage.setItem('petcard_token', jwt)
    } else {
      localStorage.removeItem('petcard_token')
    }
    loadSession()
  }

  const cerrarSesion = () => {
    localStorage.removeItem('petcard_token')
    localStorage.removeItem('petcard_usuario_actual')
    localStorage.removeItem('petcard_admin_actual')
    token.value = null
    usuarioLogueado.value = null
    isAuthenticated.value = false
    router.push('/inicio')
  }

  // ── Helpers de navegación ────────────────────────────────
  const irALogin = () => router.push('/login-usuario')
  const irALoginAdmin = () => router.push('/login-admin')
  const irARegistro = () => router.push('/registro-usuario')
  const irARegistroAdmin = () => router.push('/registro-admin')

  // ── Redirección según rol tras login ─────────────────────
  const redirigirSegunRol = () => {
    const rol = usuarioLogueado.value?.Rol?.toLowerCase()
    if (rol === 'administrador' || rol === 'admin') {
      router.push('/admin-inicio')
    } else if (rol === 'veterinario') {
      router.push('/veterinario-inicio')
    } else {
      router.push('/inicio')
    }
  }

  return {
    usuarioLogueado,
    token,
    isAuthenticated,
    setSession,
    cerrarSesion,
    redirigirSegunRol,
    irALogin,
    irALoginAdmin,
    irARegistro,
    irARegistroAdmin
  }
}