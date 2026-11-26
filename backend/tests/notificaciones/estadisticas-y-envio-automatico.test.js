// Pruebas del Sistema de Notificaciones · Estadísticas y envío automático
// - GET /api/notificaciones/estadisticas y /usuario/:id/estadisticas
// - crearNotificacionAutomatica (servicio que usan las citas y los recordatorios)
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../src/services/sms.service', () => ({ enviarSMS: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { enviarSMS } = require('../../src/services/sms.service')
const { crearNotificacionAutomatica } = require('../../src/services/notification.service')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

describe('Notificaciones · Estadísticas', () => {
  test('401 sin token', async () => {
    expect((await request(app).get('/api/notificaciones/estadisticas')).status).toBe(401)
    expect((await request(app).get('/api/notificaciones/usuario/5/estadisticas')).status).toBe(401)
  })

  test('estadísticas globales: total, leídas y no leídas', async () => {
    mockDb([[/COUNT\(\*\) as total/, [{ total: 10, leidas: 4, no_leidas: 6 }]]])
    const res = await request(app).get('/api/notificaciones/estadisticas').set(auth('administrador'))
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ total: 10, leidas: 4, no_leidas: 6 })
  })

  test('/estadisticas NO se confunde con GET /:id (no busca una notificación llamada "estadisticas")', async () => {
    mockDb([[/COUNT\(\*\) as total/, [{ total: 0, leidas: 0, no_leidas: 0 }]]])
    await request(app).get('/api/notificaciones/estadisticas').set(auth('administrador'))
    expect(consultasQue(/WHERE ID_notificacion = \?/)).toHaveLength(0)
    expect(consultasQue(/COUNT\(\*\)/)).toHaveLength(1)
  })

  test('estadísticas por usuario: filtra por el usuario pedido', async () => {
    mockDb([[/COUNT\(\*\) as total/, [{ total: 3, leidas: 1, no_leidas: 2 }]]])
    const res = await request(app).get('/api/notificaciones/usuario/5/estadisticas').set(auth('cliente', 5))
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ total: 3, leidas: 1, no_leidas: 2 })
    const [sql, params] = consultasQue(/COUNT\(\*\)/)[0]
    expect(sql).toMatch(/WHERE ID_usuario = \?/)
    expect(params).toEqual(['5'])
  })

  test('500 si falla la base de datos (globales y por usuario)', async () => {
    mockDb([[/COUNT\(\*\)/, falla('fallo')]])
    expect((await request(app).get('/api/notificaciones/estadisticas').set(auth('administrador'))).status).toBe(500)
    expect((await request(app).get('/api/notificaciones/usuario/5/estadisticas').set(auth('cliente', 5))).status).toBe(500)
  })
})

describe('Notificaciones · Envío automático (crearNotificacionAutomatica)', () => {
  test('por defecto guarda una notificación del sistema y no envía SMS', async () => {
    mockDb([[/INSERT INTO notificacion/, { insertId: 20 }]])
    const r = await crearNotificacionAutomatica(5, 'Cita confirmada', 'Cita')
    expect(r).toEqual({ success: true, ID_notificacion: 20 })
    expect(consultasQue(/INSERT INTO notificacion/)[0][1]).toEqual([5, 1, 'Cita confirmada', 'Cita', 'Sistema'])
    expect(enviarSMS).not.toHaveBeenCalled()
  })

  test('con canal SMS busca el teléfono y envía el mensaje', async () => {
    mockDb([[/INSERT INTO notificacion/, { insertId: 21 }], [/SELECT Telefono FROM usuario/, [{ Telefono: '3001234567' }]]])
    enviarSMS.mockResolvedValue({ success: true, sid: 'SM1' })
    const r = await crearNotificacionAutomatica(5, 'Vacuna próxima', 'Vacuna', 'SMS')
    expect(r).toEqual({ success: true, ID_notificacion: 21 })
    expect(enviarSMS).toHaveBeenCalledWith('3001234567', 'Vacuna próxima')
  })

  test('con canal SMS y usuario sin teléfono guarda la notificación y no envía SMS', async () => {
    mockDb([[/INSERT INTO notificacion/, { insertId: 22 }], [/SELECT Telefono FROM usuario/, [{ Telefono: null }]]])
    const r = await crearNotificacionAutomatica(5, 'Hola', 'Aviso', 'SMS')
    expect(r.success).toBe(true)
    expect(enviarSMS).not.toHaveBeenCalled()
  })

  test('si falla el INSERT devuelve { success: false } y no envía SMS', async () => {
    mockDb([[/INSERT INTO notificacion/, falla('sin conexión')]])
    const r = await crearNotificacionAutomatica(5, 'Hola', 'Aviso', 'SMS')
    expect(r).toEqual({ success: false })
    expect(enviarSMS).not.toHaveBeenCalled()
  })
})
