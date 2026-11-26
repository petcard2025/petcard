// Pruebas de Gestión de Servicios · Crear, editar y eliminar (administrador)
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const admin = () => auth('administrador')
const NUEVO = { Nombre: 'Baño', Descripcion: 'Baño y secado', Categoria: 'Estética', Precio: 35000 }
const conCodigo = (codigo, mensaje = 'error de la base de datos') =>
  (p, cb) => cb(Object.assign(new Error(mensaje), { code: codigo }))

describe('Servicios · Crear (POST /api/servicios)', () => {
  test('registra el servicio con los campos en el orden correcto y responde con su id', async () => {
    mockDb([[/INSERT INTO servicio/, { insertId: 12 }]])
    const res = await request(app).post('/api/servicios').set(admin()).send(NUEVO)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ID_servicio: 12, ...NUEVO })
    expect(consultasQue(/INSERT INTO servicio/)[0][1]).toEqual(['Baño', 'Baño y secado', 'Estética', 35000])
  })

  test('el precio es opcional: si no se envía se guarda vacío (null)', async () => {
    mockDb([[/INSERT INTO servicio/, { insertId: 13 }]])
    const { Precio, ...sinPrecio } = NUEVO
    const res = await request(app).post('/api/servicios').set(admin()).send(sinPrecio)
    expect(res.status).toBe(200)
    expect(consultasQue(/INSERT INTO servicio/)[0][1][3]).toBeNull()
  })

  test('un precio vacío ("") se guarda como null y no como texto', async () => {
    mockDb([[/INSERT INTO servicio/, { insertId: 14 }]])
    await request(app).post('/api/servicios').set(admin()).send({ ...NUEVO, Precio: '' })
    expect(consultasQue(/INSERT INTO servicio/)[0][1][3]).toBeNull()
  })

  test('acepta precio 0 (por ejemplo, una consulta gratuita)', async () => {
    mockDb([[/INSERT INTO servicio/, { insertId: 15 }]])
    const res = await request(app).post('/api/servicios').set(admin()).send({ ...NUEVO, Precio: 0 })
    expect(res.status).toBe(200)
    expect(consultasQue(/INSERT INTO servicio/)[0][1][3]).toBe(0)
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/INSERT INTO servicio/, falla('sin conexión')]])
    const res = await request(app).post('/api/servicios').set(admin()).send(NUEVO)
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('sin conexión')
  })
})

describe('Servicios · Editar (PUT /api/servicios/:id)', () => {
  test('actualiza el servicio indicado en la URL', async () => {
    mockDb([[/UPDATE servicio/, { affectedRows: 1 }]])
    const res = await request(app).put('/api/servicios/7').set(admin()).send({ ...NUEVO, Nombre: 'Baño y corte', Precio: 45000 })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Servicio actualizado' })
    expect(consultasQue(/UPDATE servicio/)[0][1]).toEqual(['Baño y corte', 'Baño y secado', 'Estética', 45000, '7'])
  })

  test('si no se envía el precio, se conserva el que ya tenía (no se borra)', async () => {
    mockDb([[/UPDATE servicio/, { affectedRows: 1 }]])
    const { Precio, ...sinPrecio } = NUEVO
    await request(app).put('/api/servicios/7').set(admin()).send(sinPrecio)
    const [sql, params] = consultasQue(/UPDATE servicio/)[0]
    expect(sql).toMatch(/Precio=COALESCE\(\?, Precio\)/)
    expect(params[3]).toBeNull()
  })

  test('un precio vacío ("") también conserva el precio anterior', async () => {
    mockDb([[/UPDATE servicio/, { affectedRows: 1 }]])
    await request(app).put('/api/servicios/7').set(admin()).send({ ...NUEVO, Precio: '' })
    expect(consultasQue(/UPDATE servicio/)[0][1][3]).toBeNull()
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/UPDATE servicio/, falla('fallo')]])
    expect((await request(app).put('/api/servicios/7').set(admin()).send(NUEVO)).status).toBe(500)
  })
})

describe('Servicios · Eliminar (DELETE /api/servicios/:id)', () => {
  test('elimina solo el servicio indicado', async () => {
    mockDb([[/DELETE FROM servicio/, { affectedRows: 1 }]])
    const res = await request(app).delete('/api/servicios/7').set(admin())
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Servicio eliminado' })
    expect(consultasQue(/DELETE FROM servicio/)[0][1]).toEqual(['7'])
  })

  test.each([
    ['PostgreSQL (23503)', '23503'],
    ['MySQL (ER_ROW_IS_REFERENCED_2)', 'ER_ROW_IS_REFERENCED_2']
  ])('409 con mensaje claro si el servicio está en uso por citas, vacunas o planes - %s', async (_motor, codigo) => {
    mockDb([[/DELETE FROM servicio/, conCodigo(codigo, 'update or delete on table "servicio" violates foreign key constraint "cita_ibfk_3"')]])
    const res = await request(app).delete('/api/servicios/7').set(admin())
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/tiene citas, vacunas o planes asociados/)
    expect(res.body.error).not.toMatch(/constraint|cita_ibfk/)
  })

  test('500 si falla la base de datos por otra causa', async () => {
    mockDb([[/DELETE FROM servicio/, falla('sin conexión')]])
    const res = await request(app).delete('/api/servicios/7').set(admin())
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('sin conexión')
  })

  test.todo('editar o eliminar un servicio que no existe debería responder 404: hoy responde 200 igual')
  test.todo('no debería permitir dos servicios con el mismo nombre: hoy se pueden crear duplicados')
})
