// Ayudas compartidas por las pruebas de los requerimientos (RF04, RF08...).
// OJO: cada archivo de prueba debe hacer su propio jest.mock(...) de la base de datos
// (jest solo permite hacerlo dentro del archivo de prueba).
const jwt = require('jsonwebtoken')
const db = require('../../src/config/database')

// Cabecera Authorization para un usuario con cierto rol
const auth = (Rol, ID_usuario = 1) => ({
  Authorization: `Bearer ${jwt.sign({ ID_usuario, Rol }, process.env.JWT_SECRET)}`
})

// Simula la BD: cada regla es [patrón del SQL, respuesta | función(params, cb)]
function mockDb(reglas) {
  db.query.mockImplementation((sql, params, cb) => {
    if (typeof params === 'function') { cb = params; params = [] }
    if (!cb) return
    const regla = reglas.find(([patron]) => patron.test(sql))
    if (!regla) return cb(new Error('Consulta no simulada: ' + sql.slice(0, 60)))
    const r = regla[1]
    typeof r === 'function' ? r(params, cb) : cb(null, r)
  })
}

// Consultas SQL que se enviaron a la BD y coinciden con el patrón: [[sql, params], ...]
const consultasQue = (patron) => db.query.mock.calls.filter(c => patron.test(c[0]))
const falla = (msg) => (p, cb) => cb(new Error(msg))

// Congela SOLO la fecha (no los timers), para que las pruebas no dependan del día en que se corran.
// 2026-11-25 15:00 UTC = 10:00 a. m. en Colombia.
const FECHA_PRUEBA = '2026-11-25T15:00:00Z'
const congelarFecha = () => jest.useFakeTimers({
  now: new Date(FECHA_PRUEBA),
  doNotFake: ['nextTick', 'setImmediate', 'clearImmediate', 'setInterval', 'clearInterval',
    'setTimeout', 'clearTimeout', 'queueMicrotask', 'performance', 'hrtime']
})

module.exports = { auth, mockDb, consultasQue, falla, congelarFecha }
