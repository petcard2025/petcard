const request = require('supertest');
const app = require('../server');

describe('RF02 - Registrar Usuarios', () => {
  
  it('Debería registrar un nuevo usuario correctamente', async () => {
    const correoUnico = `prueba_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        Nombre: 'Usuario Prueba Jest',
        Correo: correoUnico,
        Contrasena: 'Password123',
        Rol: 'cliente'
      });
    
    expect(res.statusCode).toEqual(200); 
    expect(res.body).toHaveProperty('ID_usuario'); 
    expect(res.body.Correo).toEqual(correoUnico);
  });

  it('Debería fallar (400) si faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({ Nombre: 'Sin Correo' }); // Faltan Contrasena y Correo
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Faltan campos obligatorios');
  });

  it('Debería rechazar el registro si el correo ya está en uso', async () => {
    const correoUnico = `duplicado_${Date.now()}@test.com`;
    
    await request(app).post('/api/usuarios').send({
      Nombre: 'Original', Correo: correoUnico, Contrasena: '123', Rol: 'cliente'
    });

    const res = await request(app).post('/api/usuarios').send({
      Nombre: 'Copia', Correo: correoUnico, Contrasena: '123', Rol: 'cliente'
    });
    
    expect(res.statusCode).not.toEqual(200); 
  });

  it('No debería exponer la contraseña en la respuesta', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        Nombre: 'Seguro', Correo: `seguro_${Date.now()}@test.com`, Contrasena: 'Password123', Rol: 'cliente'
      });
    
    expect(res.body).not.toHaveProperty('Contrasena');
  });

});