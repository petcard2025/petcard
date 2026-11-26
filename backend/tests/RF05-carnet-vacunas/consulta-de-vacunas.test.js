// RF05 - Carnet digital de vacunas
// Consulta del carnet: todas las vacunas (GET /api/vacunas) y las de una mascota (GET /api/vacunas/mascota/:id).
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))
jest.mock('../../src/services/notification.service', () => ({ crearNotificacionAutomatica: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const VACUNA = {
  ID_carnetVacunas: 1, ID_mascota: 3, ID_servicio: 8, Nombre_vacuna: 'Rabia', Lote: 'L-2026-01',
  Fecha_aplicacion: '2026-03-10', Proxima_dosis: '2027-03-10', Estado: 'Aplicada', Observaciones: 'Sin reacción'
}

describe('RF05 · Consulta del carnet de vacunas', () => {
  describe('GET /api/vacunas (todas)', () => {
    test('401 sin token', async () => {
      expect((await request(app).get('/api/vacunas')).status).toBe(401)
    })

    test('403 con un token inválido', async () => {
      const res = await request(app).get('/api/vacunas').set('Authorization', 'Bearer falso')
      expect(res.status).toBe(403)
    })

    test('devuelve las vacunas con el nombre de la mascota y del servicio', async () => {
      mockDb([[/FROM carnetvacunas cv/, [{ ...VACUNA, Nombre_mascota: 'Rex', Nombre_servicio: 'Vacunación' }]]])
      const res = await request(app).get('/api/vacunas').set(auth('administrador'))
      expect(res.status).toBe(200)
      expect(res.body[0]).toMatchObject({ Nombre_vacuna: 'Rabia', Nombre_mascota: 'Rex', Nombre_servicio: 'Vacunación' })
    })

    test('la consulta une carnet, mascota y servicio', async () => {
      mockDb([[/FROM carnetvacunas cv/, []]])
      await request(app).get('/api/vacunas').set(auth('administrador'))
      const [sql] = consultasQue(/FROM carnetvacunas cv/)[0]
      expect(sql).toMatch(/JOIN mascota m ON cv.ID_mascota = m.ID_mascota/)
      expect(sql).toMatch(/JOIN servicio s ON cv.ID_servicio = s.ID_servicio/)
    })

    test('lista vacía si todavía no hay vacunas', async () => {
      mockDb([[/FROM carnetvacunas cv/, []]])
      const res = await request(app).get('/api/vacunas').set(auth('administrador'))
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM carnetvacunas cv/, falla('fallo')]])
      expect((await request(app).get('/api/vacunas').set(auth('administrador'))).status).toBe(500)
    })
  })

  describe('GET /api/vacunas/mascota/:id_mascota', () => {
    test('401 sin token', async () => {
      expect((await request(app).get('/api/vacunas/mascota/3')).status).toBe(401)
    })

    test('devuelve el carnet completo de la mascota (fechas, lote, próxima dosis, estado)', async () => {
      mockDb([[/FROM carnetvacunas WHERE ID_mascota/, [VACUNA]]])
      const res = await request(app).get('/api/vacunas/mascota/3').set(auth('cliente'))
      expect(res.status).toBe(200)
      expect(res.body[0]).toMatchObject({
        Nombre_vacuna: 'Rabia', Lote: 'L-2026-01', Fecha_aplicacion: '2026-03-10',
        Proxima_dosis: '2027-03-10', Estado: 'Aplicada'
      })
    })

    test('filtra por la mascota pedida', async () => {
      mockDb([[/FROM carnetvacunas WHERE ID_mascota/, []]])
      await request(app).get('/api/vacunas/mascota/7').set(auth('cliente'))
      expect(consultasQue(/FROM carnetvacunas WHERE ID_mascota/)[0][1]).toEqual(['7'])
    })

    test('mascota sin vacunas → lista vacía (no es un error)', async () => {
      mockDb([[/FROM carnetvacunas WHERE ID_mascota/, []]])
      const res = await request(app).get('/api/vacunas/mascota/3').set(auth('cliente'))
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    test('lo pueden consultar cliente, veterinario y administrador', async () => {
      mockDb([[/FROM carnetvacunas WHERE ID_mascota/, [VACUNA]]])
      for (const rol of ['cliente', 'veterinario', 'administrador']) {
        expect((await request(app).get('/api/vacunas/mascota/3').set(auth(rol))).status).toBe(200)
      }
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM carnetvacunas WHERE ID_mascota/, falla('fallo')]])
      expect((await request(app).get('/api/vacunas/mascota/3').set(auth('cliente'))).status).toBe(500)
    })
  })

  test.todo('un cliente solo debería ver las vacunas de SUS mascotas (hoy GET /api/vacunas devuelve el carnet de TODAS a cualquier usuario autenticado)')
})
