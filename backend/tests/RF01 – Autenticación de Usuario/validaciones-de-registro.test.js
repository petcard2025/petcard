// RF01 - Autenticación de usuario
// Reglas de los datos del registro (validators.js). Son pruebas unitarias: no usan servidor ni base de datos.
const {
  validarNombrePersona, validarCorreo, validarTelefono,
  validarContrasena, validarDireccion, validarRegistroCliente, normalizarTelefono
} = require('../../src/utils/validators')

const REGISTRO_OK = {
  Nombre: 'Ana', Apellido: 'Pérez', Correo: 'ana@gmail.com',
  Telefono: '3001234567', Contrasena: 'Clave123!', Direccion: 'Calle 10 # 5-20'
}

describe('RF01 · Validaciones del registro', () => {
  describe('nombre y apellido', () => {
    test.each(['Ana', 'María José', 'Ñandú', 'Óscar Iván'])('acepta "%s"', (v) => {
      expect(validarNombrePersona(v, 'nombre')).toBeNull()
    })

    test.each([
      ['', /obligatorio/],
      ['   ', /obligatorio/],
      ['A', /entre 2 y 50/],
      ['A'.repeat(51), /entre 2 y 50/],
      ['Ana123', /solo puede tener letras/],
      ['Ana@', /solo puede tener letras/],
      ['Ana  Pérez', /solo puede tener letras/]   // doble espacio
    ])('rechaza "%s"', (v, mensaje) => {
      expect(validarNombrePersona(v, 'nombre')).toMatch(mensaje)
    })

    test('el mensaje usa la etiqueta indicada (nombre / apellido)', () => {
      expect(validarNombrePersona('', 'apellido')).toBe('El apellido es obligatorio.')
    })
  })

  describe('correo', () => {
    test.each(['ana@gmail.com', 'a.b-c@dominio.co', 'ana+tag@mail.com.co'])('acepta "%s"', (v) => {
      expect(validarCorreo(v)).toBeNull()
    })

    test('exige el símbolo @', () => {
      expect(validarCorreo('anagmail.com')).toMatch(/símbolo @/)
    })

    test.each(['ana@', '@gmail.com', 'ana@gmail', 'ana@gmail.c', 'ana @gmail.com'])('rechaza "%s"', (v) => {
      expect(validarCorreo(v)).toMatch(/correo válido/)
    })
  })

  describe('teléfono', () => {
    test('acepta exactamente 10 números', () => {
      expect(validarTelefono('3001234567')).toBeNull()
    })

    test.each(['', '300123456', '30012345678', '300-123-4567', '30012345ab', '+573001234567'])('rechaza "%s"', (v) => {
      expect(validarTelefono(v)).toBe('El teléfono debe tener exactamente 10 números.')
    })
  })

  describe('contraseña', () => {
    test('acepta una contraseña que cumple todas las reglas', () => {
      expect(validarContrasena('Clave123!')).toBeNull()
    })

    test.each([
      ['Ab1!', /al menos 8/],
      ['12345678!', /incluir letras/],
      ['clave123!', /mayúscula/],
      ['ClaveClave!', /número/],
      ['Clave1234', /carácter especial/],
      ['', /al menos 8/]
    ])('rechaza "%s"', (v, mensaje) => {
      expect(validarContrasena(v)).toMatch(mensaje)
    })
  })

  describe('dirección', () => {
    test.each(['Calle 10 # 5-20', 'Cra. 7 No. 45, Soacha', 'Av. 1°/2'])('acepta "%s"', (v) => {
      expect(validarDireccion(v)).toBeNull()
    })

    test.each([
      ['', /obligatoria/],
      ['abc', /entre 5 y 255/],
      ['x'.repeat(256), /entre 5 y 255/],
      ['Calle <script>', /no permitidos/]
    ])('rechaza "%s"', (v, mensaje) => {
      expect(validarDireccion(v)).toMatch(mensaje)
    })
  })

  describe('registro completo', () => {
    test('un registro correcto no devuelve error', () => {
      expect(validarRegistroCliente(REGISTRO_OK)).toBeNull()
    })

    test('devuelve el PRIMER error en el orden: nombre, apellido, correo, teléfono, contraseña, dirección', () => {
      expect(validarRegistroCliente({ ...REGISTRO_OK, Nombre: '', Correo: 'mal' })).toMatch(/nombre/)
      expect(validarRegistroCliente({ ...REGISTRO_OK, Correo: 'mal', Telefono: '1' })).toMatch(/@/)
      expect(validarRegistroCliente({ ...REGISTRO_OK, Telefono: '1', Contrasena: 'x' })).toMatch(/teléfono/)
      expect(validarRegistroCliente({ ...REGISTRO_OK, Contrasena: 'x', Direccion: '' })).toMatch(/contraseña/)
      expect(validarRegistroCliente({ ...REGISTRO_OK, Direccion: '' })).toMatch(/dirección/)
    })
  })

  describe('normalizarTelefono (formato internacional para SMS)', () => {
    test.each([
      ['3001234567', '+573001234567'],
      ['300 123 4567', '+573001234567'],
      ['(300) 123-4567', '+573001234567'],
      ['573001234567', '+573001234567'],
      ['+573001234567', '+573001234567'],
      ['03001234567', '+573001234567']
    ])('%s → %s', (entrada, salida) => {
      expect(normalizarTelefono(entrada)).toBe(salida)
    })
  })
})