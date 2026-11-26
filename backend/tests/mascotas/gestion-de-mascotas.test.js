// Pruebas de Gestión de Mascotas · CRUD y consultas
// Listar (admin, por cliente, catálogo), registrar, editar y desactivar (borrado lógico).
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const MASCOTA = { ID_cliente: 3, Fecha_nacimiento: '2022-05-10', Nombre: 'Firulais', Especie: 'Perro', Sexo: 'Macho', Foto: 'foto.png', Raza: 'Criollo', Peso: 12 }

describe('Gestión de Mascotas', () => {
  describe('protección con token', () => {
    test.each([
      ['get', '/api/mascotas'],
      ['get', '/api/mascotas/catalogo'],
      ['get', '/api/mascotas/cliente/3'],
      ['post', '/api/mascotas'],
      ['put', '/api/mascotas/8'],
      ['delete', '/api/mascotas/8']
    ])('401 sin token en %s %s', async (metodo, ruta) => {
      mockDb([[/mascota/, []]])
      const res = await request(app)[metodo](ruta).send(MASCOTA)
      expect(res.status).toBe(401)
      expect(consultasQue(/mascota/)).toHaveLength(0)
    })
  })

  describe('GET /api/mascotas (todas, solo administrador)', () => {
    test('403 para un cliente y para un veterinario', async () => {
      mockDb([[/FROM mascota/, []]])
      expect((await request(app).get('/api/mascotas').set(auth('cliente'))).status).toBe(403)
      expect((await request(app).get('/api/mascotas').set(auth('veterinario'))).status).toBe(403)
      expect(consultasQue(/FROM mascota/)).toHaveLength(0)
    })

    test('el administrador ve solo las activas, con el nombre del dueño', async () => {
      mockDb([[/FROM mascota m\s+JOIN cliente c/, [{ ID_mascota: 1, Nombre: 'Rex', Nombre_dueno: 'Ana' }]]])
      const res = await request(app).get('/api/mascotas').set(auth('administrador'))
      expect(res.status).toBe(200)
      expect(res.body).toEqual([{ ID_mascota: 1, Nombre: 'Rex', Nombre_dueno: 'Ana' }])
      expect(consultasQue(/m\.Estado = 'activo'/)).toHaveLength(1)
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM mascota/, falla('fallo')]])
      expect((await request(app).get('/api/mascotas').set(auth('administrador'))).status).toBe(500)
    })
  })

  describe('GET /api/mascotas/cliente/:id_cliente', () => {
    test('devuelve solo las mascotas activas de ese cliente', async () => {
      mockDb([[/FROM mascota WHERE ID_cliente=\?/, [{ ID_mascota: 1, ID_cliente: 3, Nombre: 'Rex' }]]])
      const res = await request(app).get('/api/mascotas/cliente/3').set(auth('cliente'))
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      const [sql, params] = consultasQue(/FROM mascota WHERE ID_cliente=\?/)[0]
      expect(params).toEqual(['3'])
      // comillas simples: en PostgreSQL las dobles ("activo") se leerían como una columna
      expect(sql).toContain("Estado='activo'")
      expect(sql).not.toContain('"')
    })

    test('dos clientes distintos generan consultas distintas (no se mezclan)', async () => {
      mockDb([[/FROM mascota WHERE ID_cliente=\?/, []]])
      await request(app).get('/api/mascotas/cliente/3').set(auth('cliente'))
      await request(app).get('/api/mascotas/cliente/4').set(auth('cliente'))
      expect(consultasQue(/FROM mascota WHERE ID_cliente=\?/).map(c => c[1])).toEqual([['3'], ['4']])
    })

    test('lista vacía si el cliente no tiene mascotas', async () => {
      mockDb([[/FROM mascota WHERE ID_cliente=\?/, []]])
      const res = await request(app).get('/api/mascotas/cliente/3').set(auth('cliente'))
      expect(res.body).toEqual([])
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM mascota/, falla('fallo')]])
      expect((await request(app).get('/api/mascotas/cliente/3').set(auth('cliente'))).status).toBe(500)
    })
  })

  describe('GET /api/mascotas/catalogo (veterinario o administrador)', () => {
    const FILAS = [
      { ID_mascota: 1, Nombre: 'Rex', Especie: 'perro' },
      { ID_mascota: 2, Nombre: 'Mimi', Especie: ' Felino ' },
      { ID_mascota: 3, Nombre: 'Nibbles', Especie: 'Hámster' },
      { ID_mascota: 4, Nombre: 'Cuy', Especie: 'Cuy' },
      { ID_mascota: 5, Nombre: 'Rio', Especie: 'Loro' },
      { ID_mascota: 6, Nombre: 'Drako', Especie: 'Iguana' },
      { ID_mascota: 7, Nombre: 'Sin', Especie: null }
    ]

    test('403 para un cliente, sin consultar la base de datos', async () => {
      mockDb([[/FROM mascota/, FILAS]])
      const res = await request(app).get('/api/mascotas/catalogo').set(auth('cliente'))
      expect(res.status).toBe(403)
      expect(consultasQue(/FROM mascota/)).toHaveLength(0)
    })

    test.each([['veterinario'], ['administrador']])('200 para %s', async (rol) => {
      mockDb([[/FROM mascota m\s+LEFT JOIN/, FILAS]])
      expect((await request(app).get('/api/mascotas/catalogo').set(auth(rol))).status).toBe(200)
    })

    test('unifica la especie (mayúsculas, tildes, sinónimos) y deja igual las desconocidas', async () => {
      mockDb([[/FROM mascota m\s+LEFT JOIN/, FILAS]])
      const res = await request(app).get('/api/mascotas/catalogo').set(auth('veterinario'))
      expect(res.body.map(m => m.Especie)).toEqual(['Perro', 'Gato', 'Hamster', 'Cobayo', 'Ave', 'Iguana', ''])
    })

    test('excluye las mascotas inactivas y no expone datos de contacto del dueño', async () => {
      mockDb([[/FROM mascota m\s+LEFT JOIN/, []]])
      await request(app).get('/api/mascotas/catalogo').set(auth('veterinario'))
      const [sql] = consultasQue(/FROM mascota m/)[0]
      expect(sql).toMatch(/<> 'inactivo'/)
      expect(sql).not.toMatch(/Telefono|Correo/)
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM mascota/, falla('fallo')]])
      expect((await request(app).get('/api/mascotas/catalogo').set(auth('veterinario'))).status).toBe(500)
    })
  })

  describe('POST /api/mascotas (registrar)', () => {
    test('registra la mascota con los campos en el orden correcto y responde con su id', async () => {
      mockDb([[/INSERT INTO mascota/, { insertId: 15 }]])
      const res = await request(app).post('/api/mascotas').set(auth('cliente')).send(MASCOTA)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ ID_mascota: 15, Nombre: 'Firulais', Especie: 'Perro' })
      expect(consultasQue(/INSERT INTO mascota/)[0][1])
        .toEqual([3, '2022-05-10', 'Firulais', 'Perro', 'Macho', 'foto.png', 'Criollo', 12])
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/INSERT INTO mascota/, falla('sin conexión')]])
      const res = await request(app).post('/api/mascotas').set(auth('cliente')).send(MASCOTA)
      expect(res.status).toBe(500)
      expect(res.body.error).toBe('sin conexión')
    })
  })

  describe('PUT /api/mascotas/:id (editar)', () => {
    test('actualiza los datos de la mascota indicada en la URL', async () => {
      mockDb([[/UPDATE mascota SET Fecha_nacimiento/, { affectedRows: 1 }]])
      const res = await request(app).put('/api/mascotas/8').set(auth('cliente')).send({ ...MASCOTA, Nombre: 'Rex', Peso: 14 })
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ message: 'Mascota actualizada' })
      expect(consultasQue(/UPDATE mascota SET Fecha_nacimiento/)[0][1])
        .toEqual(['2022-05-10', 'Rex', 'Perro', 'Macho', 'foto.png', 'Criollo', 14, '8'])
    })

    test('no permite cambiar el dueño: el UPDATE no incluye ID_cliente', async () => {
      mockDb([[/UPDATE mascota SET Fecha_nacimiento/, { affectedRows: 1 }]])
      await request(app).put('/api/mascotas/8').set(auth('cliente')).send({ ...MASCOTA, ID_cliente: 99 })
      expect(consultasQue(/UPDATE mascota/)[0][0]).not.toMatch(/ID_cliente/)
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/UPDATE mascota/, falla('fallo')]])
      expect((await request(app).put('/api/mascotas/8').set(auth('cliente')).send(MASCOTA)).status).toBe(500)
    })
  })

  describe('DELETE /api/mascotas/:id (desactivar)', () => {
    test('es un borrado lógico: pone Estado en inactivo y NO borra la fila', async () => {
      mockDb([[/UPDATE mascota SET Estado/, { affectedRows: 1 }]])
      const res = await request(app).delete('/api/mascotas/8').set(auth('cliente'))
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ message: 'Mascota desactivada' })
      const [sql, params] = consultasQue(/UPDATE mascota SET Estado/)[0]
      expect(sql).toContain("Estado='inactivo'")
      expect(sql).not.toContain('"')
      expect(params).toEqual(['8'])
      expect(consultasQue(/DELETE FROM mascota/)).toHaveLength(0)
    })

    test('500 si falla la base de datos', async () => {
      mockDb([[/UPDATE mascota/, falla('fallo')]])
      expect((await request(app).delete('/api/mascotas/8').set(auth('cliente'))).status).toBe(500)
    })
  })

  test.todo('un cliente solo debería poder ver, editar y desactivar SUS mascotas: hoy no se compara el dueño con el id del token, así que cualquiera con sesión puede tocar las de otro')
  test.todo('registrar una mascota debería exigir un ID_cliente válido: hoy sin ID_cliente el INSERT falla con 500 desde la base de datos')
  test.todo('editar o desactivar una mascota que no existe debería responder 404: hoy responde 200 igual')
})
