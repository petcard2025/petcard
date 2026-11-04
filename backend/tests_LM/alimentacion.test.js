const request = require('supertest');
const app = require('../app');

describe('RF06 - Módulo de Alimentación', () => {
  let tokenVeterinario;

  it('Debería crear un plan de alimentación', async () => {
    const res = await request(app)
      .post('/api/alimentacion')
      .set('Authorization', `Bearer ${tokenVeterinario}`)
      .send({
        ID_mascota: 1,
        ID_servicio: 1,
        Tipo_dieta: 'Balanceada',
        Frecuencia: '2 veces al día',
        Calorias: 1200,
        Alergias: 'Ninguna'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.Tipo_dieta).toEqual('Balanceada');
  });

  it('Debería fallar si faltan campos obligatorios (dieta o calorías)', async () => {
    const res = await request(app)
      .post('/api/alimentacion')
      .set('Authorization', `Bearer ${tokenVeterinario}`)
      .send({
        ID_mascota: 1
      });

    expect(res.statusCode).toEqual(400);
  });
});