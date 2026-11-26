// RF01 - Autenticación de usuario
// Inicio de sesión del cliente: POST /api/auth/login
// (el limitador de intentos se desactiva aquí; tiene su propio archivo: limite-de-intentos.test.js)
jest.mock('express-rate-limit', () => () => (req, res, next) => next())
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../helpers/app')
const { mockDb, consultasQue, falla } = require('../helpers/pruebas')

const CLAVE = 'Clave123!'
let HASH
beforeAll(async () => { HASH = await bcrypt.hash(CLAVE, 4) })

const usuario = (cambios = {}) => ({
  ID_usuario: 1, Nombre: 'Ana Pérez', Correo: 'ana@gmail.com', Telefono: '3001234567',
  Rol: 'cliente', Contrasena: HASH, ...cambios
})
const BUSCAR_USUARIO = (filas) => [/FROM usuario WHERE Correo/, filas]
const iniciarSesion = (Correo = 'ana@gmail.com', Contrasena = CLAVE) =>
  request(app).post('/api/auth/login').send({ Correo, Contrasena })

describe('RF01 · Inicio de sesión (POST /api/auth/login)', () => {
  describe('credenciales correctas', () => {
    test('200 con mensaje, token y datos del usuario', async () => {
      mockDb([BUSCAR_USUARIO([usuario()])])
      const res = await iniciarSesion()
      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Login exitoso')
      expect(res.body.token).toEqual(expect.any(String))
      expect(res.body.usuario).toEqual({
        ID_usuario: 1, Nombre: 'Ana Pérez', Correo: 'ana@gmail.com', Telefono: '3001234567', Rol: 'cliente'
      })
    })

    test('la respuesta NUNCA incluye la contraseña ni el hash', async () => {
      mockDb([BUSCAR_USUARIO([usuario()])])
      const res = await iniciarSesion()
      expect(JSON.stringify(res.body)).not.toMatch(/Contrasena|\$2[aby]\$/)
    })

    test('el token contiene id, nombre, correo y rol, y NO la contraseña', async () => {
      mockDb([BUSCAR_USUARIO([usuario()])])
      const { body } = await iniciarSesion()
      const datos = jwt.verify(body.token, process.env.JWT_SECRET)
      expect(datos).toMatchObject({ ID_usuario: 1, Nombre: 'Ana Pérez', Correo: 'ana@gmail.com', Rol: 'cliente' })
      expect(datos).not.toHaveProperty('Contrasena')
    })

    test('el token dura 24 horas', async () => {
      mockDb([BUSCAR_USUARIO([usuario()])])
      const { body } = await iniciarSesion()
      const { iat, exp } = jwt.decode(body.token)
      expect(exp - iat).toBe(24 * 60 * 60)
    })

    test('el token sirve para entrar a una ruta protegida', async () => {
      mockDb([BUSCAR_USUARIO([usuario()]), [/FROM mascota WHERE ID_cliente/, []]])
      const { body } = await iniciarSesion()
      const res = await request(app).get('/api/mascotas/cliente/2').set('Authorization', `Bearer ${body.token}`)
      expect(res.status).toBe(200)
    })

    test('busca al usuario por el correo recibido', async () => {
      mockDb([BUSCAR_USUARIO([usuario()])])
      await iniciarSesion('ana@gmail.com')
      expect(consultasQue(/FROM usuario WHERE Correo/)[0][1]).toEqual(['ana@gmail.com'])
    })
  })

  describe('credenciales incorrectas', () => {
    test('401 si la contraseña no coincide', async () => {
      mockDb([BUSCAR_USUARIO([usuario()])])
      const res = await iniciarSesion('ana@gmail.com', 'OtraClave1!')
      expect(res.status).toBe(401)
      expect(res.body).not.toHaveProperty('token')
    })

    test('401 si el correo no está registrado', async () => {
      mockDb([BUSCAR_USUARIO([])])
      expect((await iniciarSesion('nadie@gmail.com')).status).toBe(401)
    })

    test('el mensaje es el mismo si falla el correo o la contraseña (no revela cuál)', async () => {
      mockDb([BUSCAR_USUARIO([usuario()])])
      const claveMala = await iniciarSesion('ana@gmail.com', 'xxxxxxxx')
      mockDb([BUSCAR_USUARIO([])])
      const correoMalo = await iniciarSesion('nadie@gmail.com')
      expect(claveMala.body.error).toBe('Correo o contrasena incorrectos')
      expect(correoMalo.body.error).toBe(claveMala.body.error)
    })

    test('distingue mayúsculas y minúsculas en la contraseña', async () => {
      mockDb([BUSCAR_USUARIO([usuario()])])
      expect((await iniciarSesion('ana@gmail.com', 'clave123!')).status).toBe(401)
    })
  })

  describe('cuentas antiguas con contraseña sin cifrar', () => {
    test('inicia sesión y migra la contraseña a bcrypt', async () => {
      mockDb([BUSCAR_USUARIO([usuario({ Contrasena: 'Clave123!' })]), [/UPDATE usuario SET Contrasena/, { affectedRows: 1 }]])
      const res = await iniciarSesion()
      expect(res.status).toBe(200)
      const [nuevoHash, id] = consultasQue(/UPDATE usuario SET Contrasena/)[0][1]
      expect(nuevoHash).toMatch(/^\$2[aby]\$/)
      expect(await bcrypt.compare(CLAVE, nuevoHash)).toBe(true)
      expect(id).toBe(1)
    })

    test('si la contraseña no coincide, 401 y NO se actualiza nada', async () => {
      mockDb([BUSCAR_USUARIO([usuario({ Contrasena: 'Clave123!' })]), [/UPDATE usuario/, {}]])
      const res = await iniciarSesion('ana@gmail.com', 'otra')
      expect(res.status).toBe(401)
      expect(consultasQue(/UPDATE usuario/)).toHaveLength(0)
    })

    test('con contraseña ya cifrada no se vuelve a actualizar', async () => {
      mockDb([BUSCAR_USUARIO([usuario()])])
      await iniciarSesion()
      expect(consultasQue(/UPDATE usuario/)).toHaveLength(0)
    })
  })

  describe('errores', () => {
    test('500 si la base de datos falla', async () => {
      mockDb([[/FROM usuario WHERE Correo/, falla('sin conexión')]])
      const res = await iniciarSesion()
      expect(res.status).toBe(500)
      expect(res.body).not.toHaveProperty('token')
    })
  })

  test.todo('si se envía un correo existente SIN contraseña debería responder 400 (hoy la petición nunca responde: bcrypt lanza un error dentro de un callback sin capturar)')
  test.todo('un cliente que inicia sesión en /login sigue recibiendo token aunque sea veterinario/administrador (decidir si /login debe limitarse a clientes)')
})