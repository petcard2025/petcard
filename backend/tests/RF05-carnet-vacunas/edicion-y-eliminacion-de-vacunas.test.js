// RF05 - Carnet digital de vacunas
// Corregir (PUT /api/vacunas/:id) o eliminar (DELETE /api/vacunas/:id) un registro del carnet.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))
jest.mock('../../src/services/notification.service', () => ({ crearNotificacionAutomatica: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const CAMBIOS = {
  Nombre_vacuna: 'Rabia refuerzo', Lote: 'L-2026-09', Fecha_aplicacion: '2026-09-01',
  Proxima_dosis: '2027-09-01', Estado: 'Aplicada', Observaciones: 'Refuerzo anual'
}

describe('RF05 · Edición de vacunas (PUT /api/vacunas/:id)', () => {
  test('401 sin token', async () => {
    expect((await request(app).put('/api/vacunas/21').send(CAMBIOS)).status).toBe(401)
  })

  test('actualiza el registro y responde "Vacuna actualizada"', async () => {
    mockDb([[/UPDATE carnetvacunas SET/, { affectedRows: 1 }]])
    const res = await request(app).put('/api/vacunas/21').set(auth('veterinario')).send(CAMBIOS)
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Vacuna actualizada')
  })

  test('actualiza los campos del carnet y usa el id de la URL', async () => {
    mockDb([[/UPDATE carnetvacunas SET/, { affectedRows: 1 }]])
    await request(app).put('/api/vacunas/21').set(auth('veterinario')).send(CAMBIOS)
    expect(consultasQue(/UPDATE carnetvacunas SET/)[0][1]).toEqual([
      'Rabia refuerzo', 'L-2026-09', '2026-09-01', '2027-09-01', 'Aplicada', 'Refuerzo anual', '21'
    ])
  })

  test('no permite cambiar a qué mascota pertenece la vacuna', async () => {
    mockDb([[/UPDATE carnetvacunas SET/, { affectedRows: 1 }]])
    await request(app).put('/api/vacunas/21').set(auth('veterinario')).send({ ...CAMBIOS, ID_mascota: 99 })
    const [sql, params] = consultasQue(/UPDATE carnetvacunas SET/)[0]
    expect(sql).not.toMatch(/ID_mascota/)
    expect(params).not.toContain(99)
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/UPDATE carnetvacunas SET/, falla('fallo')]])
    expect((await request(app).put('/api/vacunas/21').set(auth('veterinario')).send(CAMBIOS)).status).toBe(500)
  })

  test.todo('editar una vacuna debería actualizar la notificación enlazada al dueño (hoy el mensaje queda con los datos antiguos)')
  test.todo('PUT sobre un id que no existe debería responder 404 (hoy responde 200 aunque no se haya actualizado nada)')
})

describe('RF05 · Eliminación de vacunas (DELETE /api/vacunas/:id)', () => {
  test('401 sin token', async () => {
    expect((await request(app).delete('/api/vacunas/21')).status).toBe(401)
  })

  test('elimina el registro indicado', async () => {
    mockDb([[/DELETE FROM carnetvacunas/, { affectedRows: 1 }]])
    const res = await request(app).delete('/api/vacunas/21').set(auth('administrador'))
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Vacuna eliminada')
    expect(consultasQue(/DELETE FROM carnetvacunas/)[0][1]).toEqual(['21'])
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/DELETE FROM carnetvacunas/, falla('fallo')]])
    expect((await request(app).delete('/api/vacunas/21').set(auth('administrador'))).status).toBe(500)
  })

  test.todo('un cliente NO debería poder eliminar vacunas del carnet (hoy cualquier usuario autenticado puede)')
  test.todo('al eliminar una vacuna debería borrarse su notificación enlazada (hoy queda huérfana hasta la próxima sincronización)')
})
