// VALIDADORES - Reglas de negocio compartidas por los controladores

// Ultimo dia en que se permite agendar citas (inclusive)
const FECHA_MAX_CITA = '2026-12-31'

// Horarios de atencion para citas (formato 24 h "HH:MM")
const HORAS_CITA = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

// Solo letras (con tildes y ñ), separadas por un espacio, guion o apostrofe.
// Ej. validos: "Max", "Luna María", "Jean-Luc", "D'Artagnan". Invalidos: "@", "123", "!!".
const REGEX_NOMBRE = /^\p{L}+(?:[ '’-]\p{L}+)*$/u

// Devuelve un mensaje de error, o null si el nombre es valido
function validarNombreMascota(nombre) {
  if (typeof nombre !== 'string') return 'El nombre de la mascota es obligatorio.'
  const n = nombre.trim()
  if (n.length < 2 || n.length > 30) return 'El nombre de la mascota debe tener entre 2 y 30 caracteres.'
  if (!REGEX_NOMBRE.test(n)) return 'El nombre de la mascota solo puede contener letras (sin numeros ni simbolos como @).'
  return null
}

// Fecha y hora actuales en Colombia: { fecha: 'YYYY-MM-DD', minutos: minutos desde las 00:00 }
// El servidor de AWS corre en UTC: sin esto, despues de las 7 pm en Colombia
// "hoy" ya seria "manana" y se rechazarian citas validas del dia.
function ahoraColombia(date = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date)
  const p = Object.fromEntries(partes.map(x => [x.type, x.value]))
  return {
    fecha: `${p.year}-${p.month}-${p.day}`,
    minutos: Number(p.hour) * 60 + Number(p.minute)
  }
}

// Fecha de hoy (YYYY-MM-DD) en hora de Colombia
function hoyColombia() {
  return ahoraColombia().fecha
}

// Convierte "08:00 AM", "2:00 PM", "08:00:00" o "14:00" a "HH:MM" (24 h).
// Devuelve null si no es una hora valida.
function normalizarHora(valor) {
  if (valor === null || valor === undefined) return null
  const m = String(valor).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ap = m[3] && m[3].toUpperCase()
  if (ap) {
    if (h < 1 || h > 12) return null
    if (ap === 'PM' && h !== 12) h += 12
    if (ap === 'AM' && h === 12) h = 0
  }
  if (h > 23 || min > 59) return null
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

// Minutos desde las 00:00 de una hora "HH:MM"
function minutosDe(hora24) {
  const [h, m] = hora24.split(':').map(Number)
  return h * 60 + m
}

// Valida la fecha de una cita. Devuelve un mensaje de error, o null si es valida.
//   permitirPasado: true al editar una cita existente (no bloquea citas ya vencidas)
function validarFechaCita(fecha, { permitirPasado = false } = {}) {
  if (!fecha) return 'La fecha de la cita es obligatoria.'
  const f = String(fecha).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || Number.isNaN(Date.parse(f))) return 'La fecha de la cita no es valida.'
  if (!permitirPasado && f < hoyColombia()) return 'No puedes agendar una cita en una fecha pasada.'
  if (f > FECHA_MAX_CITA) return 'Solo se pueden agendar citas hasta el 31 de diciembre de 2026.'
  return null
}

// Valida que la hora sea uno de los horarios de atencion
function validarHoraCita(hora) {
  const h = normalizarHora(hora)
  if (!h) return 'La hora de la cita no es valida.'
  if (!HORAS_CITA.includes(h)) return 'La hora elegida no es un horario de atencion (8:00 - 11:00 AM y 2:00 - 4:00 PM).'
  return null
}

// Indica si una cita (fecha + hora) ya paso o ya empezo, segun la hora de Colombia
function citaYaPaso(fecha, hora, ahora = ahoraColombia()) {
  const f = String(fecha || '').slice(0, 10)
  if (!f) return false
  if (f < ahora.fecha) return true
  if (f > ahora.fecha) return false
  const h = normalizarHora(hora)
  return h ? minutosDe(h) <= ahora.minutos : false
}

// Para citas NUEVAS: si la fecha es hoy, la hora debe ser posterior a la actual.
// Ej. a las 8:01 ya no se puede agendar la cita de las 8:00.
function validarFechaHoraCita(fecha, hora, ahora = ahoraColombia()) {
  const f = String(fecha || '').slice(0, 10)
  if (f === ahora.fecha && citaYaPaso(f, hora, ahora)) {
    return 'Esa hora ya pasó. Elige un horario posterior a la hora actual.'
  }
  return null
}

module.exports = {
  FECHA_MAX_CITA,
  HORAS_CITA,
  validarNombreMascota,
  validarFechaCita,
  validarHoraCita,
  validarFechaHoraCita,
  normalizarHora,
  citaYaPaso,
  ahoraColombia,
  hoyColombia
}
