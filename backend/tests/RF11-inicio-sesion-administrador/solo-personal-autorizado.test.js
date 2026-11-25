// RF11 - Inicio de sesión de administrador
// "Que solo el personal autorizado ingrese": el login del panel acepta administradores y veterinarios;
// una cuenta de cliente (o de cualquier otro rol) con credenciales válidas es rechazada.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../helpers/app')
const { mockDb } = require('../helpers/pruebas')

const CLAVE = 'Clave1234'
const CORREO = 'luis@petcard.com'

let hash
const expiracionOriginal = process.env.JWT_EXPIRES_IN
beforeAll(async () => {
  delete process.env.JWT_EXPIRES_IN          // así se prueba el valor por defecto del sistema (8 h)
  hash = await bcrypt.hash(CLAVE, 4)
})
afterAll(() => { if (expiracionOriginal !== undefined) process.env.JWT_EXPIRES_IN = expiracionOriginal })

const cuenta = (Rol) => ({ ID_usuario: 7, Nombre: 'Luis Pérez', Correo: CORREO, Telefono: '3001234567', Rol, Contrasena: hash })
const conRol = (Rol) => mockDb([[/FROM usuario WHERE Correo=\?/, [cuenta(Rol)]]])
const loginAdmin = (Contrasena = CLAVE) => request(app).post('/api/auth/login-admin').send({ Correo: CORREO, Contrasena })

describe('RF11 · Administrador', () => {
  test('entra con credenciales válidas y recibe un token firmado con su rol y 8 h de vigencia', async () => {
    conRol('administrador')
    const res = await loginAdmin()

    expect(res.status).toBe(200)
    const token = jwt.verify(res.body.token, process.env.JWT_SECRET)
    expect(token).toMatchObject({ ID_usuario: 7, Correo: CORREO, Rol: 'administrador' })
    expect(token.Contrasena).toBeUndefined()
    expect(token.exp - token.iat).toBe(8 * 60 * 60)
  })
})

describe('RF11 · Veterinario', () => {
  test('también entra por este login (su panel es el de veterinario)', async () => {
    conRol('veterinario')
    const res = await loginAdmin()
    expect(res.status).toBe(200)
    expect(jwt.verify(res.body.token, process.env.JWT_SECRET).Rol).toBe('veterinario')
  })
})

describe('RF11 · Cuentas sin permiso de acceso al panel', () => {
  test.each(['cliente', 'invitado'])('403 con credenciales válidas pero rol "%s", sin token', async (rol) => {
    conRol(rol)
    const res = await loginAdmin()
    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Esta cuenta no tiene permisos de acceso al panel.')
    expect(res.body.token).toBeUndefined()
  })

  test('un cliente con contraseña incorrecta recibe 401 (no se revela qué rol tiene la cuenta)', async () => {
    conRol('cliente')
    const res = await loginAdmin('ClaveMala999')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Correo o contrasena incorrectos')
  })
})

describe('RF11 · Rol que usa el frontend para abrir el panel correspondiente', () => {
  // login-admin.vue lee usuario.Rol: "veterinario" -> /veterinario-inicio, "administrador" -> /admin-inicio
  test.each(['administrador', 'veterinario'])('la respuesta incluye usuario.Rol = "%s"', async (rol) => {
    conRol(rol)
    const res = await loginAdmin()
    expect(res.status).toBe(200)
    expect(res.body.usuario.Rol).toBe(rol)
    expect(res.body.usuario.Contrasena).toBeUndefined()
  })
})