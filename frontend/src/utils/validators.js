// VALIDADORES DEL FORMULARIO DE CITAS - mismas reglas que backend/src/utils/validators.js
// (el backend vuelve a validar: estas son para dar respuesta inmediata al usuario)

// Ultimo dia en que se permite agendar citas (inclusive)
export const FECHA_MAX_CITA = '2026-12-31'

// Horarios de atencion para citas
export const HORAS_CITA = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']

// Fecha y hora actuales en Colombia: { fecha: 'YYYY-MM-DD', minutos: minutos desde las 00:00 }
export function ahoraColombia(date = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date)
  const p = Object.fromEntries(partes.map(x => [x.type, x.value]))
  return { fecha: `${p.year}-${p.month}-${p.day}`, minutos: Number(p.hour) * 60 + Number(p.minute) }
}

// Fecha de hoy (YYYY-MM-DD) en hora de Colombia
export function hoyColombia() {
  return ahoraColombia().fecha
}

// "08:00 AM", "2:00 PM", "08:00:00" o "14:00"  ->  "HH:MM" en 24 h. Devuelve '' si no es valida.
export function horaA24(valor) {
  const m = String(valor ?? '').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
  if (!m) return ''
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ap = m[3] && m[3].toUpperCase()
  if (ap) {
    if (h < 1 || h > 12) return ''
    if (ap === 'PM' && h !== 12) h += 12
    if (ap === 'AM' && h === 12) h = 0
  }
  if (h > 23 || min > 59) return ''
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

// Para mostrar: "14:00:00" -> "02:00 PM"  (si no se entiende, devuelve el texto original)
export function formatHora(valor) {
  const h24 = horaA24(valor)
  if (!h24) return valor ?? '—'
  const [h, m] = h24.split(':').map(Number)
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`
}

// ¿Esa fecha + hora ya paso o ya empezo? (segun la hora de Colombia)
export function citaYaPaso(fecha, hora, ahora = ahoraColombia()) {
  const f = String(fecha ?? '').slice(0, 10)
  if (!f) return false
  if (f < ahora.fecha) return true
  if (f > ahora.fecha) return false
  const h = horaA24(hora)
  if (!h) return false
  const [hh, mm] = h.split(':').map(Number)
  return hh * 60 + mm <= ahora.minutos
}

// Devuelve un mensaje de error, o '' si la fecha es valida.
//   permitirPasado: true al editar una cita existente
export function validarFechaCita(fecha, { permitirPasado = false } = {}) {
  const f = String(fecha ?? '').slice(0, 10)
  if (!f) return 'Selecciona una fecha.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || Number.isNaN(Date.parse(f))) return 'La fecha no es válida.'
  if (!permitirPasado && f < hoyColombia()) return 'No puedes agendar una cita en una fecha pasada.'
  if (f > FECHA_MAX_CITA) return 'Solo se pueden agendar citas hasta el 31 de diciembre de 2026.'
  return ''
}

// Para citas NUEVAS: si es hoy, la hora debe ser posterior a la actual
export function validarFechaHoraCita(fecha, hora) {
  const f = String(fecha ?? '').slice(0, 10)
  if (f === hoyColombia() && citaYaPaso(f, hora)) {
    return 'Esa hora ya pasó. Elige un horario posterior a la hora actual.'
  }
  return ''
}

// Lista de horarios con su disponibilidad: ocupada por otra cita, o ya pasada si la fecha es hoy.
//   ocupadas: horas ocupadas en cualquier formato
export function construirHoras(fecha, ocupadas = []) {
  const ocupadas24 = ocupadas.map(horaA24)
  const ahora = ahoraColombia()
  return HORAS_CITA.map(hora => ({
    hora,
    disponible: !ocupadas24.includes(horaA24(hora)) && !citaYaPaso(fecha, hora, ahora)
  }))
}

// ============ REGISTRO DE USUARIO ============
// Mismas reglas que backend/src/utils/validators.js (el backend vuelve a validar)

// Dominios sugeridos al escribir el @ del correo
export const DOMINIOS_CORREO = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'live.com']

// Deja solo letras (con tildes y ñ) y espacios. Sin números ni caracteres especiales.
export const soloLetras = (texto) =>
  String(texto ?? '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '').replace(/ {2,}/g, ' ').replace(/^ /, '')

// Deja solo números, máximo 10
export const soloTelefono = (texto) => String(texto ?? '').replace(/\D/g, '').slice(0, 10)

export function validarNombrePersona(valor, etiqueta) {
  const v = String(valor ?? '').trim()
  if (!v) return `El ${etiqueta} es obligatorio.`
  if (v.length < 2) return `El ${etiqueta} debe tener al menos 2 letras.`
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(v)) {
    return `El ${etiqueta} solo puede tener letras (sin números ni caracteres especiales).`
  }
  return ''
}

export function validarCorreo(correo) {
  const v = String(correo ?? '').trim()
  if (!v) return 'El correo es obligatorio.'
  if (!v.includes('@')) return 'El correo debe contener el símbolo @.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingresa un correo válido (ej. nombre@gmail.com).'
  return ''
}

export function validarTelefono(telefono) {
  const v = String(telefono ?? '')
  if (!v) return 'El teléfono es obligatorio.'
  if (!/^\d{10}$/.test(v)) return `El teléfono debe tener exactamente 10 números (llevas ${v.length}).`
  return ''
}

// Reglas de la contraseña (se usan también para el checklist en pantalla)
export const reglasContrasena = (pass) => {
  const p = String(pass ?? '')
  return [
    { texto: 'Mínimo 8 caracteres', ok: p.length >= 8 },
    { texto: 'Letras', ok: /[a-záéíóúüñ]/i.test(p) },
    { texto: 'Al menos una mayúscula', ok: /[A-ZÁÉÍÓÚÜÑ]/.test(p) },
    { texto: 'Al menos un número', ok: /\d/.test(p) },
    { texto: 'Al menos un carácter especial (@ # $ % ! *)', ok: /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]/.test(p) }
  ]
}

export function validarContrasena(pass) {
  if (!pass) return 'La contraseña es obligatoria.'
  const falla = reglasContrasena(pass).find(r => !r.ok)
  return falla ? `La contraseña no cumple: ${falla.texto.toLowerCase()}.` : ''
}

export function validarDireccion(direccion) {
  const v = String(direccion ?? '').trim()
  if (!v) return 'La dirección es obligatoria.'
  if (v.length < 5) return 'La dirección es muy corta (mínimo 5 caracteres).'
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 #\-.,°/]+$/.test(v)) return 'La dirección contiene caracteres no permitidos.'
  return ''
}
