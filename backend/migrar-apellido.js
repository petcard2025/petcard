// Agrega la columna "apellido" a la tabla usuario (se ejecuta una sola vez).
// Uso (desde la carpeta backend):  node migrar-apellido.js
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

pool.query('ALTER TABLE usuario ADD COLUMN IF NOT EXISTS apellido varchar(100)')
  .then(() => console.log('✓ Columna "apellido" lista en la tabla usuario.'))
  .catch(e => { console.error('Error:', e.message); process.exitCode = 1 })
  .finally(() => pool.end())