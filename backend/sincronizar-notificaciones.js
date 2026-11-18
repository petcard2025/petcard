// ============================================================
// SINCRONIZAR NOTIFICACIONES (reemplaza a sincronizar-notificaciones-citas.js)
//
// Deja las notificaciones EXACTAMENTE espejadas con lo que hay registrado:
//   1 notificación por cada cita, vacuna y plan de alimentación.
//
// Qué hace:
//   1. Agrega las columnas origen_tipo / origen_id a la tabla notificacion.
//   2. Borra las notificaciones automáticas viejas (tipo cita / vacuna /
//      alimentacion) que no estaban enlazadas a ningún registro
//      (aquí están las "sobrantes": de citas borradas o con fecha cambiada).
//   3. Borra las enlazadas cuyo registro ya no existe.
//   4. Crea la notificación de cada cita / vacuna / plan (quedan como leídas).
//
// Uso (desde la carpeta backend):
//   node sincronizar-notificaciones.js            -> solo muestra qué haría
//   node sincronizar-notificaciones.js --aplicar  -> lo hace
// ============================================================
const db = require('./src/config/database')
const crearSincronizador = require('./src/services/notification-sync')

const APLICAR = process.argv.includes('--aplicar')
const sync = crearSincronizador(db)
const q = sync.q

async function main() {
  const [citas, vacunas, planes] = await Promise.all([
    q('SELECT ID_cita FROM cita ORDER BY ID_cita'),
    q('SELECT ID_carnetVacunas FROM carnetvacunas ORDER BY ID_carnetVacunas'),
    q('SELECT ID_planAlimentacion FROM planalimentacion ORDER BY ID_planAlimentacion')
  ])

  // Columnas necesarias (si ya existen no pasa nada)
  const necesitaColumnas = (await q(
    `SELECT 1 FROM information_schema.columns WHERE table_name='notificacion' AND column_name='origen_tipo'`
  )).length === 0

  const viejas = necesitaColumnas
    ? await q(`SELECT ID_notificacion FROM notificacion WHERE Tipo IN ('cita','vacuna','alimentacion')`)
    : await q(`SELECT ID_notificacion FROM notificacion WHERE Tipo IN ('cita','vacuna','alimentacion') AND origen_tipo IS NULL`)

  console.log(`Registrados -> citas: ${citas.length}, vacunas: ${vacunas.length}, planes de alimentación: ${planes.length}`)
  console.log(`Notificaciones automáticas viejas sin enlazar que se van a reemplazar: ${viejas.length}`)
  console.log(`Notificaciones que quedarán: ${citas.length + vacunas.length + planes.length} (una por registro)`)

  if (!APLICAR) {
    console.log('\nModo prueba: no se cambió nada. Ejecuta con --aplicar para hacerlo.')
    return
  }

  await q('ALTER TABLE notificacion ADD COLUMN IF NOT EXISTS origen_tipo varchar(30)')
  await q('ALTER TABLE notificacion ADD COLUMN IF NOT EXISTS origen_id integer')
  await q(`CREATE UNIQUE INDEX IF NOT EXISTS notificacion_origen_uq
           ON notificacion (origen_tipo, origen_id) WHERE origen_tipo IS NOT NULL`)

  await q(`DELETE FROM notificacion WHERE Tipo IN ('cita','vacuna','alimentacion') AND origen_tipo IS NULL`)
  await sync.limpiarHuerfanas()

  for (const c of citas) await sync.sincronizarCita(c.ID_cita, { leida: 1 })
  for (const v of vacunas) await sync.sincronizarVacuna(v.ID_carnetVacunas, { leida: 1 })
  for (const p of planes) await sync.sincronizarPlan(p.ID_planAlimentacion, { leida: 1 })

  const total = await q(`SELECT origen_tipo, COUNT(*) AS total FROM notificacion WHERE origen_tipo IS NOT NULL GROUP BY origen_tipo`)
  console.log('\n✓ Listo. Notificaciones enlazadas por módulo:')
  total.forEach(t => console.log(`   ${t.origen_tipo}: ${t.total}`))
}

main()
  .catch(e => { console.error('Error:', e.message); process.exitCode = 1 })
  .finally(() => setTimeout(() => process.exit(), 300))