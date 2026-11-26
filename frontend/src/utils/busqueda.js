// =============================================================
// UTILIDADES DE BÚSQUEDA (buscador con lupa)
// =============================================================

// "Pérez" y "perez" se consideran iguales
export const normalizar = (s) =>
  String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// ¿La consulta aparece en alguno de los campos? (varias palabras: todas deben aparecer)
export function coincideBusqueda(consulta, ...campos) {
  const q = normalizar(consulta)
  if (!q) return true
  const pajar = normalizar(campos.join(' '))
  return q.split(/\s+/).every(palabra => pajar.includes(palabra))
}

// Sugerencias de mascota. Con `getCliente` muestra "Mascota · Cliente: Nombre"
// (vistas con cliente: citas, mascotas); sin él muestra solo la mascota (alimentación, carnet).
export function sugerenciasMascota(filas, getMascota, getCliente = null) {
  const mapa = new Map()
  for (const f of filas || []) {
    const mascota = String(getMascota(f) ?? '').trim()
    if (!mascota) continue
    const cliente = getCliente ? String(getCliente(f) ?? '').trim() : ''
    const clave = `${normalizar(mascota)}|${normalizar(cliente)}`
    if (!mapa.has(clave)) {
      mapa.set(clave, {
        valor: cliente ? `${mascota} ${cliente}` : mascota,
        titulo: mascota,
        detalle: cliente ? `Cliente: ${cliente}` : '',
        icono: '🐾'
      })
    }
  }
  return [...mapa.values()].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
}

// Sugerencias genéricas (usuarios, servicios, notificaciones...)
export function sugerenciasGenericas(filas, getTitulo, getDetalle = null, icono = '') {
  const mapa = new Map()
  for (const f of filas || []) {
    const titulo = String(getTitulo(f) ?? '').trim()
    if (!titulo) continue
    const detalle = getDetalle ? String(getDetalle(f) ?? '').trim() : ''
    const clave = `${normalizar(titulo)}|${normalizar(detalle)}`
    if (!mapa.has(clave)) mapa.set(clave, { valor: titulo, titulo, detalle, icono })
  }
  return [...mapa.values()].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
}
