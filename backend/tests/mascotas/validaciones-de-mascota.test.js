// Pruebas de Gestión de Mascotas · Validaciones
// validarMascota (nombre, sexo y peso) y su uso real al crear/editar por la API (400 sin tocar la BD).
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { validarMascota } = require('../../src/utils/validators')
const { auth, mockDb, consultasQue } = require('../helpers/pruebas')

const VALIDA = { ID_cliente: 3, Nombre: 'Firulais', Especie: 'Perro', Sexo: 'Macho', Peso: 12 }
const MSG_NOMBRE = /solo puede tener letras/
const MSG_SEXO = /Macho o Hembra/

describe('validarMascota (función)', () => {
  describe('nombre', () => {
    test.each([
      ['Firulais'], ['Ana'], ['Ñoño'], ['Luna Bella'], ['Mía'], ['Ab'], ['A'.repeat(30)]
    ])('acepta "%s"', (Nombre) => {
      expect(validarMascota({ ...VALIDA, Nombre })).toBeNull()
    })

    test.each([
      ['con números', 'Rex123'],
      ['con símbolos', 'Rex!'],
      ['con guion', 'Mini-Me'],
      ['de un solo carácter', 'A'],
      ['de 31 caracteres', 'A'.repeat(31)],
      ['solo espacios', '     '],
      ['vacío', ''],
      ['con emoji', 'Rex🐶']
    ])('rechaza un nombre %s', (_caso, Nombre) => {
      expect(validarMascota({ ...VALIDA, Nombre })).toMatch(MSG_NOMBRE)
    })

    test('rechaza nombre ausente, nulo o que no es texto válido', () => {
      expect(validarMascota({ Sexo: 'Macho' })).toMatch(MSG_NOMBRE)
      expect(validarMascota({ Nombre: null, Sexo: 'Macho' })).toMatch(MSG_NOMBRE)
      expect(validarMascota({ Nombre: 1234, Sexo: 'Macho' })).toMatch(MSG_NOMBRE)
    })

    test('ignora los espacios al inicio y al final al contar la longitud', () => {
      expect(validarMascota({ ...VALIDA, Nombre: '  Rex  ' })).toBeNull()
      expect(validarMascota({ ...VALIDA, Nombre: '  A  ' })).toMatch(MSG_NOMBRE)
    })
  })

  describe('sexo', () => {
    test.each([['Macho'], ['Hembra']])('acepta "%s"', (Sexo) => {
      expect(validarMascota({ ...VALIDA, Sexo })).toBeNull()
    })

    test.each([['Otro'], ['macho'], ['HEMBRA'], [''], [null], [undefined], [1]])('rechaza %p', (Sexo) => {
      expect(validarMascota({ ...VALIDA, Sexo })).toMatch(MSG_SEXO)
    })
  })

  describe('peso', () => {
    test.each([[0.5], [12], [90], ['12.5'], [''], [null], [undefined]])('acepta %p', (Peso) => {
      expect(validarMascota({ ...VALIDA, Peso })).toBeNull()
    })

    test.each([[0], [-3], ['abc'], [NaN]])('rechaza el peso %p como no válido', (Peso) => {
      expect(validarMascota({ ...VALIDA, Peso })).toBe('El peso no es válido.')
    })

    test.each([[90.1], [95], [500]])('rechaza %p kg por superar el máximo de 90', (Peso) => {
      expect(validarMascota({ ...VALIDA, Peso })).toMatch(/90 kg/)
    })
  })

  test('el nombre se revisa antes que el sexo y el sexo antes que el peso', () => {
    expect(validarMascota({ Nombre: '1', Sexo: 'x', Peso: 999 })).toMatch(MSG_NOMBRE)
    expect(validarMascota({ Nombre: 'Rex', Sexo: 'x', Peso: 999 })).toMatch(MSG_SEXO)
    expect(validarMascota({ Nombre: 'Rex', Sexo: 'Macho', Peso: 999 })).toMatch(/90 kg/)
  })
})

describe('Validaciones al guardar por la API', () => {
  const casos = [
    ['nombre con números', { Nombre: 'Rex123' }, MSG_NOMBRE],
    ['nombre muy corto', { Nombre: 'A' }, MSG_NOMBRE],
    ['nombre muy largo', { Nombre: 'A'.repeat(31) }, MSG_NOMBRE],
    ['sexo inválido', { Sexo: 'Otro' }, MSG_SEXO],
    ['sexo ausente', { Sexo: undefined }, MSG_SEXO],
    ['peso mayor a 90', { Peso: 95 }, /90 kg/],
    ['peso negativo', { Peso: -1 }, /no es válido/],
    ['peso que no es número', { Peso: 'pesado' }, /no es válido/]
  ]

  describe.each([
    ['POST /api/mascotas', (cuerpo) => request(app).post('/api/mascotas').set(auth('cliente')).send(cuerpo), /INSERT INTO mascota/, { insertId: 1 }],
    ['PUT /api/mascotas/:id', (cuerpo) => request(app).put('/api/mascotas/8').set(auth('cliente')).send(cuerpo), /UPDATE mascota SET Fecha_nacimiento/, { affectedRows: 1 }]
  ])('%s', (_nombre, enviar, patronSql, respuestaBd) => {
    test.each(casos)('400 por %s, sin tocar la base de datos', async (_caso, cambios, mensaje) => {
      mockDb([[patronSql, respuestaBd]])
      const res = await enviar({ ...VALIDA, ...cambios })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(mensaje)
      expect(consultasQue(patronSql)).toHaveLength(0)
    })

    test('acepta el peso vacío (es opcional)', async () => {
      mockDb([[patronSql, respuestaBd]])
      const res = await enviar({ ...VALIDA, Peso: '' })
      expect(res.status).toBe(200)
      expect(consultasQue(patronSql)).toHaveLength(1)
    })
  })
})
