// RF01 - Autenticación de usuario
// Protección contra fuerza bruta: se usa el limitador REAL (sin simular).
//   - login / login-admin: máximo 10 intentos cada 15 minutos (comparten el mismo contador por IP)
//   - forgot-password: máximo 3 solicitudes por hora
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn().mockResolvedValue({ success: true }) }))

const request = require('supertest')
const app = require('../helpers/app')
const { mockDb } = require('../helpers/pruebas')

beforeEach(() => mockDb([[/FROM usuario WHERE Correo/, []]]))

const login = () => request(app).post('/api/auth/login').send({ Correo: 'x@x.com', Contrasena: 'x' })
const loginAdmin = () => request(app).post('/api/auth/login-admin').send({ Correo: 'x@x.com', Contrasena: 'x' })
const olvide = () => request(app).post('/api/auth/forgot-password').send({ Correo: 'x@x.com' })

describe('RF01 · Límite de intentos', () => {
  test('forgot-password: la 4.ª solicitud en una hora es bloqueada (429)', async () => {
    for (let i = 0; i < 3; i++) expect((await olvide()).status).toBe(200)
    const res = await olvide()
    expect(res.status).toBe(429)
    expect(res.body.error).toMatch(/Demasiadas solicitudes de recuperacion/)
  })

  test('login: tras 10 intentos fallidos, el 11.º es bloqueado (429)', async () => {
    for (let i = 0; i < 10; i++) expect((await login()).status).toBe(401)
    const res = await login()
    expect(res.status).toBe(429)
    expect(res.body.error).toMatch(/Demasiados intentos de login/)
  })

  test('login-admin comparte el contador con login (no se evade cambiando de ruta)', async () => {
    // el contador ya está en 11 por la prueba anterior: ambas rutas quedan bloqueadas
    expect((await loginAdmin()).status).toBe(429)
    expect((await login()).status).toBe(429)
  })

  test('el bloqueo no afecta a rutas que no tienen límite (p. ej. el catálogo de servicios)', async () => {
    mockDb([[/FROM servicio/, []]])
    expect((await request(app).get('/api/servicios')).status).toBe(200)
  })

  test('el bloqueo informa el límite y cuántos segundos esperar (cabeceras RateLimit / Retry-After)', async () => {
    const res = await login()
    expect(res.headers['ratelimit-limit']).toBe('10')
    expect(res.headers['ratelimit-remaining']).toBe('0')
    expect(res.headers['retry-after']).toBe('900')   // 15 minutos
  })
})