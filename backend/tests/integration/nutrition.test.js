jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const jwt = require('jsonwebtoken')
const db = require('../../src/config/database')
const app = require('../helpers/app')

// ---------- Ayudas ----------
const auth = (Rol, ID_usuario = 1) => ({
  Authorization: `Bearer ${jwt.sign({ ID_usuario, Rol }, process.env.JWT_SECRET)}`
})

// Simula la BD: cada regla es [patrón del SQL, respuesta | función(params, cb)]
function mockDb(reglas) {
  db.query.mockImplementation((sql, params, cb) => {
    if (typeof params === 'function') { cb = params; params = [] }
    if (!cb) return
    const regla = reglas.find(([patron]) => patron.test(sql))
    if (!regla) return cb(new Error('Consulta no simulada: ' + sql.slice(0, 50)))
    const r = regla[1]
    typeof r === 'function' ? r(params, cb) : cb(null, r)
  })
}

const consultasQue = (patron) => db.query.mock.calls.filter(c => patron.test(c[0]))
const falla = (msg) => (p, cb) => cb(new Error(msg))

// Reglas reutilizables
const PERFIL_VET = [/FROM veterinario WHERE ID_usuario/, [{ ID_veterinario: 5, Cargo: 'Veterinario', Especialidad: 'Nutrición' }]]
const VET_ATENDIO = [/SELECT 1 FROM cita WHERE/, [{ '?column?': 1 }]]
const VET_NO_ATENDIO = [/SELECT 1 FROM cita WHERE/, []]
const PLAN_DE_MASCOTA_3 = [/SELECT ID_mascota, ID_servicio FROM planalimentacion/, [{ ID_mascota: 3, ID_servicio: 4 }]]
const INSERT_OK = [/INSERT INTO planalimentacion/, { insertId: 50 }]
const UPDATE_OK = [/UPDATE planalimentacion SET/, { affectedRows: 1 }]

const PLAN = { ID_mascota: 3, ID_servicio: 4, Tipo_dieta: 'BARF', Frecuencia: '2 veces al día', Calorias: 800 }

// ---------- GET /api/alimentacion ----------
describe('GET /api/alimentacion', () => {
  test('401 sin token', async () => {
    expect((await request(app).get('/api/alimentacion')).status).toBe(401)
  })

  test('admin ve todos los planes (sin filtro)', async () => {
    mockDb([[/FROM planalimentacion pa/, [{ ID_planAlimentacion: 1 }, { ID_planAlimentacion: 2 }]]])
    const res = await request(app).get('/api/alimentacion').set(auth('administrador'))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(consultasQue(/FROM planalimentacion pa/)[0][0]).not.toMatch(/WHERE/)
  })

  test('veterinario solo ve los planes de mascotas que atendió', async () => {
    mockDb([PERFIL_VET, [/FROM planalimentacion pa/, [{ ID_planAlimentacion: 1 }]]])
    const res = await request(app).get('/api/alimentacion').set(auth('veterinario'))
    expect(res.status).toBe(200)
    const [sql, params] = consultasQue(/FROM planalimentacion pa/)[0]
    expect(sql).toMatch(/WHERE EXISTS/)
    expect(params).toEqual([5])
  })

  test('403 si el veterinario no tiene perfil asociado', async () => {
    mockDb([[/FROM veterinario WHERE ID_usuario/, []]])
    const res = await request(app).get('/api/alimentacion').set(auth('veterinario'))
    expect(res.status).toBe(403)
  })

  test('500 si falla la consulta del perfil del veterinario', async () => {
    mockDb([[/FROM veterinario WHERE ID_usuario/, falla('fallo perfil')]])
    const res = await request(app).get('/api/alimentacion').set(auth('veterinario'))
    expect(res.status).toBe(500)
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/FROM planalimentacion pa/, falla('fallo de BD')]])
    const res = await request(app).get('/api/alimentacion').set(auth('administrador'))
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('fallo de BD')
  })

  test.todo('un cliente NO debería ver los planes de todas las mascotas (hoy los ve todos)')
})

// ---------- GET /api/alimentacion/mascota/:id_mascota ----------
describe('GET /api/alimentacion/mascota/:id_mascota', () => {
  test('401 sin token', async () => {
    expect((await request(app).get('/api/alimentacion/mascota/3')).status).toBe(401)
  })

  test('devuelve el historial de la mascota', async () => {
    mockDb([[/SELECT \* FROM planalimentacion WHERE ID_mascota/, [{ ID_planAlimentacion: 1 }]]])
    const res = await request(app).get('/api/alimentacion/mascota/3').set(auth('cliente'))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(consultasQue(/FROM planalimentacion WHERE ID_mascota/)[0][1]).toEqual(['3'])
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/SELECT \* FROM planalimentacion/, falla('fallo')]])
    const res = await request(app).get('/api/alimentacion/mascota/3').set(auth('cliente'))
    expect(res.status).toBe(500)
  })

  test.todo('un cliente solo debería ver los planes de SUS mascotas (hoy puede ver los de cualquiera)')
})

// ---------- POST /api/alimentacion ----------
describe('POST /api/alimentacion', () => {
  test('401 sin token', async () => {
    expect((await request(app).post('/api/alimentacion').send(PLAN)).status).toBe(401)
  })

  test('admin crea un plan sin verificación de atención', async () => {
    mockDb([INSERT_OK])
    const res = await request(app).post('/api/alimentacion').set(auth('administrador')).send(PLAN)
    expect(res.status).toBe(200)
    expect(res.body.ID_planAlimentacion).toBe(50)
    expect(res.body.Tipo_dieta).toBe('BARF')
    expect(consultasQue(/SELECT 1 FROM cita/)).toHaveLength(0)
  })

  test('veterinario crea un plan de una mascota+servicio que atendió', async () => {
    mockDb([PERFIL_VET, VET_ATENDIO, INSERT_OK])
    const res = await request(app).post('/api/alimentacion').set(auth('veterinario')).send(PLAN)
    expect(res.status).toBe(200)
    expect(res.body.ID_planAlimentacion).toBe(50)
    expect(consultasQue(/SELECT 1 FROM cita/)[0][1]).toEqual([5, 3, 4])
    expect(consultasQue(/INSERT INTO planalimentacion/)[0][1].slice(0, 2)).toEqual([3, 4])
  })

  test('403 si el veterinario no atendió esa mascota+servicio (y no inserta)', async () => {
    mockDb([PERFIL_VET, VET_NO_ATENDIO, INSERT_OK])
    const res = await request(app).post('/api/alimentacion').set(auth('veterinario')).send(PLAN)
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/que has atendido/)
    expect(consultasQue(/INSERT INTO planalimentacion/)).toHaveLength(0)
  })

  test('500 si falla la verificación de atención del veterinario', async () => {
    mockDb([PERFIL_VET, [/SELECT 1 FROM cita WHERE/, falla('fallo check')]])
    const res = await request(app).post('/api/alimentacion').set(auth('veterinario')).send(PLAN)
    expect(res.status).toBe(500)
    expect(consultasQue(/INSERT INTO planalimentacion/)).toHaveLength(0)
  })

  test('500 si falla el INSERT', async () => {
    mockDb([[/INSERT INTO planalimentacion/, falla('fallo insert')]])
    const res = await request(app).post('/api/alimentacion').set(auth('administrador')).send(PLAN)
    expect(res.status).toBe(500)
  })

  test.todo('un cliente NO debería poder crear planes de alimentación (hoy puede, el middleware lo deja pasar)')
})

// ---------- PUT /api/alimentacion/:id ----------
describe('PUT /api/alimentacion/:id', () => {
  const cambios = { Tipo_dieta: 'Pienso premium', Frecuencia: '3 veces al día', Calorias: 650 }

  test('admin actualiza un plan', async () => {
    mockDb([UPDATE_OK])
    const res = await request(app).put('/api/alimentacion/7').set(auth('administrador')).send(cambios)
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Plan actualizado')
    const params = consultasQue(/UPDATE planalimentacion SET/)[0][1]
    expect(params[0]).toBe('Pienso premium')
    expect(params[params.length - 1]).toBe('7')
  })

  test('veterinario actualiza un plan de una mascota+servicio que atendió', async () => {
    mockDb([PERFIL_VET, PLAN_DE_MASCOTA_3, VET_ATENDIO, UPDATE_OK])
    const res = await request(app).put('/api/alimentacion/7').set(auth('veterinario')).send(cambios)
    expect(res.status).toBe(200)
    expect(consultasQue(/SELECT 1 FROM cita/)[0][1]).toEqual([5, 3, 4])
  })

  test('403 si el veterinario no atendió la mascota+servicio del plan (y no actualiza)', async () => {
    mockDb([PERFIL_VET, PLAN_DE_MASCOTA_3, VET_NO_ATENDIO, UPDATE_OK])
    const res = await request(app).put('/api/alimentacion/7').set(auth('veterinario')).send(cambios)
    expect(res.status).toBe(403)
    expect(consultasQue(/UPDATE planalimentacion SET/)).toHaveLength(0)
  })

  test('404 si el plan no existe (veterinario)', async () => {
    mockDb([PERFIL_VET, [/SELECT ID_mascota, ID_servicio FROM planalimentacion/, []]])
    const res = await request(app).put('/api/alimentacion/7').set(auth('veterinario')).send(cambios)
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Plan no encontrado')
  })

  test('500 si falla la búsqueda del plan (veterinario)', async () => {
    mockDb([PERFIL_VET, [/SELECT ID_mascota, ID_servicio FROM planalimentacion/, falla('fallo plan')]])
    const res = await request(app).put('/api/alimentacion/7').set(auth('veterinario')).send(cambios)
    expect(res.status).toBe(500)
  })

  test('500 si falla el UPDATE', async () => {
    mockDb([[/UPDATE planalimentacion SET/, falla('fallo update')]])
    const res = await request(app).put('/api/alimentacion/7').set(auth('administrador')).send(cambios)
    expect(res.status).toBe(500)
  })

  test.todo('un cliente NO debería poder editar planes de alimentación (hoy puede, el middleware lo deja pasar)')
})

// ---------- DELETE /api/alimentacion/:id ----------
describe('DELETE /api/alimentacion/:id', () => {
  test('401 sin token', async () => {
    expect((await request(app).delete('/api/alimentacion/7')).status).toBe(401)
  })

  test('403 si no es administrador (ni el veterinario puede)', async () => {
    const res = await request(app).delete('/api/alimentacion/7').set(auth('veterinario'))
    expect(res.status).toBe(403)
    expect(consultasQue(/DELETE FROM planalimentacion/)).toHaveLength(0)
  })

  test('admin elimina el plan', async () => {
    mockDb([[/DELETE FROM planalimentacion/, { affectedRows: 1 }]])
    const res = await request(app).delete('/api/alimentacion/7').set(auth('administrador'))
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Plan eliminado')
    expect(consultasQue(/DELETE FROM planalimentacion/)[0][1]).toEqual(['7'])
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/DELETE FROM planalimentacion/, falla('fallo')]])
    const res = await request(app).delete('/api/alimentacion/7').set(auth('administrador'))
    expect(res.status).toBe(500)
  })
})