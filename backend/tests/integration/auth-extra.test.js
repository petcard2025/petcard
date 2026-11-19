jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../../src/config/database')
const app = require('../helpers/app')

const usuario = (Rol, Contrasena) => ({
  ID_usuario: 7, Nombre: 'Luis', Correo: 'luis@test.com',
  Telefono: '3001234567', Rol, Contrasena
})

// SELECT devuelve el usuario; UPDATE responde bien
function mockUsuario(fila) {
  db.query.mockImplementation((sql, params, cb) => {
    if (/^\s*UPDATE/i.test(sql)) return cb(null, { affectedRows: 1 })
    cb(null, fila ? [fila] : [])
  })
}

describe('POST /api/auth/login (casos extra)', () => {
  test('acepta contraseña antigua en texto plano y la convierte a hash', async () => {
    mockUsuario(usuario('cliente', 'ClaveVieja1'))

    const res = await request(app).post('/api/auth/login')
      .send({ Correo: 'luis@test.com', Contrasena: 'ClaveVieja1' })

    expect(res.status).toBe(200)
    const update = db.query.mock.calls.find(c => /UPDATE/i.test(c[0]))
    expect(update[1][0]).toMatch(/^\$2/)
    expect(update[1][1]).toBe(7)
  })

  test('500 si falla la base de datos', async () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error('fallo de BD')))
    const res = await request(app).post('/api/auth/login')
      .send({ Correo: 'luis@test.com', Contrasena: 'x' })
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('fallo de BD')
  })
})

describe('POST /api/auth/login-admin (casos extra)', () => {
  let hash
  beforeAll(async () => { hash = await bcrypt.hash('Clave123', 4) })

  test.each(['administrador', 'veterinario'])('200 y token con rol %s', async (rol) => {
    mockUsuario(usuario(rol, hash))
    const res = await request(app).post('/api/auth/login-admin')
      .send({ Correo: 'luis@test.com', Contrasena: 'Clave123' })

    expect(res.status).toBe(200)
    expect(jwt.verify(res.body.token, process.env.JWT_SECRET).Rol).toBe(rol)
  })

  test('401 con contraseña incorrecta', async () => {
    mockUsuario(usuario('administrador', hash))
    const res = await request(app).post('/api/auth/login-admin')
      .send({ Correo: 'luis@test.com', Contrasena: 'mala' })
    expect(res.status).toBe(401)
  })

  test('401 si el correo no existe', async () => {
    mockUsuario(null)
    const res = await request(app).post('/api/auth/login-admin')
      .send({ Correo: 'nadie@test.com', Contrasena: 'x' })
    expect(res.status).toBe(401)
  })

  test('500 si falla la base de datos', async () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error('fallo de BD')))
    const res = await request(app).post('/api/auth/login-admin')
      .send({ Correo: 'luis@test.com', Contrasena: 'x' })
    expect(res.status).toBe(500)
  })
})