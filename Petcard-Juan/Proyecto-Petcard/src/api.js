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

    // Obtener texto primero
    const text = await response.text()

    // Intentar convertir a JSON
    let data

    try {
      data = JSON.parse(text)
      console.log('RESPUESTA DEL SERVIDOR:')
console.log(text)
    } catch {
      console.error('La respuesta no es JSON:', text)
      throw new Error('El servidor devolvió una respuesta inválida')
    }

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}`)
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
