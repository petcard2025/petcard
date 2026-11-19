// Se desactiva el limitador solo en este archivo (las pruebas necesitan varias solicitudes)
jest.mock('express-rate-limit', () => () => (req, res, next) => next())
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const db = require('../../src/config/database')
const mailer = require('../../mailer')
const app = require('../helpers/app')

const CORREO = 'ana@test.com'

// Simula la base de datos: UPDATE responde bien, SELECT devuelve el usuario indicado
function mockDb(usuario = { ID_usuario: 1, Nombre: 'Ana', Telefono: '3001234567' }) {
  db.query.mockImplementation((sql, params, cb) => {
    if (/^\s*UPDATE/i.test(sql)) return cb(null, { affectedRows: 1 })
    cb(null, usuario ? [usuario] : [])
  })
}

// Pide un código y lo recupera del correo simulado
async function solicitarCodigo() {
  mailer.enviarCorreoRecuperacion.mockResolvedValue({ success: true })
  await request(app).post('/api/auth/forgot-password').send({ Correo: CORREO })
  const llamadas = mailer.enviarCorreoRecuperacion.mock.calls
  return llamadas[llamadas.length - 1][1]
}

describe('POST /api/auth/forgot-password', () => {
  test('400 si falta el correo', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({})
    expect(res.status).toBe(400)
  })

  test('responde igual y no envía correo si el usuario no existe', async () => {
    mockDb(null)
    const res = await request(app).post('/api/auth/forgot-password').send({ Correo: 'nadie@test.com' })
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/Si el correo esta registrado/)
    expect(mailer.enviarCorreoRecuperacion).not.toHaveBeenCalled()
  })

  test('envía un código de 6 dígitos si el usuario existe', async () => {
    mockDb()
    const codigo = await solicitarCodigo()
    expect(codigo).toMatch(/^\d{6}$/)
  })
})

describe('POST /api/auth/reset-password', () => {
  test('400 si faltan código o contraseña nueva', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ Correo: CORREO })
    expect(res.status).toBe(400)
  })

  test('400 si la contraseña nueva tiene menos de 6 caracteres', async () => {
    const res = await request(app).post('/api/auth/reset-password')
      .send({ codigo: '123456', nuevaContrasena: '123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/al menos 6/)
  })

  test('400 con un código que no existe', async () => {
    const res = await request(app).post('/api/auth/reset-password')
      .send({ codigo: 'codigo-falso', nuevaContrasena: 'ClaveNueva1' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/invalido/)
  })

  test('200 con código válido y guarda la contraseña con hash', async () => {
    mockDb()
    const codigo = await solicitarCodigo()

    const res = await request(app).post('/api/auth/reset-password')
      .send({ Correo: CORREO, codigo, nuevaContrasena: 'ClaveNueva1' })

    expect(res.status).toBe(200)
    const update = db.query.mock.calls.find(c => /UPDATE/i.test(c[0]))
    expect(update[1][0]).toMatch(/^\$2/)          // es un hash de bcrypt
    expect(update[1][0]).not.toBe('ClaveNueva1')  // no se guardó en texto plano
    expect(update[1][1]).toBe(1)                  // se actualizó el usuario correcto
  })

  test('el código es de un solo uso', async () => {
    mockDb()
    const codigo = await solicitarCodigo()
    const datos = { Correo: CORREO, codigo, nuevaContrasena: 'ClaveNueva1' }

    expect((await request(app).post('/api/auth/reset-password').send(datos)).status).toBe(200)
    expect((await request(app).post('/api/auth/reset-password').send(datos)).status).toBe(400)
  })

  test('400 si el código no corresponde al correo indicado', async () => {
    mockDb()
    const codigo = await solicitarCodigo()
    mockDb({ ID_usuario: 2 }) // el correo enviado ahora pertenece a otro usuario

    const res = await request(app).post('/api/auth/reset-password')
      .send({ Correo: 'otro@test.com', codigo, nuevaContrasena: 'ClaveNueva1' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/no corresponde/)
  })

  test('400 si el código expiró (más de 5 minutos)', async () => {
    mockDb()
    const codigo = await solicitarCodigo()
    const spy = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 6 * 60 * 1000)
    try {
      const res = await request(app).post('/api/auth/reset-password')
        .send({ Correo: CORREO, codigo, nuevaContrasena: 'ClaveNueva1' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/ha expirado/)
    } finally {
      spy.mockRestore()
    }
  })
})