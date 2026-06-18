/**
 * API de Notificaciones
 * Archivo centralizado para manejar todas las operaciones relacionadas con notificaciones
 * Base URL: http://localhost:3001/api/notificaciones
 */

// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Función auxiliar para realizar peticiones HTTP
 * @param {string} endpoint - El endpoint de la API
 * @param {object} options - Opciones adicionales (método, headers, body, etc)
 * @returns {Promise<object>} Respuesta de la API
 */
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

/**
 * NOTIFICACIONES API
 * Objeto con todos los métodos para gestionar notificaciones
 */
export const notificacionesAPI = {
  /**
   * Obtener todas las notificaciones
   * GET /api/notificaciones
   * @returns {Promise<object[]>} Lista de todas las notificaciones
   */
  obtener: () => fetchAPI('/notificaciones'),

  /**
   * Obtener notificaciones de un usuario específico
   * GET /api/notificaciones/usuario/:idUsuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<object[]>} Lista de notificaciones del usuario
   */
  obtenerPorUsuario: (idUsuario) => 
    fetchAPI(`/notificaciones/usuario/${idUsuario}`),

  /**
   * Obtener una notificación específica
   * GET /api/notificaciones/:id
   * @param {number} id - ID de la notificación
   * @returns {Promise<object>} Datos de la notificación
   */
  obtenerPorId: (id) => 
    fetchAPI(`/notificaciones/${id}`),

  /**
   * Crear una nueva notificación
   * POST /api/notificaciones
   * @param {object} datos - Datos de la notificación
   * @param {number} datos.ID_usuario - ID del usuario que recibe la notificación
   * @param {number} datos.ID_sistemaCorreo - ID del sistema de correo
   * @param {string} datos.Mensaje - Contenido del mensaje
   * @param {string} datos.Tipo - Tipo de notificación (Recordatorio, Confirmación, Alerta)
   * @param {string} datos.Canal - Canal de envío (Correo, SMS, Sistema)
   * @param {string} [datos.Fecha_envio] - Fecha de envío (opcional)
   * @returns {Promise<object>} Notificación creada
   */
  crear: (datos) => fetchAPI('/notificaciones', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),

  /**
   * Crear múltiples notificaciones
   * POST /api/notificaciones/bulk
   * @param {object[]} notificaciones - Array de notificaciones a crear
   * @returns {Promise<object>} Resultado de la operación
   */
  crearMultiples: (notificaciones) => fetchAPI('/notificaciones/bulk', {
    method: 'POST',
    body: JSON.stringify({ notificaciones })
  }),

  /**
   * Actualizar una notificación existente
   * PUT /api/notificaciones/:id
   * @param {number} id - ID de la notificación
   * @param {object} datos - Datos a actualizar
   * @returns {Promise<object>} Notificación actualizada
   */
  actualizar: (id, datos) => fetchAPI(`/notificaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  }),

  /**
   * Marcar una notificación como leída
   * PATCH /api/notificaciones/:id/marcar-como-leida
   * @param {number} id - ID de la notificación
   * @returns {Promise<object>} Notificación actualizada
   */
  marcarComoLeida: (id) => 
    fetchAPI(`/notificaciones/${id}/marcar-como-leida`, {
      method: 'PATCH'
    }),

  /**
   * Marcar múltiples notificaciones como leídas
   * PATCH /api/notificaciones/marcar-como-leidas/bulk
   * @param {number[]} ids - Array de IDs de notificaciones
   * @returns {Promise<object>} Resultado de la operación
   */
  marcarMultiplesComoLeidas: (ids) => 
    fetchAPI('/notificaciones/marcar-como-leidas/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids })
    }),

  /**
   * Obtener notificaciones no leídas de un usuario
   * GET /api/notificaciones/usuario/:idUsuario/no-leidas
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<object[]>} Lista de notificaciones no leídas
   */
  obtenerNoLeidas: (idUsuario) => 
    fetchAPI(`/notificaciones/usuario/${idUsuario}/no-leidas`),

  /**
   * Obtener notificaciones por tipo
   * GET /api/notificaciones/tipo/:tipo
   * @param {string} tipo - Tipo de notificación (Recordatorio, Confirmación, Alerta)
   * @returns {Promise<object[]>} Lista de notificaciones del tipo especificado
   */
  obtenerPorTipo: (tipo) => 
    fetchAPI(`/notificaciones/tipo/${tipo}`),

  /**
   * Obtener notificaciones por canal
   * GET /api/notificaciones/canal/:canal
   * @param {string} canal - Canal de notificación (Correo, SMS, Sistema)
   * @returns {Promise<object[]>} Lista de notificaciones del canal especificado
   */
  obtenerPorCanal: (canal) => 
    fetchAPI(`/notificaciones/canal/${canal}`),

  /**
   * Obtener notificaciones dentro de un rango de fechas
   * GET /api/notificaciones/fecha/rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
   * @param {string} fechaInicio - Fecha inicial (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha final (YYYY-MM-DD)
   * @returns {Promise<object[]>} Lista de notificaciones en el rango
   */
  obtenerPorRangoFechas: (fechaInicio, fechaFin) => 
    fetchAPI(`/notificaciones/fecha/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),

  /**
   * Eliminar una notificación
   * DELETE /api/notificaciones/:id
   * @param {number} id - ID de la notificación
   * @returns {Promise<object>} Resultado de la operación
   */
  eliminar: (id) => fetchAPI(`/notificaciones/${id}`, {
    method: 'DELETE'
  }),

  /**
   * Eliminar múltiples notificaciones
   * DELETE /api/notificaciones/bulk
   * @param {number[]} ids - Array de IDs de notificaciones
   * @returns {Promise<object>} Resultado de la operación
   */
  eliminarMultiples: (ids) => fetchAPI('/notificaciones/bulk', {
    method: 'DELETE',
    body: JSON.stringify({ ids })
  }),

  /**
   * Eliminar todas las notificaciones de un usuario
   * DELETE /api/notificaciones/usuario/:idUsuario/todas
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<object>} Resultado de la operación
   */
  eliminarTodas: (idUsuario) => 
    fetchAPI(`/notificaciones/usuario/${idUsuario}/todas`, {
      method: 'DELETE'
    }),

  /**
   * Obtener estadísticas de notificaciones
   * GET /api/notificaciones/estadisticas
   * @returns {Promise<object>} Estadísticas generales
   */
  obtenerEstadisticas: () => 
    fetchAPI('/notificaciones/estadisticas'),

  /**
   * Obtener estadísticas de un usuario
   * GET /api/notificaciones/usuario/:idUsuario/estadisticas
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<object>} Estadísticas del usuario
   */
  obtenerEstadisticasUsuario: (idUsuario) => 
    fetchAPI(`/notificaciones/usuario/${idUsuario}/estadisticas`)
}

export default notificacionesAPI
