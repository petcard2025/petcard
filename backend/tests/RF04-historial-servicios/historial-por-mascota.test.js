// RF04 - Historial de servicios
// Registros clínicos que se consultan POR MASCOTA: vacunas, plan de alimentación y mascotas del cliente.
// Se verifica que cada consulta use únicamente el id de la mascota seleccionada (para no mezclar mascotas).
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

describe('RF04 · Historial por mascota', () => {
  describe('GET /api/vacunas/mascota/:id_mascota', () => {
    test('401 sin token', async () => {
      expect((await request(app).get('/api/vacunas/mascota/3')).status).toBe(401)
    })

    test('devuelve solo el historial de vacunas de la mascota pedida', async () => {
      mockDb([[/FROM carnetvacunas WHERE ID_mascota/, [{ ID_carnetVacunas: 1, ID_mascota: 3, Nombre_vacuna: 'Rabia' }]]])
      const res = await request(app).get('/api/vacunas/mascota/3').set(auth('cliente'))
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(consultasQue(/FROM carnetvacunas WHERE ID_mascota/)[0][1]).toEqual(['3'])
    })

    test('dos mascotas distintas generan consultas distintas (no se mezclan)', async () => {
      mockDb([[/FROM carnetvacunas WHERE ID_mascota/, []]])
      await request(app).get('/api/vacunas/mascota/3').set(auth('cliente'))
      await request(app).get('/api/vacunas/mascota/4').set(auth('cliente'))
      const llamadas = consultasQue(/FROM carnetvacunas WHERE ID_mascota/).map(c => c[1])
      expect(llamadas).toEqual([['3'], ['4']])
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM carnetvacunas/, falla('fallo')]])
      expect((await request(app).get('/api/vacunas/mascota/3').set(auth('cliente'))).status).toBe(500)
    })
  })

  describe('GET /api/alimentacion/mascota/:id_mascota', () => {
    test('401 sin token', async () => {
      expect((await request(app).get('/api/alimentacion/mascota/3')).status).toBe(401)
    })

    test('devuelve los planes de la mascota con el plan activo primero', async () => {
      mockDb([[/FROM planalimentacion WHERE ID_mascota/, [{ ID_planAlimentacion: 9, Revision_nutricional: 'Activo' }]]])
      const res = await request(app).get('/api/alimentacion/mascota/3').set(auth('cliente'))
      expect(res.status).toBe(200)
      const [sql, params] = consultasQue(/FROM planalimentacion WHERE ID_mascota/)[0]
      expect(params).toEqual(['3'])
      expect(sql).toMatch(/ORDER BY CASE WHEN Revision_nutricional = 'Activo' THEN 0 ELSE 1 END, ID_planAlimentacion DESC/)
    })
  })

  describe('GET /api/mascotas/cliente/:id_cliente', () => {
    test('401 sin token', async () => {
      expect((await request(app).get('/api/mascotas/cliente/2')).status).toBe(401)
    })

    test('lista las mascotas del cliente pedido', async () => {
      mockDb([[/FROM mascota WHERE ID_cliente/, [{ ID_mascota: 3, Nombre: 'Rex' }, { ID_mascota: 4, Nombre: 'Luna' }]]])
      const res = await request(app).get('/api/mascotas/cliente/2').set(auth('cliente'))
      expect(res.status).toBe(200)
      expect(res.body.map(m => m.Nombre)).toEqual(['Rex', 'Luna'])
      expect(consultasQue(/FROM mascota WHERE ID_cliente/)[0][1]).toEqual(['2'])
    })
  })

  test.todo('un cliente solo debería ver el historial de vacunas de SUS mascotas (hoy puede consultar el de cualquiera)')
  test.todo('un cliente solo debería ver los planes de alimentación de SUS mascotas (hoy puede consultar los de cualquiera)')
})
