const jwt = require('jsonwebtoken')
const { verifyToken, verifyAdmin } = require('../../src/middlewares/auth')

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('verifyToken', () => {
  test('401 si no hay token', () => {
    const res = mockRes(), next = jest.fn()
    verifyToken({ headers: {} }, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
  test('403 si el token es inválido', () => {
    const res = mockRes(), next = jest.fn()
    verifyToken({ headers: { authorization: 'Bearer basura' } }, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
  })
  test('deja pasar con token válido y llena req.usuario', () => {
    const token = jwt.sign({ ID_usuario: 1, Rol: 'cliente' }, process.env.JWT_SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    const next = jest.fn()
    verifyToken(req, mockRes(), next)
    expect(next).toHaveBeenCalled()
    expect(req.usuario.ID_usuario).toBe(1)
  })
})

describe('verifyAdmin', () => {
  test('bloquea a un cliente', () => {
    const res = mockRes(), next = jest.fn()
    verifyAdmin({ usuario: { Rol: 'cliente' } }, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
  test('permite al administrador', () => {
    const next = jest.fn()
    verifyAdmin({ usuario: { Rol: 'administrador' } }, mockRes(), next)
    expect(next).toHaveBeenCalled()
  })
})