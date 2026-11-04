const request = require('supertest');
const app = require('../app');

describe('RF02 - Registrar Usuarios', () => {
  it('Debería registrar un nuevo usuario correctamente', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        Nombre: 'Usuario Prueba',
        Correo: 'prueba_jest@test.com',
        Contrasena: 'Password123',
        Rol: 'cliente'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('No debería registrar un usuario con un correo duplicado', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        Nombre: 'Usuario Prueba 2',
        Correo: 'prueba_jest@test.com',
        Contrasena: 'Password123'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBeDefined();
  });
});