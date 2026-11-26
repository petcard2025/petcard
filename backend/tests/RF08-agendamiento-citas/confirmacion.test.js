// RF08 - Agendamiento de citas
// "Que se genere la confirmación automática y que el cliente tenga la certeza de que su cita quedó
// confirmada": notificación + evento de calendario al reservar, y cambios de estado (confirmar / cancelar).
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))
jest.mock('../../src/services/google-calendar.service', () => ({ crearEventoCalendar: jest.fn() }))
jest.mock('../../src/services/notification.service', () => ({ crearNotificacionAutomatica: jest.fn() }))
const mockSincronizarCita = jest.fn()
jest.mock('../../src/services/notification-sync', () => () => ({
  sincronizarCita: (...args) => mockSincronizarCita(...args),
  quitar: jest.fn().mockResolvedValue({})
}))

const request = require('supertest')
const app = require('../helpers/app')
const { crearEventoCalendar } = require('../../src/services/google-calendar.service')
const { auth, mockDb, consultasQue, congelarFecha } = require('../helpers/pruebas')

beforeAll(congelarFecha)
afterAll(() => jest.useRealTimers())
beforeEach(() => {
  crearEventoCalendar.mockResolvedValue('evt-123')
  mockSincronizarCita.mockResolvedValue({})
})

const CITA = { ID_mascota: 3, ID_servicio: 4, ID_veterinario: 5, Fecha: '2026-12-01', Hora: '09:00', Motivo: 'Control', Observaciones: 'Cojea' }
const MASCOTA_DEL_USUARIO_1 = [/FROM mascota m\s+JOIN cliente c/, [{ ID_cliente: 2, ID_usuario: 1 }]]
const HORARIO_LIBRE = [/SELECT ID_cita, Hora FROM cita WHERE ID_veterinario/, []]
const INSERTAR_OK = [/INSERT INTO cita/, { insertId: 99 }]
const GUARDAR_EVENTO = [/UPDATE cita SET Google_Event_ID/, { affectedRows: 1 }]

describe('RF08 · Confirmación automática al reservar', () => {
  test('se crea la notificación enlazada a la cita recién creada', async () => {
    mockDb([MASCOTA_DEL_USUARIO_1, HORARIO_LIBRE, INSERTAR_OK, GUARDAR_EVENTO])
    await request(app).post('/api/citas').set(auth('cliente')).send(CITA)
    expect(mockSincronizarCita).toHaveBeenCalledWith(99)
  })

  test('se crea el evento en Google Calendar y se guarda su id en la cita', async () => {
    mockDb([MASCOTA_DEL_USUARIO_1, HORARIO_LIBRE, INSERTAR_OK, GUARDAR_EVENTO])
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA)
    expect(crearEventoCalendar).toHaveBeenCalledWith(expect.objectContaining({ Fecha: '2026-12-01', Hora: '09:00' }))
    expect(res.body.googleEventId).toBe('evt-123')
    expect(consultasQue(/UPDATE cita SET Google_Event_ID/)[0][1]).toEqual(['evt-123', 99])
  })

  test('si Google Calendar falla, la cita igual queda reservada y se informa el error', async () => {
    crearEventoCalendar.mockRejectedValue(new Error('calendar caído'))
    mockDb([MASCOTA_DEL_USUARIO_1, HORARIO_LIBRE, INSERTAR_OK, GUARDAR_EVENTO])
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA)
    expect(res.status).toBe(200)
    expect(res.body.ID_cita).toBe(99)
    expect(res.body.calendarError).toBe('calendar caído')
  })

  test('si la notificación falla, la cita igual queda reservada', async () => {
    mockSincronizarCita.mockRejectedValue(new Error('fallo notificación'))
    mockDb([MASCOTA_DEL_USUARIO_1, HORARIO_LIBRE, INSERTAR_OK, GUARDAR_EVENTO])
    const res = await request(app).post('/api/citas').set(auth('cliente')).send(CITA)
    expect(res.status).toBe(200)
    expect(res.body.ID_cita).toBe(99)
  })

  test('si la reserva es rechazada (horario ocupado) NO se crea notificación ni evento', async () => {
    mockDb([MASCOTA_DEL_USUARIO_1, [/SELECT ID_cita, Hora FROM cita WHERE ID_veterinario/, [{ ID_cita: 1, Hora: '09:00' }]], INSERTAR_OK])
    await request(app).post('/api/citas').set(auth('cliente')).send(CITA)
    expect(mockSincronizarCita).not.toHaveBeenCalled()
    expect(crearEventoCalendar).not.toHaveBeenCalled()
  })

  test('la cita nueva no se inserta con estado "Confirmada": nace pendiente hasta que el veterinario la confirme', async () => {
    mockDb([MASCOTA_DEL_USUARIO_1, HORARIO_LIBRE, INSERTAR_OK, GUARDAR_EVENTO])
    await request(app).post('/api/citas').set(auth('cliente')).send(CITA)
    expect(consultasQue(/INSERT INTO cita/)[0][0]).not.toMatch(/Estado/)   // la BD le asigna el estado por defecto
  })
})

describe('RF08 · Cambio de estado de la cita (PATCH /api/citas/:id)', () => {
  const PERFIL_VET = [/FROM veterinario WHERE ID_usuario/, [{ ID_veterinario: 5, Cargo: 'Veterinario', Especialidad: 'General' }]]
  const citaDe = (cambios = {}) => [/SELECT ci\.\*, c\.ID_usuario AS ID_usuario_cliente/, [{
    ID_cita: 7, ID_cliente: 2, ID_mascota: 3, ID_servicio: 4, ID_veterinario: 5, ID_usuario_cliente: 1,
    Fecha: '2026-12-01', Hora: '09:00', Estado: 'Pendiente', ...cambios
  }]]
  const ACTUALIZAR_OK = [/UPDATE cita SET Estado/, { affectedRows: 1 }]
  const SIN_VET_PARA_AVISAR = [/FROM veterinario v\s+JOIN mascota m/, []]
  const patch = (cuerpo, rol, idUsuario = 1) => request(app).patch('/api/citas/7').set(auth(rol, idUsuario)).send(cuerpo)

  test('401 sin token', async () => {
    expect((await request(app).patch('/api/citas/7').send({ Estado: 'Confirmada' })).status).toBe(401)
  })

  test('el veterinario confirma una cita suya', async () => {
    mockDb([PERFIL_VET, citaDe(), ACTUALIZAR_OK])
    const res = await patch({ Estado: 'Confirmada' }, 'veterinario')
    expect(res.status).toBe(200)
    expect(consultasQue(/UPDATE cita SET Estado/)[0][1]).toEqual(['Confirmada', 7])
  })

  test('al cambiar el estado se actualiza la notificación del cliente', async () => {
    mockDb([PERFIL_VET, citaDe(), ACTUALIZAR_OK])
    await patch({ Estado: 'Confirmada' }, 'veterinario')
    expect(mockSincronizarCita).toHaveBeenCalledWith(7)
  })

  test('acepta el estado en minúsculas y lo guarda normalizado', async () => {
    mockDb([PERFIL_VET, citaDe(), ACTUALIZAR_OK])
    await patch({ Estado: 'confirmada' }, 'veterinario')
    expect(consultasQue(/UPDATE cita SET Estado/)[0][1][0]).toBe('Confirmada')
  })

  test('400 si el estado no es válido', async () => {
    mockDb([PERFIL_VET, citaDe(), ACTUALIZAR_OK])
    const res = await patch({ Estado: 'Aprobada' }, 'veterinario')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Estado no valido/)
  })

  test('403 si el veterinario intenta modificar la cita de otro veterinario', async () => {
    mockDb([PERFIL_VET, citaDe({ ID_veterinario: 9 }), ACTUALIZAR_OK])
    const res = await patch({ Estado: 'Confirmada' }, 'veterinario')
    expect(res.status).toBe(403)
    expect(consultasQue(/UPDATE cita SET Estado/)).toHaveLength(0)
  })

  test('404 si la cita no existe', async () => {
    mockDb([[/SELECT ci\.\*/, []]])
    expect((await patch({ Estado: 'Confirmada' }, 'administrador')).status).toBe(404)
  })

  describe('cancelación por el cliente', () => {
    test('el cliente cancela su cita pendiente', async () => {
      mockDb([citaDe(), ACTUALIZAR_OK, SIN_VET_PARA_AVISAR])
      const res = await patch({ Estado: 'Cancelada' }, 'cliente')
      expect(res.status).toBe(200)
      expect(consultasQue(/UPDATE cita SET Estado/)[0][1]).toEqual(['Cancelada', 7])
    })

    test('el cliente también puede cancelar una cita ya confirmada', async () => {
      mockDb([citaDe({ Estado: 'Confirmada' }), ACTUALIZAR_OK, SIN_VET_PARA_AVISAR])
      expect((await patch({ Estado: 'Cancelada' }, 'cliente')).status).toBe(200)
    })

    test('403 si el cliente intenta confirmar (solo puede cancelar)', async () => {
      mockDb([citaDe(), ACTUALIZAR_OK])
      const res = await patch({ Estado: 'Confirmada' }, 'cliente')
      expect(res.status).toBe(403)
      expect(consultasQue(/UPDATE cita SET Estado/)).toHaveLength(0)
    })

    test('403 si el cliente intenta cancelar la cita de otro cliente', async () => {
      mockDb([citaDe({ ID_usuario_cliente: 50 }), ACTUALIZAR_OK])
      const res = await patch({ Estado: 'Cancelada' }, 'cliente', 1)
      expect(res.status).toBe(403)
      expect(consultasQue(/UPDATE cita SET Estado/)).toHaveLength(0)
    })

    test('409 si la cita ya está completada (no se puede cancelar)', async () => {
      mockDb([citaDe({ Estado: 'Completada' }), ACTUALIZAR_OK])
      const res = await patch({ Estado: 'Cancelada' }, 'cliente')
      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/completada/)
    })

    test('400 si la cita ya pasó (no se puede cancelar)', async () => {
      mockDb([citaDe({ Fecha: '2026-11-20' }), ACTUALIZAR_OK])
      const res = await patch({ Estado: 'Cancelada' }, 'cliente')
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/ya paso/)
    })
  })

  test('PATCH solo permite cambiar Estado u Observaciones (400 con otros campos)', async () => {
    mockDb([PERFIL_VET, citaDe(), ACTUALIZAR_OK])
    const res = await patch({ Estado: 'Confirmada', ID_veterinario: 9 }, 'veterinario')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Campo no permitido/)
  })

  test('cuando un horario se cancela queda libre: ya no cuenta como ocupado', async () => {
    mockDb([[/SELECT Hora FROM cita/, []]])
    await request(app).get('/api/citas/horas-ocupadas?ID_veterinario=5&Fecha=2026-12-01').set(auth('cliente'))
    expect(consultasQue(/SELECT Hora FROM cita/)[0][0]).toMatch(/Estado <> 'Cancelada'/)
  })
})
