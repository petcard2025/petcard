// ===== API CLIENT PARA PETCARD =====
// Conecta con el backend en http://localhost:3001/api

const API_BASE_URL = 'http://localhost:3001/api'

// ===== FUNCIONES DE USUARIO =====
async function loginUser(correo, contrasena) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Correo: correo, Contrasena: contrasena })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error en login')
    return data
  } catch (error) {
    console.error('Error en login:', error)
    throw error
  }
}

async function registroUser(nombre, correo, telefono, contrasena, rol = 'cliente') {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Nombre: nombre, Correo: correo, Telefono: telefono, Contrasena: contrasena, Rol: rol })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error en registro')
    return data
  } catch (error) {
    console.error('Error en registro:', error)
    throw error
  }
}

async function obtenerUsuarios() {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener usuarios')
    return data
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    throw error
  }
}

// ===== FUNCIONES DE MASCOTAS =====
async function obtenerMascotas() {
  try {
    const response = await fetch(`${API_BASE_URL}/mascotas`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener mascotas')
    return data
  } catch (error) {
    console.error('Error obteniendo mascotas:', error)
    throw error
  }
}

async function obtenerMascotasPorCliente(idCliente) {
  try {
    const response = await fetch(`${API_BASE_URL}/mascotas/cliente/${idCliente}`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener mascotas')
    return data
  } catch (error) {
    console.error('Error obteniendo mascotas:', error)
    throw error
  }
}

async function crearMascota(idCliente, nombre, especie, raza, sexo, fechaNacimiento, peso, foto) {
  try {
    const response = await fetch(`${API_BASE_URL}/mascotas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ID_cliente: idCliente,
        Nombre: nombre,
        Especie: especie,
        Raza: raza,
        Sexo: sexo,
        Fecha_nacimiento: fechaNacimiento,
        Peso: peso,
        Foto: foto
      })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al crear mascota')
    return data
  } catch (error) {
    console.error('Error creando mascota:', error)
    throw error
  }
}

// ===== FUNCIONES DE SERVICIOS =====
async function obtenerServicios() {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener servicios')
    return data
  } catch (error) {
    console.error('Error obteniendo servicios:', error)
    throw error
  }
}

// ===== FUNCIONES DE CITAS =====
async function obtenerCitas() {
  try {
    const response = await fetch(`${API_BASE_URL}/citas`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener citas')
    return data
  } catch (error) {
    console.error('Error obteniendo citas:', error)
    throw error
  }
}

async function crearCita(idCliente, idMascota, idServicio, idVeterinario, fecha, hora, motivo, observaciones) {
  try {
    const response = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ID_cliente: idCliente,
        ID_mascota: idMascota,
        ID_servicio: idServicio,
        ID_veterinario: idVeterinario,
        Fecha: fecha,
        Hora: hora,
        Motivo: motivo,
        Observaciones: observaciones
      })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al crear cita')
    return data
  } catch (error) {
    console.error('Error creando cita:', error)
    throw error
  }
}

// ===== FUNCIONES DE VACUNAS =====
async function obtenerVacunas() {
  try {
    const response = await fetch(`${API_BASE_URL}/vacunas`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener vacunas')
    return data
  } catch (error) {
    console.error('Error obteniendo vacunas:', error)
    throw error
  }
}

async function obtenerVacunasPorMascota(idMascota) {
  try {
    const response = await fetch(`${API_BASE_URL}/vacunas/mascota/${idMascota}`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener vacunas')
    return data
  } catch (error) {
    console.error('Error obteniendo vacunas:', error)
    throw error
  }
}

// ===== FUNCIONES DE ALIMENTACION =====
async function obtenerAlimentacion() {
  try {
    const response = await fetch(`${API_BASE_URL}/alimentacion`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener alimentación')
    return data
  } catch (error) {
    console.error('Error obteniendo alimentación:', error)
    throw error
  }
}

async function obtenerAlimentacionPorMascota(idMascota) {
  try {
    const response = await fetch(`${API_BASE_URL}/alimentacion/mascota/${idMascota}`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener alimentación')
    return data
  } catch (error) {
    console.error('Error obteniendo alimentación:', error)
    throw error
  }
}

// ===== FUNCIONES DE VETERINARIOS =====
async function obtenerVeterinarios() {
  try {
    const response = await fetch(`${API_BASE_URL}/veterinarios`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener veterinarios')
    return data
  } catch (error) {
    console.error('Error obteniendo veterinarios:', error)
    throw error
  }
}

// ===== FUNCIONES DE NOTIFICACIONES =====
async function obtenerNotificaciones() {
  try {
    const response = await fetch(`${API_BASE_URL}/notificaciones`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener notificaciones')
    return data
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error)
    throw error
  }
}
