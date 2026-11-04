const request = require('supertest');
const app = require('../server');

describe('RF18 - Gestión del Carnet de Vacunas', () => {
  
  it('Debería denegar la creación de vacuna sin token (401)', async () => {
    const res = await request(app)
      .post('/api/vacunas')
      .set('Authorization', '')
      .send({
        ID_mascota: 1,
        Nombre_vacuna: 'Rabia'
      });

    expect(res.statusCode).toEqual(401); 
  });

  it('Debería denegar la consulta de vacunas con token inválido (403)', async () => {
    const res = await request(app)
      .get('/api/vacunas/mascota/1') 
      .set('Authorization', 'Bearer token_falso');
      
    expect(res.statusCode).toEqual(403); 
  });

  it('Debería denegar la actualización de una vacuna sin token (401)', async () => {
    const res = await request(app)
      .put('/api/vacunas/1')
      .set('Authorization', '')
      .send({ Nombre_vacuna: 'Rabia Modificada' });

    expect(res.statusCode).toEqual(401);
  });

  it('Debería denegar la eliminación de una vacuna sin token (401)', async () => {
    const res = await request(app)
      .delete('/api/vacunas/1')
      .set('Authorization', '');

    expect(res.statusCode).toEqual(401);
  });

});