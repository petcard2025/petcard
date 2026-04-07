// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Función auxiliar para hacer peticiones
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()

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
  // Obtener todos los usuarios
  obtener: () => fetchAPI('/usuarios'),

  // Crear nuevo usuario
  crear: (datos) => fetchAPI('/usuarios', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),

  // Actualizar usuario
  actualizar: (id, datos) => fetchAPI(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),

  // Eliminar usuario
  eliminar: (id) => fetchAPI(`/usuarios/${id}`, {
    method: 'DELETE'
  })
}

// ========== LOGIN ==========
export const loginAPI = {
  // Login de usuario
  loginUsuario: (correo, contrasena) => fetchAPI('/login', {
    method: 'POST',
    body: JSON.stringify({ Correo: correo, Contrasena: contrasena })
  })
}

// ========== CLIENTES ==========
export const clientesAPI = {
  // Obtener todos los clientes
  obtener: () => fetchAPI('/clientes'),

  // Obtener cliente por usuario
  obtenerPorUsuario: (idUsuario) => fetchAPI(`/clientes/usuario/${idUsuario}`),

  // Crear nuevo cliente
  crear: (datos) => fetchAPI('/clientes', {
    method: 'POST',
    body: JSON.stringify(datos)
  })
}

// ========== MASCOTAS ==========
export const mascotasAPI = {
  // Obtener todas las mascotas
  obtener: () => fetchAPI('/mascotas'),

  // Obtener mascotas de un cliente
  obtenerPorCliente: (idCliente) => fetchAPI(`/mascotas/cliente/${idCliente}`),

  // Crear mascota
  crear: (datos) => fetchAPI('/mascotas', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),

  // Actualizar mascota
  actualizar: (id, datos) => fetchAPI(`/mascotas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),

  // Eliminar mascota
  eliminar: (id) => fetchAPI(`/mascotas/${id}`, {
    method: 'DELETE'
  })
}

// ========== VETERINARIOS ==========
export const veterinariosAPI = {
  // Obtener todos los veterinarios
  obtener: () => fetchAPI('/veterinarios')
}

// ========== SERVICIOS ==========
export const serviciosAPI = {
  // Obtener todos los servicios
  obtener: () => fetchAPI('/servicios'),

  // Crear servicio
  crear: (datos) => fetchAPI('/servicios', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),

  // Actualizar servicio
  actualizar: (id, datos) => fetchAPI(`/servicios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),

  // Eliminar servicio
  eliminar: (id) => fetchAPI(`/servicios/${id}`, {
    method: 'DELETE'
  })
}

// ========== CITAS ==========
export const citasAPI = {
  // Obtener todas las citas
  obtener: () => fetchAPI('/citas'),

  // Crear cita
  crear: (datos) => fetchAPI('/citas', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),

  // Actualizar cita
  actualizar: (id, datos) => fetchAPI(`/citas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),

  // Eliminar cita
  eliminar: (id) => fetchAPI(`/citas/${id}`, {
    method: 'DELETE'
  })
}

// ========== VACUNAS / CARNET ==========
export const vacunasAPI = {
  // Obtener todas las vacunas
  obtener: () => fetchAPI('/vacunas'),

  // Obtener vacunas de una mascota
  obtenerPorMascota: (idMascota) => fetchAPI(`/vacunas/mascota/${idMascota}`),

  // Crear registro de vacuna
  crear: (datos) => fetchAPI('/vacunas', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),

  // Actualizar vacuna
  actualizar: (id, datos) => fetchAPI(`/vacunas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),

  // Eliminar vacuna
  eliminar: (id) => fetchAPI(`/vacunas/${id}`, {
    method: 'DELETE'
  })
}

// ========== ALIMENTACION ==========
export const alimentacionAPI = {
  // Obtener todos los planes
  obtener: () => fetchAPI('/alimentacion'),

  // Obtener planes de una mascota
  obtenerPorMascota: (idMascota) => fetchAPI(`/alimentacion/mascota/${idMascota}`),

  // Crear plan de alimentación
  crear: (datos) => fetchAPI('/alimentacion', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),

  // Actualizar plan
  actualizar: (id, datos) => fetchAPI(`/alimentacion/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),

  // Eliminar plan
  eliminar: (id) => fetchAPI(`/alimentacion/${id}`, {
    method: 'DELETE'
  })
}

// ========== NOTIFICACIONES ==========
export const notificacionesAPI = {
  // Obtener todas las notificaciones
  obtener: () => fetchAPI('/notificaciones'),

  // Crear notificación
  crear: (datos) => fetchAPI('/notificaciones', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),

  // Eliminar notificación
  eliminar: (id) => fetchAPI(`/notificaciones/${id}`, {
    method: 'DELETE'
  })
}

// ========== ADMINISTRADORES ==========
export const administradoresAPI = {
  // Obtener todos los administradores
  obtener: () => fetchAPI('/administradores')
}
