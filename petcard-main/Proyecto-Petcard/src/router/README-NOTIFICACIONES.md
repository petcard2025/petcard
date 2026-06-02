# API de Notificaciones - PetCard

Documentación completa de la API de Notificaciones para el sistema PetCard.

## 📋 Descripción

Este archivo API (`notificaciones.api.js`) proporciona una interfaz completa y bien documentada para interactuar con el sistema de notificaciones de PetCard. Incluye métodos para crear, leer, actualizar y eliminar notificaciones, así como operaciones en lote y búsquedas avanzadas.

## 🚀 Inicio Rápido

### 1. Importar el API en tu componente Vue

```javascript
import { notificacionesAPI } from '@/router/notificaciones.api.js'
// O si prefieres importar el default export:
// import notificacionesAPI from '@/router/notificaciones.api.js'
```

### 2. Usar en un componente Vue

```vue
<script>
import { notificacionesAPI } from '@/router/notificaciones.api.js'

export default {
  name: 'MisNotificaciones',
  data() {
    return {
      notificaciones: [],
      cargando: false
    }
  },
  methods: {
    async cargarNotificaciones() {
      try {
        this.cargando = true
        this.notificaciones = await notificacionesAPI.obtener()
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
      } finally {
        this.cargando = false
      }
    },
    async obtenerNotificacionesUsuario(idUsuario) {
      const notifs = await notificacionesAPI.obtenerPorUsuario(idUsuario)
      return notifs
    }
  },
  mounted() {
    this.cargarNotificaciones()
  }
}
</script>
```

## 📚 Métodos Disponibles

### GET - Obtener Notificaciones

#### `obtener()`
Obtiene todas las notificaciones del sistema.

**Endpoint:** `GET /api/notificaciones`

```javascript
const todasLasNotificaciones = await notificacionesAPI.obtener()
```

---

#### `obtenerPorUsuario(idUsuario)`
Obtiene todas las notificaciones de un usuario específico.

**Endpoint:** `GET /api/notificaciones/usuario/:idUsuario`

**Parámetros:**
- `idUsuario` (number): ID del usuario

```javascript
const notificacionesUsuario = await notificacionesAPI.obtenerPorUsuario(1)
```

---

#### `obtenerPorId(id)`
Obtiene los detalles de una notificación específica.

**Endpoint:** `GET /api/notificaciones/:id`

**Parámetros:**
- `id` (number): ID de la notificación

```javascript
const notificacion = await notificacionesAPI.obtenerPorId(1)
```

---

#### `obtenerNoLeidas(idUsuario)`
Obtiene las notificaciones no leídas de un usuario.

**Endpoint:** `GET /api/notificaciones/usuario/:idUsuario/no-leidas`

**Parámetros:**
- `idUsuario` (number): ID del usuario

```javascript
const noLeidas = await notificacionesAPI.obtenerNoLeidas(1)
console.log(`Tienes ${noLeidas.length} notificaciones sin leer`)
```

---

#### `obtenerPorTipo(tipo)`
Obtiene notificaciones de un tipo específico.

**Endpoint:** `GET /api/notificaciones/tipo/:tipo`

**Parámetros:**
- `tipo` (string): Tipo de notificación
  - `"Recordatorio"`
  - `"Confirmación"`
  - `"Alerta"`

```javascript
const recordatorios = await notificacionesAPI.obtenerPorTipo('Recordatorio')
```

---

#### `obtenerPorCanal(canal)`
Obtiene notificaciones de un canal específico.

**Endpoint:** `GET /api/notificaciones/canal/:canal`

**Parámetros:**
- `canal` (string): Canal de envío
  - `"Correo"`
  - `"SMS"`
  - `"Sistema"`

```javascript
const notificacionesEmail = await notificacionesAPI.obtenerPorCanal('Correo')
```

---

#### `obtenerPorRangoFechas(fechaInicio, fechaFin)`
Obtiene notificaciones dentro de un rango de fechas.

**Endpoint:** `GET /api/notificaciones/fecha/rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD`

**Parámetros:**
- `fechaInicio` (string): Fecha inicial en formato YYYY-MM-DD
- `fechaFin` (string): Fecha final en formato YYYY-MM-DD

```javascript
const notificacionesMes = await notificacionesAPI.obtenerPorRangoFechas(
  '2026-06-01', 
  '2026-06-30'
)
```

---

#### `obtenerEstadisticas()`
Obtiene estadísticas generales del sistema de notificaciones.

**Endpoint:** `GET /api/notificaciones/estadisticas`

```javascript
const stats = await notificacionesAPI.obtenerEstadisticas()
// Retorna: { total, leidas, no_leidas, por_tipo, por_canal }
```

---

#### `obtenerEstadisticasUsuario(idUsuario)`
Obtiene estadísticas de notificaciones de un usuario.

**Endpoint:** `GET /api/notificaciones/usuario/:idUsuario/estadisticas`

**Parámetros:**
- `idUsuario` (number): ID del usuario

```javascript
const statsUsuario = await notificacionesAPI.obtenerEstadisticasUsuario(1)
```

---

### POST - Crear Notificaciones

#### `crear(datos)`
Crea una nueva notificación.

**Endpoint:** `POST /api/notificaciones`

**Parámetros (objeto datos):**
- `ID_usuario` (number, **requerido**): ID del usuario
- `ID_sistemaCorreo` (number, **requerido**): ID del sistema de correo
- `Mensaje` (string, **requerido**): Contenido del mensaje
- `Tipo` (string, **requerido**): Tipo de notificación (Recordatorio, Confirmación, Alerta)
- `Canal` (string, **requerido**): Canal de envío (Correo, SMS, Sistema)
- `Fecha_envio` (string, opcional): Fecha de envío (ISO 8601 format)

```javascript
const nuevaNotificacion = await notificacionesAPI.crear({
  ID_usuario: 1,
  ID_sistemaCorreo: 1,
  Mensaje: 'Recordatorio: Tu mascota Max necesita vacunarse',
  Tipo: 'Recordatorio',
  Canal: 'Correo'
})
```

---

#### `crearMultiples(notificaciones)`
Crea múltiples notificaciones en una sola petición.

**Endpoint:** `POST /api/notificaciones/bulk`

**Parámetros:**
- `notificaciones` (array): Array de objetos notificación

```javascript
const resultado = await notificacionesAPI.crearMultiples([
  {
    ID_usuario: 1,
    ID_sistemaCorreo: 1,
    Mensaje: 'Notificación 1',
    Tipo: 'Recordatorio',
    Canal: 'Correo'
  },
  {
    ID_usuario: 2,
    ID_sistemaCorreo: 1,
    Mensaje: 'Notificación 2',
    Tipo: 'Confirmación',
    Canal: 'SMS'
  }
])
```

---

### PUT - Actualizar Notificaciones

#### `actualizar(id, datos)`
Actualiza una notificación existente.

**Endpoint:** `PUT /api/notificaciones/:id`

**Parámetros:**
- `id` (number): ID de la notificación
- `datos` (object): Campos a actualizar

```javascript
const notificacionActualizada = await notificacionesAPI.actualizar(1, {
  Mensaje: 'Mensaje actualizado',
  Tipo: 'Confirmación',
  Canal: 'SMS'
})
```

---

### PATCH - Operaciones Parciales

#### `marcarComoLeida(id)`
Marca una notificación como leída.

**Endpoint:** `PATCH /api/notificaciones/:id/marcar-como-leida`

**Parámetros:**
- `id` (number): ID de la notificación

```javascript
await notificacionesAPI.marcarComoLeida(1)
```

---

#### `marcarMultiplesComoLeidas(ids)`
Marca múltiples notificaciones como leídas.

**Endpoint:** `PATCH /api/notificaciones/marcar-como-leidas/bulk`

**Parámetros:**
- `ids` (array): Array de IDs de notificaciones

```javascript
await notificacionesAPI.marcarMultiplesComoLeidas([1, 2, 3, 4, 5])
```

---

### DELETE - Eliminar Notificaciones

#### `eliminar(id)`
Elimina una notificación específica.

**Endpoint:** `DELETE /api/notificaciones/:id`

**Parámetros:**
- `id` (number): ID de la notificación

```javascript
await notificacionesAPI.eliminar(1)
```

---

#### `eliminarMultiples(ids)`
Elimina múltiples notificaciones.

**Endpoint:** `DELETE /api/notificaciones/bulk`

**Parámetros:**
- `ids` (array): Array de IDs de notificaciones

```javascript
await notificacionesAPI.eliminarMultiples([1, 2, 3])
```

---

#### `eliminarTodas(idUsuario)`
Elimina todas las notificaciones de un usuario.

**Endpoint:** `DELETE /api/notificaciones/usuario/:idUsuario/todas`

**Parámetros:**
- `idUsuario` (number): ID del usuario

```javascript
await notificacionesAPI.eliminarTodas(1)
```

---

## 🧪 Pruebas en Postman

### Importar Colección

1. Abre Postman
2. Click en "Import" (arriba a la izquierda)
3. Selecciona "File" y elige: `PetCard-Notificaciones-Postman.json`
4. ¡La colección se importará con todos los endpoints!

### Configurar Variables de Entorno

Para mayor flexibilidad, configura estas variables en Postman:

| Variable | Valor por defecto |
|----------|------------------|
| `base_url` | `http://localhost:3001/api` |
| `usuario_id` | `1` |
| `notificacion_id` | `1` |

Luego puedes usar `{{base_url}}`, `{{usuario_id}}`, `{{notificacion_id}}` en las URLs.

### Ejemplos de Prueba

#### 1. Crear una notificación

```
POST http://localhost:3001/api/notificaciones
Content-Type: application/json

{
  "ID_usuario": 1,
  "ID_sistemaCorreo": 1,
  "Mensaje": "Tu cita veterinaria está confirmada para mañana",
  "Tipo": "Confirmación",
  "Canal": "Correo"
}
```

#### 2. Obtener notificaciones de un usuario

```
GET http://localhost:3001/api/notificaciones/usuario/1
```

#### 3. Marcar como leída

```
PATCH http://localhost:3001/api/notificaciones/1/marcar-como-leida
```

#### 4. Obtener notificaciones no leídas

```
GET http://localhost:3001/api/notificaciones/usuario/1/no-leidas
```

---

## 📊 Estructura de Datos

### Objeto Notificación

```json
{
  "ID_notificacion": 1,
  "ID_usuario": 1,
  "ID_sistemaCorreo": 1,
  "Mensaje": "Recordatorio: Tu mascota Max necesita ser vacunado pronto",
  "Tipo": "Recordatorio",
  "Canal": "Correo",
  "Fecha_envio": "2026-02-18T21:40:19.000Z",
  "Leida": false,
  "Fecha_lectura": null
}
```

### Tipos Válidos

- **Tipo**: `"Recordatorio"`, `"Confirmación"`, `"Alerta"`
- **Canal**: `"Correo"`, `"SMS"`, `"Sistema"`

---

## ⚙️ Configuración

### Variables de Entorno

Si necesitas usar un servidor diferente, configura la variable de entorno en tu `.env`:

```env
VITE_API_URL=http://mi-servidor:3001/api
```

Por defecto usa: `http://localhost:3001/api`

---

## 🔧 Manejo de Errores

El API maneja automáticamente errores y los propaga como excepciones. Siempre envuelve las llamadas en try-catch:

```javascript
try {
  const notificaciones = await notificacionesAPI.obtenerPorUsuario(1)
  console.log(notificaciones)
} catch (error) {
  console.error('Error al obtener notificaciones:', error.message)
  // Mostrar mensaje al usuario
}
```

---

## 📝 Casos de Uso Comunes

### 1. Mostrar número de notificaciones no leídas

```javascript
async function obtenerContadorNoLeidas(idUsuario) {
  const noLeidas = await notificacionesAPI.obtenerNoLeidas(idUsuario)
  return noLeidas.length
}
```

### 2. Crear notificación de recordatorio automático

```javascript
async function crearRecordatorioVacuna(idUsuario, nombreMascota) {
  await notificacionesAPI.crear({
    ID_usuario: idUsuario,
    ID_sistemaCorreo: 1,
    Mensaje: `Recordatorio: Es hora de vacunar a ${nombreMascota}`,
    Tipo: 'Recordatorio',
    Canal: 'Correo'
  })
}
```

### 3. Marcar todas las notificaciones de una categoría como leídas

```javascript
async function marcarRecordatoriosComoLeidos() {
  const recordatorios = await notificacionesAPI.obtenerPorTipo('Recordatorio')
  const ids = recordatorios.map(r => r.ID_notificacion)
  await notificacionesAPI.marcarMultiplesComoLeidas(ids)
}
```

### 4. Obtener resumen del día

```javascript
async function obtenerResumenDelDia() {
  const hoy = new Date().toISOString().split('T')[0]
  const notificacionesHoy = await notificacionesAPI.obtenerPorRangoFechas(hoy, hoy)
  return {
    total: notificacionesHoy.length,
    por_tipo: agruparPorTipo(notificacionesHoy),
    por_canal: agruparPorCanal(notificacionesHoy)
  }
}
```

---

## 🛠️ Ubicación en el Proyecto

- **Archivo API:** `src/router/notificaciones.api.js`
- **Colección Postman:** `src/router/PetCard-Notificaciones-Postman.json`
- **Documentación:** `src/router/README-NOTIFICACIONES.md` (este archivo)

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica que el servidor backend esté corriendo en `http://localhost:3001`
2. Revisa los logs del navegador (F12 > Consola)
3. Abre Postman y prueba directamente los endpoints
4. Verifica que los IDs de usuario y notificación existan en la base de datos

---

**Versión:** 1.0.0  
**Última actualización:** Junio 2026
