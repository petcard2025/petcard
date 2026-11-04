const request = require('supertest');
const app = require('../app');

describe('RF18 - Carnet de Vacunas', () => {
  let tokenVeterinario;

  it('Debería registrar una nueva vacuna para una mascota', async () => {
    const res = await request(app)
      .post('/api/vacunas')
      .set('Authorization', `Bearer ${tokenVeterinario}`)
      .send({
        ID_mascota: 1,
        Nombre_vacuna: 'Rabia',
        Lote: 'LOTE123',
        Fecha_aplicacion: '2026-10-25'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.Nombre_vacuna).toEqual('Rabia');
  });

  it('Debería traer el historial de vacunas de una mascota', async () => {
    const res = await request(app)
      .get('/api/vacunas/1') // ID de la mascota
      .set('Authorization', `Bearer ${tokenVeterinario}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});