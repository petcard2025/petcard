// VALIDACIONES DE PLANES DE ALIMENTACION
// Longitudes y tipos según la tabla planalimentacion:
//   Tipo_dieta, Frecuencia, Horario -> varchar(100) | Calorias -> INTEGER | Fecha_inicio, Fecha_fin -> date

const LIMITE_TEXTO = 100
const CALORIAS_MAX = 10000

const vacio = (v) => v === undefined || v === null || v === ''

// Acepta "2026-02-20" y también "2026-02-20T00:00:00.000Z" (así llegan las fechas al editar un plan)
function fechaValida(valor) {
  const texto = String(valor).substring(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false
  const fecha = new Date(`${texto}T00:00:00Z`)
  return !isNaN(fecha.getTime()) && fecha.toISOString().substring(0, 10) === texto
}

const esIdValido = (v) => !vacio(v) && Number.isInteger(Number(v)) && Number(v) > 0

// Devuelve un mensaje de error o null si el plan es válido.
// { crear: true } exige además la mascota y el servicio (en la edición no se envían).
function validarPlanAlimentacion(body = {}, { crear = false } = {}) {
  if (crear && (!esIdValido(body.ID_mascota) || !esIdValido(body.ID_servicio))) {
    return 'La mascota y el servicio son obligatorios.'
  }

  const textos = [
    ['Tipo_dieta', 'El tipo de dieta'],
    ['Frecuencia', 'La frecuencia'],
    ['Horario', 'El horario']
  ]
  for (const [campo, nombre] of textos) {
    const valor = body[campo]
    if (!vacio(valor) && String(valor).trim().length > LIMITE_TEXTO) {
      return `${nombre} no puede superar ${LIMITE_TEXTO} caracteres.`
    }
  }

  if (!vacio(body.Calorias)) {
    const calorias = Number(body.Calorias)
    if (!Number.isInteger(calorias) || calorias < 1 || calorias > CALORIAS_MAX) {
      return `Las calorías deben ser un número entero entre 1 y ${CALORIAS_MAX}.`
    }
  }

  if (!vacio(body.Fecha_inicio) && !fechaValida(body.Fecha_inicio)) {
    return 'La fecha de inicio no es válida.'
  }
  if (!vacio(body.Fecha_fin) && !fechaValida(body.Fecha_fin)) {
    return 'La fecha de fin no es válida.'
  }
  if (!vacio(body.Fecha_inicio) && !vacio(body.Fecha_fin) &&
      String(body.Fecha_fin).substring(0, 10) < String(body.Fecha_inicio).substring(0, 10)) {
    return 'La fecha de fin no puede ser anterior a la de inicio.'
  }

  return null
}

// Los formularios envían "" en los campos que se dejan vacíos. PostgreSQL rechaza "" en columnas
// de tipo INTEGER o date, así que se guardan como null.
function normalizarPlanAlimentacion(body = {}) {
  return {
    Calorias: vacio(body.Calorias) ? null : Number(body.Calorias),
    Fecha_inicio: vacio(body.Fecha_inicio) ? null : body.Fecha_inicio,
    Fecha_fin: vacio(body.Fecha_fin) ? null : body.Fecha_fin
  }
}

module.exports = { validarPlanAlimentacion, normalizarPlanAlimentacion, CALORIAS_MAX, LIMITE_TEXTO }
