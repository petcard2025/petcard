jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../../src/config/database')
const app = require('../helpers/app')

const filaUsuario = (hash, Rol = 'cliente') => ({
  ID_usuario: 1, Nombre: 'Ana', Correo: 'ana@test.com',
  Telefono: '3001234567', Rol, Contrasena: hash
})

describe('POST /api/auth/login', () => {
  test('200 y token con credenciales correctas', async () => {
    const hash = await bcrypt.hash('Clave123', 4)
    db.query.mockImplementation((sql, params, cb) => cb(null, [filaUsuario(hash)]))

    const res = await request(app).post('/api/auth/login')
      .send({ Correo: 'ana@test.com', Contrasena: 'Clave123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.usuario).not.toHaveProperty('Contrasena')
  })

  test('401 con contraseña incorrecta', async () => {
    const hash = await bcrypt.hash('Clave123', 4)
    db.query.mockImplementation((sql, params, cb) => cb(null, [filaUsuario(hash)]))

    const res = await request(app).post('/api/auth/login')
      .send({ Correo: 'ana@test.com', Contrasena: 'incorrecta' })
    expect(res.status).toBe(401)
  })

  test('401 si el correo no existe', async () => {
    db.query.mockImplementation((sql, params, cb) => cb(null, []))
    const res = await request(app).post('/api/auth/login')
      .send({ Correo: 'nadie@test.com', Contrasena: 'x' })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/login-admin', () => {
  test('403 si la cuenta es de cliente', async () => {
    const hash = await bcrypt.hash('Clave123', 4)
    db.query.mockImplementation((sql, params, cb) => cb(null, [filaUsuario(hash, 'cliente')]))

    const res = await request(app).post('/api/auth/login-admin')
      .send({ Correo: 'ana@test.com', Contrasena: 'Clave123' })
    expect(res.status).toBe(403)
  })
})

describe('GET /api/mascotas (solo admin)', () => {
  const tokenDe = (Rol) => jwt.sign({ ID_usuario: 1, Rol }, process.env.JWT_SECRET)

  test('401 sin token', async () => {
    expect((await request(app).get('/api/mascotas')).status).toBe(401)
  })
  test('403 con rol cliente', async () => {
    const res = await request(app).get('/api/mascotas')
      .set('Authorization', `Bearer ${tokenDe('cliente')}`)
    expect(res.status).toBe(403)
  })
  test('200 con admin', async () => {
    db.query.mockImplementation((sql, cb) => cb(null, [{ ID_mascota: 1, Nombre: 'Rex' }]))
    const res = await request(app).get('/api/mascotas')
      .set('Authorization', `Bearer ${tokenDe('administrador')}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})