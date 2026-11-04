
## 1. Visión general

**PETCARD** es una plataforma web que digitaliza la información de las mascotas y de sus dueños en la veterinaria **GRAN CAN**. Se usa desde el navegador del computador o del celular, sin instalar nada, y reúne en un solo lugar lo que hoy está disperso en papeles, libretas y chats de WhatsApp:

- La ficha de cada mascota (datos, alergias, fotografía).
- Su historial de servicios (consultas, baños, cortes, desparasitaciones).
- Su carnet de vacunas, con alertas para los refuerzos.
- Su alimentación y preferencias.
- Sus citas, que el cliente agenda en línea.
- Las notificaciones automáticas para recordar lo importante.

El sistema tiene dos caras: un **portal para el cliente**, donde el dueño consulta y gestiona lo suyo, y un **panel administrativo** para el personal de la veterinaria.

**En una frase:** PETCARD convierte el desorden de papeles y mensajes en un historial único, ordenado y consultable, y se encarga de recordarle al dueño lo que no debe olvidar.

## 2. El problema que resuelve

### 2.1 Situación actual

Mediante observación directa en el negocio y entrevistas con el personal y con dueños de mascotas, el equipo identificó que la veterinaria trabaja con registros manuales: agendas físicas, carpetas, libretas y conversaciones de WhatsApp. Cada dato vive en un lugar distinto y depende de que alguien lo anote y lo encuentre a tiempo.

### 2.2 Consecuencias detectadas

| Problema | Qué ocurre en la práctica | Quién lo sufre |
|---|---|---|
| Citas perdidas o retrasadas | Una cita anotada en papel o en un chat se cruza, se olvida o no se confirma | Veterinaria y cliente |
| Vacunas olvidadas | El dueño no recuerda cuándo toca el refuerzo ni conserva el comprobante | Mascota y dueño |
| Errores de registro | Precios, tratamientos y datos transcritos a mano se anotan mal | Veterinaria |
| Información difícil de encontrar | Buscar un historial implica revisar carpetas físicas; hay datos duplicados | Veterinario y recepción |
| Servicio poco personalizado | Sin historial consolidado, es difícil recomendar o hacer seguimiento | Veterinaria y cliente |
| Baja fidelización | Si el cliente se siente desatendido o desinformado, tiene menos razones para volver | Veterinaria |

### 2.3 Por qué importa

Una vacuna olvidada es un riesgo de salud para la mascota. Una cita perdida es un ingreso perdido y un cliente molesto. Un historial incompleto limita la calidad del diagnóstico. Son problemas pequeños por separado, pero juntos frenan el crecimiento y la calidad del servicio.

## 3. Objetivo del proyecto

**Objetivo general:** desarrollar un sistema de información para la veterinaria GRAN CAN que permita gestionar digitalmente los datos clínicos y administrativos de las mascotas y sus dueños, con módulos para registrar, consultar y actualizar información, y para programar, confirmar y dar seguimiento a citas y servicios.

**Resultado esperado:** que la información esté centralizada, que las citas y vacunas se gestionen con recordatorios automáticos y que el personal dedique menos tiempo a tareas manuales y más a atender.

## 4. La solución, explicada módulo por módulo

### 4.1 Registro de mascotas

Cada mascota tiene un perfil digital con nombre, especie, raza, edad, peso, alergias, características físicas, historial médico y fotografía, ligado a su dueño.

**Para qué sirve:** que cualquier persona autorizada tenga la ficha completa en segundos, sin buscar en carpetas.

**Quién lo usa:** el cliente registra y edita sus propias mascotas; el personal puede gestionarlas todas.

### 4.2 Historial de servicios

Registra cada atención recibida (consulta, baño, corte, desparasitación) con fecha, responsable, observaciones y estado.

**Para qué sirve:** dar seguimiento a la salud y al cuidado de la mascota en el tiempo, y evitar repetir o saltarse procedimientos.

### 4.3 Carnet digital de vacunas

Guarda cada vacuna con su fecha, lote, profesional que la aplicó y comprobante adjunto, y calcula la próxima dosis para activar una alerta.

**Para qué sirve:** reemplazar el carnet de papel que se pierde o se olvida en casa. El dueño lo consulta desde su celular y recibe aviso antes de cada refuerzo.

### 4.4 Alimentación y preferencias

Registra marca de alimento, tipo de dieta, frecuencia de compra y alergias alimenticias, y avisa cuándo toca renovar.

**Para qué sirve:** cuidar la nutrición de la mascota, evitar alimentos con los que tiene alergia y facilitar recomendaciones personalizadas.

### 4.5 Agendamiento de citas en línea

El cliente elige mascota y servicio, ve los horarios disponibles en tiempo real y reserva. Recibe confirmación automática y un recordatorio previo. El administrador puede aprobar, reprogramar o cancelar.

**Para qué sirve:** eliminar las llamadas y mensajes de ida y vuelta, y reducir cruces y olvidos de agenda.

### 4.6 Notificaciones automáticas

Envía avisos de vacunas pendientes, citas próximas, renovación de alimento y hasta el cumpleaños de la mascota. Según el estudio, el canal más valorado es WhatsApp, seguido de la aplicación móvil y el correo.

**Para qué sirve:** que el dueño no tenga que acordarse de todo; el sistema lo hace por él.

### 4.7 Perfil del cliente

Permite al dueño ver y editar sus datos y consultar el historial completo de sus mascotas.

### 4.8 Panel administrativo

Concentra la gestión de usuarios, mascotas, servicios, citas, alimentación y vacunas, además de reportes con indicadores del negocio. Es el único rol que puede crear otros administradores.

## 5. Quiénes lo usan y qué ve cada uno

| Rol | Qué puede hacer | Qué no puede hacer |
|---|---|---|
| **Cliente (dueño)** | Gestionar sus mascotas, agendar y cancelar citas, ver historial, carnet y alimentación, recibir notificaciones | Ver datos de otros clientes o de sus mascotas |
| **Médico veterinario** | Actualizar historiales, registrar vacunas, adjuntar documentos (radiografías, exámenes), atender sus citas | Administrar usuarios del sistema |
| **Auxiliar veterinario** | Apoyar el registro de servicios, coordinar citas y notificaciones | Acciones administrativas globales |
| **Administrador** | Control total: usuarios, mascotas, servicios, vacunas, alimentación, citas y reportes | — |

El control por roles protege la privacidad: cada persona ve solo lo que necesita para su trabajo.

## 6. Qué respalda esta propuesta: la investigación

El proyecto no parte de suposiciones. Se levantaron los requisitos con cinco técnicas complementarias:

| Técnica | Qué se hizo | Hallazgo principal |
|---|---|---|
| Encuestas | Cuestionario en línea a dueños de mascotas | Lo más valorado: historial digital, recordatorios y agendamiento |
| Entrevistas | Guion de 12 preguntas con personal y dueños | Piden registro completo, carnet con lote y comprobante, y poder adjuntar documentos clínicos |
| Observación | Ficha de observación en el negocio | Se confirmaron citas perdidas, olvidos de vacunas y errores manuales |
| Investigación documental | Análisis de sistemas y fuentes existentes | Buenas prácticas: nube, recordatorios, API y crecimiento modular |
| Grupos focales | Sesión con 6 a 8 dueños | Quieren WhatsApp o app, rapidez y uso desde el celular |

### Resultados de la encuesta

| Función | Valoración |
|---|---|
| Historial clínico digital accesible | 85 % |
| Recordatorios automáticos de vacunas y citas | 80 % |
| Agendamiento en línea con horarios en tiempo real | 75 % |
| Carnet digital de vacunas | 70 % |
| Registro de alimentación y alergias | 55 % |

**Canal preferido de notificación:** WhatsApp 60 %, aplicación móvil 30 %, correo electrónico 10 %.

**Lectura:** los clientes piden justo lo que PETCARD ofrece, y en el orden de prioridad que el sistema respeta. La función menos valorada (alimentación) sigue siendo relevante para una atención personalizada, pero no es el motor de adopción.

## 7. Beneficios

### Para el negocio

- Información centralizada, sin duplicados y siempre disponible.
- Menos citas perdidas y mejor ocupación de la agenda.
- Menos errores de registro y trabajo administrativo más rápido.
- Reportes para tomar decisiones con datos.
- Mejor fidelización gracias a un servicio más personalizado y constante.

### Para el dueño de la mascota

- Carnet e historial siempre a la mano, desde el celular.
- Recordatorios que evitan olvidar vacunas, citas o compras de alimento.
- Citas sin llamadas ni esperas.
- Recomendaciones basadas en la historia real de su mascota.

### Para el veterinario

- Historial completo antes de la consulta.
- Posibilidad de adjuntar radiografías y exámenes al perfil.
- Agenda ordenada con alertas.


## 8. Diferenciadores clave

1. **Diseñado desde el negocio real.** Nació de encuestas, entrevistas, observación en la veterinaria y grupos focales, no de una plantilla genérica. Por eso cubre problemas reales, como las vacunas olvidadas y las citas perdidas.
2. **Pensado para el celular.** El diseño responsive se adapta a computador, tablet y teléfono. Fue la expectativa más repetida por los dueños.
3. **Notificaciones por el canal que la gente usa.** Prioriza WhatsApp y la app móvil, que son los canales preferidos según la encuesta.
4. **Información centralizada y respaldada.** Todo vive en la nube con respaldo automático y acceso permanente, así que no depende de una carpeta ni de un computador.
5. **Control por roles.** Cada usuario ve solo lo que le corresponde, lo que protege los datos de clientes y mascotas.
6. **Crecimiento por módulos.** La arquitectura permite añadir funciones después (por ejemplo, ventas o collares con código QR, que hoy quedan fuera) sin rehacer el sistema.

## 9. Alcance

**Incluido:** registro de mascotas, historial de servicios, carnet digital de vacunas, módulo de alimentación, notificaciones, perfil del cliente, panel administrativo y agendamiento de citas.

**No incluido en esta versión:** ventas, inventarios comerciales, collares con código QR, módulos para tiendas de mascotas y comercio electrónico.

Dejar claras las exclusiones evita malentendidos y permite planear mejoras futuras.

## 10. Cómo está construido (en lenguaje simple)

- **Modelo cliente/servidor:** el usuario entra desde un navegador (Chrome, Firefox o Edge) en Windows, Android o iOS; un servidor central atiende las solicitudes de muchos usuarios a la vez.
- **Base de datos relacional** (MySQL o equivalente) donde se guardan usuarios, mascotas, citas, vacunas y demás registros, y **almacenamiento en la nube** para fotos y documentos.
- **API** para comunicar módulos entre sí y, a futuro, con otros servicios.
- **Seguridad:** contraseñas cifradas, acceso limitado por rol y conexión mediante HTTPS.
- **Confiabilidad:** disponibilidad objetivo 24/7, copias de respaldo y recuperación automática.
- **Desempeño objetivo:** respuestas en menos de 3 segundos y al menos 100 usuarios simultáneos.
- **Requisitos mínimos del equipo del usuario:** conexión a internet, navegador actualizado y 2 GB de memoria.

## 11. Cronograma de implementación (propuesta)

| Fase | Duración | Actividades | Resultado |
|---|---|---|---|
| Mes 1 | Semanas 1-2 | Validación de requerimientos, configuración del entorno y capacitación inicial | Equipo alineado y sistema configurado |
| Mes 1 | Semanas 3-4 | Carga de datos existentes (clientes, mascotas, vacunas) y configuración de servicios | Información histórica dentro del sistema |
| Mes 2 | Semanas 1-2 | Pruebas piloto con usuarios reales y ajustes | Sistema validado en condiciones reales |
| Mes 2 | Semanas 3-4 | Despliegue completo y acompañamiento | Operación completa |

**Tiempo total propuesto:** 8 semanas. **[CONFIRMAR con el cliente]**

## 12. Cómo se medirá el éxito (propuesta)

Para demostrar el valor del sistema conviene medir antes y después de la puesta en marcha:

| Indicador | Cómo medirlo |
|---|---|
| Citas perdidas o canceladas sin aviso | Conteo mensual antes y después |
| Vacunas atrasadas | Porcentaje de mascotas con refuerzo vencido |
| Tiempo para encontrar un historial | Cronometrar una muestra de búsquedas |
| Clientes que usan el portal | Cuentas activas y citas agendadas en línea |
| Satisfacción del cliente | Encuesta breve a los 2 meses |



## 13. Riesgos y cómo se manejan

| Riesgo | Mitigación |
|---|---|
| Baja adopción del personal | Capacitación por rol y acompañamiento inicial |
| Datos históricos incompletos | Plantilla de captura y revisión conjunta |
| Fallas en notificaciones | Canal alterno por correo y monitoreo de envíos |
| Caída del servicio | Respaldos y recuperación automática |
| Cambio de requisitos | Reunión de alineación inicial y desarrollo por módulos |

## 14. Próximos pasos

1. **Reunión de alineación (semana 1):** validar requerimientos específicos y resolver dudas técnicas y comerciales.
2. **Aprobación de la propuesta (semana 2):** firma del acuerdo y programación del inicio.
3. **Inicio de implementación (semana 3):** reunión de arranque con el equipo clave y comienzo de la migración de datos.

## 15. Conclusión

PETCARD no es solo un software: es una forma de organizar el cuidado de las mascotas. Reemplaza papeles, libretas y chats por un sistema único, seguro y fácil de usar, y responde a los tres problemas que la investigación dejó más claros: información desordenada, olvidos de vacunas y citas, y pérdida de documentos.

Para la veterinaria GRAN CAN significa menos trabajo manual, menos errores y clientes mejor atendidos. Para los dueños, significa tener la salud de su mascota al alcance del celular y no tener que acordarse de todo. Y para el negocio, una base sólida que puede crecer con nuevos módulos.

## 16. Contacto

**Equipo PETCARD – SENA ADSO**
- Diego Sebastian Guerrero Niño (Backend e integración): diego.guerrero.1747@gmail.com
- Carlos Ferney Mosquera Murillo (QA y pruebas): carlosmorquerauwu@gmail.com
- Yuber Alexander Franco Cuetochambo (Base de datos): yuberfranco4@gmail.com
- Laura Valentina Marroquin Rodriguez (Frontend y UX/UI): lauramarro2018@gmail.com
- Juan José Pinilla Marulanda (Análisis de requerimientos): Juanjosepinilla39@gmail.com