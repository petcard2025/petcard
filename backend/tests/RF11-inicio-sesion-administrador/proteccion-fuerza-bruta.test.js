// RF11 - Inicio de sesión de administrador
// Protección del login: tras varios intentos fallidos desde la misma IP se bloquea temporalmente (HTTP 429).
// Va en su propio archivo porque el contador de intentos se comparte entre las pruebas de un mismo archivo.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../helpers/app')
const { mockDb, consultasQue } = require('../helpers/pruebas')

const CLAVE = 'Admin1234'
const CORREO = 'admin@petcard.com'
const MENSAJE_BLOQUEO = 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'

describe('RF11 · Bloqueo por intentos fallidos', () => {
  test('después de varios intentos incorrectos el login responde 429, incluso con la contraseña correcta', async () => {
    const hash = await bcrypt.hash(CLAVE, 4)
    mockDb([[/FROM usuario WHERE Correo=\?/, [{ ID_usuario: 1, Nombre: 'Laura', Correo: CORREO, Telefono: '300', Rol: 'administrador', Contrasena: hash }]]])
    const intentar = (Contrasena) => request(app).post('/api/auth/login-admin').send({ Correo: CORREO, Contrasena })

    // Intentos incorrectos hasta que el sistema bloquea (el límite configurado es de 10 por 15 minutos)
    let bloqueadoEnElIntento = null
    let respuestaBloqueo = null
    for (let i = 1; i <= 15 && bloqueadoEnElIntento === null; i++) {
      const res = await intentar('incorrecta-' + i)
      if (res.status === 429) { bloqueadoEnElIntento = i; respuestaBloqueo = res }
      else expect(res.status).toBe(401)
    }
    expect(bloqueadoEnElIntento).not.toBeNull()
    expect(bloqueadoEnElIntento).toBeLessThanOrEqual(11)
    expect(respuestaBloqueo.body.error).toBe(MENSAJE_BLOQUEO)

    // Ya bloqueado: ni la contraseña correcta entra, y ni siquiera se consulta la BD
    const consultasAntes = consultasQue(/FROM usuario WHERE Correo=\?/).length
    const conClaveCorrecta = await intentar(CLAVE)
    expect(conClaveCorrecta.status).toBe(429)
    expect(conClaveCorrecta.body.token).toBeUndefined()
    expect(consultasQue(/FROM usuario WHERE Correo=\?/)).toHaveLength(consultasAntes)
  })
})