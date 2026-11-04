const request = require('supertest');
const app = require('../app');

describe('RF12 - Cerrar Sesión / Seguridad', () => {
  it('Debería rechazar el acceso a una ruta protegida si no hay token (simulando logout)', async () => {
    const res = await request(app)
      .get('/api/mascotas')
      .set('Authorization', '');

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toContain('Token'); 
  });

  it('Debería rechazar un token inválido o alterado', async () => {
    const res = await request(app)
      .get('/api/mascotas')
      .set('Authorization', 'Bearer token_falso_que_no_existe');

    expect(res.statusCode).toEqual(401);
  });
});