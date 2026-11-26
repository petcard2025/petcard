// Pruebas del Sistema de Notificaciones · Consulta
// GET /api/notificaciones, /usuario/:id, /usuario/:id/no-leidas y /:id
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../src/services/sms.service', () => ({ enviarSMS: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const NOTIF = { ID_notificacion: 1, ID_usuario: 5, Mensaje: 'Tu cita es mañana', Tipo: 'Recordatorio', Canal: 'Sistema', Leida: 0 }

describe('Notificaciones · Consulta', () => {
  describe('protección con token', () => {
    test.each([
      ['/api/notificaciones'],
      ['/api/notificaciones/1'],
      ['/api/notificaciones/usuario/5'],
      ['/api/notificaciones/usuario/5/no-leidas']
    ])('401 sin token en GET %s', async (ruta) => {
      mockDb([[/FROM notificacion/, [NOTIF]]])
      const res = await request(app).get(ruta)
      expect(res.status).toBe(401)
      expect(consultasQue(/notificacion/)).toHaveLength(0)
    })

    test('403 con un token inválido', async () => {
      const res = await request(app).get('/api/notificaciones').set('Authorization', 'Bearer token-falso')
      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/notificaciones (todas)', () => {
    test('devuelve la lista con el nombre del usuario, ordenada por fecha descendente', async () => {
      mockDb([[/FROM notificacion n\s+JOIN usuario u/, [{ ...NOTIF, Nombre_usuario: 'Ana' }]]])
      const res = await request(app).get('/api/notificaciones').set(auth('administrador'))
      expect(res.status).toBe(200)
      expect(res.body).toEqual([{ ...NOTIF, Nombre_usuario: 'Ana' }])
      expect(consultasQue(/ORDER BY n\.Fecha_envio DESC/)).toHaveLength(1)
    })

    test('lista vacía cuando no hay notificaciones', async () => {
      mockDb([[/FROM notificacion n/, []]])
      const res = await request(app).get('/api/notificaciones').set(auth('administrador'))
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM notificacion n/, falla('sin conexión')]])
      const res = await request(app).get('/api/notificaciones').set(auth('administrador'))
      expect(res.status).toBe(500)
      expect(res.body.error).toBe('sin conexión')
    })
  })

  describe('GET /api/notificaciones/usuario/:idUsuario', () => {
    test('consulta solo las notificaciones del usuario pedido', async () => {
      mockDb([[/FROM notificacion WHERE ID_usuario = \?/, [NOTIF]]])
      const res = await request(app).get('/api/notificaciones/usuario/5').set(auth('cliente', 5))
      expect(res.status).toBe(200)
      expect(res.body).toEqual([NOTIF])
      expect(consultasQue(/WHERE ID_usuario = \?/)[0][1]).toEqual(['5'])
    })

    test('dos usuarios distintos generan consultas distintas (no se mezclan)', async () => {
      mockDb([[/FROM notificacion WHERE ID_usuario = \?/, []]])
      await request(app).get('/api/notificaciones/usuario/5').set(auth('cliente', 5))
      await request(app).get('/api/notificaciones/usuario/6').set(auth('cliente', 6))
      expect(consultasQue(/WHERE ID_usuario = \?/).map(c => c[1])).toEqual([['5'], ['6']])
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM notificacion/, falla('fallo')]])
      const res = await request(app).get('/api/notificaciones/usuario/5').set(auth('cliente', 5))
      expect(res.status).toBe(500)
    })
  })

  describe('GET /api/notificaciones/usuario/:idUsuario/no-leidas', () => {
    test('solo pide las no leídas (Leida = 0) del usuario', async () => {
      mockDb([[/Leida = 0/, [NOTIF]]])
      const res = await request(app).get('/api/notificaciones/usuario/5/no-leidas').set(auth('cliente', 5))
      expect(res.status).toBe(200)
      expect(res.body).toEqual([NOTIF])
      const [sql, params] = consultasQue(/Leida = 0/)[0]
      expect(sql).toMatch(/ID_usuario = \? AND Leida = 0/)
      expect(params).toEqual(['5'])
    })

    test('lista vacía si todas están leídas', async () => {
      mockDb([[/Leida = 0/, []]])
      const res = await request(app).get('/api/notificaciones/usuario/5/no-leidas').set(auth('cliente', 5))
      expect(res.body).toEqual([])
    })
  })

  describe('GET /api/notificaciones/:id', () => {
    test('200 con la notificación pedida', async () => {
      mockDb([[/WHERE ID_notificacion = \?/, [NOTIF]]])
      const res = await request(app).get('/api/notificaciones/1').set(auth('cliente', 5))
      expect(res.status).toBe(200)
      expect(res.body).toEqual(NOTIF)
      expect(consultasQue(/WHERE ID_notificacion = \?/)[0][1]).toEqual(['1'])
    })

    test('404 si no existe', async () => {
      mockDb([[/WHERE ID_notificacion = \?/, []]])
      const res = await request(app).get('/api/notificaciones/999').set(auth('cliente', 5))
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Notificacion no encontrada')
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM notificacion/, falla('fallo')]])
      const res = await request(app).get('/api/notificaciones/1').set(auth('cliente', 5))
      expect(res.status).toBe(500)
    })
  })

  test.todo('un cliente solo debería ver SUS notificaciones: hoy GET /usuario/:idUsuario y GET /:id no comparan el id con el del token, así que cualquiera con sesión puede leer las de otro usuario')
  test.todo('GET /api/notificaciones (todas, con nombre de usuario) debería ser solo para administradores: hoy cualquier usuario con token la puede consultar')
})
