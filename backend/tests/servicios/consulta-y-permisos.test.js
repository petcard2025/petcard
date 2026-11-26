// Pruebas de Gestión de Servicios · Consulta pública y permisos
// El catálogo lo puede ver cualquiera; crear, editar y eliminar es solo del administrador.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const SERVICIO = { Nombre: 'Baño', Descripcion: 'Baño y secado', Categoria: 'Estética', Precio: 35000 }
const TODO_OK = [[/servicio/, { insertId: 1, affectedRows: 1 }]]

describe('Servicios · Consulta pública', () => {
  test('GET /api/servicios no pide token y devuelve todo el catálogo', async () => {
    mockDb([[/SELECT \* FROM servicio/, [
      { ID_servicio: 1, Nombre: 'Consulta General', Categoria: 'Consulta', Precio: '0.00' },
      { ID_servicio: 2, Nombre: 'Vacuna Antirrábica', Categoria: 'Vacuna', Precio: '50000.00' }
    ]]])
    const res = await request(app).get('/api/servicios')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[1]).toMatchObject({ Nombre: 'Vacuna Antirrábica', Precio: '50000.00' })
  })

  test('devuelve una lista vacía si no hay servicios', async () => {
    mockDb([[/SELECT \* FROM servicio/, []]])
    const res = await request(app).get('/api/servicios')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test('también funciona con sesión iniciada, sea cual sea el rol', async () => {
    mockDb([[/SELECT \* FROM servicio/, []]])
    for (const rol of ['cliente', 'veterinario', 'administrador']) {
      expect((await request(app).get('/api/servicios').set(auth(rol))).status).toBe(200)
    }
  })

  test('500 si falla la base de datos', async () => {
    mockDb([[/SELECT \* FROM servicio/, falla('sin conexión')]])
    const res = await request(app).get('/api/servicios')
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('sin conexión')
  })
})

describe('Servicios · Permisos de administración', () => {
  const acciones = [
    ['crear (POST /api/servicios)', (a) => a.post('/api/servicios').send(SERVICIO), /INSERT INTO servicio/],
    ['editar (PUT /api/servicios/1)', (a) => a.put('/api/servicios/1').send(SERVICIO), /UPDATE servicio/],
    ['eliminar (DELETE /api/servicios/1)', (a) => a.delete('/api/servicios/1'), /DELETE FROM servicio/]
  ]

  describe.each(acciones)('%s', (_nombre, enviar, patronSql) => {
    const intentar = (cabecera) => {
      const peticion = enviar(request(app))
      return cabecera ? peticion.set(cabecera) : peticion
    }

    test('401 sin token', async () => {
      mockDb(TODO_OK)
      expect((await intentar()).status).toBe(401)
      expect(consultasQue(patronSql)).toHaveLength(0)
    })

    test('403 con un token inválido', async () => {
      mockDb(TODO_OK)
      expect((await intentar({ Authorization: 'Bearer token-falso' })).status).toBe(403)
      expect(consultasQue(patronSql)).toHaveLength(0)
    })

    test.each([['cliente'], ['veterinario']])('403 para un %s, sin tocar la base de datos', async (rol) => {
      mockDb(TODO_OK)
      const res = await intentar(auth(rol))
      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/administrador/)
      expect(consultasQue(patronSql)).toHaveLength(0)
    })

    test('el administrador sí puede', async () => {
      mockDb(TODO_OK)
      expect((await intentar(auth('administrador'))).status).toBe(200)
      expect(consultasQue(patronSql)).toHaveLength(1)
    })
  })
})
