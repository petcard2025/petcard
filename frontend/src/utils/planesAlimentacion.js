// =============================================================
// PLANES DE ALIMENTACIÓN SEGÚN ESPECIE, EDAD Y PESO
// =============================================================
// Los planes son una REFERENCIA de partida (no reemplazan el criterio del
// veterinario). Se basan en guías públicas de veterinarias y asociaciones:
//   · Perros y gatos: AAHA/WSAVA (energía en reposo RER = 70 × kg^0.75 y factores
//     por etapa de vida), OSU Veterinary Medical Center.
//   · Conejos: House Rabbit Society, NCSU Veterinary Hospital, VCA Hospitals, RSPCA.
//   · Cobayos: MSD/Merck Veterinary Manual, VCA Hospitals, PDSA.
//   · Hámsters: Wood Green, PetMD, Pets Radar (guía veterinaria).
//   · Aves: MSD/Merck Veterinary Manual y VCA Hospitals.
// Las calorías de conejo, cobayo, hámster y ave son una ESTIMACIÓN
// (RER × factor); en esas especies lo importante son los gramos/tazas.

// Especies que manejan planes (se quitaron Pez y Reptil)
export const ESPECIES_PLAN = ['Perro', 'Gato', 'Conejo', 'Ave', 'Hamster', 'Cobayo']

export const ICONO_ESPECIE = {
  Perro: '🐶', Gato: '🐱', Conejo: '🐰', Ave: '🐦', Hamster: '🐹', Cobayo: '🐹'
}

// ── Utilidades ────────────────────────────────────────────────

// Edad en meses a partir de la fecha de nacimiento (null si no hay fecha válida)
export function edadEnMeses(fechaNacimiento, hoy = new Date()) {
  if (!fechaNacimiento) return null
  const f = new Date(fechaNacimiento)
  if (Number.isNaN(f.getTime())) return null
  // Fechas imposibles (ej. 1899-11-30 por un dato vacío) o futuras se tratan como "sin fecha"
  if (f.getFullYear() < 1990 || f > hoy) return null
  let meses = (hoy.getFullYear() - f.getFullYear()) * 12 + (hoy.getMonth() - f.getMonth())
  if (hoy.getDate() < f.getDate()) meses -= 1
  return Math.max(0, meses)
}

// "8 meses", "1 año y 3 meses", "5 años"
export function textoEdad(meses) {
  if (meses === null || meses === undefined) return '—'
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  const a = Math.floor(meses / 12)
  const m = meses % 12
  const años = `${a} ${a === 1 ? 'año' : 'años'}`
  return m ? `${años} y ${m} ${m === 1 ? 'mes' : 'meses'}` : años
}

const aNumero = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

// Energía en reposo (kcal/día): 70 × kg^0.75
const rer = (kg) => 70 * Math.pow(kg, 0.75)
const redondear5 = (n) => Math.max(5, Math.round(n / 5) * 5)

// Tazas redondeadas a 1/4 ("1.5 tazas")
function tazas(valor) {
  const v = Math.max(0.25, Math.round(valor * 4) / 4)
  return `${String(v).replace(/\.0+$/, '')} ${v === 1 ? 'taza' : 'tazas'}`
}

// Gramos de pellets de conejo por kg de peso (rango de las guías)
const gPellets = (kg, minPorKg, maxPorKg) => {
  const a = Math.max(5, Math.round(kg * minPorKg / 5) * 5)
  const b = Math.max(a, Math.round(kg * maxPorKg / 5) * 5)
  return a === b ? `${a} g` : `${a}–${b} g`
}

// Horarios típicos según número de comidas al día
const HORARIOS = {
  1: '7:00 PM',
  2: '7:00 AM · 6:00 PM',
  3: '7:00 AM · 1:00 PM · 7:00 PM',
  4: '7:00 AM · 12:00 PM · 5:00 PM · 9:00 PM'
}

const hoyISO = () => new Date().toISOString().slice(0, 10)
const enMeses = (n) => {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

// Construye un plan con el formato que usan las tarjetas y la base de datos
function plan(base) {
  return {
    color: '#2ecc71',
    badge: 'Recomendado',
    alergias: 'Ninguna conocida',
    suplementos: 'Ninguno',
    revisionMeses: 3,
    ...base
  }
}

// Convierte un plan sugerido en el cuerpo que espera POST /api/alimentacion
export function planAPayload(p, idMascota, idServicio) {
  return {
    ID_mascota: idMascota,
    ID_servicio: idServicio || '',
    Tipo_dieta: p.tipoDieta,
    Frecuencia: p.frecuencia,
    Horario: p.horario,
    Calorias: p.calorias,
    Alergias: p.alergias,
    Suplementos: p.suplementos,
    Comidas: p.comidas.join(' | '),
    Fecha_inicio: hoyISO(),
    Fecha_fin: enMeses(p.revisionMeses),
    Diagnostico: p.diagnostico,
    Observaciones: `${p.observaciones} (Plan sugerido: ${p.titulo}).`,
    Revision_nutricional: 'Activo'
  }
}

// ── PERRO ─────────────────────────────────────────────────────
function planesPerro({ kg, meses, nombre }) {
  const grande = kg >= 25
  const edadSenior = grande ? 6 * 12 : 7 * 12
  const cachorro = meses !== null && meses < 12
  const senior = meses !== null && meses >= edadSenior
  const gCroq = (kcal) => Math.round(kcal / 3.7 / 5) * 5 // croqueta seca ≈ 3.7 kcal/g
  const R = rer(kg)

  let etapa, factor, comidasN, extra
  if (cachorro) {
    etapa = 'Cachorro'
    factor = meses < 4 ? 3.0 : 2.0
    comidasN = meses < 4 ? 4 : meses < 6 ? 3 : 3
    extra = grande
      ? 'Raza grande: usar alimento para cachorros de raza grande (calcio controlado) y no sobrealimentar para no acelerar el crecimiento.'
      : 'Pesar cada 2 semanas y ajustar la porción al crecimiento.'
  } else if (senior) {
    etapa = 'Senior'
    factor = 1.4
    comidasN = 2
    extra = 'Revisión geriátrica cada 6 meses (articulaciones, dientes, riñón).'
  } else {
    etapa = 'Adulto'
    factor = 1.6
    comidasN = 2
    extra = 'Factor 1.6 para adulto esterilizado; si no está esterilizado o es muy activo puede necesitar hasta 1.8.'
  }

  const kcal = redondear5(R * factor)
  const porcion = gCroq(kcal)
  const porComida = Math.round(porcion / comidasN / 5) * 5

  const principal = plan({
    id: 'perro-etapa',
    titulo: `Plan ${etapa} balanceado`,
    fuente: 'AAHA / WSAVA · energía = 70 × peso^0.75 × factor de etapa',
    icono: '🥗',
    badge: etapa,
    tipoDieta: cachorro ? 'Alimento completo para cachorro' : senior ? 'Alimento senior, fácil de digerir' : 'Alimento completo y balanceado',
    frecuencia: `${comidasN} veces al día`,
    horario: HORARIOS[Math.min(comidasN, 4)],
    calorias: kcal,
    comidas: [
      `Croqueta seca ≈ ${porcion} g al día (≈ ${porComida} g por comida)`,
      cachorro ? 'Alimento húmedo para cachorro como complemento (opcional)' : 'Verduras cocidas (zanahoria, calabacín) como premio',
      'Agua fresca siempre disponible'
    ],
    suplementos: cachorro ? 'Omega-3 (DHA) para desarrollo cerebral' : senior ? 'Omega-3 y condroprotectores si el veterinario lo indica' : 'Ninguno',
    diagnostico: `Mantenimiento – etapa ${etapa.toLowerCase()}`,
    observaciones: `Para ${nombre} (${kg} kg). ${extra} Premios y extras: máximo 10 % de las calorías diarias.`,
    revisionMeses: cachorro ? 1 : 6
  })

  const kcalPeso = redondear5(R * 1.0)
  const control = plan({
    id: 'perro-peso',
    titulo: 'Plan control de peso',
    fuente: 'AAHA · pérdida de peso ≈ 1.0 × RER (del peso ideal)',
    icono: '⚖️',
    badge: 'Sobrepeso',
    color: '#f59e0b',
    tipoDieta: 'Hipocalórica, alta en fibra y proteína',
    frecuencia: '3 veces al día',
    horario: HORARIOS[3],
    calorias: kcalPeso,
    comidas: [
      `Croqueta light ≈ ${gCroq(kcalPeso)} g al día repartidos en 3 comidas`,
      'Verduras (zanahoria, ejotes) para aumentar el volumen',
      'Sin premios calóricos entre comidas'
    ],
    diagnostico: 'Control de peso',
    observaciones: `Úsalo solo si el veterinario confirma sobrepeso (condición corporal). Pesaje cada 2 semanas; meta de pérdida ≈ 1–2 % del peso por semana. Ejercicio diario.`,
    revisionMeses: 2
  })

  const tercero = senior
    ? plan({
        id: 'perro-articular',
        titulo: 'Plan senior articular y cognitivo',
        fuente: 'Pautas geriátricas de clínicas veterinarias (Hill\'s, Royal Canin, OSU)',
        icono: '🦴',
        badge: 'Senior',
        color: '#6366f1',
        tipoDieta: 'Senior con antiinflamatorios naturales',
        frecuencia: '2 – 3 veces al día',
        horario: HORARIOS[3],
        calorias: redondear5(R * 1.3),
        comidas: [
          `Alimento senior ≈ ${gCroq(R * 1.3)} g al día en porciones pequeñas`,
          'Pescado (sardina/salmón) cocido 1–2 veces por semana para omega-3',
          'Agua fresca; humedecer la croqueta si come con dificultad'
        ],
        suplementos: 'Glucosamina/condroitina y omega-3 (según indicación)',
        diagnostico: 'Soporte articular y cognitivo',
        observaciones: 'Evitar alimentos con mucho sodio. Control de peso para cuidar las articulaciones.',
        revisionMeses: 6
      })
    : plan({
        id: 'perro-digestivo',
        titulo: 'Plan digestión sensible',
        fuente: 'Pautas de nutrición clínica (WSAVA / clínicas veterinarias)',
        icono: '🍚',
        badge: 'Estómago sensible',
        color: '#8b5cf6',
        tipoDieta: 'Digestiva, proteína única y fibra moderada',
        frecuencia: '3 veces al día',
        horario: HORARIOS[3],
        calorias: kcal,
        comidas: [
          `Alimento digestivo ≈ ${porcion} g al día en 3 tomas pequeñas`,
          'Arroz blanco y pollo hervido sin piel en caso de diarrea leve (máx. 2–3 días)',
          'Probiótico para perros según indicación'
        ],
        suplementos: 'Probióticos',
        diagnostico: 'Sensibilidad digestiva',
        observaciones: 'Cambiar de alimento siempre de forma gradual en 7 días. Si hay vómito o diarrea por más de 48 h, consultar.',
        revisionMeses: 1
      })

  return [principal, control, tercero]
}

// ── GATO ──────────────────────────────────────────────────────
function planesGato({ kg, meses, nombre }) {
  const gatito = meses !== null && meses < 12
  const senior = meses !== null && meses >= 11 * 12
  const R = rer(kg)
  const gCroq = (kcal) => Math.round(kcal / 4 / 5) * 5 // croqueta seca de gato ≈ 4 kcal/g

  let etapa, factor, comidasN
  if (gatito) { etapa = 'Gatito'; factor = 2.5; comidasN = meses < 6 ? 4 : 3 }
  else if (senior) { etapa = 'Senior'; factor = 1.2; comidasN = 3 }
  else { etapa = 'Adulto'; factor = 1.3; comidasN = 2 }

  const kcal = redondear5(R * factor)
  const hum = Math.round(kcal * 0.5 / 85) // lata/sobre húmedo ≈ 85 kcal
  const seco = gCroq(kcal * 0.5)

  const principal = plan({
    id: 'gato-etapa',
    titulo: `Plan ${etapa} balanceado`,
    fuente: 'AAHA / WSAVA · energía = 70 × peso^0.75 × factor de etapa',
    icono: '🥗',
    badge: etapa,
    tipoDieta: gatito ? 'Alimento completo para gatito (alta energía)' : senior ? 'Alimento senior, alta calidad proteica' : 'Alimento completo, alto en proteína animal',
    frecuencia: `${comidasN} veces al día`,
    horario: HORARIOS[Math.min(comidasN, 4)],
    calorias: kcal,
    comidas: [
      `Alimento húmedo ≈ ${hum} ${hum === 1 ? 'sobre' : 'sobres'} de ≈ 85 kcal al día (50 % de las calorías)`,
      `Croqueta seca ≈ ${seco} g al día (50 % de las calorías)`,
      'Agua fresca; fuente de agua para estimular que beba'
    ],
    suplementos: gatito ? 'Ninguno (el alimento de gatito ya incluye taurina y DHA)' : 'Ninguno',
    diagnostico: `Mantenimiento – etapa ${etapa.toLowerCase()}`,
    observaciones: `Para ${nombre} (${kg} kg). Los gatos son carnívoros estrictos: necesitan taurina y proteína animal. Factor ${factor} × RER (esterilizado 1.2–1.4; sin esterilizar 1.4–1.6). Premios: máximo 10 % de las calorías.`,
    revisionMeses: gatito ? 1 : 6
  })

  const kcalPeso = redondear5(R * 0.8)
  const control = plan({
    id: 'gato-peso',
    titulo: 'Plan control de peso (gato de interior)',
    fuente: 'AAHA · pérdida de peso en gatos ≈ 0.8 × RER',
    icono: '⚖️',
    badge: 'Sobrepeso',
    color: '#f59e0b',
    tipoDieta: 'Hipocalórica, alta en proteína',
    frecuencia: '3 – 4 veces al día (porciones pequeñas)',
    horario: HORARIOS[4],
    calorias: kcalPeso,
    comidas: [
      `Alimento light húmedo + seco ≈ ${kcalPeso} kcal repartidas en 4 tomas`,
      'Usar comederos de juego/puzzle para alargar el tiempo de comida',
      'Sin comida libre'
    ],
    diagnostico: 'Control de peso',
    observaciones: 'Nunca someter a un gato a ayuno: la pérdida de peso debe ser gradual (0.5–2 % semanal) y supervisada para evitar lipidosis hepática.',
    revisionMeses: 2
  })

  const urinario = plan({
    id: 'gato-urinario',
    titulo: 'Plan hidratación y vías urinarias',
    fuente: 'Pautas de clínicas felinas (AAFP / ISFM, Hill\'s, Royal Canin)',
    icono: '💧',
    badge: 'Prevención',
    color: '#3b82f6',
    tipoDieta: 'Alta humedad, minerales controlados',
    frecuencia: '3 veces al día',
    horario: HORARIOS[3],
    calorias: kcal,
    comidas: [
      'Alimento húmedo en 2/3 de la ración diaria',
      'Fuente de agua o varios bebederos en la casa',
      `Croqueta urinaria ≈ ${gCroq(kcal / 3)} g al día como complemento`
    ],
    suplementos: 'Ninguno',
    diagnostico: 'Prevención de problemas urinarios',
    observaciones: 'Muy útil en machos esterilizados o gatos que beben poco. Si hay esfuerzo para orinar o sangre en la orina: urgencia veterinaria.',
    revisionMeses: 3
  })

  return [principal, control, urinario]
}

// ── CONEJO ────────────────────────────────────────────────────
function planesConejo({ kg, meses, nombre }) {
  const joven = meses !== null && meses < 7
  const adultoJoven = meses !== null && meses >= 7 && meses < 12
  const senior = meses !== null && meses >= 6 * 12
  const R = rer(kg)
  const unidades = kg / 2.7 // las guías se expresan "por cada 6 libras (2.7 kg)"
  const kcal = redondear5(R * 2)

  let etapa, tipo, comidas, obs
  if (joven) {
    etapa = 'Juvenil (crecimiento)'
    tipo = 'Heno de alfalfa y pellets de alfalfa a libre demanda'
    comidas = [
      'Heno de alfalfa a libre demanda',
      'Pellets de alfalfa a libre demanda',
      meses >= 3 ? 'Verduras de hoja nuevas, una a la vez (≈ 15 g)' : 'Aún sin verduras (se introducen desde los 3 meses)'
    ]
    obs = 'Los conejos en crecimiento necesitan el calcio y la proteína extra de la alfalfa.'
  } else if (adultoJoven) {
    etapa = 'Adulto joven (7–12 meses)'
    tipo = 'Transición a heno de pasto y menos pellets'
    comidas = [
      'Heno de pasto (timothy/avena) ilimitado; reducir poco a poco la alfalfa',
      `Pellets de timothy ≈ ${gPellets(kg, 25, 35)} al día (1/2 taza por cada 2.7 kg)`,
      `Verduras de hoja ≈ ${tazas(unidades * 1)} al día`
    ]
    obs = 'Subir las verduras de forma gradual. Frutas solo como premio (30–60 g por cada 2.7 kg).'
  } else if (senior) {
    etapa = 'Senior (6+ años)'
    tipo = 'Heno ilimitado y verduras; pellets según peso corporal'
    comidas = [
      'Heno de pasto ilimitado (agregar alfalfa si está bajo de peso)',
      `Pellets ≈ ${gPellets(kg, 15, 25)} al día (más si está delgado)`,
      `Verduras de hoja ≈ ${tazas(unidades * 2)} al día`
    ]
    obs = 'Revisar dientes y peso cada 3–6 meses. Los conejos frágiles pueden necesitar más pellets.'
  } else {
    etapa = 'Adulto (1–5 años)'
    tipo = 'Dieta alta en fibra: heno + verduras + pellets limitados'
    comidas = [
      'Heno de pasto (timothy/avena) ilimitado, disponible 24 h',
      `Pellets de timothy ≈ ${gPellets(kg, 15, 25)} al día (1/4 taza por cada 2.7 kg)`,
      `Verduras de hoja variadas (3 tipos) ≈ ${tazas(unidades * 2)} al día`
    ]
    obs = 'Lavar muy bien las verduras. Frutas solo como premio y en poca cantidad.'
  }

  const principal = plan({
    id: 'conejo-etapa',
    titulo: `Plan ${etapa}`,
    fuente: 'House Rabbit Society · NCSU Veterinary Hospital · VCA · RSPCA',
    icono: '🥕',
    badge: joven ? 'Juvenil' : senior ? 'Senior' : 'Adulto',
    tipoDieta: tipo,
    frecuencia: joven ? '3 veces al día + heno libre' : '2 veces al día + heno libre',
    horario: joven ? HORARIOS[3] : HORARIOS[2],
    calorias: kcal,
    comidas,
    diagnostico: `Mantenimiento – ${etapa.toLowerCase()}`,
    observaciones: `Para ${nombre} (${kg} kg). ${obs} Calorías estimadas (referencia).`,
    revisionMeses: joven ? 1 : 6
  })

  const control = plan({
    id: 'conejo-peso',
    titulo: 'Plan control de peso',
    fuente: 'House Rabbit Society · veterinarios de conejos',
    icono: '⚖️',
    badge: 'Sobrepeso',
    color: '#f59e0b',
    tipoDieta: 'Muy alta en fibra, pellets reducidos',
    frecuencia: '2 veces al día + heno libre',
    horario: HORARIOS[2],
    calorias: redondear5(R * 1.6),
    comidas: [
      'Heno de pasto ilimitado (la base de la dieta)',
      `Pellets ≈ ${gPellets(kg, 8, 12)} al día (mínimo)`,
      `Verduras de hoja ≈ ${tazas(unidades * 2)} al día, sin zanahoria ni fruta en exceso`
    ],
    diagnostico: 'Control de peso',
    observaciones: 'Más tiempo de juego y espacio para correr (mínimo 4 horas al día fuera de la jaula). Pesar cada semana.',
    revisionMeses: 2
  })

  const digestivo = plan({
    id: 'conejo-digestivo',
    titulo: 'Plan digestivo (prevención de estasis)',
    fuente: 'VCA Hospitals · House Rabbit Society',
    icono: '🌿',
    badge: 'Prevención',
    color: '#8b5cf6',
    tipoDieta: 'Máxima fibra larga para mantener el tránsito',
    frecuencia: 'Heno 24 h + 2 comidas',
    horario: HORARIOS[2],
    calorias: kcal,
    comidas: [
      'Heno variado (timothy, avena, pradera) siempre disponible',
      'Verduras de hoja oscuras, al menos 3 variedades al día',
      'Mucha agua fresca; bebedero tipo plato'
    ],
    diagnostico: 'Prevención de problemas digestivos',
    observaciones: 'Si deja de comer o de hacer heces por más de 12 horas es una urgencia veterinaria. Evitar cambios bruscos de dieta.',
    revisionMeses: 3
  })

  return [principal, control, digestivo]
}

// ── COBAYO ────────────────────────────────────────────────────
function planesCobayo({ kg, meses, nombre }) {
  const joven = meses !== null && meses < 6
  const R = rer(kg)
  const kcal = redondear5(R * 2)
  const vitMin = Math.max(10, Math.round(kg * 10))
  const vitMax = Math.max(vitMin + 5, Math.round(kg * 25))
  const vitJoven = Math.max(30, Math.round(kg * 30))

  const principal = plan({
    id: 'cobayo-etapa',
    titulo: joven ? 'Plan juvenil (crecimiento)' : 'Plan adulto balanceado',
    fuente: 'MSD/Merck Veterinary Manual · VCA Hospitals · PDSA',
    icono: '🥬',
    badge: joven ? 'Juvenil' : 'Adulto',
    tipoDieta: joven ? 'Heno y pellets de alfalfa + vitamina C' : 'Heno de pasto ilimitado + vitamina C diaria',
    frecuencia: '2 veces al día + heno libre',
    horario: HORARIOS[2],
    calorias: kcal,
    comidas: [
      joven ? 'Heno de alfalfa a libre demanda' : 'Heno de timothy o pasto, ilimitado (≈ su tamaño en heno)',
      joven ? 'Pellets de cobayo (con vitamina C) ≈ 2 cucharadas al día' : 'Pellets de cobayo con vitamina C ≈ 1–2 cucharadas al día',
      'Verduras frescas ≈ 1 taza al día (pimentón, perejil, kale, lechuga romana)'
    ],
    suplementos: joven ? `Vitamina C ≈ ${vitJoven} mg/día` : `Vitamina C ≈ ${vitMin}–${vitMax} mg/día`,
    diagnostico: joven ? 'Mantenimiento – juvenil' : 'Mantenimiento – adulto',
    observaciones: `Para ${nombre} (${kg} kg). Los cobayos no fabrican vitamina C: necesitan 10–25 mg/kg al día (30 mg/kg si están creciendo, preñadas o enfermas). No usar pellets de conejo. Calorías estimadas (referencia).`,
    revisionMeses: joven ? 1 : 6
  })

  const vitC = plan({
    id: 'cobayo-vitc',
    titulo: 'Plan reforzado en vitamina C',
    fuente: 'MSD Veterinary Manual · Veterinary Partner',
    icono: '🍊',
    badge: 'Prevención de escorbuto',
    color: '#f59e0b',
    tipoDieta: 'Verduras ricas en vitamina C a diario',
    frecuencia: '2 veces al día + heno libre',
    horario: HORARIOS[2],
    calorias: kcal,
    comidas: [
      'Pimentón rojo o verde (≈ 2 cucharadas picado)',
      'Perejil, kale o brócoli (2–3 variedades rotando)',
      'Heno ilimitado y pellets frescos (la vitamina C se degrada en ~90 días)'
    ],
    suplementos: `Vitamina C ≈ ${vitMin}–${vitMax} mg/día (solo si el veterinario lo indica)`,
    diagnostico: 'Prevención de deficiencia de vitamina C',
    observaciones: 'No agregar vitamina C al agua (se degrada rápido). Signos de falta: cojera, encías sangrantes, pelo áspero.',
    revisionMeses: 3
  })

  const control = plan({
    id: 'cobayo-peso',
    titulo: 'Plan control de peso',
    fuente: 'UF Small Animal Hospital · VCA Hospitals',
    icono: '⚖️',
    badge: 'Sobrepeso',
    color: '#8b5cf6',
    tipoDieta: 'Menos pellets, más heno y verdura',
    frecuencia: '2 veces al día + heno libre',
    horario: HORARIOS[2],
    calorias: redondear5(R * 1.6),
    comidas: [
      'Heno de pasto ilimitado',
      'Pellets limitados a 1 cucharada al día',
      'Verduras de hoja, sin fruta ni zanahoria en exceso'
    ],
    suplementos: `Vitamina C ≈ ${vitMin}–${vitMax} mg/día`,
    diagnostico: 'Control de peso',
    observaciones: 'Más espacio para moverse. Pesar cada semana.',
    revisionMeses: 2
  })

  return [principal, vitC, control]
}

// ── HÁMSTER ───────────────────────────────────────────────────
function planesHamster({ kg, meses, nombre, raza }) {
  const sirio = /sirio/i.test(raza || '')
  const joven = meses !== null && meses < 3
  const senior = meses !== null && meses > 18
  const gramos = sirio ? 10 : 6
  const R = rer(Math.max(kg, 0.03))
  const kcal = redondear5(R * 2)
  const aguaMl = Math.max(5, Math.round(kg * 1000 * 0.1)) // 10 ml por 100 g de peso

  const principal = plan({
    id: 'hamster-etapa',
    titulo: joven ? 'Plan juvenil (crecimiento)' : senior ? 'Plan senior' : 'Plan adulto balanceado',
    fuente: 'Wood Green · PetMD · Pets Radar (guía veterinaria)',
    icono: '🌰',
    badge: joven ? 'Juvenil' : senior ? 'Senior' : 'Adulto',
    tipoDieta: 'Pellets o bloque de roedor (≈ 75 %) + mezcla de semillas y frescos (≈ 25 %)',
    frecuencia: '1 vez al día (en la tarde-noche)',
    horario: HORARIOS[1],
    calorias: kcal,
    comidas: [
      `Alimento seco ≈ ${gramos}${sirio ? '' : '–8'} g al día (${sirio ? '1 cucharada' : '1 cucharadita'})`,
      'Verdura fresca en porción del tamaño de una uña (pepino, brócoli, zanahoria)',
      joven ? 'Un poco de proteína extra (gusano de harina seco) 1–2 veces por semana' : senior ? 'Evitar exceso de proteína (cuida el riñón)' : 'Proteína (gusano de harina seco) ocasional'
    ],
    diagnostico: `Mantenimiento – ${joven ? 'juvenil' : senior ? 'senior' : 'adulto'}`,
    observaciones: `Para ${nombre} (${Math.round(kg * 1000)} g). Revisar el escondite de comida antes de subir la ración. Agua ≈ ${aguaMl} ml/día. Premios: máximo 5 % de la dieta. Evitar cítricos. Calorías estimadas (referencia).`,
    revisionMeses: joven ? 1 : 3
  })

  const control = plan({
    id: 'hamster-peso',
    titulo: 'Plan control de peso',
    fuente: 'Pets Radar · Wood Green',
    icono: '⚖️',
    badge: 'Sobrepeso',
    color: '#f59e0b',
    tipoDieta: 'Pellets medidos, sin semillas grasas',
    frecuencia: '1 vez al día',
    horario: HORARIOS[1],
    calorias: redondear5(R * 1.6),
    comidas: [
      `Pellets ≈ ${sirio ? 8 : 5} g al día`,
      'Verdura en pequeña cantidad; sin semillas de girasol ni cacahuate',
      'Rueda de ejercicio de tamaño adecuado'
    ],
    diagnostico: 'Control de peso',
    observaciones: 'Pesar cada semana con una báscula de cocina.',
    revisionMeses: 1
  })

  const forrajeo = plan({
    id: 'hamster-forrajeo',
    titulo: 'Plan con forrajeo y enriquecimiento',
    fuente: 'Veterinarios de exóticos (Chewy / PetMD)',
    icono: '🔎',
    badge: 'Bienestar',
    color: '#3b82f6',
    tipoDieta: 'Misma ración, esparcida para buscar',
    frecuencia: '1 vez al día',
    horario: HORARIOS[1],
    calorias: kcal,
    comidas: [
      'Esparcir los pellets y semillas sobre el sustrato para que los busque',
      'Rollos de cartón o heno con comida escondida',
      'Agua fresca en biberón con tubo de acero'
    ],
    diagnostico: 'Enriquecimiento alimentario',
    observaciones: 'Mantiene al hámster activo y evita que solo escoja las semillas que más le gustan.',
    revisionMeses: 3
  })

  return [principal, control, forrajeo]
}

// ── AVE ───────────────────────────────────────────────────────
function planesAve({ kg, meses, nombre, raza }) {
  const g = Math.round(kg * 1000)
  const corral = /(gallo|gallina|paloma|pato)/i.test(raza || '')
  const joven = meses !== null && meses < 12
  const R = rer(Math.max(kg, 0.01))
  const kcal = redondear5(R * 2)
  const tamano = g < 40 ? 'muy pequeña' : g < 150 ? 'pequeña/mediana' : 'grande'
  const porcion = g < 40 ? '1 – 2 cucharaditas de pellets' : g < 150 ? '1 – 2 cucharadas de pellets' : '1/4 – 1/2 taza de pellets'

  const principal = plan({
    id: 'ave-etapa',
    titulo: joven ? 'Plan juvenil con pellets' : 'Plan adulto con pellets',
    fuente: 'MSD/Merck Veterinary Manual · VCA Hospitals',
    icono: '🦜',
    badge: joven ? 'Joven' : 'Adulto',
    tipoDieta: 'Pellets formulados (≈ 60–70 %) + verduras y frutas (≈ 20–40 %)',
    frecuencia: '2 veces al día',
    horario: HORARIOS[2],
    calorias: kcal,
    comidas: [
      `Pellets para su tamaño (${tamano}) ≈ ${porcion} al día`,
      'Verduras de hoja y de colores (zanahoria, brócoli, calabaza) en platito aparte',
      'Semillas solo como premio (máximo ≈ 10 %)'
    ],
    suplementos: 'Ninguno si come pellets y verduras (no sobresuplementar vitamina A)',
    diagnostico: `Mantenimiento – ${joven ? 'joven' : 'adulto'}`,
    observaciones: `Para ${nombre} (${g} g). ${corral ? 'Es un ave de corral/doméstica: usa alimento balanceado específico para su especie y consulta al veterinario las cantidades. ' : ''}Evitar aguacate, cebolla, ajo, chocolate y semillas de manzana (tóxicos). Agua fresca todos los días. Calorías estimadas (referencia).`,
    revisionMeses: joven ? 2 : 6
  })

  const transicion = plan({
    id: 'ave-transicion',
    titulo: 'Plan de transición de semillas a pellets',
    fuente: 'RSPCA Australia · VCA Hospitals',
    icono: '🔄',
    badge: 'Transición',
    color: '#f59e0b',
    tipoDieta: 'Destete gradual de la dieta de semillas',
    frecuencia: '2 veces al día',
    horario: HORARIOS[2],
    calorias: kcal,
    comidas: [
      'Semana 1: mezcla mitad semillas, mitad pellets triturados + verduras',
      'Semanas 2–3: quitar una pizca de semilla cada día',
      'Ofrecer pellets primero en la mañana, cuando tiene más hambre'
    ],
    diagnostico: 'Cambio de dieta a pellets',
    observaciones: 'Una dieta solo de semillas causa deficiencia de vitamina A y calcio. Vigilar que siga comiendo durante el cambio; si no come en pocas horas, consultar.',
    revisionMeses: 1
  })

  const control = plan({
    id: 'ave-peso',
    titulo: 'Plan control de peso',
    fuente: 'MSD/Merck Veterinary Manual',
    icono: '⚖️',
    badge: 'Sobrepeso',
    color: '#8b5cf6',
    tipoDieta: 'Pellets medidos, bajo en grasa',
    frecuencia: '2 veces al día',
    horario: HORARIOS[2],
    calorias: redondear5(R * 1.5),
    comidas: [
      'Ración de pellets medida (sin semillas ni nueces)',
      'Verduras en mayor proporción que la fruta',
      'Ejercicio: espacio para volar, trepar o caminar'
    ],
    diagnostico: 'Control de peso',
    observaciones: 'Un ave se considera obesa si pesa 20 % más que su peso ideal.',
    revisionMeses: 2
  })

  return [principal, transicion, control]
}

const GENERADORES = {
  Perro: planesPerro,
  Gato: planesGato,
  Conejo: planesConejo,
  Cobayo: planesCobayo,
  Hamster: planesHamster,
  Ave: planesAve
}

// ── API pública ───────────────────────────────────────────────
// mascota: { Nombre, Especie, Raza, Peso, Fecha_nacimiento }
// Devuelve { planes: [...], aviso: '' }.
// Si faltan datos o la especie no tiene planes, planes = [] y aviso explica por qué.
export function generarPlanes(mascota) {
  if (!mascota) return { planes: [], aviso: '' }
  const generador = GENERADORES[mascota.Especie]
  if (!generador) {
    return { planes: [], aviso: `Todavía no hay planes sugeridos para la especie "${mascota.Especie || 'sin especie'}".` }
  }
  const kg = aNumero(mascota.Peso)
  if (!kg) {
    return { planes: [], aviso: 'Falta el peso de la mascota. Agrégalo en Mis Mascotas para ver los planes.' }
  }
  const meses = edadEnMeses(mascota.Fecha_nacimiento)
  const planes = generador({
    kg,
    meses,
    nombre: mascota.Nombre || 'la mascota',
    raza: mascota.Raza || ''
  })
  return {
    planes,
    aviso: meses === null ? 'No hay fecha de nacimiento: se asumió una mascota adulta.' : ''
  }
}
