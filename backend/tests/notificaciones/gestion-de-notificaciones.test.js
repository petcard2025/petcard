// Pruebas del Sistema de Notificaciones · Gestión
// Crear (con y sin SMS), actualizar, eliminar, marcar como leída y operaciones masivas.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../src/services/sms.service', () => ({ enviarSMS: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { enviarSMS } = require('../../src/services/sms.service')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const INSERTAR_OK = [/INSERT INTO notificacion/, { insertId: 9 }]
const admin = () => auth('administrador', 1)
const NUEVA = { ID_usuario: 5, ID_sistemaCorreo: 1, Mensaje: 'Tu cita es mañana', Tipo: 'Recordatorio', Canal: 'Sistema' }

describe('Notificaciones · Gestión', () => {
  describe('protección con token', () => {
    test.each([
      ['post', '/api/notificaciones'],
      ['put', '/api/notificaciones/1'],
      ['delete', '/api/notificaciones/1'],
      ['patch', '/api/notificaciones/1/marcar-como-leida'],
      ['patch', '/api/notificaciones/marcar-como-leidas/bulk'],
      ['delete', '/api/notificaciones/bulk'],
      ['delete', '/api/notificaciones/usuario/5/todas']
    ])('401 sin token en %s %s', async (metodo, ruta) => {
      mockDb([[/notificacion/, { affectedRows: 1, insertId: 1 }]])
      const res = await request(app)[metodo](ruta).send({ ids: [1] })
      expect(res.status).toBe(401)
      expect(consultasQue(/notificacion/)).toHaveLength(0)
    })
  })

  describe('POST /api/notificaciones (crear)', () => {
    test('crea una notificación del sistema y responde con su id, sin enviar SMS', async () => {
      mockDb([INSERTAR_OK])
      const res = await request(app).post('/api/notificaciones').set(admin()).send(NUEVA)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ ID_notificacion: 9, ...NUEVA, sms_enviado: false })
      expect(consultasQue(/INSERT INTO notificacion/)[0][1]).toEqual([5, 1, 'Tu cita es mañana', 'Recordatorio', 'Sistema'])
      expect(enviarSMS).not.toHaveBeenCalled()
      expect(consultasQue(/FROM usuario/)).toHaveLength(0)
    })

    test('canal SMS: busca el teléfono del usuario y envía el mensaje', async () => {
      mockDb([INSERTAR_OK, [/SELECT Telefono, Nombre FROM usuario/, [{ Telefono: '3001234567', Nombre: 'Ana' }]]])
      enviarSMS.mockResolvedValue({ success: true, sid: 'SM123' })
      const res = await request(app).post('/api/notificaciones').set(admin()).send({ ...NUEVA, Canal: 'SMS' })
      expect(res.status).toBe(200)
      expect(res.body.sms_enviado).toBe(true)
      expect(res.body).not.toHaveProperty('sms_error')
      expect(enviarSMS).toHaveBeenCalledTimes(1)
      expect(enviarSMS).toHaveBeenCalledWith('3001234567', 'Tu cita es mañana')
    })

    test('canal SMS: si el envío falla, igual guarda la notificación y avisa el error', async () => {
      mockDb([INSERTAR_OK, [/SELECT Telefono, Nombre FROM usuario/, [{ Telefono: '3001234567', Nombre: 'Ana' }]]])
      enviarSMS.mockResolvedValue({ success: false, error: 'Número inválido' })
      const res = await request(app).post('/api/notificaciones').set(admin()).send({ ...NUEVA, Canal: 'SMS' })
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ ID_notificacion: 9, sms_enviado: false, sms_error: 'Número inválido' })
    })

    test('canal SMS: si el usuario no tiene teléfono, no intenta enviar', async () => {
      mockDb([INSERTAR_OK, [/SELECT Telefono, Nombre FROM usuario/, [{ Telefono: null, Nombre: 'Ana' }]]])
      const res = await request(app).post('/api/notificaciones').set(admin()).send({ ...NUEVA, Canal: 'SMS' })
      expect(res.status).toBe(200)
      expect(res.body.sms_enviado).toBe(false)
      expect(enviarSMS).not.toHaveBeenCalled()
    })

    test('canal SMS: si el usuario no existe, no intenta enviar', async () => {
      mockDb([INSERTAR_OK, [/SELECT Telefono, Nombre FROM usuario/, []]])
      const res = await request(app).post('/api/notificaciones').set(admin()).send({ ...NUEVA, Canal: 'SMS' })
      expect(res.status).toBe(200)
      expect(res.body.sms_enviado).toBe(false)
      expect(enviarSMS).not.toHaveBeenCalled()
    })

    test('500 si falla el INSERT y no se envía ningún SMS', async () => {
      mockDb([[/INSERT INTO notificacion/, falla('sin conexión')]])
      const res = await request(app).post('/api/notificaciones').set(admin()).send({ ...NUEVA, Canal: 'SMS' })
      expect(res.status).toBe(500)
      expect(enviarSMS).not.toHaveBeenCalled()
    })
  })

  describe('PUT /api/notificaciones/:id (actualizar)', () => {
    test('actualiza mensaje, tipo y canal de la notificación indicada', async () => {
      mockDb([[/UPDATE notificacion SET Mensaje=\?, Tipo=\?, Canal=\?/, { affectedRows: 1 }]])
      const res = await request(app).put('/api/notificaciones/7').set(admin())
        .send({ Mensaje: 'Nuevo texto', Tipo: 'Aviso', Canal: 'Correo' })
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ message: 'Notificacion actualizada', ID_notificacion: '7' })
      expect(consultasQue(/UPDATE notificacion/)[0][1]).toEqual(['Nuevo texto', 'Aviso', 'Correo', '7'])
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/UPDATE notificacion/, falla('fallo')]])
      const res = await request(app).put('/api/notificaciones/7').set(admin()).send({ Mensaje: 'x', Tipo: 'y', Canal: 'z' })
      expect(res.status).toBe(500)
    })
  })

  describe('DELETE /api/notificaciones/:id (eliminar)', () => {
    test('elimina solo la notificación indicada', async () => {
      mockDb([[/DELETE FROM notificacion WHERE ID_notificacion=\?/, { affectedRows: 1 }]])
      const res = await request(app).delete('/api/notificaciones/7').set(admin())
      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Notificacion eliminada')
      expect(consultasQue(/DELETE FROM notificacion/)[0][1]).toEqual(['7'])
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/DELETE FROM notificacion/, falla('fallo')]])
      expect((await request(app).delete('/api/notificaciones/7').set(admin())).status).toBe(500)
    })
  })

  describe('PATCH /api/notificaciones/:id/marcar-como-leida', () => {
    test('marca como leída y guarda la fecha de lectura', async () => {
      mockDb([[/UPDATE notificacion SET Leida = 1, Fecha_lectura = NOW\(\) WHERE ID_notificacion = \?/, { affectedRows: 1 }]])
      const res = await request(app).patch('/api/notificaciones/7/marcar-como-leida').set(auth('cliente', 5))
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ message: 'Notificacion marcada como leida', ID_notificacion: '7' })
      expect(consultasQue(/SET Leida = 1/)[0][1]).toEqual(['7'])
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/UPDATE notificacion/, falla('fallo')]])
      expect((await request(app).patch('/api/notificaciones/7/marcar-como-leida').set(auth('cliente', 5))).status).toBe(500)
    })
  })

  describe('PATCH /api/notificaciones/marcar-como-leidas/bulk (varias)', () => {
    test('marca varias como leídas con un solo UPDATE', async () => {
      mockDb([[/UPDATE notificacion SET Leida = 1/, { affectedRows: 3 }]])
      const res = await request(app).patch('/api/notificaciones/marcar-como-leidas/bulk').set(auth('cliente', 5)).send({ ids: [1, 2, 3] })
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ actualizadas: 3 })
      const [sql, params] = consultasQue(/UPDATE notificacion/)[0]
      expect(sql).toMatch(/IN \(\?,\?,\?\)/)
      expect(params).toEqual([1, 2, 3])
    })

    test.each([
      ['sin ids', {}],
      ['ids vacío', { ids: [] }],
      ['ids que no es lista', { ids: 'uno' }],
      ['ids como número', { ids: 5 }]
    ])('400 si %s, sin tocar la base de datos', async (_caso, cuerpo) => {
      mockDb([[/UPDATE notificacion/, { affectedRows: 0 }]])
      const res = await request(app).patch('/api/notificaciones/marcar-como-leidas/bulk').set(auth('cliente', 5)).send(cuerpo)
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('ids debe ser un array no vacio')
      expect(consultasQue(/UPDATE notificacion/)).toHaveLength(0)
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/UPDATE notificacion/, falla('fallo')]])
      const res = await request(app).patch('/api/notificaciones/marcar-como-leidas/bulk').set(auth('cliente', 5)).send({ ids: [1] })
      expect(res.status).toBe(500)
    })
  })

  describe('DELETE /api/notificaciones/bulk (varias)', () => {
    test('elimina varias con un solo DELETE ... IN (...) y NO lo confunde con DELETE /:id', async () => {
      mockDb([[/DELETE FROM notificacion/, { affectedRows: 2 }]])
      const res = await request(app).delete('/api/notificaciones/bulk').set(admin()).send({ ids: [4, 5] })
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ eliminadas: 2 })
      const llamadas = consultasQue(/DELETE FROM notificacion/)
      expect(llamadas).toHaveLength(1)
      expect(llamadas[0][0]).toMatch(/IN \(\?,\?\)/)
      expect(llamadas[0][1]).toEqual([4, 5])
    })

    test.each([
      ['sin ids', {}],
      ['ids vacío', { ids: [] }],
      ['ids que no es lista', { ids: '4,5' }]
    ])('400 si %s, sin borrar nada', async (_caso, cuerpo) => {
      mockDb([[/DELETE FROM notificacion/, { affectedRows: 0 }]])
      const res = await request(app).delete('/api/notificaciones/bulk').set(admin()).send(cuerpo)
      expect(res.status).toBe(400)
      expect(consultasQue(/DELETE FROM notificacion/)).toHaveLength(0)
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/DELETE FROM notificacion/, falla('fallo')]])
      expect((await request(app).delete('/api/notificaciones/bulk').set(admin()).send({ ids: [1] })).status).toBe(500)
    })
  })

  describe('DELETE /api/notificaciones/usuario/:idUsuario/todas', () => {
    test('elimina todas las del usuario y devuelve cuántas fueron', async () => {
      mockDb([[/DELETE FROM notificacion WHERE ID_usuario = \?/, { affectedRows: 6 }]])
      const res = await request(app).delete('/api/notificaciones/usuario/5/todas').set(auth('cliente', 5))
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ eliminadas: 6 })
      expect(consultasQue(/DELETE FROM notificacion/)[0][1]).toEqual(['5'])
    })

    test('devuelve 0 si el usuario no tenía notificaciones', async () => {
      mockDb([[/DELETE FROM notificacion WHERE ID_usuario = \?/, { affectedRows: 0 }]])
      const res = await request(app).delete('/api/notificaciones/usuario/5/todas').set(auth('cliente', 5))
      expect(res.body).toEqual({ eliminadas: 0 })
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/DELETE FROM notificacion/, falla('fallo')]])
      expect((await request(app).delete('/api/notificaciones/usuario/5/todas').set(auth('cliente', 5))).status).toBe(500)
    })
  })

  test.todo('crear una notificación sin ID_usuario o sin Mensaje debería responder 400: hoy intenta el INSERT con valores vacíos y falla con 500 desde la base de datos')
  test.todo('crear, editar y eliminar notificaciones manualmente debería ser solo para administradores: hoy cualquier usuario con token puede hacerlo')
  test.todo('un cliente solo debería poder marcar como leídas o borrar SUS notificaciones: hoy no se compara el dueño con el id del token')
})
