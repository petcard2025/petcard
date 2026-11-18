// ============================================================
// SINCRONIZADOR DE NOTIFICACIONES
// Cada cita / vacuna / plan de alimentación tiene UNA notificación enlazada
// (columnas origen_tipo + origen_id en la tabla notificacion). Así:
//   - al crear el registro  -> se crea su notificación
//   - al editarlo           -> se actualiza el mensaje de esa notificación
//   - al borrarlo           -> se borra su notificación
// Para agregar otro módulo: escribe un "sincronizarX(id)" igual a los de abajo
// y llámalo desde las rutas de crear/editar; y quitar('x', id) al borrar.
// ============================================================

module.exports = function crearSincronizador(db) {
  const q = (sql, params = []) =>
    new Promise((resolve, reject) => db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r))))

  const fecha = (v) => (v ? String(v).substring(0, 10) : '')
  const hora = (v) => (v ? String(v).substring(0, 5) : '')

  // Crea la notificación si no existe; si existe y el texto cambió, la actualiza
  // (y la vuelve a marcar como no leída para que el usuario note el cambio).
  async function upsert({ origen_tipo, origen_id, ID_usuario, mensaje, tipo, leida = 0 }) {
    if (!ID_usuario) return { omitida: true }
    const existentes = await q(
      'SELECT ID_notificacion, Mensaje, ID_usuario FROM notificacion WHERE origen_tipo=? AND origen_id=?',
      [origen_tipo, origen_id]
    )
    if (existentes.length > 0) {
      const n = existentes[0]
      if (n.Mensaje !== mensaje || n.ID_usuario !== ID_usuario) {
        await q(
          'UPDATE notificacion SET Mensaje=?, ID_usuario=?, Tipo=?, Leida=0, Fecha_lectura=NULL, Fecha_envio=NOW() WHERE ID_notificacion=?',
          [mensaje, ID_usuario, tipo, n.ID_notificacion]
        )
        return { actualizada: true }
      }
      return { sinCambios: true }
    }
    await q(
      `INSERT INTO notificacion (ID_usuario, ID_sistemaCorreo, Mensaje, Tipo, Canal, Fecha_envio, Leida, Fecha_lectura, origen_tipo, origen_id)
       VALUES (?,?,?,?,?,NOW(),?,?,?,?)`,
      [ID_usuario, 1, mensaje, tipo, 'Sistema', leida, leida ? new Date() : null, origen_tipo, origen_id]
    )
    return { creada: true }
  }

  // Borra la notificación enlazada a un registro
  async function quitar(origen_tipo, origen_id) {
    await q('DELETE FROM notificacion WHERE origen_tipo=? AND origen_id=?', [origen_tipo, origen_id])
  }

  // Borra las notificaciones de un usuario cuyo registro ya no existe
  // (por ejemplo, si se borró una mascota y con ella sus citas)
  async function limpiarHuerfanas(ID_usuario) {
    const filtro = ID_usuario ? ' AND ID_usuario = ?' : ''
    const params = ID_usuario ? [ID_usuario] : []
    await q(`DELETE FROM notificacion WHERE origen_tipo='cita' AND origen_id NOT IN (SELECT ID_cita FROM cita)${filtro}`, params)
    await q(`DELETE FROM notificacion WHERE origen_tipo='vacuna' AND origen_id NOT IN (SELECT ID_carnetVacunas FROM carnetvacunas)${filtro}`, params)
    await q(`DELETE FROM notificacion WHERE origen_tipo='alimentacion' AND origen_id NOT IN (SELECT ID_planAlimentacion FROM planalimentacion)${filtro}`, params)
  }

  // ---------------- CITAS ----------------
  async function sincronizarCita(ID_cita, opts = {}) {
    const rows = await q(
      `SELECT ci.Fecha, ci.Hora, ci.Estado, c.ID_usuario,
              m.Nombre AS Nombre_mascota, s.Nombre AS Nombre_servicio
       FROM cita ci
       JOIN cliente c  ON c.ID_cliente  = ci.ID_cliente
       JOIN mascota m  ON m.ID_mascota  = ci.ID_mascota
       JOIN servicio s ON s.ID_servicio = ci.ID_servicio
       WHERE ci.ID_cita = ?`,
      [ID_cita]
    )
    if (rows.length === 0) return { omitida: true }
    const r = rows[0]
    const estado = String(r.Estado || 'Pendiente').toLowerCase()
    const cuando = `${r.Nombre_mascota || 'tu mascota'} — ${r.Nombre_servicio || 'Consulta'} el ${fecha(r.Fecha)} a las ${hora(r.Hora)}.`
    let mensaje = `✅ Cita agendada para ${cuando}`
    if (estado === 'cancelada') mensaje = `❌ Cita cancelada para ${cuando}`
    else if (estado === 'completada' || estado === 'completa') mensaje = `☑️ Cita completada para ${cuando}`
    else if (estado === 'confirmada') mensaje = `✅ Cita confirmada para ${cuando}`
    return upsert({ origen_tipo: 'cita', origen_id: ID_cita, ID_usuario: r.ID_usuario, mensaje, tipo: 'cita', ...opts })
  }

  // ---------------- VACUNAS ----------------
  async function sincronizarVacuna(ID_carnetVacunas, opts = {}) {
    const rows = await q(
      `SELECT cv.Nombre_vacuna, cv.Fecha_aplicacion, cv.Proxima_dosis, c.ID_usuario, m.Nombre AS Nombre_mascota
       FROM carnetvacunas cv
       JOIN mascota m ON m.ID_mascota = cv.ID_mascota
       JOIN cliente c ON c.ID_cliente = m.ID_cliente
       WHERE cv.ID_carnetVacunas = ?`,
      [ID_carnetVacunas]
    )
    if (rows.length === 0) return { omitida: true }
    const r = rows[0]
    const aplicada = r.Fecha_aplicacion ? ` aplicada el ${fecha(r.Fecha_aplicacion)}` : ''
    const proxima = r.Proxima_dosis ? `. Próxima dosis: ${fecha(r.Proxima_dosis)}` : ''
    const mensaje = `💉 Vacuna "${r.Nombre_vacuna}" registrada para ${r.Nombre_mascota || 'tu mascota'}${aplicada}${proxima}.`
    return upsert({ origen_tipo: 'vacuna', origen_id: ID_carnetVacunas, ID_usuario: r.ID_usuario, mensaje, tipo: 'vacuna', ...opts })
  }

  // ---------------- ALIMENTACIÓN ----------------
  async function sincronizarPlan(ID_planAlimentacion, opts = {}) {
    const rows = await q(
      `SELECT pa.Tipo_dieta, pa.Fecha_inicio, pa.Fecha_fin, c.ID_usuario, m.Nombre AS Nombre_mascota
       FROM planalimentacion pa
       JOIN mascota m ON m.ID_mascota = pa.ID_mascota
       JOIN cliente c ON c.ID_cliente = m.ID_cliente
       WHERE pa.ID_planAlimentacion = ?`,
      [ID_planAlimentacion]
    )
    if (rows.length === 0) return { omitida: true }
    const r = rows[0]
    const desde = r.Fecha_inicio ? ` desde el ${fecha(r.Fecha_inicio)}` : ''
    const hasta = r.Fecha_fin ? ` hasta el ${fecha(r.Fecha_fin)}` : ''
    const dieta = r.Tipo_dieta ? ` (${r.Tipo_dieta})` : ''
    const mensaje = `🍖 Plan de alimentación${dieta} registrado para ${r.Nombre_mascota || 'tu mascota'}${desde}${hasta}.`
    return upsert({ origen_tipo: 'alimentacion', origen_id: ID_planAlimentacion, ID_usuario: r.ID_usuario, mensaje, tipo: 'alimentacion', ...opts })
  }

  return { upsert, quitar, limpiarHuerfanas, sincronizarCita, sincronizarVacuna, sincronizarPlan, q }
}