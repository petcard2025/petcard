// RF11 - Inicio de sesión de administrador
// "Que al ingresar se acceda al panel de administración correspondiente a su rol":
// el token que entrega el login abre las rutas de administración solo si es de un administrador.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue } = require('../helpers/pruebas')

const CLAVE = 'Clave1234'
const CORREO = 'luis@petcard.com'
let hash
beforeAll(async () => { hash = await bcrypt.hash(CLAVE, 4) })

const LISTA_ADMINS = [/FROM administrador a JOIN usuario u/, [
  { ID_administrador: 1, Cargo: 'Gerente', Area: 'General', Permisos: 'todos', Nombre: 'Laura Gómez', Correo: 'admin@petcard.com' }
]]
const LISTA_USUARIOS = [/FROM usuario$/, [
  { ID_usuario: 1, Nombre: 'Laura Gómez', Correo: 'admin@petcard.com', Telefono: '3001234567', Rol: 'administrador' }
]]
const sesionComo = (Rol) => mockDb([
  [/FROM usuario WHERE Correo=\?/, [{ ID_usuario: 7, Nombre: 'Luis Pérez', Correo: CORREO, Telefono: '3001234567', Rol, Contrasena: hash }]],
  LISTA_ADMINS,
  LISTA_USUARIOS
])
const iniciarSesion = async () => {
  const res = await request(app).post('/api/auth/login-admin').send({ Correo: CORREO, Contrasena: CLAVE })
  return { res, cabecera: { Authorization: `Bearer ${res.body.token}` } }
}

describe('RF11 · Después de iniciar sesión como administrador', () => {
  test('el token entregado abre el panel: GET /api/administradores responde 200', async () => {
    sesionComo('administrador')
    const { res, cabecera } = await iniciarSesion()
    expect(res.status).toBe(200)

    const panel = await request(app).get('/api/administradores').set(cabecera)
    expect(panel.status).toBe(200)
    expect(panel.body[0].Cargo).toBe('Gerente')
  })

  test('el mismo token permite gestionar usuarios: GET /api/usuarios responde 200', async () => {
    sesionComo('administrador')
    const { cabecera } = await iniciarSesion()
    const res = await request(app).get('/api/usuarios').set(cabecera)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('RF11 · Cada rol llega solo a su panel', () => {
  test('un veterinario inicia sesión, pero su token NO abre el panel de administración (403)', async () => {
    sesionComo('veterinario')
    const { res, cabecera } = await iniciarSesion()
    expect(res.status).toBe(200)

    const panel = await request(app).get('/api/administradores').set(cabecera)
    expect(panel.status).toBe(403)
    expect(consultasQue(/FROM administrador/)).toHaveLength(0)
  })

  test.each(['/api/administradores', '/api/usuarios'])('un cliente no puede entrar a %s (403)', async (ruta) => {
    mockDb([LISTA_ADMINS, LISTA_USUARIOS])
    const res = await request(app).get(ruta).set(auth('cliente'))
    expect(res.status).toBe(403)
  })
})

describe('RF11 · Sesiones no válidas', () => {
  const RUTA = '/api/administradores'
  beforeEach(() => mockDb([LISTA_ADMINS]))

  test('401 sin token', async () => {
    const res = await request(app).get(RUTA)
    expect(res.status).toBe(401)
    expect(consultasQue(/FROM administrador/)).toHaveLength(0)
  })

  test('403 con un token que no es un JWT', async () => {
    expect((await request(app).get(RUTA).set('Authorization', 'Bearer cualquier-cosa')).status).toBe(403)
  })

  test('403 con un token vencido', async () => {
    const vencido = jwt.sign({ ID_usuario: 1, Rol: 'administrador' }, process.env.JWT_SECRET, { expiresIn: -60 })
    expect((await request(app).get(RUTA).set('Authorization', `Bearer ${vencido}`)).status).toBe(403)
  })

  test('403 con un token firmado con otra clave', async () => {
    const ajeno = jwt.sign({ ID_usuario: 1, Rol: 'administrador' }, 'otra-clave-secreta')
    expect((await request(app).get(RUTA).set('Authorization', `Bearer ${ajeno}`)).status).toBe(403)
  })

  test('403 si un cliente edita su token para ponerse rol administrador (la firma ya no coincide)', async () => {
    const [cabecera, , firma] = auth('cliente', 5).Authorization.replace('Bearer ', '').split('.')
    const cuerpoFalso = Buffer.from(JSON.stringify({ ID_usuario: 5, Rol: 'administrador' })).toString('base64url')
    const falso = [cabecera, cuerpoFalso, firma].join('.')
    const res = await request(app).get(RUTA).set('Authorization', `Bearer ${falso}`)
    expect(res.status).toBe(403)
    expect(consultasQue(/FROM administrador/)).toHaveLength(0)
  })
})