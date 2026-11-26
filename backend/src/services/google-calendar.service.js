// SERVICIO DE GOOGLE CALENDAR - Crea eventos en Google Calendar
const { google } = require('googleapis')
const { normalizarHora } = require('../utils/validators')

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
  // Acepta "08:00 AM", "02:00 PM", "08:00:00"... y la pasa a "HH:MM" de 24 h.
  // Antes se cortaban 5 caracteres, y "02:00 PM" quedaba como las 2 de la madrugada.
  const horaStr = normalizarHora(cita.Hora)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr) || !horaStr) {
    throw new Error('Fecha/Hora invalida: ' + fechaStr + ' ' + cita.Hora)
  }

  // La hora se manda tal cual, con la zona horaria de Colombia. Antes se convertia a UTC
  // con toISOString() y Google lo mostraba 5 horas corrido.
  const [h, m] = horaStr.split(':').map(Number)
  const finStr = h >= 23 ? '23:59' : `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`

  const event = {
    summary: 'Cita PetCard — ' + (cita.Nombre_mascota || 'Mascota'),
    description: 'Motivo: ' + (cita.Motivo || '') + '\nServicio: ' + (cita.Nombre_servicio || '') + '\nObservaciones: ' + (cita.Observaciones || ''),
    start: { dateTime: `${fechaStr}T${horaStr}:00`, timeZone: 'America/Bogota' },
    end: { dateTime: `${fechaStr}T${finStr}:00`, timeZone: 'America/Bogota' }
  }

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    resource: event
  })
  return response.data.id
}

module.exports = { getCalendarClient, crearEventoCalendar }
