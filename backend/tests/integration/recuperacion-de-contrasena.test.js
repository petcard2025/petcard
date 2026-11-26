// RF01 - Autenticación de usuario
// Recuperación de contraseña con código de 6 dígitos que llega al correo:
//   POST /api/auth/forgot-password  →  POST /api/auth/reset-password
jest.mock('express-rate-limit', () => () => (req, res, next) => next())
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../helpers/app')
const mailer = require('../../mailer')
const { mockDb, consultasQue, falla, congelarFecha } = require('../helpers/pruebas')

const CORREO = 'ana@gmail.com'
const USUARIO = [/SELECT ID_usuario, Nombre, Telefono FROM usuario WHERE Correo/, [{ ID_usuario: 1, Nombre: 'Ana', Telefono: '3001234567' }]]
const SIN_USUARIO = [/SELECT ID_usuario, Nombre, Telefono FROM usuario WHERE Correo/, []]
const CORREO_DE_USUARIO_1 = [/SELECT ID_usuario FROM usuario WHERE Correo/, [{ ID_usuario: 1 }]]
const CORREO_DE_USUARIO_2 = [/SELECT ID_usuario FROM usuario WHERE Correo/, [{ ID_usuario: 2 }]]
const ACTUALIZAR_OK = [/UPDATE usuario SET Contrasena/, { affectedRows: 1 }]

beforeEach(() => mailer.enviarCorreoRecuperacion.mockResolvedValue({ success: true }))

const pedirCodigo = async (correo = CORREO) => {
  await request(app).post('/api/auth/forgot-password').send({ Correo: correo })
  const llamadas = mailer.enviarCorreoRecuperacion.mock.calls
  return llamadas[llamadas.length - 1]?.[1]
}
const restablecer = (cuerpo) => request(app).post('/api/auth/reset-password').send(cuerpo)

describe('RF01 · Recuperación de contraseña', () => {
  describe('solicitar el código (forgot-password)', () => {
    test('400 si no se envía el correo', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({})
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Correo requerido')
    })

    test('envía por correo un código de 6 dígitos', async () => {
      mockDb([USUARIO])
      const codigo = await pedirCodigo()
      expect(codigo).toMatch(/^\d{6}$/)
      expect(mailer.enviarCorreoRecuperacion).toHaveBeenCalledWith(CORREO, codigo)
    })

    test('la respuesta no revela si el correo existe (mismo mensaje y 200)', async () => {
      mockDb([USUARIO])
      const existe = await request(app).post('/api/auth/forgot-password').send({ Correo: CORREO })
      mockDb([SIN_USUARIO])
      const noExiste = await request(app).post('/api/auth/forgot-password').send({ Correo: 'nadie@gmail.com' })
      expect(existe.status).toBe(200)
      expect(noExiste.status).toBe(200)
      expect(noExiste.body).toEqual(existe.body)
    })

    test('si el correo no existe, NO se envía ningún correo', async () => {
      mockDb([SIN_USUARIO])
      await pedirCodigo('nadie@gmail.com')
      expect(mailer.enviarCorreoRecuperacion).not.toHaveBeenCalled()
    })

    test('si falla el envío del correo, igual responde 200 (sin filtrar el error)', async () => {
      mockDb([USUARIO])
      mailer.enviarCorreoRecuperacion.mockRejectedValue(new Error('SMTP caído'))
      const res = await request(app).post('/api/auth/forgot-password').send({ Correo: CORREO })
      expect(res.status).toBe(200)
      expect(JSON.stringify(res.body)).not.toMatch(/SMTP/)
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM usuario WHERE Correo/, falla('sin conexión')]])
      expect((await request(app).post('/api/auth/forgot-password').send({ Correo: CORREO })).status).toBe(500)
    })
  })

  describe('restablecer la contraseña (reset-password)', () => {
    test('400 si faltan el código o la contraseña nueva', async () => {
      expect((await restablecer({ Correo: CORREO })).status).toBe(400)
      expect((await restablecer({ codigo: '123456' })).status).toBe(400)
    })

    test('400 si la contraseña nueva tiene menos de 6 caracteres', async () => {
      const res = await restablecer({ codigo: '123456', nuevaContrasena: '12345' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/al menos 6/)
    })

    test('400 si el código no existe', async () => {
      const res = await restablecer({ codigo: '000000', nuevaContrasena: 'NuevaClave1!' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/invalido o expirado/)
    })

    test('con el código correcto actualiza la contraseña, guardándola cifrada', async () => {
      mockDb([USUARIO, CORREO_DE_USUARIO_1, ACTUALIZAR_OK])
      const codigo = await pedirCodigo()
      const res = await restablecer({ Correo: CORREO, codigo, nuevaContrasena: 'NuevaClave1!' })
      expect(res.status).toBe(200)
      expect(res.body.message).toMatch(/actualizada exitosamente/)
      const [hash, idUsuario] = consultasQue(/UPDATE usuario SET Contrasena/)[0][1]
      expect(idUsuario).toBe(1)
      expect(hash).not.toBe('NuevaClave1!')
      expect(await bcrypt.compare('NuevaClave1!', hash)).toBe(true)
    })

    test('el código es de un solo uso: no se puede reutilizar', async () => {
      mockDb([USUARIO, CORREO_DE_USUARIO_1, ACTUALIZAR_OK])
      const codigo = await pedirCodigo()
      await restablecer({ Correo: CORREO, codigo, nuevaContrasena: 'NuevaClave1!' })
      const segundo = await restablecer({ Correo: CORREO, codigo, nuevaContrasena: 'OtraClave2!' })
      expect(segundo.status).toBe(400)
      expect(consultasQue(/UPDATE usuario SET Contrasena/)).toHaveLength(1)
    })

    test('400 si el código pertenece a OTRO correo (y no actualiza)', async () => {
      mockDb([USUARIO, CORREO_DE_USUARIO_2, ACTUALIZAR_OK])
      const codigo = await pedirCodigo()
      const res = await restablecer({ Correo: 'otro@gmail.com', codigo, nuevaContrasena: 'NuevaClave1!' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/no corresponde a este correo/)
      expect(consultasQue(/UPDATE usuario SET Contrasena/)).toHaveLength(0)
    })

    test('500 si falla la actualización en la base de datos', async () => {
      mockDb([USUARIO, CORREO_DE_USUARIO_1, [/UPDATE usuario SET Contrasena/, falla('fallo')]])
      const codigo = await pedirCodigo()
      expect((await restablecer({ Correo: CORREO, codigo, nuevaContrasena: 'NuevaClave1!' })).status).toBe(500)
    })
  })

  describe('vencimiento del código (5 minutos)', () => {
    beforeEach(congelarFecha)
    afterEach(() => jest.useRealTimers())

    test('a los 4 minutos el código todavía sirve', async () => {
      mockDb([USUARIO, CORREO_DE_USUARIO_1, ACTUALIZAR_OK])
      const codigo = await pedirCodigo()
      jest.setSystemTime(Date.now() + 4 * 60 * 1000)
      expect((await restablecer({ Correo: CORREO, codigo, nuevaContrasena: 'NuevaClave1!' })).status).toBe(200)
    })

    test('pasados 5 minutos el código expira (400) y no se actualiza nada', async () => {
      mockDb([USUARIO, CORREO_DE_USUARIO_1, ACTUALIZAR_OK])
      const codigo = await pedirCodigo()
      jest.setSystemTime(Date.now() + 5 * 60 * 1000 + 1)
      const res = await restablecer({ Correo: CORREO, codigo, nuevaContrasena: 'NuevaClave1!' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/ha expirado/)
      expect(consultasQue(/UPDATE usuario SET Contrasena/)).toHaveLength(0)
    })

    test('un código vencido se elimina: al reintentar dice "inválido o expirado"', async () => {
      mockDb([USUARIO, CORREO_DE_USUARIO_1, ACTUALIZAR_OK])
      const codigo = await pedirCodigo()
      jest.setSystemTime(Date.now() + 6 * 60 * 1000)
      await restablecer({ Correo: CORREO, codigo, nuevaContrasena: 'NuevaClave1!' })
      const segundo = await restablecer({ Correo: CORREO, codigo, nuevaContrasena: 'NuevaClave1!' })
      expect(segundo.body.error).toMatch(/invalido o expirado/)
    })
  })

  test.todo('la contraseña nueva debería cumplir las MISMAS reglas del registro (8+ caracteres, mayúscula, número y especial); hoy solo exige 6 caracteres')
  test.todo('si NO se envía el correo, el código por sí solo cambia la contraseña de cualquiera que lo adivine (6 dígitos); debería exigirse siempre el correo')
})