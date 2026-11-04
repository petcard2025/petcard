const request = require('supertest');
const app = require('../server');

describe('RF12 - Cerrar Sesión / Seguridad (Auth)', () => {
  
  it('Debería rechazar el acceso a una ruta protegida si no hay token (401)', async () => {
    const res = await request(app)
      .get('/api/mascotas')
      .set('Authorization', ''); 

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toContain('Token no proporcionado');
  });

  it('Debería rechazar un token inválido o alterado (403)', async () => {
    const res = await request(app)
      .get('/api/mascotas')
      .set('Authorization', 'Bearer token_falso_que_no_existe');

    expect(res.statusCode).toEqual(403);
    expect(res.body.error).toContain('Token invalido o expirado');
  });

  it('Debería rechazar el login si la contraseña está vacía', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ Correo: 'admin@gmail.com', Contrasena: '' });

    expect(res.statusCode).toEqual(401);
  });

  it('Debería rechazar un login con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ Correo: 'correo_que_no_existe@gmail.com', Contrasena: 'PasswordIncorrecto' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toContain('Correo o contrasena incorrectos');
  });

});