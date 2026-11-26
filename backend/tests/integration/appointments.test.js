jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))
jest.mock('../../src/services/google-calendar.service', () => ({ crearEventoCalendar: jest.fn() }))
jest.mock('../../src/services/notification.service', () => ({ crearNotificacionAutomatica: jest.fn() }))

const request = require('supertest')
const jwt = require('jsonwebtoken')
const db = require('../../src/config/database')
const { crearEventoCalendar } = require('../../src/services/google-calendar.service')
const { crearNotificacionAutomatica } = require('../../src/services/notification.service')
const app = require('../helpers/app')

// ---------- Ayudas ----------
const auth = (Rol, ID_usuario = 1) => ({
  Authorization: `Bearer ${jwt.sign({ ID_usuario, Rol }, process.env.JWT_SECRET)}`
})

// Simula la BD: cada regla es [patrón del SQL, respuesta | función(params, cb)]
function mockDb(reglas) {
  db.query.mockImplementation((sql, params, cb) => {
    if (typeof params === 'function') { cb = params; params = [] }
    if (!cb) return // consultas "sin esperar respuesta" (como el UPDATE del evento de Calendar)
    const regla = reglas.find(([patron]) => patron.test(sql))
    if (!regla) return cb(new Error('Consulta no simulada: ' + sql.slice(0, 50)))
    const r = regla[1]
    typeof r === 'function' ? r(params, cb) : cb(null, r)
  })
}

const consultasQue = (patron) => db.query.mock.calls.filter(c => patron.test(c[0]))

const PERFIL_VET = [/FROM veterinario WHERE ID_usuario/, [{ ID_veterinario: 5, Cargo: 'Veterinario', Especialidad: 'General' }]]
const CITA_OK = { ID_cliente: 2, ID_mascota: 3, ID_servicio: 4, ID_veterinario: 5, Fecha: '2026-12-01', Hora: '09:00', Motivo: 'Control' }

beforeEach(() => {
  crearEventoCalendar.mockResolvedValue('evt-123')
  crearNotificacionAutomatica.mockResolvedValue({ success: true, ID_notificacion: 1 })
})

// ---------- GET /api/citas ----------
describe('GET /api/citas', () => {
  test('401 sin token', async () => {
    expect((await request(app).get('/api/citas')).status).toBe(401)
  })

  test('admin ve todas las citas (sin filtro WHERE)', async () => {
    mockDb([[/FROM cita ci/, [{ ID_cita: 1 }, { ID_cita: 2 }]]])
    const res = await request(app).get('/api/citas').set(auth('administrador'))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(consultasQue(/FROM cita ci/)[0][0]).not.toMatch(/WHERE/)
  })

  test('veterinario solo ve las suyas (filtra por su ID_veterinario)', async () => {
    mockDb([PERFIL_VET, [/FROM cita ci/, [{ ID_cita: 1 }]]])
    const res = await request(app).get('/api/citas').set(auth('veterinario'))
    expect(res.status).toBe(200)
    const [sql, params] = consultasQue(/FROM cita ci/)[0]
    expect(sql).toMatch(/WHERE ci\.ID_veterinario = \?/)
    expect(params).toEqual([5])
  })

  test('403 si el veterinario no tiene perfil asociado', async () => {
    mockDb([[/FROM veterinario WHERE ID_usuario/, []]])
    const res = await request(app).get('/api/citas').set(auth('veterinario'))
    expect(res.status).toBe(403)
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/FROM cita ci/, (p, cb) => cb(new Error('fallo de BD'))]])
    const res = await request(app).get('/api/citas').set(auth('administrador'))
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('fallo de BD')
  })

  test.todo('un cliente NO debería ver las citas de otros clientes (hoy las ve todas)')
})

// ---------- GET /api/citas/horas-ocupadas ----------
describe('GET /api/citas/horas-ocupadas', () => {
  test('400 si faltan parámetros', async () => {
    const res = await request(app).get('/api/citas/horas-ocupadas?ID_veterinario=5').set(auth('cliente'))
    expect(res.status).toBe(400)
  })

  test('devuelve la lista de horas ocupadas', async () => {
    mockDb([[/SELECT Hora FROM cita/, [{ Hora: '09:00:00' }, { Hora: '10:00:00' }]]])
    const res = await request(app)
      .get('/api/citas/horas-ocupadas?ID_veterinario=5&Fecha=2026-12-01').set(auth('cliente'))
    expect(res.status).toBe(200)
    expect(res.body.horasOcupadas).toEqual(['09:00:00', '10:00:00'])
    expect(consultasQue(/SELECT Hora FROM cita/)[0][1]).toEqual(['5', '2026-12-01'])
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/SELECT Hora FROM cita/, (p, cb) => cb(new Error('fallo'))]])
    const res = await request(app)
      .get('/api/citas/horas-ocupadas?ID_veterinario=5&Fecha=2026-12-01').set(auth('cliente'))
    expect(res.status).toBe(500)
  })
})

// ---------- POST /api/citas ----------
describe('POST /api/citas', () => {
  const reglasBase = (extra = []) => [
    ...extra,
    [/SELECT ID_cita FROM cita/, []],
    [/INSERT INTO cita/, { insertId: 99 }],
    [/FROM cliente c/, [{ ID_usuario: 10, Nombre_mascota: 'Rex', Nombre_servicio: 'Vacunación' }]]
  ]

  test('409 si el veterinario ya tiene una cita a esa hora (y no inserta)', async () => {
    mockDb([[/SELECT ID_cita FROM cita/, [{ ID_cita: 7 }]]])
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA_OK)
    expect(res.status).toBe(409)
    expect(consultasQue(/INSERT INTO cita/)).toHaveLength(0)
  })

  test('crea la cita, la notificación y el evento de Calendar', async () => {
    mockDb(reglasBase())
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA_OK)

    expect(res.status).toBe(200)
    expect(res.body.ID_cita).toBe(99)
    expect(res.body.googleEventId).toBe('evt-123')
    expect(crearNotificacionAutomatica).toHaveBeenCalledWith(10, expect.stringMatching(/Rex/), 'cita', 'Sistema')
    expect(consultasQue(/Google_Event_ID/)[0][1]).toEqual(['evt-123', 99])
  })

  test('si Google Calendar falla, la cita igual se crea y se avisa del error', async () => {
    crearEventoCalendar.mockRejectedValue(new Error('sin permisos'))
    mockDb(reglasBase())
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA_OK)

    expect(res.status).toBe(200)
    expect(res.body.ID_cita).toBe(99)
    expect(res.body.calendarError).toBe('sin permisos')
    expect(res.body).not.toHaveProperty('googleEventId')
  })

  test('si la notificación falla, la cita igual se crea', async () => {
    crearNotificacionAutomatica.mockRejectedValue(new Error('fallo notif'))
    mockDb(reglasBase())
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA_OK)
    expect(res.status).toBe(200)
    expect(res.body.ID_cita).toBe(99)
  })

  test('la cita se crea aunque no se encuentre cliente/mascota/servicio para la notificación', async () => {
    mockDb([
      [/SELECT ID_cita FROM cita/, []],
      [/INSERT INTO cita/, { insertId: 99 }],
      [/FROM cliente c/, []]
    ])
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA_OK)

    expect(res.status).toBe(200)
    expect(res.body.ID_cita).toBe(99)
    expect(crearNotificacionAutomatica).not.toHaveBeenCalled()
  })

  test('500 si falla la verificación de horario', async () => {
    mockDb([[/SELECT ID_cita FROM cita/, (p, cb) => cb(new Error('fallo check'))]])
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA_OK)
    expect(res.status).toBe(500)
  })

  test('500 si falla el INSERT', async () => {
    mockDb([
      [/SELECT ID_cita FROM cita/, []],
      [/INSERT INTO cita/, (p, cb) => cb(new Error('fallo insert'))]
    ])
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA_OK)
    expect(res.status).toBe(500)
    expect(crearEventoCalendar).not.toHaveBeenCalled()
  })
})

// ---------- PUT /api/citas/:id ----------
describe('PUT /api/citas/:id', () => {
  const cambios = { ID_servicio: 4, ID_veterinario: 5, Fecha: '2026-12-02', Hora: '11:00', Motivo: 'Control', Observaciones: 'Ok' }

  test('admin actualiza cualquier cita', async () => {
    mockDb([[/UPDATE cita SET/, { affectedRows: 1 }]])
    const res = await request(app).put('/api/citas/3').set(auth('administrador')).send(cambios)
    expect(res.status).toBe(200)
    expect(consultasQue(/UPDATE cita SET/)[0][1])
      .toEqual([4, 5, '2026-12-02', '11:00', 'Control', 'Ok', '3'])
  })

  test('veterinario actualiza una cita suya', async () => {
    mockDb([PERFIL_VET, [/SELECT ID_veterinario FROM cita/, [{ ID_veterinario: 5 }]], [/UPDATE cita SET/, { affectedRows: 1 }]])
    const res = await request(app).put('/api/citas/3').set(auth('veterinario')).send(cambios)
    expect(res.status).toBe(200)
  })

  test('403 si el veterinario intenta editar la cita de otro (y no actualiza)', async () => {
    mockDb([PERFIL_VET, [/SELECT ID_veterinario FROM cita/, [{ ID_veterinario: 6 }]], [/UPDATE cita SET/, { affectedRows: 1 }]])
    const res = await request(app).put('/api/citas/3').set(auth('veterinario')).send(cambios)
    expect(res.status).toBe(403)
    expect(consultasQue(/UPDATE cita SET/)).toHaveLength(0)
  })

  test('404 si la cita no existe (veterinario)', async () => {
    mockDb([PERFIL_VET, [/SELECT ID_veterinario FROM cita/, []]])
    const res = await request(app).put('/api/citas/3').set(auth('veterinario')).send(cambios)
    expect(res.status).toBe(404)
  })

  test.todo('un cliente NO debería poder editar citas ajenas (hoy no hay ninguna verificación)')
})

// ---------- PATCH /api/citas/:id ----------
describe('PATCH /api/citas/:id', () => {
  test('400 si el body viene vacío', async () => {
    const res = await request(app).patch('/api/citas/3').set(auth('administrador')).send({})
    expect(res.status).toBe(400)
  })

  test('admin cambia el estado de una cita', async () => {
    mockDb([[/UPDATE cita SET/, { affectedRows: 1 }]])
    const res = await request(app).patch('/api/citas/3').set(auth('administrador')).send({ Estado: 'completada' })
    expect(res.status).toBe(200)
    const [sql, params] = consultasQue(/UPDATE cita SET/)[0]
    expect(sql).toBe('UPDATE cita SET Estado=? WHERE ID_cita=?')
    expect(params).toEqual(['completada', '3'])
  })

  test('403 si el veterinario intenta modificar la cita de otro', async () => {
    mockDb([PERFIL_VET, [/SELECT ID_veterinario FROM cita/, [{ ID_veterinario: 6 }]]])
    const res = await request(app).patch('/api/citas/3').set(auth('veterinario')).send({ Estado: 'cancelada' })
    expect(res.status).toBe(403)
  })

  test('veterinario modifica una cita suya', async () => {
    mockDb([PERFIL_VET, [/SELECT ID_veterinario FROM cita/, [{ ID_veterinario: 5 }]], [/UPDATE cita SET/, { affectedRows: 1 }]])
    const res = await request(app).patch('/api/citas/3').set(auth('veterinario')).send({ Estado: 'completada' })
    expect(res.status).toBe(200)
  })

  test('400 si el body trae un campo que no está permitido (y no actualiza)', async () => {
    mockDb([[/UPDATE cita SET/, { affectedRows: 1 }]])
    const res = await request(app).patch('/api/citas/3').set(auth('administrador'))
      .send({ Estado: 'Cancelada', ID_veterinario: 9 })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/ID_veterinario/)
    expect(consultasQue(/UPDATE cita SET/)).toHaveLength(0)
  })

  test('400 si el nombre del campo trae SQL (intento de inyección)', async () => {
    mockDb([[/UPDATE cita SET/, { affectedRows: 1 }]])
    const res = await request(app).patch('/api/citas/3').set(auth('administrador'))
      .send({ "Estado='Completada' --": 'x' })

    expect(res.status).toBe(400)
    expect(consultasQue(/UPDATE cita SET/)).toHaveLength(0)
  })
})

// ---------- DELETE /api/citas/:id ----------
describe('DELETE /api/citas/:id', () => {
  test('401 sin token', async () => {
    expect((await request(app).delete('/api/citas/3')).status).toBe(401)
  })

  test('403 si no es administrador', async () => {
    const res = await request(app).delete('/api/citas/3').set(auth('cliente'))
    expect(res.status).toBe(403)
    expect(consultasQue(/DELETE FROM cita/)).toHaveLength(0)
  })

  test('admin elimina la cita', async () => {
    mockDb([[/DELETE FROM cita/, { affectedRows: 1 }]])
    const res = await request(app).delete('/api/citas/3').set(auth('administrador'))
    expect(res.status).toBe(200)
    expect(consultasQue(/DELETE FROM cita/)[0][1]).toEqual(['3'])
  })
})
