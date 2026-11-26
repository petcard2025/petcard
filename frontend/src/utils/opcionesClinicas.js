// =============================================================
// OPCIONES CLÍNICAS PARA LOS FORMULARIOS (veterinario y administrador)
// =============================================================
// Listas de opción múltiple según el servicio, la especie y el plan de alimentación.
// Se armaron tomando como guía clínicas veterinarias, guías de vacunación de
// perros y gatos (WSAVA / MSD Veterinary Manual / esquemas usados en Colombia) y los
// motivos de consulta más frecuentes (gastrointestinales, vacunación, piel, oído,
// respiratorios y comportamiento). Todos los campos permiten además "Otro" para
// casos que no estén en la lista.

const sinTildes = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// ── Servicio → categoría ──────────────────────────────────────
// Usa la Categoria guardada en la tabla servicio; si viene vacía, la deduce del nombre.
export function categoriaDeServicio(servicio) {
  if (!servicio) return ''
  const cat = sinTildes(servicio.Categoria)
  const nombre = sinTildes(servicio.Nombre || servicio.Nombre_servicio)
  const texto = `${cat} ${nombre}`
  if (texto.includes('vacun')) return 'Vacuna'
  if (texto.includes('cirug') || texto.includes('esteriliz') || texto.includes('castrac')) return 'Cirugía'
  if (texto.includes('desparas') || texto.includes('tratamiento') || texto.includes('pulga') || texto.includes('limpieza')) return 'Tratamiento'
  if (texto.includes('diagnost') || texto.includes('laboratorio') || texto.includes('radiograf') || texto.includes('ecograf')) return 'Diagnóstico'
  if (texto.includes('estetic') || texto.includes('peluquer') || texto.includes('bano')) return 'Estética'
  return 'Consulta'
}

const unicos = (...listas) => [...new Set(listas.flat())]

// ── Citas ─────────────────────────────────────────────────────
export const CATEGORIAS_SERVICIO = ['Consulta', 'Vacuna', 'Cirugía', 'Tratamiento', 'Diagnóstico', 'Estética']

const MOTIVOS = {
  Consulta: [
    'Control general / chequeo anual',
    'Vómito o diarrea',
    'Pérdida de apetito o decaimiento',
    'Cojera o dolor al caminar',
    'Problemas de piel o picazón',
    'Molestias en el oído (otitis)',
    'Tos, estornudos o problemas respiratorios',
    'Problemas en los ojos',
    'Cambios de comportamiento',
    'Pérdida de peso o sobrepeso',
    'Control de gestación'
  ],
  Vacuna: [
    'Primera dosis (cachorro o gatito)',
    'Refuerzo anual',
    'Esquema de vacunación incompleto',
    'Vacuna requerida para viaje o guardería',
    'Control posterior a la vacuna'
  ],
  Cirugía: [
    'Esterilización o castración',
    'Cirugía de tejidos blandos',
    'Cirugía ortopédica',
    'Extracción dental',
    'Valoración prequirúrgica',
    'Control posoperatorio'
  ],
  Tratamiento: [
    'Desparasitación interna',
    'Control de pulgas y garrapatas',
    'Seguimiento de tratamiento',
    'Curación de heridas',
    'Limpieza dental',
    'Aplicación de medicamento'
  ],
  Diagnóstico: [
    'Examen de laboratorio',
    'Radiografía',
    'Ecografía',
    'Revisión de resultados'
  ],
  Estética: [
    'Baño y peluquería',
    'Corte de uñas',
    'Limpieza de oídos'
  ]
}

export function motivosCita(categoria) {
  return MOTIVOS[categoria] || unicos(Object.values(MOTIVOS))
}

const OBS_CLINICAS = {
  Consulta: [
    'Examen físico normal',
    'Se solicita examen de laboratorio',
    'Se formuló tratamiento',
    'Dieta blanda por 3 días',
    'Reposo relativo',
    'Control en 8 días',
    'Control en 15 días',
    'Se recomienda plan de alimentación'
  ],
  Vacuna: [
    'Vacuna aplicada sin reacción',
    'Reacción local leve (observar 24 h)',
    'Próxima dosis programada',
    'Se recomienda desparasitar antes del refuerzo',
    'Se aplaza la vacuna por fiebre'
  ],
  Cirugía: [
    'Cirugía sin complicaciones',
    'Collar isabelino indicado',
    'Analgésico formulado',
    'Retiro de puntos en 10 días',
    'Control posoperatorio en 8 días',
    'Ayuno previo de 8 a 12 horas'
  ],
  Tratamiento: [
    'Medicamento aplicado',
    'Repetir dosis en 15 días',
    'Completar el tratamiento en casa',
    'Control de evolución',
    'Evitar baños por 48 horas'
  ],
  Diagnóstico: [
    'Muestra tomada',
    'Resultados en 24 a 48 horas',
    'Requiere nueva toma',
    'Resultados normales'
  ],
  Estética: [
    'Piel y pelaje en buen estado',
    'Se recomienda cepillado frecuente',
    'Se detectaron parásitos externos'
  ]
}

export function observacionesCita(categoria) {
  return OBS_CLINICAS[categoria] || unicos(Object.values(OBS_CLINICAS))
}

// ── Servicios (administrador) ─────────────────────────────────
const NOMBRES_SERVICIO = {
  Consulta: ['Consulta General', 'Consulta Especializada', 'Consulta de Urgencias', 'Control de Seguimiento', 'Consulta Nutricional'],
  Vacuna: ['Vacuna Antirrábica', 'Vacuna Polivalente', 'Vacuna Triple Felina', 'Vacuna Leucemia Felina', 'Vacuna Tos de las Perreras'],
  Cirugía: ['Cirugía Esterilización', 'Cirugía Castración', 'Cirugía de Tejidos Blandos', 'Extracción Dental'],
  Tratamiento: ['Desparasitación', 'Control de Pulgas y Garrapatas', 'Limpieza Dental', 'Curación de Heridas'],
  Diagnóstico: ['Examen de Laboratorio', 'Radiografía', 'Ecografía'],
  Estética: ['Baño y Peluquería', 'Corte de Uñas']
}

const DESCRIPCIONES_SERVICIO = {
  Consulta: ['Revisión médica básica', 'Evaluación clínica completa', 'Atención de urgencia', 'Seguimiento de tratamiento'],
  Vacuna: ['Aplicación de vacuna y registro en el carnet', 'Refuerzo del esquema de vacunación'],
  Cirugía: ['Procedimiento quirúrgico con anestesia', 'Cirugía con control posoperatorio'],
  Tratamiento: ['Tratamiento antiparasitario', 'Tratamiento preventivo', 'Procedimiento ambulatorio'],
  Diagnóstico: ['Examen de apoyo diagnóstico', 'Toma de muestra y entrega de resultados'],
  Estética: ['Higiene y cuidado del pelaje', 'Cuidado básico de uñas y oídos']
}

export const nombresServicio = (categoria) => NOMBRES_SERVICIO[categoria] || unicos(Object.values(NOMBRES_SERVICIO))
export const descripcionesServicio = (categoria) => DESCRIPCIONES_SERVICIO[categoria] || unicos(Object.values(DESCRIPCIONES_SERVICIO))

// ── Vacunas (carnet) ──────────────────────────────────────────
const VACUNAS = {
  Perro: [
    'Antirrábica',
    'Pentavalente (moquillo, hepatitis, parvovirus, parainfluenza, leptospirosis)',
    'Polivalente / Séxtuple',
    'Parvovirus',
    'Moquillo',
    'Leptospirosis',
    'Tos de las perreras (Bordetella)',
    'Coronavirus'
  ],
  Gato: [
    'Antirrábica',
    'Triple felina (panleucopenia, rinotraqueítis, calicivirus)',
    'Leucemia felina (FeLV)',
    'Clamidia felina'
  ],
  Conejo: ['Mixomatosis', 'Enfermedad hemorrágica viral (RHDV)'],
  Otros: ['Antirrábica']
}

export function vacunasPorEspecie(especie, servicio) {
  let lista = VACUNAS[especie] || VACUNAS.Otros
  // Si el servicio es la antirrábica, esa vacuna va primero
  const nombre = sinTildes(servicio?.Nombre || servicio?.Nombre_servicio)
  if (nombre.includes('rabi')) lista = unicos(['Antirrábica'], lista)
  return lista
}

export const OBS_VACUNA = [
  'Sin reacciones adversas',
  'Reacción local leve (observar 24 h)',
  'Desparasitada previamente',
  'Refuerzo en 3 a 4 semanas',
  'Refuerzo anual',
  'Aplazar si presenta fiebre'
]

// ── Mascotas: razas por especie ───────────────────────────────
// Mismo catálogo que usa el cliente al registrar su mascota (mis-mascotas.vue),
// para que administrador y cliente ofrezcan las mismas razas.
const RAZAS = {
  Perro: ['Labrador Retriever', 'Golden Retriever', 'Pastor Alemán', 'Bulldog Inglés', 'Bulldog Francés', 'Bulldog Americano', 'Beagle', 'Poodle (Caniche)', 'Chihuahua', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Dachshund (Salchicha)', 'Shih Tzu', 'Husky Siberiano', 'Doberman', 'Pug', 'Schnauzer', 'Cocker Spaniel', 'Border Collie', 'Pitbull', 'Maltés', 'Pomerania', 'Gran Danés', 'San Bernardo', 'Akita', 'Samoyedo', 'Dálmata', 'Mastín', 'Basset Hound', 'Criollo', 'Mestizo'],
  Gato: ['Siamés', 'Persa', 'Maine Coon', 'Bengalí', 'Ragdoll', 'Sphynx', 'British Shorthair', 'Angora', 'Abisinio', 'Azul Ruso', 'Birmano', 'Scottish Fold', 'Himalayo', 'Criollo', 'Mestizo'],
  Ave: ['Canario', 'Periquito', 'Agaporni', 'Cacatúa', 'Loro', 'Guacamayo', 'Ninfa (Cockatiel)', 'Cotorra', 'Gallo de pelea', 'Gallina', 'Paloma', 'Pato', 'Criollo'],
  Conejo: ['Cabeza de León', 'Holandés', 'Enano', 'Mini Lop', 'Rex', 'Angora', 'Gigante de Flandes', 'Californiano', 'Criollo'],
  Hamster: ['Sirio', 'Enano Ruso', 'Roborovski', 'Chino'],
  Pez: ['Pez dorado (Goldfish)', 'Betta', 'Guppy', 'Neón', 'Escalar', 'Disco', 'Molly', 'Platy', 'Koi'],
  Reptil: ['Iguana', 'Tortuga', 'Gecko leopardo', 'Dragón barbudo', 'Pitón bola', 'Camaleón'],
  Cobayo: ['Americano', 'Peruano', 'Abisinio', 'Teddy'],
  Otro: []
}

export const ESPECIES_MASCOTA = Object.keys(RAZAS)

const ALIAS_ESPECIE = {
  perro: 'Perro', canino: 'Perro', gato: 'Gato', felino: 'Gato', conejo: 'Conejo',
  ave: 'Ave', pajaro: 'Ave', loro: 'Ave', hamster: 'Hamster', cobayo: 'Cobayo', cuy: 'Cobayo', cobaya: 'Cobayo'
}
export const normalizarEspecie = (e) => ALIAS_ESPECIE[sinTildes(e).trim()] || String(e || '').trim()

export const razasPorEspecie = (especie) => RAZAS[normalizarEspecie(especie)] || []

// ── Plan de alimentación ──────────────────────────────────────
const DIETAS_BASE = [
  'Alimento completo y balanceado',
  'Hipocalórica (control de peso)',
  'Digestiva (estómago sensible)',
  'Hipoalergénica',
  'Renal (bajo en fósforo)',
  'Urinaria (control de cristales)',
  'Articular (soporte de articulaciones)',
  'Dermatológica (piel y pelaje)',
  'Cardíaca (bajo en sodio)',
  'Diabética (alta en fibra)',
  'Recuperación (alta energía)',
  'Gestación y lactancia',
  'Dieta casera supervisada por el veterinario'
]

const DIETAS_ESPECIE = {
  Perro: ['Alimento completo para cachorro', 'Alimento senior, fácil de digerir'],
  Gato: ['Alimento completo para gatito', 'Alimento senior, fácil de digerir'],
  Conejo: ['Heno de pasto y pellets', 'Heno, pellets y verduras de hoja verde'],
  Cobayo: ['Heno de pasto, pellets y vitamina C', 'Heno y verduras ricas en vitamina C'],
  Hamster: ['Mezcla de semillas y pellets', 'Mezcla de semillas con proteína animal ocasional'],
  Ave: ['Pellets y semillas', 'Pellets, frutas y verduras']
}

export function tiposDieta(especie) {
  const e = normalizarEspecie(especie)
  const propias = DIETAS_ESPECIE[e] || []
  // Para conejo, cobayo, hámster y ave solo aplican las dietas propias + las clínicas generales
  return unicos(propias, DIETAS_BASE)
}

export const FRECUENCIAS = [
  '1 vez al día',
  '2 veces al día',
  '3 veces al día',
  '4 veces al día',
  '2 – 3 veces al día',
  'Libre acceso (a voluntad)'
]

const HORARIOS_POR_FRECUENCIA = {
  '1 vez al día': ['7:00 PM', '7:00 AM', '12:00 PM'],
  '2 veces al día': ['7:00 AM · 6:00 PM', '8:00 AM · 7:00 PM', '7:00 AM · 5:00 PM'],
  '3 veces al día': ['7:00 AM · 1:00 PM · 7:00 PM', '8:00 AM · 1:00 PM · 6:00 PM'],
  '4 veces al día': ['7:00 AM · 12:00 PM · 5:00 PM · 9:00 PM', '7:00 AM · 11:00 AM · 3:00 PM · 7:00 PM'],
  '2 – 3 veces al día': ['7:00 AM · 1:00 PM · 7:00 PM', '7:00 AM · 6:00 PM'],
  'Libre acceso (a voluntad)': ['Todo el día']
}

export function horariosPorFrecuencia(frecuencia) {
  return HORARIOS_POR_FRECUENCIA[frecuencia] || unicos(Object.values(HORARIOS_POR_FRECUENCIA))
}

export const ALERGIAS = [
  'Ninguna conocida', 'Pollo', 'Res', 'Pescado', 'Cerdo', 'Cordero', 'Huevo',
  'Lácteos', 'Trigo / gluten', 'Maíz', 'Soya', 'Colorantes y conservantes'
]

const SUPLEMENTOS_BASE = [
  'Ninguno', 'Omega-3', 'Probióticos', 'Multivitamínico', 'Glucosamina y condroitina',
  'Calcio y fósforo', 'Fibra', 'Complejo B', 'Hierro'
]

export function suplementos(especie) {
  const e = normalizarEspecie(especie)
  const extra = e === 'Gato' ? ['Taurina'] : e === 'Cobayo' ? ['Vitamina C'] : []
  return unicos(SUPLEMENTOS_BASE, extra)
}

const COMIDAS_BASE = [
  'Agua fresca siempre disponible',
  'Premios (máximo 10 % de las calorías diarias)'
]

const COMIDAS_ESPECIE = {
  Perro: [
    'Croqueta seca (porción diaria repartida)',
    'Alimento húmedo (lata o sobre)',
    'Pollo hervido sin piel',
    'Arroz blanco',
    'Verduras cocidas (zanahoria, calabacín)',
    'Pescado cocido (sardina o salmón)'
  ],
  Gato: [
    'Croqueta seca para gato',
    'Alimento húmedo (lata o sobre)',
    'Pollo o pavo hervido sin piel',
    'Pescado cocido (sin espinas)'
  ],
  Conejo: ['Heno de pasto (libre acceso)', 'Pellets', 'Verduras de hoja verde', 'Frutas como premio'],
  Cobayo: ['Heno de pasto (libre acceso)', 'Pellets con vitamina C', 'Verduras ricas en vitamina C (pimentón, perejil)', 'Frutas como premio'],
  Hamster: ['Mezcla de semillas', 'Pellets', 'Verduras frescas en poca cantidad', 'Proteína animal ocasional'],
  Ave: ['Pellets', 'Mezcla de semillas', 'Frutas', 'Verduras de hoja verde']
}

export function comidasPlan(especie) {
  const e = normalizarEspecie(especie)
  const propias = COMIDAS_ESPECIE[e] || unicos(Object.values(COMIDAS_ESPECIE))
  return unicos(propias, COMIDAS_BASE)
}

const DIAGNOSTICOS_BASE = [
  'Mantenimiento (adulto sano)',
  'Crecimiento (cachorro o gatito)',
  'Control de peso',
  'Sobrepeso u obesidad',
  'Bajo peso',
  'Sensibilidad digestiva',
  'Alergia o intolerancia alimentaria',
  'Soporte articular y cognitivo (senior)',
  'Enfermedad renal',
  'Enfermedad urinaria',
  'Diabetes',
  'Gestación y lactancia'
]

const DIAGNOSTICOS_POR_CATEGORIA = {
  Cirugía: ['Recuperación posquirúrgica'],
  Tratamiento: ['Recuperación durante tratamiento'],
  Vacuna: ['Mantenimiento (adulto sano)'],
  Consulta: []
}

export function diagnosticosNutricionales(categoria) {
  return unicos(DIAGNOSTICOS_POR_CATEGORIA[categoria] || [], DIAGNOSTICOS_BASE)
}

export const OBS_ALIMENTACION = [
  'Cambiar de alimento de forma gradual en 7 días',
  'Pesar cada 2 semanas',
  'Premios: máximo 10 % de las calorías diarias',
  'Dividir la ración en porciones pequeñas',
  'Evitar sobras de comida humana',
  'Ejercicio diario recomendado',
  'Control de peso mensual',
  'Revisión nutricional en 1 mes',
  'Consultar si hay vómito o diarrea por más de 48 horas'
]

// ── Notificaciones (plantillas de mensaje por tipo) ───────────
const MENSAJES = {
  General: [
    'Recuerda mantener tus datos de contacto actualizados.',
    'Tenemos un nuevo horario de atención. Consúltalo en PetCard.',
    'Gracias por confiar en PetCard para el cuidado de tu mascota.'
  ],
  cita: [
    'Recordatorio: tienes una cita próxima. Te esperamos.',
    'Tu cita fue confirmada. Por favor llega 10 minutos antes.',
    'Tu cita fue reprogramada. Revisa la nueva fecha en PetCard.',
    'Tu cita fue cancelada. Puedes agendar una nueva cuando quieras.'
  ],
  vacuna: [
    'Recordatorio: la próxima dosis de vacuna de tu mascota está próxima.',
    'La vacuna de tu mascota está vencida. Agenda un refuerzo.',
    'Se registró una nueva vacuna en el carnet de tu mascota.'
  ],
  alimentacion: [
    'Tu veterinario asignó un nuevo plan de alimentación para tu mascota.',
    'Tu plan de alimentación fue actualizado. Revísalo en PetCard.',
    'Es momento de la revisión nutricional de tu mascota.'
  ]
}

export const mensajesNotificacion = (tipo) => MENSAJES[tipo] || unicos(Object.values(MENSAJES))

// ── Todas las listas del plan de alimentación según especie, servicio y frecuencia ──
export function opcionesPlan(especie, categoriaServicio, frecuencia) {
  return {
    dietas: tiposDieta(especie),
    frecuencias: FRECUENCIAS,
    horarios: horariosPorFrecuencia(frecuencia),
    alergias: ALERGIAS,
    suplementos: suplementos(especie),
    comidas: comidasPlan(especie),
    diagnosticos: diagnosticosNutricionales(categoriaServicio),
    observaciones: OBS_ALIMENTACION
  }
}

// Si cambia la frecuencia y el horario elegido ya no corresponde, se limpia para volver a elegirlo
export function horarioCompatible(horario, frecuencia) {
  return !horario || horariosPorFrecuencia(frecuencia).includes(horario)
}
