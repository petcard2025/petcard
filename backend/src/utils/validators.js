// VALIDADORES - Reglas de negocio compartidas por los controladores

// Ultimo dia en que se permite agendar citas (inclusive)
const FECHA_MAX_CITA = '2026-12-31'

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

// Fecha de hoy (YYYY-MM-DD) en hora de Colombia.
// El servidor de AWS corre en UTC: sin esto, despues de las 7 pm en Colombia
// "hoy" ya seria "manana" y se rechazarian citas validas del dia.
function hoyColombia() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
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

module.exports = { FECHA_MAX_CITA, validarNombreMascota, validarFechaCita, hoyColombia }
