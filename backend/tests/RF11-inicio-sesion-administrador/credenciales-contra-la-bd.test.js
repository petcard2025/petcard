// RF11 - Inicio de sesión de administrador
// "Que las credenciales se validen contra la base de datos y que se rechacen las incorrectas."
// Ruta probada: POST /api/auth/login-admin
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../helpers/app')
const { mockDb, consultasQue, falla } = require('../helpers/pruebas')

const CLAVE = 'Admin1234'
const MENSAJE_RECHAZO = 'Correo o contrasena incorrectos'
const ADMIN = { ID_usuario: 7, Nombre: 'Laura Gómez', Correo: 'admin@petcard.com', Telefono: '3001234567', Rol: 'administrador' }

let hash
beforeAll(async () => { hash = await bcrypt.hash(CLAVE, 4) })

const fila = (cambios = {}) => ({ ...ADMIN, Contrasena: hash, ...cambios })
// La BD solo "encuentra" al usuario si el correo recibido como parámetro es el suyo
const BUSCAR_USUARIO = (f) => [/FROM usuario WHERE Correo=\?/, (params, cb) => cb(null, params[0] === f.Correo ? [f] : [])]
const ACTUALIZAR_HASH = [/UPDATE usuario SET Contrasena/, { affectedRows: 1 }]
const loginAdmin = (Correo, Contrasena) => request(app).post('/api/auth/login-admin').send({ Correo, Contrasena })

describe('RF11 · Credenciales válidas', () => {
  test('consulta la tabla usuario por correo (con parámetro) y entrega token y datos sin la contraseña', async () => {
    mockDb([BUSCAR_USUARIO(fila())])
    const res = await loginAdmin(ADMIN.Correo, CLAVE)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Login admin exitoso')
    expect(typeof res.body.token).toBe('string')
    expect(res.body.usuario).toEqual(ADMIN)
    expect(JSON.stringify(res.body)).not.toContain(hash)

    const [sql, params] = consultasQue(/FROM usuario WHERE Correo=\?/)[0]
    expect(params).toEqual([ADMIN.Correo])
    expect(sql).not.toContain(ADMIN.Correo)
  })

  test('una contraseña antigua guardada en texto plano también entra y se convierte a hash bcrypt', async () => {
    mockDb([BUSCAR_USUARIO(fila({ Contrasena: 'ClaveVieja1' })), ACTUALIZAR_HASH])
    const res = await loginAdmin(ADMIN.Correo, 'ClaveVieja1')

    expect(res.status).toBe(200)
    const [, params] = consultasQue(/UPDATE usuario SET Contrasena/)[0]
    expect(params[0]).toMatch(/^\$2/)
    expect(params[1]).toBe(ADMIN.ID_usuario)
    expect(await bcrypt.compare('ClaveVieja1', params[0])).toBe(true)
  })
})

describe('RF11 · Credenciales incorrectas', () => {
  test('401 con contraseña incorrecta y no se entrega token', async () => {
    mockDb([BUSCAR_USUARIO(fila())])
    const res = await loginAdmin(ADMIN.Correo, 'ClaveMala999')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe(MENSAJE_RECHAZO)
    expect(res.body.token).toBeUndefined()
  })

  test('401 si el correo no está registrado, con el MISMO mensaje (no revela si la cuenta existe)', async () => {
    mockDb([BUSCAR_USUARIO(fila())])
    const res = await loginAdmin('nadie@petcard.com', CLAVE)
    expect(res.status).toBe(401)
    expect(res.body.error).toBe(MENSAJE_RECHAZO)
    expect(res.body.token).toBeUndefined()
  })

  test('401 si la contraseña en texto plano guardada no coincide, y no se modifica la BD', async () => {
    mockDb([BUSCAR_USUARIO(fila({ Contrasena: 'ClaveVieja1' })), ACTUALIZAR_HASH])
    const res = await loginAdmin(ADMIN.Correo, 'otra-clave')
    expect(res.status).toBe(401)
    expect(consultasQue(/UPDATE usuario/)).toHaveLength(0)
  })

  test("un correo con intento de inyección SQL (' OR '1'='1) no entra", async () => {
    mockDb([BUSCAR_USUARIO(fila())])
    const intento = "' OR '1'='1' --"
    const res = await loginAdmin(intento, 'cualquiera')
    expect(res.status).toBe(401)
    expect(res.body.token).toBeUndefined()
    expect(consultasQue(/FROM usuario WHERE Correo=\?/)[0][1]).toEqual([intento])
  })

  test('no se puede entrar sin enviar credenciales', async () => {
    mockDb([BUSCAR_USUARIO(fila())])
    const res = await request(app).post('/api/auth/login-admin').send({})
    expect(res.status).toBe(401)
    expect(res.body.token).toBeUndefined()
  })
})

describe('RF11 · Fallas del servidor', () => {
  test('500 si falla la base de datos (y no se entrega token)', async () => {
    mockDb([[/FROM usuario WHERE Correo=\?/, falla('fallo de BD')]])
    const res = await loginAdmin(ADMIN.Correo, CLAVE)
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('fallo de BD')
    expect(res.body.token).toBeUndefined()
  })
})