import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()
  const usuarioLogueado = ref(null)

  const loadUsuario = () => {
    const usuario = localStorage.getItem('petcard_usuario_actual')
    if (usuario) {
      try {
        usuarioLogueado.value = JSON.parse(usuario)
      } catch {
        usuarioLogueado.value = null
      }
    } else {
      usuarioLogueado.value = null
    }
  }

  loadUsuario()
  onMounted(loadUsuario)

  const cerrarSesion = () => {
    localStorage.removeItem('petcard_usuario_actual')
    usuarioLogueado.value = null
    router.push('/inicio')
  }

  const irALogin = () => router.push('/login-usuario')
  const irALoginAdmin = () => router.push('/login-admin')
  const irARegistro = () => router.push('/registro-usuario')
  const irARegistroAdmin = () => router.push('/registro-admin')

  return {
    usuarioLogueado,
    cerrarSesion,
    irALogin,
    irALoginAdmin,
    irARegistro,
    irARegistroAdmin
  }
}
