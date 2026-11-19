const { normalizarTelefono, validarMascota } = require('../../src/utils/validators')

describe('normalizarTelefono', () => {
  test.each([
    ['3001234567', '+573001234567'],
    ['300 123 4567', '+573001234567'],
    ['573001234567', '+573001234567'],
    ['03001234567', '+573001234567'],
    ['+573001234567', '+573001234567']
  ])('%s -> %s', (entrada, esperado) => {
    expect(normalizarTelefono(entrada)).toBe(esperado)
  })
})

describe('validarMascota', () => {
  const valida = { Nombre: 'Firulais', Sexo: 'Macho', Peso: 12 }

  test('acepta una mascota válida', () => {
    expect(validarMascota(valida)).toBeNull()
  })
  test('rechaza nombre con números', () => {
    expect(validarMascota({ ...valida, Nombre: 'Rex123' })).toMatch(/solo puede tener letras/)
  })
  test('rechaza sexo inválido', () => {
    expect(validarMascota({ ...valida, Sexo: 'Otro' })).toMatch(/Macho o Hembra/)
  })
  test('rechaza peso mayor a 90 kg', () => {
    expect(validarMascota({ ...valida, Peso: 95 })).toMatch(/90 kg/)
  })
  test('acepta peso vacío', () => {
    expect(validarMascota({ ...valida, Peso: '' })).toBeNull()
  })
})