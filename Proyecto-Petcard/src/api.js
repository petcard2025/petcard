// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:3001/api'

// Función auxiliar para hacer peticiones
const fetchAPI = async (endpoint, options = {}) => {
  try {
    // ✅ Leer el token JWT guardado al hacer login
    const token = localStorage.getItem('petcard_token')

    const response = await fetch(`${API_URL}${endpoint}`, {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        // ✅ Enviar el token en cada petición si existe
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    })

    const data = await response.json()

    // ✅ Si el token expiró, limpiar sesión y redirigir al login
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('petcard_token')
      localStorage.removeItem('petcard_usuario_actual')
      window.location.href = '/login-usuario'
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
    }

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}: ${response.statusText}`)
    }

    return data
  } catch (error) {
    console.error('Error en la petición:', error)
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
export const loginAPI = {
  loginUsuario: (correo, contrasena) => fetchAPI('/login', {
    method: 'POST',
    body: JSON.stringify({ Correo: correo, Contrasena: contrasena })
  })
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
  obtenerPorUsuario: (idUsuario) => fetchAPI(`/notificaciones/usuario/${idUsuario}`),
  obtenerNoLeidas: (idUsuario) => fetchAPI(`/notificaciones/usuario/${idUsuario}/no-leidas`),
  obtenerPorId: (id) => fetchAPI(`/notificaciones/${id}`),
  crear: (datos) => fetchAPI('/notificaciones', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  actualizar: (id, datos) => fetchAPI(`/notificaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),
  marcarComoLeida: (id) => fetchAPI(`/notificaciones/${id}/marcar-como-leida`, {
    method: 'PATCH'
  }),
  marcarMultiplesComoLeidas: (ids) => fetchAPI('/notificaciones/marcar-como-leidas/bulk', {
    method: 'PATCH',
    body: JSON.stringify({ ids })
  }),
  eliminar: (id) => fetchAPI(`/notificaciones/${id}`, {
    method: 'DELETE'
  }),
  eliminarMultiples: (ids) => fetchAPI('/notificaciones/bulk', {
    method: 'DELETE',
    body: JSON.stringify({ ids })
  }),
  eliminarTodas: (idUsuario) => fetchAPI(`/notificaciones/usuario/${idUsuario}/todas`, {
    method: 'DELETE'
  }),
  obtenerEstadisticas: () => fetchAPI('/notificaciones/estadisticas'),
  obtenerEstadisticasUsuario: (idUsuario) => fetchAPI(`/notificaciones/usuario/${idUsuario}/estadisticas`)
}

// ========== AUTENTICACIÓN (Olvidé contraseña / Reset) ==========
export const authAPI = {
  requestForgotPassword: (correo) => fetchAPI('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ Correo: correo })
  }),
  resetPassword: (token, nuevaContrasena) => fetchAPI('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, nuevaContrasena })
  })
}

// ========== ADMINISTRADORES ==========
export const administradoresAPI = {
  obtener: () => fetchAPI('/administradores')
}