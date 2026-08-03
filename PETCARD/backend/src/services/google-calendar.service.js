// SERVICIO DE GOOGLE CALENDAR - Crea eventos en Google Calendar
const { google } = require('googleapis')

// OBTENER CLIENTE DE CALENDAR - Autenticacion con Google
async function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/calendar']
  })
  const authClient = await auth.getClient()
  return google.calendar({ version: 'v3', auth: authClient })
}

// CREAR EVENTO EN CALENDAR - Inserta una cita en Google Calendar
async function crearEventoCalendar(cita) {
  const calendar = await getCalendarClient()
  const fechaStr = String(cita.Fecha).substring(0, 10)
  const horaStr = String(cita.Hora).substring(0, 5)
  const fechaInicio = new Date(fechaStr + 'T' + horaStr + ':00')
  if (isNaN(fechaInicio.getTime())) {
    throw new Error('Fecha/Hora invalida: ' + fechaStr + ' ' + horaStr)
  }
  const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000)

  const event = {
    summary: 'Cita PetCard — ' + (cita.Nombre_mascota || 'Mascota'),
    description: 'Motivo: ' + (cita.Motivo || '') + '\nServicio: ' + (cita.Nombre_servicio || '') + '\nObservaciones: ' + (cita.Observaciones || ''),
    start: { dateTime: fechaInicio.toISOString(), timeZone: 'America/Bogota' },
    end: { dateTime: fechaFin.toISOString(), timeZone: 'America/Bogota' }
  }

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    resource: event
  })
  return response.data.id
}

module.exports = { getCalendarClient, crearEventoCalendar }