function normalizarTelefono(telefono) {
  let num = telefono.toString().replace(/[\s\-().]/g, '')
  if (num.startsWith('+57')) return num
  if (num.startsWith('57') && num.length === 12) return '+' + num
  if (num.length === 10) return '+57' + num
  if (num.startsWith('0') && num.length === 11) return '+57' + num.slice(1)
  if (num.startsWith('+')) return num
  return '+57' + num
}

function validarMascota({ Nombre, Sexo, Peso }) {
  const nombre = String(Nombre || '').trim()
  if (nombre.length < 2 || nombre.length > 30 || !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(nombre)) {
    return 'El nombre solo puede tener letras (mínimo 2, máximo 30).'
  }
  if (!['Macho', 'Hembra'].includes(Sexo)) return 'El sexo debe ser Macho o Hembra.'
  if (Peso !== undefined && Peso !== null && Peso !== '') {
    const peso = Number(Peso)
    if (isNaN(peso) || peso <= 0) return 'El peso no es válido.'
    if (peso > 90) return 'El peso máximo permitido es 90 kg.'
  }
  return null
}

// ============ REGISTRO DE USUARIO (cliente) ============
const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/
const DIRECCION_OK = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 #\-.,°/]+$/

function validarNombrePersona(valor, etiqueta) {
  const v = String(valor || '').trim()
  if (!v) return `El ${etiqueta} es obligatorio.`
  if (v.length < 2 || v.length > 50) return `El ${etiqueta} debe tener entre 2 y 50 letras.`
  if (!SOLO_LETRAS.test(v)) return `El ${etiqueta} solo puede tener letras (sin números ni caracteres especiales).`
  return null
}

function validarCorreo(correo) {
  const v = String(correo || '').trim()
  if (!v.includes('@')) return 'El correo debe contener el símbolo @.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingresa un correo válido (ej. nombre@gmail.com).'
  return null
}

function validarTelefono(telefono) {
  if (!/^\d{10}$/.test(String(telefono || '').trim())) return 'El teléfono debe tener exactamente 10 números.'
  return null
}

function validarContrasena(pass) {
  const p = String(pass || '')
  if (p.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (!/[a-záéíóúüñ]/i.test(p)) return 'La contraseña debe incluir letras.'
  if (!/[A-ZÁÉÍÓÚÜÑ]/.test(p)) return 'La contraseña debe incluir al menos una mayúscula.'
  if (!/\d/.test(p)) return 'La contraseña debe incluir al menos un número.'
  if (!/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]/.test(p)) return 'La contraseña debe incluir al menos un carácter especial (ej. @ # $ % ! *).'
  return null
}

function validarDireccion(direccion) {
  const v = String(direccion || '').trim()
  if (!v) return 'La dirección es obligatoria.'
  if (v.length < 5 || v.length > 255) return 'La dirección debe tener entre 5 y 255 caracteres.'
  if (!DIRECCION_OK.test(v)) return 'La dirección contiene caracteres no permitidos.'
  return null
}

// Devuelve el primer error del registro de un cliente, o null si todo está bien.
function validarRegistroCliente({ Nombre, Apellido, Correo, Telefono, Contrasena, Direccion }) {
  return validarNombrePersona(Nombre, 'nombre')
    || validarNombrePersona(Apellido, 'apellido')
    || validarCorreo(Correo)
    || validarTelefono(Telefono)
    || validarContrasena(Contrasena)
    || validarDireccion(Direccion)
}

// ============ CITAS ============
// Ultimo dia en que se permite agendar citas (inclusive)
const FECHA_MAX_CITA = '2026-12-31'

// Horarios de atencion para citas (formato 24 h "HH:MM")
const HORAS_CITA = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

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

// Reglas del servicio (catálogo). Longitudes según la tabla servicio: Nombre 120, Categoria 100, Precio decimal(10,2)
function validarServicio({ Nombre, Categoria, Precio }) {
  const nombre = typeof Nombre === 'string' ? Nombre.trim() : ''
  if (nombre.length < 2 || nombre.length > 120) {
    return 'El nombre del servicio es obligatorio (mínimo 2, máximo 120 caracteres).'
  }
  if (Categoria !== undefined && Categoria !== null && String(Categoria).trim().length > 100) {
    return 'La categoría no puede superar 100 caracteres.'
  }
  if (Precio !== undefined && Precio !== null && Precio !== '') {
    const precio = Number(Precio)
    if (isNaN(precio) || precio < 0) return 'El precio no es válido.'
    if (precio > 99999999.99) return 'El precio es demasiado alto.'
  }
  return null
}

module.exports = {
  normalizarTelefono,
  validarNombrePersona,
  validarCorreo,
  validarTelefono,
  validarContrasena,
  validarDireccion,
  validarRegistroCliente,
  validarMascota,
  validarServicio,
  FECHA_MAX_CITA,
  HORAS_CITA,
  validarFechaCita,
  validarHoraCita,
  validarFechaHoraCita,
  normalizarHora,
  citaYaPaso,
  ahoraColombia,
  hoyColombia
}
