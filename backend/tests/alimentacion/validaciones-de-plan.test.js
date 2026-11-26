// Pruebas de Gestión de Alimentación · Validaciones
// validarPlanAlimentacion, normalizarPlanAlimentacion y su uso real al crear/editar por la API (400 sin tocar la BD).
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { validarPlanAlimentacion, normalizarPlanAlimentacion, CALORIAS_MAX } = require('../../src/utils/alimentacion-validators')
const { auth, mockDb, consultasQue } = require('../helpers/pruebas')

const VALIDO = {
  ID_mascota: 3, ID_servicio: 4, Tipo_dieta: 'BARF', Frecuencia: '2 veces al día', Horario: '8am - 6pm',
  Calorias: 800, Fecha_inicio: '2026-03-01', Fecha_fin: '2026-06-01'
}
const CREAR = { crear: true }

describe('validarPlanAlimentacion (función)', () => {
  test('acepta un plan completo', () => {
    expect(validarPlanAlimentacion(VALIDO, CREAR)).toBeNull()
  })

  test('acepta un plan con solo la mascota y el servicio (todo lo demás es opcional)', () => {
    expect(validarPlanAlimentacion({ ID_mascota: 3, ID_servicio: 4 }, CREAR)).toBeNull()
  })

  describe('mascota y servicio (solo al crear)', () => {
    test.each([
      ['sin mascota', { ID_mascota: undefined }],
      ['mascota vacía', { ID_mascota: '' }],
      ['sin servicio', { ID_servicio: undefined }],
      ['servicio vacío', { ID_servicio: '' }],
      ['mascota que no es número', { ID_mascota: 'abc' }],
      ['mascota en cero', { ID_mascota: 0 }],
      ['servicio negativo', { ID_servicio: -1 }],
      ['servicio decimal', { ID_servicio: 1.5 }]
    ])('rechaza %s', (_caso, cambios) => {
      expect(validarPlanAlimentacion({ ...VALIDO, ...cambios }, CREAR)).toBe('La mascota y el servicio son obligatorios.')
    })

    test('acepta los ids como texto numérico ("3"), como los envía un select', () => {
      expect(validarPlanAlimentacion({ ...VALIDO, ID_mascota: '3', ID_servicio: '4' }, CREAR)).toBeNull()
    })

    test('al editar no se exigen (no se envían)', () => {
      expect(validarPlanAlimentacion({ Tipo_dieta: 'BARF' })).toBeNull()
      expect(validarPlanAlimentacion({ Tipo_dieta: 'BARF' }, { crear: false })).toBeNull()
    })
  })

  describe('textos de máximo 100 caracteres', () => {
    test.each([['Tipo_dieta', /tipo de dieta/], ['Frecuencia', /frecuencia/], ['Horario', /horario/]])('%s', (campo, mensaje) => {
      expect(validarPlanAlimentacion({ ...VALIDO, [campo]: 'a'.repeat(100) }, CREAR)).toBeNull()
      expect(validarPlanAlimentacion({ ...VALIDO, [campo]: 'a'.repeat(101) }, CREAR)).toMatch(mensaje)
      expect(validarPlanAlimentacion({ ...VALIDO, [campo]: 'a'.repeat(101) }, CREAR)).toMatch(/100 caracteres/)
    })

    test.each([[undefined], [null], ['']])('acepta %p', (valor) => {
      expect(validarPlanAlimentacion({ ...VALIDO, Tipo_dieta: valor, Frecuencia: valor, Horario: valor }, CREAR)).toBeNull()
    })
  })

  describe('calorías', () => {
    test.each([[1], [800], ['800'], [CALORIAS_MAX], [undefined], [null], ['']])('acepta %p', (Calorias) => {
      expect(validarPlanAlimentacion({ ...VALIDO, Calorias }, CREAR)).toBeNull()
    })

    test.each([[0], [-50], [CALORIAS_MAX + 1], [12.5], ['abc'], ['12abc'], [NaN]])('rechaza %p', (Calorias) => {
      expect(validarPlanAlimentacion({ ...VALIDO, Calorias }, CREAR)).toMatch(/calorías deben ser un número entero entre 1 y 10000/)
    })
  })

  describe('fechas', () => {
    test.each([['2026-03-01'], ['2026-03-01T00:00:00.000Z'], ['2028-02-29'], [undefined], [null], ['']])('acepta la fecha de inicio %p', (Fecha_inicio) => {
      expect(validarPlanAlimentacion({ ...VALIDO, Fecha_inicio, Fecha_fin: undefined }, CREAR)).toBeNull()
    })

    test.each([['01/03/2026'], ['2026-13-01'], ['2026-02-30'], ['2027-02-29'], ['ayer'], ['2026-3-1']])('rechaza la fecha de inicio %p', (Fecha_inicio) => {
      expect(validarPlanAlimentacion({ ...VALIDO, Fecha_inicio }, CREAR)).toBe('La fecha de inicio no es válida.')
    })

    test.each([['31/12/2026'], ['2026-00-10'], ['fin']])('rechaza la fecha de fin %p', (Fecha_fin) => {
      expect(validarPlanAlimentacion({ ...VALIDO, Fecha_fin }, CREAR)).toBe('La fecha de fin no es válida.')
    })

    test('la fecha de fin no puede ser anterior a la de inicio', () => {
      expect(validarPlanAlimentacion({ ...VALIDO, Fecha_inicio: '2026-06-01', Fecha_fin: '2026-03-01' }, CREAR))
        .toBe('La fecha de fin no puede ser anterior a la de inicio.')
    })

    test('la fecha de fin puede ser igual a la de inicio', () => {
      expect(validarPlanAlimentacion({ ...VALIDO, Fecha_inicio: '2026-03-01', Fecha_fin: '2026-03-01' }, CREAR)).toBeNull()
    })

    test('compara bien aunque una fecha traiga hora y la otra no', () => {
      expect(validarPlanAlimentacion({ ...VALIDO, Fecha_inicio: '2026-03-01T00:00:00.000Z', Fecha_fin: '2026-03-01' }, CREAR)).toBeNull()
    })

    test('se puede dejar solo una de las dos fechas', () => {
      expect(validarPlanAlimentacion({ ...VALIDO, Fecha_fin: '' }, CREAR)).toBeNull()
      expect(validarPlanAlimentacion({ ...VALIDO, Fecha_inicio: '' }, CREAR)).toBeNull()
    })
  })

  test('orden de las revisiones: mascota/servicio, textos, calorías y fechas', () => {
    const todoMal = { ID_mascota: '', Tipo_dieta: 'a'.repeat(101), Calorias: -1, Fecha_inicio: 'x' }
    expect(validarPlanAlimentacion(todoMal, CREAR)).toMatch(/mascota y el servicio/)
    expect(validarPlanAlimentacion({ ...todoMal, ID_mascota: 3, ID_servicio: 4 }, CREAR)).toMatch(/tipo de dieta/)
    expect(validarPlanAlimentacion({ ...todoMal, ID_mascota: 3, ID_servicio: 4, Tipo_dieta: 'ok' }, CREAR)).toMatch(/calorías/)
    expect(validarPlanAlimentacion({ ...todoMal, ID_mascota: 3, ID_servicio: 4, Tipo_dieta: 'ok', Calorias: 10 }, CREAR)).toMatch(/fecha de inicio/)
  })
})

describe('normalizarPlanAlimentacion (función)', () => {
  test('convierte los vacíos en null', () => {
    expect(normalizarPlanAlimentacion({ Calorias: '', Fecha_inicio: '', Fecha_fin: '' }))
      .toEqual({ Calorias: null, Fecha_inicio: null, Fecha_fin: null })
    expect(normalizarPlanAlimentacion({})).toEqual({ Calorias: null, Fecha_inicio: null, Fecha_fin: null })
    expect(normalizarPlanAlimentacion({ Calorias: null })).toMatchObject({ Calorias: null })
  })

  test('conserva los valores y pasa las calorías a número', () => {
    expect(normalizarPlanAlimentacion({ Calorias: '900', Fecha_inicio: '2026-03-01', Fecha_fin: '2026-06-01' }))
      .toEqual({ Calorias: 900, Fecha_inicio: '2026-03-01', Fecha_fin: '2026-06-01' })
  })

  test('0 calorías no se confunde con vacío (lo rechaza la validación, no la normalización)', () => {
    expect(normalizarPlanAlimentacion({ Calorias: 0 }).Calorias).toBe(0)
  })
})

describe('Validaciones al guardar por la API', () => {
  const casos = [
    ['calorías negativas', { Calorias: -5 }, /calorías/],
    ['calorías que no son número', { Calorias: 'muchas' }, /calorías/],
    ['calorías decimales', { Calorias: 10.5 }, /calorías/],
    ['calorías por encima del máximo', { Calorias: 50000 }, /calorías/],
    ['tipo de dieta demasiado largo', { Tipo_dieta: 'a'.repeat(101) }, /tipo de dieta/],
    ['frecuencia demasiado larga', { Frecuencia: 'a'.repeat(101) }, /frecuencia/],
    ['horario demasiado largo', { Horario: 'a'.repeat(101) }, /horario/],
    ['fecha de inicio inválida', { Fecha_inicio: '31/12/2026' }, /fecha de inicio/],
    ['fecha de fin inválida', { Fecha_fin: 'mañana' }, /fecha de fin/],
    ['fecha de fin anterior a la de inicio', { Fecha_inicio: '2026-06-01', Fecha_fin: '2026-03-01' }, /anterior/]
  ]

  describe.each([
    ['POST /api/alimentacion', (cuerpo) => request(app).post('/api/alimentacion').set(auth('administrador')).send(cuerpo), /INSERT INTO planalimentacion/, { insertId: 1 }],
    ['PUT /api/alimentacion/:id', (cuerpo) => request(app).put('/api/alimentacion/7').set(auth('administrador')).send(cuerpo), /UPDATE planalimentacion SET/, { affectedRows: 1 }]
  ])('%s', (_nombre, enviar, patronSql, respuestaBd) => {
    test.each(casos)('400 por %s, sin tocar la base de datos', async (_caso, cambios, mensaje) => {
      mockDb([[patronSql, respuestaBd]])
      const res = await enviar({ ...VALIDO, ...cambios })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(mensaje)
      expect(consultasQue(patronSql)).toHaveLength(0)
    })

    test('un plan válido sí se guarda', async () => {
      mockDb([[patronSql, respuestaBd]])
      expect((await enviar(VALIDO)).status).toBe(200)
      expect(consultasQue(patronSql)).toHaveLength(1)
    })
  })

  test('POST: 400 si falta la mascota o el servicio, sin tocar la base de datos', async () => {
    mockDb([[/INSERT INTO planalimentacion/, { insertId: 1 }]])
    for (const cambios of [{ ID_mascota: undefined }, { ID_servicio: '' }]) {
      const res = await request(app).post('/api/alimentacion').set(auth('administrador')).send({ ...VALIDO, ...cambios })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('La mascota y el servicio son obligatorios.')
    }
    expect(consultasQue(/INSERT INTO planalimentacion/)).toHaveLength(0)
  })

  test('PUT: no exige la mascota ni el servicio (no se envían al editar)', async () => {
    mockDb([[/UPDATE planalimentacion SET/, { affectedRows: 1 }]])
    const { ID_mascota, ID_servicio, ...sinIds } = VALIDO
    expect((await request(app).put('/api/alimentacion/7').set(auth('administrador')).send(sinIds)).status).toBe(200)
  })

  test('el permiso se revisa antes que los datos: un veterinario sin atención recibe 403, no 400', async () => {
    mockDb([
      [/FROM veterinario WHERE ID_usuario/, [{ ID_veterinario: 5 }]],
      [/SELECT 1 FROM cita WHERE/, []]
    ])
    const res = await request(app).post('/api/alimentacion').set(auth('veterinario')).send({ ...VALIDO, Calorias: -1 })
    expect(res.status).toBe(403)
  })
})
