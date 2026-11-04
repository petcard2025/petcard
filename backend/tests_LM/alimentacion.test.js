const request = require('supertest');
const app = require('../server');

describe('RF06 - Módulo de Alimentación', () => {
  
  it('Debería denegar la consulta de planes sin token (401)', async () => {
    const res = await request(app)
      .get('/api/alimentacion')
      .set('Authorization', '');

    expect(res.statusCode).toEqual(401); 
  });

  it('Debería denegar la creación de un plan con token inválido (403)', async () => {
    const res = await request(app)
      .post('/api/alimentacion')
      .set('Authorization', 'Bearer token_invalido')
      .send({
        ID_mascota: 1,
        Tipo_dieta: 'Balanceada',
        Frecuencia: '2 veces',
        Calorias: 100
      });

    expect(res.statusCode).toEqual(403); 
  });

  it('Debería denegar el borrado de planes de alimentación a un cliente (no admin)', async () => {
    const res = await request(app)
      .delete('/api/alimentacion/1')
      .set('Authorization', 'Bearer token_falso_cliente');

    expect(res.statusCode).toEqual(403); 
  });

  it('Debería denegar la actualización de un plan sin enviar datos', async () => {
    const res = await request(app)
      .put('/api/alimentacion/1')
      .set('Authorization', 'Bearer token_falso_vet')
      .send({});

    expect(res.statusCode).toEqual(403);
  });

});