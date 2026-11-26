// RF04 - Historial de servicios
// Catálogo de servicios (consultas, baños, desparasitaciones, tratamientos...) con el que se registran
// los servicios realizados a cada mascota. Cualquiera puede verlo; solo el administrador lo modifica.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const SERVICIOS = [
  { ID_servicio: 1, Nombre: 'Consulta General', Categoria: 'Consulta' },
  { ID_servicio: 2, Nombre: 'Baño', Categoria: 'Estética' },
  { ID_servicio: 3, Nombre: 'Desparasitación', Categoria: 'Tratamiento' }
]

describe('RF04 · Catálogo de servicios', () => {
  test('GET /api/servicios es público y lista los servicios', async () => {
    mockDb([[/SELECT \* FROM servicio/, SERVICIOS]])
    const res = await request(app).get('/api/servicios')
    expect(res.status).toBe(200)
    expect(res.body.map(s => s.Nombre)).toEqual(['Consulta General', 'Baño', 'Desparasitación'])
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/SELECT \* FROM servicio/, falla('fallo')]])
    expect((await request(app).get('/api/servicios')).status).toBe(500)
  })

  test('401 si se intenta crear un servicio sin token', async () => {
    expect((await request(app).post('/api/servicios').send({ Nombre: 'Nuevo' })).status).toBe(401)
  })

  test('403 si un cliente intenta crear un servicio', async () => {
    mockDb([])
    const res = await request(app).post('/api/servicios').set(auth('cliente')).send({ Nombre: 'Nuevo' })
    expect(res.status).toBe(403)
    expect(consultasQue(/INSERT INTO servicio/)).toHaveLength(0)
  })

  test('403 si un veterinario intenta eliminar un servicio', async () => {
    mockDb([])
    const res = await request(app).delete('/api/servicios/1').set(auth('veterinario'))
    expect(res.status).toBe(403)
    expect(consultasQue(/DELETE FROM servicio/)).toHaveLength(0)
  })
})
