// ============================================================
// CONEXION A POSTGRESQL (SUPABASE)
// Con capa de compatibilidad para seguir usando db.query('... ?', [...])
// ============================================================
const { Pool, types } = require('pg')
require('dotenv').config()

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL no esta definida en .env')
  process.exit(1)
}

// Evita que pg convierta DATE/TIMESTAMP a objetos Date de JS
types.setTypeParser(1082, val => val) // DATE
types.setTypeParser(1114, val => val) // TIMESTAMP

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Mapa para restaurar mayúsculas (igual que en server.js)
const COLUMN_CASE_MAP = {
  id_usuario: 'ID_usuario',
  id_cliente: 'ID_cliente',
  id_veterinario: 'ID_veterinario',
  id_administrador: 'ID_administrador',
  id_servicio: 'ID_servicio',
  id_mascota: 'ID_mascota',
  id_cita: 'ID_cita',
  id_carnetvacunas: 'ID_carnetVacunas',
  id_planalimentacion: 'ID_planAlimentacion',
  id_sistemacorreo: 'ID_sistemaCorreo',
  id_notificacion: 'ID_notificacion',
  nombre: 'Nombre',
  correo: 'Correo',
  telefono: 'Telefono',
  contrasena: 'Contrasena',
  rol: 'Rol',
  firebase_uid: 'firebase_uid',
  direccion: 'Direccion',
  cargo: 'Cargo',
  especialidad: 'Especialidad',
  area: 'Area',
  permisos: 'Permisos',
  descripcion: 'Descripcion',
  categoria: 'Categoria',
  precio: 'Precio',
  fecha_nacimiento: 'Fecha_nacimiento',
  especie: 'Especie',
  sexo: 'Sexo',
  foto: 'Foto',
  raza: 'Raza',
  peso: 'Peso',
  estado: 'Estado',
  fecha: 'Fecha',
  hora: 'Hora',
  motivo: 'Motivo',
  observaciones: 'Observaciones',
  google_event_id: 'Google_Event_ID',
  nombre_vacuna: 'Nombre_vacuna',
  laboratorio: 'Laboratorio',
  lote: 'Lote',
  fecha_aplicacion: 'Fecha_aplicacion',
  proxima_dosis: 'Proxima_dosis',
  tipo_dieta: 'Tipo_dieta',
  frecuencia: 'Frecuencia',
  alergias: 'Alergias',
  horario: 'Horario',
  calorias: 'Calorias',
  suplementos: 'Suplementos',
  comidas: 'Comidas',
  fecha_inicio: 'Fecha_inicio',
  fecha_fin: 'Fecha_fin',
  diagnostico: 'Diagnostico',
  revision_nutricional: 'Revision_nutricional',
  protocolo: 'Protocolo',
  mensaje: 'Mensaje',
  tipo: 'Tipo',
  canal: 'Canal',
  fecha_envio: 'Fecha_envio',
  leida: 'Leida',
  fecha_lectura: 'Fecha_lectura',
  nombre_dueno: 'Nombre_dueno',
  nombre_mascota: 'Nombre_mascota',
  nombre_cliente: 'Nombre_cliente',
  nombre_servicio: 'Nombre_servicio',
  nombre_veterinario: 'Nombre_veterinario',
  nombre_usuario: 'Nombre_usuario'
}

function restaurarMayusculas(row) {
  const nuevo = {}
  for (const key of Object.keys(row)) {
    nuevo[COLUMN_CASE_MAP[key] || key] = row[key]
  }
  return nuevo
}

// Capa de compatibilidad estilo mysql2
const db = {
  query(sql, paramsOrCallback, maybeCallback) {
    let params = []
    let callback
    if (typeof paramsOrCallback === 'function') {
      callback = paramsOrCallback
    } else {
      params = paramsOrCallback || []
      callback = maybeCallback
    }

    let index = 0
    const pgSql = sql.replace(/\?/g, () => `$${++index}`)

    const esInsert = /^\s*INSERT\s+INTO/i.test(pgSql)
    const esUpdateODelete = /^\s*(UPDATE|DELETE)/i.test(pgSql)
    const sqlFinal = (esInsert && !/RETURNING/i.test(pgSql)) ? `${pgSql} RETURNING *` : pgSql

    const promesa = pool.query(sqlFinal, params)

    if (!callback) {
      promesa.catch(err => console.error('Error en query sin callback:', err.message))
      return
    }

    promesa
      .then((pgResult) => {
        const filas = (pgResult.rows || []).map(restaurarMayusculas)

        if (esInsert || esUpdateODelete) {
          const result = {
            affectedRows: pgResult.rowCount,
            insertId: esInsert && filas[0] ? Object.values(pgResult.rows[0])[0] : undefined
          }
          callback(null, result)
        } else {
          callback(null, filas)
        }
      })
      .catch((err) => callback(err))
  }
}

// Verificar conexión al iniciar
pool.query('SELECT 1')
  .then(() => console.log('✓ Conectado a Supabase (PostgreSQL) correctamente'))
  .catch(err => console.error('ERROR conectando a Supabase:', err.message))

module.exports = db