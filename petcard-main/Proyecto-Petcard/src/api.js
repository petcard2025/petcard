// Configuracion de la API
// Una sola fuente de verdad para la URL del backend.
// En produccion, define VITE_API_URL en el .env del frontend
// apuntando al dominio HTTPS real del backend desplegado.
export const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:3001/api'

// Obtiene el token JWT guardado en localStorage tras el login
function getToken() {
  return localStorage.getItem('petcard_token')
}

// Funcion auxiliar para hacer peticiones al backend
// Si existe un token JWT lo agrega automaticamente en el header Authorization
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // Agregar el token si existe (rutas protegidas lo requieren)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      mode: 'cors',
      headers,
      ...options
    })

    const data = await response.json()

    if (!response.ok) {
      // Si el token expiro o es invalido, limpiar sesion
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('petcard_token')
        localStorage.removeItem('petcard_usuario_actual')
        window.location.href = '/login-usuario'
      }
      throw new Error(data.error || `Error ${response.status}: ${response.statusText}`)
    }

    return data
  } catch (error) {
    console.error('Error en la peticion:', error)
    throw error
  }
}

// ========== USUARIOS ==========
export const usuariosAPI = {
  obtener: () => fetchAPI('/usuarios'),
  crear: (datos) => fetchAPI('/usuarios', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  actualizar: (id, datos) => fetchAPI(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),
  eliminar: (id) => fetchAPI(`/usuarios/${id}`, {
    method: 'DELETE'
  })
}

// ========== LOGIN ==========
// Guarda el token JWT en localStorage automaticamente al hacer login
export const loginAPI = {
  loginUsuario: async (correo, contrasena) => {
    const data = await fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify({ Correo: correo, Contrasena: contrasena })
    })
    // Si el backend devuelve token, guardarlo en localStorage
    if (data.token) {
      localStorage.setItem('petcard_token', data.token)
    }
    return data
  }
}

// ========== CLIENTES ==========
export const clientesAPI = {
  obtener: () => fetchAPI('/clientes'),
  obtenerPorUsuario: (idUsuario) => fetchAPI(`/clientes/usuario/${idUsuario}`),
  crear: (datos) => fetchAPI('/clientes', {
    method: 'POST',
    body: JSON.stringify(datos)
  })
}

// ========== MASCOTAS ==========
export const mascotasAPI = {
  obtener: () => fetchAPI('/mascotas'),
  obtenerPorCliente: (idCliente) => fetchAPI(`/mascotas/cliente/${idCliente}`),
  crear: (datos) => fetchAPI('/mascotas', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  actualizar: (id, datos) => fetchAPI(`/mascotas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),
  eliminar: (id) => fetchAPI(`/mascotas/${id}`, {
    method: 'DELETE'
  })
}

// ========== VETERINARIOS ==========
export const veterinariosAPI = {
  obtener: () => fetchAPI('/veterinarios')
}

// ========== SERVICIOS ==========
export const serviciosAPI = {
  obtener: () => fetchAPI('/servicios'),
  crear: (datos) => fetchAPI('/servicios', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  actualizar: (id, datos) => fetchAPI(`/servicios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),
  eliminar: (id) => fetchAPI(`/servicios/${id}`, {
    method: 'DELETE'
  })
}

// ========== CITAS ==========
export const citasAPI = {
  obtener: () => fetchAPI('/citas'),
  crear: (datos) => fetchAPI('/citas', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  actualizar: (id, datos) => fetchAPI(`/citas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),
  eliminar: (id) => fetchAPI(`/citas/${id}`, {
    method: 'DELETE'
  })
}

// ========== VACUNAS / CARNET ==========
export const vacunasAPI = {
  obtener: () => fetchAPI('/vacunas'),
  obtenerPorMascota: (idMascota) => fetchAPI(`/vacunas/mascota/${idMascota}`),
  crear: (datos) => fetchAPI('/vacunas', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  actualizar: (id, datos) => fetchAPI(`/vacunas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),
  eliminar: (id) => fetchAPI(`/vacunas/${id}`, {
    method: 'DELETE'
  })
}

// ========== ALIMENTACION ==========
export const alimentacionAPI = {
  obtener: () => fetchAPI('/alimentacion'),
  obtenerPorMascota: (idMascota) => fetchAPI(`/alimentacion/mascota/${idMascota}`),
  crear: (datos) => fetchAPI('/alimentacion', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  actualizar: (id, datos) => fetchAPI(`/alimentacion/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),
  eliminar: (id) => fetchAPI(`/alimentacion/${id}`, {
    method: 'DELETE'
  })
}

// ========== NOTIFICACIONES ==========
export const notificacionesAPI = {
  obtener: () => fetchAPI('/notificaciones'),
  crear: (datos) => fetchAPI('/notificaciones', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  eliminar: (id) => fetchAPI(`/notificaciones/${id}`, {
    method: 'DELETE'
  })
}

// ========== ADMINISTRADORES ==========
export const administradoresAPI = {
  obtener: () => fetchAPI('/administradores')
}