// Pruebas de Gestión de Alimentación · Crear, editar y eliminar planes
// Administrador: sin restricciones. Veterinario: solo mascotas+servicios que atendió. Eliminar: solo administrador.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const PERFIL_VET = [/FROM veterinario WHERE ID_usuario/, [{ ID_veterinario: 5, Cargo: 'Veterinario', Especialidad: 'Nutrición' }]]
const VET_ATENDIO = [/SELECT 1 FROM cita WHERE/, [{ '?column?': 1 }]]
const VET_NO_ATENDIO = [/SELECT 1 FROM cita WHERE/, []]
const PLAN_DE_MASCOTA_3 = [/SELECT ID_mascota, ID_servicio FROM planalimentacion/, [{ ID_mascota: 3, ID_servicio: 4 }]]
const INSERT_OK = [/INSERT INTO planalimentacion/, { insertId: 50 }]
const UPDATE_OK = [/UPDATE planalimentacion SET/, { affectedRows: 1 }]

const PLAN = {
  ID_mascota: 3, ID_servicio: 4, Tipo_dieta: 'BARF', Frecuencia: '2 veces al día', Alergias: 'Pollo',
  Horario: '8am - 6pm', Calorias: 800, Suplementos: 'Omega 3', Comidas: 'Carne y vegetales',
  Fecha_inicio: '2026-03-01', Fecha_fin: '2026-06-01', Observaciones: 'Control mensual',
  Diagnostico: 'Sobrepeso leve', Revision_nutricional: 'Activo'
}

describe('Alimentación · Crear (POST /api/alimentacion)', () => {
  test('401 sin token', async () => {
    mockDb([INSERT_OK])
    expect((await request(app).post('/api/alimentacion').send(PLAN)).status).toBe(401)
    expect(consultasQue(/INSERT INTO planalimentacion/)).toHaveLength(0)
  })

  test('el administrador crea el plan sin verificación de atención y recibe su id', async () => {
    mockDb([INSERT_OK])
    const res = await request(app).post('/api/alimentacion').set(auth('administrador')).send(PLAN)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ID_planAlimentacion: 50, ID_mascota: 3, Tipo_dieta: 'BARF' })
    expect(consultasQue(/FROM cita/)).toHaveLength(0)
  })

  test('guarda los 14 campos en el orden de las columnas, incluido ID_servicio (columna obligatoria)', async () => {
    mockDb([INSERT_OK])
    await request(app).post('/api/alimentacion').set(auth('administrador')).send(PLAN)
    const [sql, params] = consultasQue(/INSERT INTO planalimentacion/)[0]
    expect(sql).toMatch(/\(ID_mascota, ID_servicio, Tipo_dieta/)
    expect(sql.match(/\?/g)).toHaveLength(14)
    expect(params).toEqual([
      3, 4, 'BARF', '2 veces al día', 'Pollo', '8am - 6pm', 800, 'Omega 3', 'Carne y vegetales',
      '2026-03-01', '2026-06-01', 'Control mensual', 'Sobrepeso leve', 'Activo'
    ])
  })

  test('los campos numéricos y de fecha vacíos ("") se guardan como null, no como texto', async () => {
    mockDb([INSERT_OK])
    const res = await request(app).post('/api/alimentacion').set(auth('administrador'))
      .send({ ...PLAN, Calorias: '', Fecha_inicio: '', Fecha_fin: '' })
    expect(res.status).toBe(200)
    const params = consultasQue(/INSERT INTO planalimentacion/)[0][1]
    expect(params[6]).toBeNull()   // Calorias
    expect(params[9]).toBeNull()   // Fecha_inicio
    expect(params[10]).toBeNull()  // Fecha_fin
  })

  test('las calorías que llegan como texto ("900") se guardan como número', async () => {
    mockDb([INSERT_OK])
    await request(app).post('/api/alimentacion').set(auth('administrador')).send({ ...PLAN, Calorias: '900' })
    expect(consultasQue(/INSERT INTO planalimentacion/)[0][1][6]).toBe(900)
  })

  test('el veterinario crea un plan de una mascota y servicio que atendió', async () => {
    mockDb([PERFIL_VET, VET_ATENDIO, INSERT_OK])
    const res = await request(app).post('/api/alimentacion').set(auth('veterinario', 8)).send(PLAN)
    expect(res.status).toBe(200)
    // se verifica con su id de veterinario, la mascota y el servicio del plan
    expect(consultasQue(/SELECT 1 FROM cita WHERE/)[0][1]).toEqual([5, 3, 4])
    expect(consultasQue(/INSERT INTO planalimentacion/)).toHaveLength(1)
  })

  test('403 si el veterinario no atendió esa mascota y servicio, y no se inserta nada', async () => {
    mockDb([PERFIL_VET, VET_NO_ATENDIO, INSERT_OK])
    const res = await request(app).post('/api/alimentacion').set(auth('veterinario')).send(PLAN)
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/has atendido/)
    expect(consultasQue(/INSERT INTO planalimentacion/)).toHaveLength(0)
  })

  test('403 si el veterinario no tiene perfil asociado', async () => {
    mockDb([[/FROM veterinario WHERE ID_usuario/, []], INSERT_OK])
    const res = await request(app).post('/api/alimentacion').set(auth('veterinario')).send(PLAN)
    expect(res.status).toBe(403)
    expect(consultasQue(/INSERT INTO planalimentacion/)).toHaveLength(0)
  })

  test('500 si falla la verificación de atención del veterinario', async () => {
    mockDb([PERFIL_VET, [/SELECT 1 FROM cita WHERE/, falla('fallo cita')], INSERT_OK])
    const res = await request(app).post('/api/alimentacion').set(auth('veterinario')).send(PLAN)
    expect(res.status).toBe(500)
    expect(consultasQue(/INSERT INTO planalimentacion/)).toHaveLength(0)
  })

  test('500 si falla el INSERT', async () => {
    mockDb([[/INSERT INTO planalimentacion/, falla('sin conexión')]])
    const res = await request(app).post('/api/alimentacion').set(auth('administrador')).send(PLAN)
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('sin conexión')
  })
})

describe('Alimentación · Editar (PUT /api/alimentacion/:id)', () => {
  const CAMBIOS = { ...PLAN, Tipo_dieta: 'Balanceada', Calorias: 1000 }

  test('401 sin token', async () => {
    mockDb([UPDATE_OK])
    expect((await request(app).put('/api/alimentacion/7').send(CAMBIOS)).status).toBe(401)
    expect(consultasQue(/UPDATE planalimentacion/)).toHaveLength(0)
  })

  test('el administrador actualiza el plan indicado en la URL, con los campos en orden', async () => {
    mockDb([UPDATE_OK])
    const res = await request(app).put('/api/alimentacion/7').set(auth('administrador')).send(CAMBIOS)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Plan actualizado' })
    expect(consultasQue(/UPDATE planalimentacion SET/)[0][1]).toEqual([
      'Balanceada', '2 veces al día', 'Pollo', '8am - 6pm', 1000, 'Omega 3', 'Carne y vegetales',
      '2026-03-01', '2026-06-01', 'Control mensual', 'Sobrepeso leve', 'Activo', '7'
    ])
  })

  test('no permite cambiar la mascota ni el servicio del plan: el UPDATE no los incluye', async () => {
    mockDb([UPDATE_OK])
    await request(app).put('/api/alimentacion/7').set(auth('administrador')).send({ ...CAMBIOS, ID_mascota: 99, ID_servicio: 99 })
    expect(consultasQue(/UPDATE planalimentacion SET/)[0][0]).not.toMatch(/ID_mascota|ID_servicio/)
  })

  test('los campos de fecha y calorías vacíos ("") se guardan como null', async () => {
    mockDb([UPDATE_OK])
    await request(app).put('/api/alimentacion/7').set(auth('administrador')).send({ ...CAMBIOS, Calorias: '', Fecha_inicio: '', Fecha_fin: '' })
    const params = consultasQue(/UPDATE planalimentacion SET/)[0][1]
    expect([params[4], params[7], params[8]]).toEqual([null, null, null])
  })

  test('acepta las fechas con hora, como llegan al editar un plan ya guardado', async () => {
    mockDb([UPDATE_OK])
    const res = await request(app).put('/api/alimentacion/7').set(auth('administrador'))
      .send({ ...CAMBIOS, Fecha_inicio: '2026-03-01T00:00:00.000Z', Fecha_fin: '2026-06-01T00:00:00.000Z' })
    expect(res.status).toBe(200)
  })

  test('el veterinario edita un plan de una mascota y servicio que atendió', async () => {
    mockDb([PERFIL_VET, PLAN_DE_MASCOTA_3, VET_ATENDIO, UPDATE_OK])
    const res = await request(app).put('/api/alimentacion/7').set(auth('veterinario')).send(CAMBIOS)
    expect(res.status).toBe(200)
    // la mascota y el servicio se toman del plan guardado, no del cuerpo de la petición
    expect(consultasQue(/SELECT 1 FROM cita WHERE/)[0][1]).toEqual([5, 3, 4])
  })

  test('403 si el veterinario no atendió la mascota y servicio del plan, y no se actualiza', async () => {
    mockDb([PERFIL_VET, PLAN_DE_MASCOTA_3, VET_NO_ATENDIO, UPDATE_OK])
    const res = await request(app).put('/api/alimentacion/7').set(auth('veterinario')).send(CAMBIOS)
    expect(res.status).toBe(403)
    expect(consultasQue(/UPDATE planalimentacion/)).toHaveLength(0)
  })

  test('404 si el plan no existe (veterinario)', async () => {
    mockDb([PERFIL_VET, [/SELECT ID_mascota, ID_servicio FROM planalimentacion/, []], UPDATE_OK])
    const res = await request(app).put('/api/alimentacion/999').set(auth('veterinario')).send(CAMBIOS)
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Plan no encontrado')
    expect(consultasQue(/UPDATE planalimentacion/)).toHaveLength(0)
  })

  test('500 si falla la búsqueda del plan (veterinario)', async () => {
    mockDb([PERFIL_VET, [/SELECT ID_mascota, ID_servicio FROM planalimentacion/, falla('fallo')], UPDATE_OK])
    expect((await request(app).put('/api/alimentacion/7').set(auth('veterinario')).send(CAMBIOS)).status).toBe(500)
  })

  test('500 si falla el UPDATE', async () => {
    mockDb([[/UPDATE planalimentacion SET/, falla('sin conexión')]])
    const res = await request(app).put('/api/alimentacion/7').set(auth('administrador')).send(CAMBIOS)
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('sin conexión')
  })
})

describe('Alimentación · Eliminar (DELETE /api/alimentacion/:id)', () => {
  test('401 sin token', async () => {
    mockDb([[/DELETE FROM planalimentacion/, { affectedRows: 1 }]])
    expect((await request(app).delete('/api/alimentacion/7')).status).toBe(401)
    expect(consultasQue(/DELETE FROM planalimentacion/)).toHaveLength(0)
  })

  test.each([['veterinario'], ['cliente']])('403 para un %s, sin borrar nada', async (rol) => {
    mockDb([PERFIL_VET, [/DELETE FROM planalimentacion/, { affectedRows: 1 }]])
    const res = await request(app).delete('/api/alimentacion/7').set(auth(rol))
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/administrador/)
    expect(consultasQue(/DELETE FROM planalimentacion/)).toHaveLength(0)
  })

  test('el administrador elimina solo el plan indicado', async () => {
    mockDb([[/DELETE FROM planalimentacion/, { affectedRows: 1 }]])
    const res = await request(app).delete('/api/alimentacion/7').set(auth('administrador'))
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Plan eliminado' })
    expect(consultasQue(/DELETE FROM planalimentacion/)[0][1]).toEqual(['7'])
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/DELETE FROM planalimentacion/, falla('fallo')]])
    expect((await request(app).delete('/api/alimentacion/7').set(auth('administrador'))).status).toBe(500)
  })

  test.todo('un cliente NO debería poder crear ni editar planes de alimentación: hoy, con sesión de cliente, el middleware lo deja pasar')
  test.todo('editar o eliminar un plan que no existe (como administrador) debería responder 404: hoy responde 200 igual')
  test.todo('POST /api/alimentacion/sugerido: el frontend lo llama para aplicar un plan sugerido, pero esa ruta no existe en el backend')
})
