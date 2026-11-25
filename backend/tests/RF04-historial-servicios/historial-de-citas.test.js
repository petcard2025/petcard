// RF04 - Historial de servicios
// El historial de servicios de cada mascota se arma con sus citas (consulta, baño, desparasitación,
// tratamiento...): fecha, servicio, responsable (veterinario) y observaciones.
// Aquí se prueba GET /api/citas, que es la fuente de ese historial.
jest.mock('../../src/config/database', () => ({ query: jest.fn() }))
jest.mock('../../mailer', () => ({ enviarCorreoRecuperacion: jest.fn() }))

const request = require('supertest')
const app = require('../helpers/app')
const { auth, mockDb, consultasQue, falla } = require('../helpers/pruebas')

const PERFIL_VET = [/FROM veterinario WHERE ID_usuario/, [{ ID_veterinario: 5, Cargo: 'Veterinario', Especialidad: 'General' }]]

const HISTORIAL = [
  { ID_cita: 2, ID_mascota: 3, Nombre_mascota: 'Rex', Nombre_servicio: 'Desparasitación', Nombre_veterinario: 'Dra. Ruiz', Fecha: '2026-10-20', Hora: '10:00', Observaciones: 'Sin novedad', Estado: 'Completada' },
  { ID_cita: 1, ID_mascota: 3, Nombre_mascota: 'Rex', Nombre_servicio: 'Consulta General', Nombre_veterinario: 'Dr. Pérez', Fecha: '2026-09-01', Hora: '09:00', Observaciones: 'Control anual', Estado: 'Completada' }
]

describe('RF04 · Historial de servicios (GET /api/citas)', () => {
  describe('acceso', () => {
    test('401 sin token', async () => {
      expect((await request(app).get('/api/citas')).status).toBe(401)
    })

    test('403 con token inválido', async () => {
      const res = await request(app).get('/api/citas').set({ Authorization: 'Bearer token-falso' })
      expect(res.status).toBe(403)
    })
  })

  describe('contenido de cada registro del historial', () => {
    test('la consulta trae fecha, hora, servicio, responsable y observaciones', async () => {
      mockDb([[/FROM cita ci/, HISTORIAL]])
      await request(app).get('/api/citas').set(auth('cliente'))
      const sql = consultasQue(/FROM cita ci/)[0][0]
      expect(sql).toMatch(/ci\.Fecha/)
      expect(sql).toMatch(/ci\.Hora/)
      expect(sql).toMatch(/s\.Nombre AS Nombre_servicio/)      // servicio realizado
      expect(sql).toMatch(/uv\.Nombre AS Nombre_veterinario/)  // responsable
      expect(sql).toMatch(/ci\.Observaciones/)
      expect(sql).toMatch(/m\.Nombre AS Nombre_mascota/)
      expect(sql).toMatch(/ci\.ID_mascota/)                    // permite separar el historial por mascota
    })

    test('responde con los registros tal como salen de la base de datos', async () => {
      mockDb([[/FROM cita ci/, HISTORIAL]])
      const res = await request(app).get('/api/citas').set(auth('cliente'))
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body[0]).toMatchObject({
        Nombre_servicio: 'Desparasitación',
        Nombre_veterinario: 'Dra. Ruiz',
        Observaciones: 'Sin novedad',
        Fecha: '2026-10-20'
      })
    })

    test('devuelve lista vacía si la mascota aún no tiene servicios', async () => {
      mockDb([[/FROM cita ci/, []]])
      const res = await request(app).get('/api/citas').set(auth('cliente'))
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })
  })

  describe('orden del historial', () => {
    test('se pide ordenado del servicio más reciente al más antiguo', async () => {
      mockDb([[/FROM cita ci/, HISTORIAL]])
      await request(app).get('/api/citas').set(auth('cliente'))
      expect(consultasQue(/FROM cita ci/)[0][0]).toMatch(/ORDER BY ci\.Fecha DESC, ci\.Hora DESC/)
    })
  })

  describe('la información no se mezcla entre usuarios', () => {
    test('un cliente solo recibe las citas de SUS mascotas (filtra por su ID_usuario)', async () => {
      mockDb([[/FROM cita ci/, HISTORIAL]])
      await request(app).get('/api/citas').set(auth('cliente', 77))
      const [sql, params] = consultasQue(/FROM cita ci/)[0]
      expect(sql).toMatch(/WHERE c\.ID_usuario = \?/)
      expect(params).toEqual([77])
    })

    test('otro cliente consulta con SU propio id, no con el del anterior', async () => {
      mockDb([[/FROM cita ci/, []]])
      await request(app).get('/api/citas').set(auth('cliente', 88))
      expect(consultasQue(/FROM cita ci/)[0][1]).toEqual([88])
    })

    test('el veterinario solo ve las citas que tiene asignadas', async () => {
      mockDb([PERFIL_VET, [/FROM cita ci/, HISTORIAL]])
      await request(app).get('/api/citas').set(auth('veterinario'))
      const [sql, params] = consultasQue(/FROM cita ci/)[0]
      expect(sql).toMatch(/WHERE ci\.ID_veterinario = \?/)
      expect(params).toEqual([5])
    })

    test('el administrador ve el historial completo (sin filtro)', async () => {
      mockDb([[/FROM cita ci/, HISTORIAL]])
      await request(app).get('/api/citas').set(auth('administrador'))
      expect(consultasQue(/FROM cita ci/)[0][0]).not.toMatch(/WHERE/)
    })

    test('403 si el veterinario no tiene perfil asociado', async () => {
      mockDb([[/FROM veterinario WHERE ID_usuario/, []]])
      const res = await request(app).get('/api/citas').set(auth('veterinario'))
      expect(res.status).toBe(403)
    })
  })

  describe('errores', () => {
    test('500 si falla la base de datos', async () => {
      mockDb([[/FROM cita ci/, falla('fallo de BD')]])
      const res = await request(app).get('/api/citas').set(auth('cliente'))
      expect(res.status).toBe(500)
      expect(res.body.error).toBe('fallo de BD')
    })
  })

  test.todo('GET /api/citas debería poder filtrar por mascota en el servidor (hoy el filtro por mascota lo hace el frontend)')
})
