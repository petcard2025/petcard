// Pruebas de Gestión de Servicios · Validaciones
// validarServicio (nombre, categoría y precio) y su uso real al crear/editar por la API.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { validarServicio } = require('../../src/utils/validators')
const { auth, mockDb, consultasQue } = require('../helpers/pruebas')

const VALIDO = { Nombre: 'Baño', Descripcion: 'Baño y secado', Categoria: 'Estética', Precio: 35000 }
const MSG_NOMBRE = /nombre del servicio es obligatorio/
const MSG_CATEGORIA = /categoría no puede superar 100/
const MSG_PRECIO = 'El precio no es válido.'

describe('validarServicio (función)', () => {
  test('acepta un servicio completo', () => {
    expect(validarServicio(VALIDO)).toBeNull()
  })

  describe('nombre', () => {
    test.each([['Baño'], ['Ab'], ['Vacuna Antirrábica'], ['  Consulta  '], ['A'.repeat(120)]])('acepta %p', (Nombre) => {
      expect(validarServicio({ ...VALIDO, Nombre })).toBeNull()
    })

    test.each([
      ['ausente', undefined],
      ['nulo', null],
      ['vacío', ''],
      ['solo espacios', '     '],
      ['de un carácter', 'A'],
      ['de 121 caracteres', 'A'.repeat(121)],
      ['que no es texto', 12345],
      ['que es un objeto', { $ne: null }]
    ])('rechaza un nombre %s', (_caso, Nombre) => {
      expect(validarServicio({ ...VALIDO, Nombre })).toMatch(MSG_NOMBRE)
    })
  })

  describe('categoría (opcional)', () => {
    test.each([[undefined], [null], [''], ['Consulta'], ['C'.repeat(100)]])('acepta %p', (Categoria) => {
      expect(validarServicio({ ...VALIDO, Categoria })).toBeNull()
    })
    test('rechaza más de 100 caracteres', () => {
      expect(validarServicio({ ...VALIDO, Categoria: 'C'.repeat(101) })).toMatch(MSG_CATEGORIA)
    })
  })

  describe('precio (opcional)', () => {
    test.each([[0], [35000], ['35000'], ['35000.50'], [99999999.99], [undefined], [null], ['']])('acepta %p', (Precio) => {
      expect(validarServicio({ ...VALIDO, Precio })).toBeNull()
    })
    test.each([[-1], ['-5'], ['abc'], [NaN]])('rechaza %p', (Precio) => {
      expect(validarServicio({ ...VALIDO, Precio })).toBe(MSG_PRECIO)
    })
    test.each([[100000000], [1e12]])('rechaza %p por no caber en la columna decimal(10,2)', (Precio) => {
      expect(validarServicio({ ...VALIDO, Precio })).toBe('El precio es demasiado alto.')
    })
  })

  test('el nombre se revisa antes que la categoría y la categoría antes que el precio', () => {
    expect(validarServicio({ Nombre: '', Categoria: 'C'.repeat(101), Precio: -1 })).toMatch(MSG_NOMBRE)
    expect(validarServicio({ Nombre: 'Baño', Categoria: 'C'.repeat(101), Precio: -1 })).toMatch(MSG_CATEGORIA)
    expect(validarServicio({ Nombre: 'Baño', Precio: -1 })).toBe(MSG_PRECIO)
  })
})

describe('Validaciones al guardar por la API', () => {
  const casos = [
    ['sin nombre', { Nombre: undefined }, MSG_NOMBRE],
    ['nombre vacío', { Nombre: '   ' }, MSG_NOMBRE],
    ['nombre demasiado largo', { Nombre: 'A'.repeat(121) }, MSG_NOMBRE],
    ['categoría demasiado larga', { Categoria: 'C'.repeat(101) }, MSG_CATEGORIA],
    ['precio negativo', { Precio: -100 }, /precio no es válido/],
    ['precio que no es número', { Precio: 'barato' }, /precio no es válido/],
    ['precio demasiado alto', { Precio: 1e9 }, /demasiado alto/]
  ]

  describe.each([
    ['POST /api/servicios', (cuerpo) => request(app).post('/api/servicios').set(auth('administrador')).send(cuerpo), /INSERT INTO servicio/, { insertId: 1 }],
    ['PUT /api/servicios/:id', (cuerpo) => request(app).put('/api/servicios/7').set(auth('administrador')).send(cuerpo), /UPDATE servicio/, { affectedRows: 1 }]
  ])('%s', (_nombre, enviar, patronSql, respuestaBd) => {
    test.each(casos)('400 %s, sin tocar la base de datos', async (_caso, cambios, mensaje) => {
      mockDb([[patronSql, respuestaBd]])
      const res = await enviar({ ...VALIDO, ...cambios })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(mensaje)
      expect(consultasQue(patronSql)).toHaveLength(0)
    })

    test('un servicio válido sí se guarda', async () => {
      mockDb([[patronSql, respuestaBd]])
      expect((await enviar(VALIDO)).status).toBe(200)
      expect(consultasQue(patronSql)).toHaveLength(1)
    })
  })

  test('primero se revisa el permiso y luego los datos: un cliente recibe 403, no 400', async () => {
    mockDb([[/INSERT INTO servicio/, { insertId: 1 }]])
    const res = await request(app).post('/api/servicios').set(auth('cliente')).send({ Nombre: '' })
    expect(res.status).toBe(403)
  })
})
