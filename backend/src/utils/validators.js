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

module.exports = { normalizarTelefono, validarMascota }