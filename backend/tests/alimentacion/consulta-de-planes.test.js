// Pruebas de Gestión de Alimentación · Consulta de planes
// GET /api/alimentacion (según el rol) y GET /api/alimentacion/mascota/:id_mascota
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const PERFIL_VET = [/FROM veterinario WHERE ID_usuario/, [{ ID_veterinario: 5, Cargo: 'Veterinario', Especialidad: 'Nutrición' }]]
const PLAN = { ID_planAlimentacion: 1, ID_mascota: 3, ID_servicio: 4, Tipo_dieta: 'BARF', Revision_nutricional: 'Activo' }

describe('Alimentación · Consulta general (GET /api/alimentacion)', () => {
  test('401 sin token', async () => {
    mockDb([[/FROM planalimentacion/, [PLAN]]])
    const res = await request(app).get('/api/alimentacion')
    expect(res.status).toBe(401)
    expect(consultasQue(/planalimentacion/)).toHaveLength(0)
  })

  test('403 con un token inválido', async () => {
    const res = await request(app).get('/api/alimentacion').set('Authorization', 'Bearer token-falso')
    expect(res.status).toBe(403)
  })

  test('el administrador ve todos los planes, con el nombre de la mascota y del servicio', async () => {
    mockDb([[/FROM planalimentacion pa/, [{ ...PLAN, Nombre_mascota: 'Rex', Nombre_servicio: 'Consulta Nutricional' }]]])
    const res = await request(app).get('/api/alimentacion').set(auth('administrador'))
    expect(res.status).toBe(200)
    expect(res.body[0]).toMatchObject({ Nombre_mascota: 'Rex', Nombre_servicio: 'Consulta Nutricional' })
    const [sql, params] = consultasQue(/FROM planalimentacion pa/)[0]
    expect(sql).toMatch(/JOIN mascota m/)
    expect(sql).toMatch(/JOIN servicio s/)
    expect(sql).not.toMatch(/WHERE/)
    expect(params).toEqual([])
  })

  test('el veterinario solo ve los planes de mascotas y servicios que atendió', async () => {
    mockDb([PERFIL_VET, [/FROM planalimentacion pa/, [PLAN]]])
    const res = await request(app).get('/api/alimentacion').set(auth('veterinario', 8))
    expect(res.status).toBe(200)
    const [sql, params] = consultasQue(/FROM planalimentacion pa/)[0]
    expect(sql).toMatch(/WHERE EXISTS/)
    expect(sql).toMatch(/ci\.ID_veterinario = \?/)
    expect(params).toEqual([5])
    // el perfil del veterinario se busca con el usuario del token
    expect(consultasQue(/FROM veterinario WHERE ID_usuario/)[0][1]).toEqual([8])
  })

  test('403 si el veterinario no tiene perfil asociado, sin consultar los planes', async () => {
    mockDb([[/FROM veterinario WHERE ID_usuario/, []]])
    const res = await request(app).get('/api/alimentacion').set(auth('veterinario'))
    expect(res.status).toBe(403)
    expect(consultasQue(/FROM planalimentacion/)).toHaveLength(0)
  })

  test('lista vacía si no hay planes', async () => {
    mockDb([[/FROM planalimentacion pa/, []]])
    const res = await request(app).get('/api/alimentacion').set(auth('administrador'))
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/FROM planalimentacion pa/, falla('sin conexión')]])
    const res = await request(app).get('/api/alimentacion').set(auth('administrador'))
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('sin conexión')
  })

  test('500 si falla la búsqueda del perfil del veterinario', async () => {
    mockDb([[/FROM veterinario WHERE ID_usuario/, falla('fallo perfil')]])
    expect((await request(app).get('/api/alimentacion').set(auth('veterinario'))).status).toBe(500)
  })
})

describe('Alimentación · Historial por mascota (GET /api/alimentacion/mascota/:id_mascota)', () => {
  test('401 sin token', async () => {
    mockDb([[/FROM planalimentacion/, [PLAN]]])
    expect((await request(app).get('/api/alimentacion/mascota/3')).status).toBe(401)
    expect(consultasQue(/planalimentacion/)).toHaveLength(0)
  })

  test('devuelve solo los planes de la mascota pedida', async () => {
    mockDb([[/FROM planalimentacion WHERE ID_mascota=\?/, [PLAN]]])
    const res = await request(app).get('/api/alimentacion/mascota/3').set(auth('cliente', 2))
    expect(res.status).toBe(200)
    expect(res.body).toEqual([PLAN])
    expect(consultasQue(/WHERE ID_mascota=\?/)[0][1]).toEqual(['3'])
  })

  test('dos mascotas distintas generan consultas distintas (no se mezclan)', async () => {
    mockDb([[/FROM planalimentacion WHERE ID_mascota=\?/, []]])
    await request(app).get('/api/alimentacion/mascota/3').set(auth('cliente'))
    await request(app).get('/api/alimentacion/mascota/9').set(auth('cliente'))
    expect(consultasQue(/WHERE ID_mascota=\?/).map(c => c[1])).toEqual([['3'], ['9']])
  })

  test('el plan Activo aparece primero y luego los más recientes', async () => {
    mockDb([[/FROM planalimentacion WHERE ID_mascota=\?/, []]])
    await request(app).get('/api/alimentacion/mascota/3').set(auth('cliente'))
    const [sql] = consultasQue(/WHERE ID_mascota=\?/)[0]
    expect(sql).toMatch(/ORDER BY CASE WHEN Revision_nutricional = 'Activo' THEN 0 ELSE 1 END, ID_planAlimentacion DESC/)
    // comillas simples: en PostgreSQL las dobles se leerían como una columna
    expect(sql).not.toContain('"')
  })

  test('lista vacía si la mascota no tiene planes', async () => {
    mockDb([[/FROM planalimentacion WHERE ID_mascota=\?/, []]])
    const res = await request(app).get('/api/alimentacion/mascota/3').set(auth('cliente'))
    expect(res.body).toEqual([])
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/FROM planalimentacion/, falla('fallo')]])
    expect((await request(app).get('/api/alimentacion/mascota/3').set(auth('cliente'))).status).toBe(500)
  })

  test.todo('un cliente solo debería ver los planes de SUS mascotas: hoy no se compara el dueño con el token, así que puede consultar los de cualquier mascota')
  test.todo('un cliente no debería poder listar los planes de todas las mascotas (GET /api/alimentacion): hoy lo puede hacer con solo tener sesión')
})
