// RF08 - Agendamiento de citas
// El cliente reserva una cita eligiendo servicio, fecha y hora; no se permite reservar un horario ya ocupado.
// POST /api/citas
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))
jest.mock('../../src/services/google-calendar.service', () => ({ crearEventoCalendar: jest.fn() }))
jest.mock('../../src/services/notification.service', () => ({ crearNotificacionAutomatica: jest.fn() }))
jest.mock('../../src/services/notification-sync', () => () => ({
  sincronizarCita: jest.fn().mockResolvedValue({}),
  quitar: jest.fn().mockResolvedValue({})
}))

const request = require('supertest')
const app = require('../helpers/app')
const { crearEventoCalendar } = require('../../src/services/google-calendar.service')
const { auth, mockDb, consultasQue, congelarFecha, falla } = require('../helpers/pruebas')

beforeAll(congelarFecha)            // "hoy" = 25/11/2026, 10:00 a. m. (Colombia)
afterAll(() => jest.useRealTimers())
beforeEach(() => crearEventoCalendar.mockResolvedValue('evt-123'))

// ---------- Datos y reglas de la BD simulada ----------
const CITA = { ID_mascota: 3, ID_servicio: 4, ID_veterinario: 5, Fecha: '2026-12-01', Hora: '09:00', Motivo: 'Control' }
const el = (cambios) => ({ ...CITA, ...cambios })

// La mascota 3 pertenece al usuario 1 (el cliente que inicia sesión en las pruebas)
const MASCOTA_DEL_USUARIO_1 = [/FROM mascota m\s+JOIN cliente c/, [{ ID_cliente: 2, ID_usuario: 1 }]]
const HORARIO_LIBRE = [/SELECT ID_cita, Hora FROM cita WHERE ID_veterinario/, []]
const INSERTAR_OK = [/INSERT INTO cita/, { insertId: 99 }]
const GUARDAR_EVENTO = [/UPDATE cita SET Google_Event_ID/, { affectedRows: 1 }]
const RESERVA_OK = [MASCOTA_DEL_USUARIO_1, HORARIO_LIBRE, INSERTAR_OK, GUARDAR_EVENTO]

const reservar = (cuerpo, rol = 'cliente', idUsuario = 1) =>
  request(app).post('/api/citas').set(auth(rol, idUsuario)).send(cuerpo)
const seInserto = () => consultasQue(/INSERT INTO cita/).length > 0

describe('RF08 · Reserva de citas (POST /api/citas)', () => {
  describe('reserva exitosa', () => {
    test('401 sin token', async () => {
      expect((await request(app).post('/api/citas').send(CITA)).status).toBe(401)
    })

    test('el cliente reserva eligiendo mascota, servicio, veterinario, fecha y hora', async () => {
      mockDb(RESERVA_OK)
      const res = await reservar(CITA)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ ID_cita: 99, ID_mascota: 3, ID_servicio: 4, ID_veterinario: 5, Fecha: '2026-12-01', Hora: '09:00' })
    })

    test('el cliente de la cita se toma de la mascota (no del cuerpo de la petición)', async () => {
      mockDb(RESERVA_OK)
      await reservar(el({ ID_cliente: 999 }))   // intenta colarse como otro cliente
      const params = consultasQue(/INSERT INTO cita/)[0][1]
      expect(params[0]).toBe(2)                 // ID_cliente real de la mascota
    })

    test('acepta la hora en formato "09:00 AM" y la guarda normalizada', async () => {
      mockDb(RESERVA_OK)
      const res = await reservar(el({ Hora: '09:00 AM' }))
      expect(res.status).toBe(200)
      expect(consultasQue(/INSERT INTO cita/)[0][1][5]).toBe('09:00')
    })

    test('se puede reservar en el horario de la tarde (2:00 PM)', async () => {
      mockDb(RESERVA_OK)
      expect((await reservar(el({ Hora: '14:00' }))).status).toBe(200)
    })

    test('se puede reservar hoy en una hora posterior a la actual (son las 10:00)', async () => {
      mockDb(RESERVA_OK)
      expect((await reservar(el({ Fecha: '2026-11-25', Hora: '11:00' }))).status).toBe(200)
    })
  })

  describe('no se permite reservar un horario ya ocupado (sin cruces de horario)', () => {
    test('409 si el veterinario ya tiene una cita a esa fecha y hora (y no inserta)', async () => {
      mockDb([MASCOTA_DEL_USUARIO_1, [/SELECT ID_cita, Hora FROM cita WHERE ID_veterinario/, [{ ID_cita: 50, Hora: '09:00' }]], INSERTAR_OK])
      const res = await reservar(CITA)
      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/ya tiene una cita agendada/)
      expect(seInserto()).toBe(false)
    })

    test('detecta el cruce aunque la hora esté guardada como "09:00:00" o "09:00 AM"', async () => {
      for (const guardada of ['09:00:00', '09:00 AM']) {
        mockDb([MASCOTA_DEL_USUARIO_1, [/SELECT ID_cita, Hora FROM cita WHERE ID_veterinario/, [{ ID_cita: 50, Hora: guardada }]], INSERTAR_OK])
        expect((await reservar(CITA)).status).toBe(409)
      }
    })

    test('otra hora del mismo día con el mismo veterinario sí se puede reservar', async () => {
      mockDb([MASCOTA_DEL_USUARIO_1, [/SELECT ID_cita, Hora FROM cita WHERE ID_veterinario/, [{ ID_cita: 50, Hora: '10:00' }]], INSERTAR_OK, GUARDAR_EVENTO])
      expect((await reservar(CITA)).status).toBe(200)
    })

    test('las citas canceladas no bloquean el horario', async () => {
      mockDb(RESERVA_OK)
      await reservar(CITA)
      expect(consultasQue(/SELECT ID_cita, Hora FROM cita/)[0][0]).toMatch(/Estado <> 'Cancelada'/)
    })

    test('409 también si la BD rechaza el duplicado (restricción única, ej. dos reservas simultáneas)', async () => {
      mockDb([MASCOTA_DEL_USUARIO_1, HORARIO_LIBRE, [/INSERT INTO cita/, (p, cb) => cb(Object.assign(new Error('duplicado'), { code: '23505' }))]])
      const res = await reservar(CITA)
      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/ya tiene una cita agendada/)
    })
  })

  describe('validación de datos de la reserva', () => {
    test.each([
      ['mascota', { ID_mascota: undefined }],
      ['servicio', { ID_servicio: undefined }],
      ['veterinario', { ID_veterinario: undefined }]
    ])('400 si falta la %s', async (_, faltante) => {
      mockDb(RESERVA_OK)
      const res = await reservar(el(faltante))
      expect(res.status).toBe(400)
      expect(seInserto()).toBe(false)
    })

    test('400 si no se envía la fecha', async () => {
      mockDb(RESERVA_OK)
      const res = await reservar(el({ Fecha: undefined }))
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/fecha/i)
    })

    test('400 si la fecha ya pasó', async () => {
      mockDb(RESERVA_OK)
      const res = await reservar(el({ Fecha: '2026-11-24' }))
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/fecha pasada/)
      expect(seInserto()).toBe(false)
    })

    test('400 si la fecha pasa del 31 de diciembre de 2026', async () => {
      mockDb(RESERVA_OK)
      const res = await reservar(el({ Fecha: '2027-01-05' }))
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/31 de diciembre de 2026/)
    })

    test('400 si la hora no es un horario de atención (ej. 12:00 del mediodía)', async () => {
      mockDb(RESERVA_OK)
      const res = await reservar(el({ Hora: '12:00' }))
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/horario de atencion/)
    })

    test('400 si la hora no tiene un formato válido', async () => {
      mockDb(RESERVA_OK)
      expect((await reservar(el({ Hora: 'nueve' }))).status).toBe(400)
    })

    test('400 si es hoy y la hora elegida ya pasó (son las 10:00 y elige las 9:00)', async () => {
      mockDb(RESERVA_OK)
      const res = await reservar(el({ Fecha: '2026-11-25', Hora: '09:00' }))
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/ya pasó/)
      expect(seInserto()).toBe(false)
    })
  })

  describe('permisos', () => {
    test('403 si un veterinario intenta agendar', async () => {
      mockDb([[/FROM veterinario WHERE ID_usuario/, [{ ID_veterinario: 5 }]], ...RESERVA_OK])
      const res = await reservar(CITA, 'veterinario')
      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/veterinarios no pueden agendar/)
    })

    test('403 si el cliente intenta agendar para la mascota de otro cliente', async () => {
      mockDb(RESERVA_OK)                       // la mascota 3 es del usuario 1...
      const res = await reservar(CITA, 'cliente', 2)   // ...pero inicia sesión el usuario 2
      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/tus propias mascotas/)
      expect(seInserto()).toBe(false)
    })

    test('el administrador sí puede agendar para cualquier mascota', async () => {
      mockDb(RESERVA_OK)
      expect((await reservar(CITA, 'administrador', 2)).status).toBe(200)
    })

    test('404 si la mascota no existe o está inactiva', async () => {
      mockDb([[/FROM mascota m\s+JOIN cliente c/, []], HORARIO_LIBRE, INSERTAR_OK])
      const res = await reservar(CITA)
      expect(res.status).toBe(404)
      expect(seInserto()).toBe(false)
    })
  })

  describe('errores', () => {
    test('400 si el servicio, veterinario o mascota no existen (llave foránea)', async () => {
      mockDb([MASCOTA_DEL_USUARIO_1, HORARIO_LIBRE, [/INSERT INTO cita/, (p, cb) => cb(Object.assign(new Error('fk'), { code: '23503' }))]])
      expect((await reservar(CITA)).status).toBe(400)
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM mascota m\s+JOIN cliente c/, falla('fallo de BD')]])
      expect((await reservar(CITA)).status).toBe(500)
    })
  })
})
