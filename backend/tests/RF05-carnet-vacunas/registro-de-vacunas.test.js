// RF05 - Carnet digital de vacunas
// Registrar una vacuna: POST /api/vacunas. Al registrarla se notifica automáticamente al dueño de la mascota.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))
jest.mock('../../src/services/notification.service', () => ({ crearNotificacionAutomatica: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { crearNotificacionAutomatica } = require('../../src/services/notification.service')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const VACUNA = {
  ID_mascota: 3, ID_servicio: 8, Nombre_vacuna: 'Rabia', Lote: 'L-2026-01',
  Fecha_aplicacion: '2026-03-10', Proxima_dosis: '2027-03-10', Estado: 'Aplicada', Observaciones: 'Sin reacción'
}
const INSERTAR_OK = [/INSERT INTO carnetvacunas/, { insertId: 21 }]
const DUENO = [/FROM mascota m\s+JOIN cliente c ON c.ID_cliente = m.ID_cliente/, [{ ID_usuario: 2, Nombre_mascota: 'Rex' }]]
const registrar = (cuerpo = VACUNA, rol = 'veterinario') => request(app).post('/api/vacunas').set(auth(rol)).send(cuerpo)

describe('RF05 · Registro de vacunas (POST /api/vacunas)', () => {
  describe('registro exitoso', () => {
    test('401 sin token', async () => {
      expect((await request(app).post('/api/vacunas').send(VACUNA)).status).toBe(401)
    })

    test('registra la vacuna y devuelve su id junto con los datos enviados', async () => {
      mockDb([INSERTAR_OK, DUENO])
      const res = await registrar()
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ ID_carnetVacunas: 21, ID_mascota: 3, Nombre_vacuna: 'Rabia', Lote: 'L-2026-01' })
    })

    test('guarda todos los datos del carnet en el orden correcto', async () => {
      mockDb([INSERTAR_OK, DUENO])
      await registrar()
      expect(consultasQue(/INSERT INTO carnetvacunas/)[0][1]).toEqual([
        3, 8, 'Rabia', 'L-2026-01', '2026-03-10', '2027-03-10', 'Aplicada', 'Sin reacción'
      ])
    })

    test('el veterinario y el administrador pueden registrar vacunas', async () => {
      mockDb([INSERTAR_OK, DUENO])
      expect((await registrar(VACUNA, 'veterinario')).status).toBe(200)
      expect((await registrar(VACUNA, 'administrador')).status).toBe(200)
    })
  })

  describe('notificación automática al dueño', () => {
    test('se notifica al dueño de la mascota (tipo "vacuna", canal "Sistema")', async () => {
      mockDb([INSERTAR_OK, DUENO])
      await registrar()
      expect(crearNotificacionAutomatica).toHaveBeenCalledTimes(1)
      const [idUsuario, mensaje, tipo, canal] = crearNotificacionAutomatica.mock.calls[0]
      expect(idUsuario).toBe(2)
      expect(tipo).toBe('vacuna')
      expect(canal).toBe('Sistema')
      expect(mensaje).toBe('Vacuna "Rabia" registrada para Rex aplicada el 2026-03-10. Proxima dosis: 2027-03-10.')
    })

    test('el dueño se busca a partir de la mascota de la vacuna', async () => {
      mockDb([INSERTAR_OK, DUENO])
      await registrar()
      expect(consultasQue(/FROM mascota m\s+JOIN cliente c/)[0][1]).toEqual([3])
    })

    test('sin próxima dosis, el mensaje no la menciona', async () => {
      mockDb([INSERTAR_OK, DUENO])
      await registrar({ ...VACUNA, Proxima_dosis: null })
      expect(crearNotificacionAutomatica.mock.calls[0][1]).not.toMatch(/Proxima dosis/)
    })

    test('sin fecha de aplicación, el mensaje no la menciona', async () => {
      mockDb([INSERTAR_OK, DUENO])
      await registrar({ ...VACUNA, Fecha_aplicacion: null })
      expect(crearNotificacionAutomatica.mock.calls[0][1]).not.toMatch(/aplicada el/)
    })

    test('si no se encuentra al dueño, la vacuna igual se registra y no se notifica', async () => {
      mockDb([INSERTAR_OK, [/FROM mascota m\s+JOIN cliente c/, []]])
      const res = await registrar()
      expect(res.status).toBe(200)
      expect(crearNotificacionAutomatica).not.toHaveBeenCalled()
    })

    test('si falla la búsqueda del dueño, la vacuna igual se registra', async () => {
      mockDb([INSERTAR_OK, [/FROM mascota m\s+JOIN cliente c/, falla('fallo')]])
      const res = await registrar()
      expect(res.status).toBe(200)
      expect(crearNotificacionAutomatica).not.toHaveBeenCalled()
    })
  })

  describe('errores', () => {
    test('500 si falla el INSERT (y no se notifica)', async () => {
      mockDb([[/INSERT INTO carnetvacunas/, falla('fallo')], DUENO])
      const res = await registrar()
      expect(res.status).toBe(500)
      expect(crearNotificacionAutomatica).not.toHaveBeenCalled()
    })
  })

  test.todo('debería rechazar (400) una vacuna sin ID_mascota o sin Nombre_vacuna (hoy se intenta guardar con campos vacíos)')
  test.todo('la próxima dosis debería ser posterior a la fecha de aplicación (hoy no se valida)')
  test.todo('un cliente NO debería poder registrar vacunas en el carnet (hoy cualquier usuario autenticado puede)')
})
