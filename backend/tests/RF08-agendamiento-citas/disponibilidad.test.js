// RF08 - Agendamiento de citas
// "Que se muestre la disponibilidad en tiempo real": GET /api/citas/horas-ocupadas
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const URL = '/api/citas/horas-ocupadas'

describe('RF08 · Disponibilidad de horarios (GET /api/citas/horas-ocupadas)', () => {
  test('401 sin token', async () => {
    expect((await request(app).get(`${URL}?ID_veterinario=5&Fecha=2026-12-01`)).status).toBe(401)
  })

  test('400 si falta el veterinario', async () => {
    const res = await request(app).get(`${URL}?Fecha=2026-12-01`).set(auth('cliente'))
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/ID_veterinario y Fecha/)
  })

  test('400 si falta la fecha', async () => {
    const res = await request(app).get(`${URL}?ID_veterinario=5`).set(auth('cliente'))
    expect(res.status).toBe(400)
  })

  test('400 si la fecha no tiene el formato AAAA-MM-DD', async () => {
    const res = await request(app).get(`${URL}?ID_veterinario=5&Fecha=01/12/2026`).set(auth('cliente'))
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/fecha no es valida/)
  })

  test('devuelve las horas que ya están ocupadas ese día con ese veterinario', async () => {
    mockDb([[/SELECT Hora FROM cita/, [{ Hora: '09:00:00' }, { Hora: '10:00:00' }]]])
    const res = await request(app).get(`${URL}?ID_veterinario=5&Fecha=2026-12-01`).set(auth('cliente'))
    expect(res.status).toBe(200)
    expect(res.body.horasOcupadas).toEqual(['09:00:00', '10:00:00'])
    expect(consultasQue(/SELECT Hora FROM cita/)[0][1]).toEqual(['5', '2026-12-01'])
  })

  test('si no hay citas ese día, todas las horas quedan libres', async () => {
    mockDb([[/SELECT Hora FROM cita/, []]])
    const res = await request(app).get(`${URL}?ID_veterinario=5&Fecha=2026-12-02`).set(auth('cliente'))
    expect(res.status).toBe(200)
    expect(res.body.horasOcupadas).toEqual([])
  })

  test('una cita cancelada libera su horario (no cuenta como ocupada)', async () => {
    mockDb([[/SELECT Hora FROM cita/, []]])
    await request(app).get(`${URL}?ID_veterinario=5&Fecha=2026-12-01`).set(auth('cliente'))
    expect(consultasQue(/SELECT Hora FROM cita/)[0][0]).toMatch(/Estado <> 'Cancelada'/)
  })

  test('la disponibilidad es por veterinario: otro veterinario consulta con su propio id', async () => {
    mockDb([[/SELECT Hora FROM cita/, []]])
    await request(app).get(`${URL}?ID_veterinario=5&Fecha=2026-12-01`).set(auth('cliente'))
    await request(app).get(`${URL}?ID_veterinario=6&Fecha=2026-12-01`).set(auth('cliente'))
    const params = consultasQue(/SELECT Hora FROM cita/).map(c => c[1])
    expect(params).toEqual([['5', '2026-12-01'], ['6', '2026-12-01']])
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/SELECT Hora FROM cita/, falla('fallo de BD')]])
    const res = await request(app).get(`${URL}?ID_veterinario=5&Fecha=2026-12-01`).set(auth('cliente'))
    expect(res.status).toBe(500)
  })
})
