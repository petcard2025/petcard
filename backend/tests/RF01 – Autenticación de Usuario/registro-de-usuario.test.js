// RF01 - Autenticación de usuario
// Registro de un cliente nuevo: POST /api/usuarios (público, no requiere token).
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../helpers/app')
const { mockDb, consultasQue, falla } = require('../helpers/pruebas')

const REGISTRO = {
  Nombre: 'Ana', Apellido: 'Pérez', Correo: 'ana@gmail.com', Telefono: '3001234567',
  Contrasena: 'Clave123!', Direccion: 'Calle 10 # 5-20', Rol: 'cliente'
}
const el = (cambios) => ({ ...REGISTRO, ...cambios })
const registrar = (cuerpo) => request(app).post('/api/usuarios').send(cuerpo)
const seInserto = () => consultasQue(/INSERT INTO usuario/).length > 0

const INSERTAR_OK = [/INSERT INTO usuario/, { insertId: 10 }]

describe('RF01 · Registro de usuario (POST /api/usuarios)', () => {
  describe('registro exitoso', () => {
    test('registra al cliente y responde con sus datos (sin contraseña)', async () => {
      mockDb([INSERTAR_OK])
      const res = await registrar(REGISTRO)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ ID_usuario: 10, Correo: 'ana@gmail.com', Telefono: '3001234567', Rol: 'cliente' })
      expect(res.body).not.toHaveProperty('Contrasena')
    })

    test('no necesita token (el registro es público)', async () => {
      mockDb([INSERTAR_OK])
      expect((await registrar(REGISTRO)).status).toBe(200)
    })

    test('el nombre guardado une nombre y apellido', async () => {
      mockDb([INSERTAR_OK])
      const res = await registrar(REGISTRO)
      expect(res.body.Nombre).toBe('Ana Pérez')
      expect(res.body.Apellido).toBe('Pérez')
      const params = consultasQue(/INSERT INTO usuario/)[0][1]
      expect(params.slice(0, 3)).toEqual(['Ana Pérez', 'Pérez', 'ana@gmail.com'])
    })

    test('la contraseña se guarda CIFRADA (bcrypt), nunca en texto plano', async () => {
      mockDb([INSERTAR_OK])
      await registrar(REGISTRO)
      const guardada = consultasQue(/INSERT INTO usuario/)[0][1][4]
      expect(guardada).not.toBe('Clave123!')
      expect(guardada).toMatch(/^\$2[aby]\$/)
      expect(await bcrypt.compare('Clave123!', guardada)).toBe(true)
    })

    test('dos usuarios con la misma contraseña obtienen hashes distintos', async () => {
      mockDb([INSERTAR_OK])
      await registrar(REGISTRO)
      await registrar(el({ Correo: 'otra@gmail.com' }))
      const [h1, h2] = consultasQue(/INSERT INTO usuario/).map(c => c[1][4])
      expect(h1).not.toBe(h2)
    })
  })

  describe('campos obligatorios', () => {
    test.each(['Nombre', 'Correo', 'Contrasena', 'Rol'])('400 si falta %s (y no inserta)', async (campo) => {
      mockDb([INSERTAR_OK])
      const res = await registrar(el({ [campo]: undefined }))
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Faltan campos obligatorios')
      expect(seInserto()).toBe(false)
    })
  })

  describe('validaciones de los datos del cliente', () => {
    test.each([
      ['nombre con números', { Nombre: 'Ana1' }, /nombre solo puede tener letras/],
      ['apellido vacío', { Apellido: '' }, /apellido es obligatorio/],
      ['correo sin @', { Correo: 'anagmail.com' }, /símbolo @/],
      ['correo mal formado', { Correo: 'ana@gmail' }, /correo válido/],
      ['teléfono de 9 dígitos', { Telefono: '300123456' }, /exactamente 10 números/],
      ['teléfono con letras', { Telefono: '30012345ab' }, /exactamente 10 números/],
      ['contraseña corta', { Contrasena: 'Ab1!' }, /al menos 8/],
      ['contraseña sin mayúscula', { Contrasena: 'clave123!' }, /mayúscula/],
      ['contraseña sin número', { Contrasena: 'ClaveClave!' }, /número/],
      ['contraseña sin carácter especial', { Contrasena: 'Clave1234' }, /carácter especial/],
      ['dirección vacía', { Direccion: '' }, /dirección es obligatoria/],
      ['dirección con caracteres raros', { Direccion: 'Calle <1>' }, /no permitidos/]
    ])('400 con %s (y no inserta)', async (_, cambios, mensaje) => {
      mockDb([INSERTAR_OK])
      const res = await registrar(el(cambios))
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(mensaje)
      expect(seInserto()).toBe(false)
    })
  })

  describe('errores', () => {
    test('500 si la base de datos falla (por ejemplo, correo ya registrado)', async () => {
      mockDb([[/INSERT INTO usuario/, falla('llave duplicada: Correo')]])
      const res = await registrar(REGISTRO)
      expect(res.status).toBe(500)
      expect(res.body.error).toMatch(/llave duplicada/)
    })
  })

  test.todo('un correo ya registrado debería responder 409 con un mensaje claro (hoy responde 500 con el texto del error de la base de datos)')
  test.todo('el registro debería crear también la fila en la tabla cliente con la dirección (hoy solo se crea el usuario y la dirección no se guarda aquí)')
})