// VALIDADORES DEL FORMULARIO - mismas reglas que backend/src/utils/validators.js
// (el backend vuelve a validar: estas son para dar respuesta inmediata al usuario)

// Ultimo dia en que se permite agendar citas (inclusive)
export const FECHA_MAX_CITA = '2026-12-31'

// Solo letras (con tildes y ñ), separadas por un espacio, guion o apostrofe
const REGEX_NOMBRE = /^\p{L}+(?:[ '’-]\p{L}+)*$/u

// Devuelve un mensaje de error, o '' si el nombre es valido
export function validarNombreMascota(nombre) {
  const n = String(nombre ?? '').trim()
  if (n.length < 2 || n.length > 30) return 'El nombre de la mascota debe tener entre 2 y 30 caracteres.'
  if (!REGEX_NOMBRE.test(n)) return 'El nombre de la mascota solo puede contener letras (sin números ni símbolos como @).'
  return ''
}

// Fecha de hoy (YYYY-MM-DD) en hora de Colombia
export function hoyColombia() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
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
