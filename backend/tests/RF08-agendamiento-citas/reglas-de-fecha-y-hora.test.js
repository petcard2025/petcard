// RF08 - Agendamiento de citas
// Reglas puras (sin base de datos ni servidor): formato de hora, horarios de atención,
// rango de fechas permitido y hora de Colombia.
const {
  normalizarHora, validarHoraCita, validarFechaCita, citaYaPaso, validarFechaHoraCita,
  ahoraColombia, HORAS_CITA, FECHA_MAX_CITA
} = require('../../src/utils/validators')
const { congelarFecha } = require('../helpers/pruebas')

describe('RF08 · Reglas de fecha y hora', () => {
  describe('normalizarHora', () => {
    test.each([
      ['08:00 AM', '08:00'], ['9:00 AM', '09:00'], ['2:00 PM', '14:00'], ['04:00 PM', '16:00'],
      ['12:00 PM', '12:00'], ['12:00 AM', '00:00'], ['08:00:00', '08:00'], ['14:00', '14:00']
    ])('"%s" → "%s"', (entrada, esperado) => {
      expect(normalizarHora(entrada)).toBe(esperado)
    })

    test.each(['', 'nueve', '25:00', '10:75', '13:00 PM', null, undefined])('%p no es una hora válida', (entrada) => {
      expect(normalizarHora(entrada)).toBeNull()
    })
  })

  describe('horarios de atención', () => {
    test('la mañana va de 8:00 a 11:00 y la tarde de 2:00 a 4:00', () => {
      expect(HORAS_CITA).toEqual(['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'])
    })

    test.each(HORAS_CITA)('%s es un horario válido', (h) => {
      expect(validarHoraCita(h)).toBeNull()
    })

    test.each(['07:00', '12:00', '13:00', '17:00', '23:00'])('%s está fuera del horario de atención', (h) => {
      expect(validarHoraCita(h)).toMatch(/horario de atencion/)
    })

    test('una hora con formato inválido se rechaza', () => {
      expect(validarHoraCita('abc')).toMatch(/no es valida/)
    })
  })

  describe('validarFechaCita (con "hoy" = 25/11/2026)', () => {
    beforeAll(congelarFecha)
    afterAll(() => jest.useRealTimers())

    test('la fecha es obligatoria', () => {
      expect(validarFechaCita('')).toMatch(/obligatoria/)
    })

    test.each(['01/12/2026', '2026-13-45', 'mañana'])('"%s" no es una fecha válida', (f) => {
      expect(validarFechaCita(f)).toMatch(/no es valida/)
    })

    test('no se puede agendar en una fecha pasada', () => {
      expect(validarFechaCita('2026-11-24')).toMatch(/fecha pasada/)
    })

    test('hoy y los días futuros hasta el 31/12/2026 sí se pueden', () => {
      expect(validarFechaCita('2026-11-25')).toBeNull()
      expect(validarFechaCita('2026-12-15')).toBeNull()
      expect(validarFechaCita(FECHA_MAX_CITA)).toBeNull()
    })

    test('después del 31/12/2026 no se puede', () => {
      expect(validarFechaCita('2027-01-01')).toMatch(/31 de diciembre de 2026/)
    })

    test('al editar una cita vencida se tolera la fecha pasada (permitirPasado)', () => {
      expect(validarFechaCita('2026-11-01', { permitirPasado: true })).toBeNull()
    })
  })

  describe('citaYaPaso / validarFechaHoraCita', () => {
    const ahora10am = { fecha: '2026-11-25', minutos: 10 * 60 }

    test('un día anterior ya pasó; uno posterior no', () => {
      expect(citaYaPaso('2026-11-24', '09:00', ahora10am)).toBe(true)
      expect(citaYaPaso('2026-11-26', '08:00', ahora10am)).toBe(false)
    })

    test('hoy: una hora anterior o igual a la actual ya pasó; una posterior no', () => {
      expect(citaYaPaso('2026-11-25', '09:00', ahora10am)).toBe(true)
      expect(citaYaPaso('2026-11-25', '10:00', ahora10am)).toBe(true)   // ya empezó
      expect(citaYaPaso('2026-11-25', '11:00', ahora10am)).toBe(false)
    })

    test('validarFechaHoraCita rechaza hoy una hora que ya pasó', () => {
      expect(validarFechaHoraCita('2026-11-25', '09:00', ahora10am)).toMatch(/ya pasó/)
    })

    test('validarFechaHoraCita acepta hoy una hora posterior y cualquier hora de días futuros', () => {
      expect(validarFechaHoraCita('2026-11-25', '15:00', ahora10am)).toBeNull()
      expect(validarFechaHoraCita('2026-12-01', '08:00', ahora10am)).toBeNull()
    })

    test('a las 8:01 ya no se puede agendar la cita de las 8:00', () => {
      expect(citaYaPaso('2026-11-25', '08:00', { fecha: '2026-11-25', minutos: 8 * 60 + 1 })).toBe(true)
    })
  })

  describe('ahoraColombia (el servidor corre en UTC)', () => {
    test('a las 02:00 UTC del 26/11 todavía es el 25/11 en Colombia (21:00)', () => {
      expect(ahoraColombia(new Date('2026-11-26T02:00:00Z'))).toEqual({ fecha: '2026-11-25', minutos: 21 * 60 })
    })

    test('a las 15:30 UTC son las 10:30 a. m. en Colombia', () => {
      expect(ahoraColombia(new Date('2026-11-25T15:30:00Z'))).toEqual({ fecha: '2026-11-25', minutos: 10 * 60 + 30 })
    })
  })
})
