<!-- Admin Alimentación - Documentación -->

# 📋 Admin Alimentación

## Descripción
Módulo de gestión de planes de alimentación para administradores de PetCard. Incluye funcionalidades de creación, edición, eliminación y filtrado de planes de alimentación.

## 📁 Estructura de Carpetas

```
admin-alimentacion/
├── admin-alimentacion.js  (Funciones y eventos de botones)
└── Este generado automáticamente
```

```
../css/admin-alimentacion/
├── styles.css  (Estilos personalizados con efectos hermosos)
```

## ✨ Funcionalidades Implementadas

### 1. **Botones Principales**
- **Generar Datos**: Exporta el listado actual a PDF y descarga para imprimir
- **Nuevo Plan**: Abre un formulario para crear un nuevo plan de alimentación

### 2. **Botones de Acción (Por Mascota)**
- **Editar**: Abre el formulario de edición para modificar el plan
- **Eliminar**: Elimina el plan con confirmación y animación de salida

### 3. **Botones de Perfil**
- **Ver Perfil**: Redirige a la página de perfil del administrador
- **Cerrar Sesión**: Cierra la sesión actual con confirmación

### 4. **Búsqueda y Filtrado**
- **Buscador**: Filtra planes por nombre de mascota
- **Filtro de Estado**: Filtra por estado (Todos, Activo, Pendiente)

### 5. **Exportar PDF**
- **Generar Datos** ahora genera y descarga un PDF imprimible con todos los planes visibles


## 🎨 Efectos Visuales

### Animaciones de Botones
- **Ripple Effect**: Efecto de onda al hacer clic
- **Hover State**: Se elevan al pasar el mouse
- **Active State**: Se comprimen al presionar
- **Transiciones Suaves**: Todas tienen transiciones fluidas

### Animaciones de Tarjetas
- **Slide In**: Las tarjetas se deslizan suavemente al cargar
- **Hover Lift**: Se elevan al pasar el mouse
- **Delete Animation**: Giro y desvanecimiento al eliminar

### Notificaciones
- **Toast Notifications**: Mensajes notificaciones en la esquina superior derecha
- **Tipos**: Success (verde), Error (rojo), Warning (naranja), Info (azul)
- **Auto-dismiss**: Se cierran automáticamente después de 3 segundos

## 📝 Eventos por Botón

```javascript
// Generar Datos
btn-generar → generarDatos(event)
  └─ Muestra notificación de carga
  └─ Después de 1.5s muestra éxito

// Nuevo Plan
btn-nuevo-plan → abrirNuevoPlan(event)
  └─ Muestra alerta (reemplazar con modal)
  └─ Notifica éxito

// Editar Plan
btn-editar-{mascota} → editarPlan(mascota, event)
  └─ Efecto ripple
  └─ Abre formulario de edición
  └─ Notifica actualización

// Eliminar Plan
btn-eliminar-{mascota} → eliminarPlan(mascota, event)
  └─ Pide confirmación
  └─ Anima salida de tarjeta
  └─ Remueve elemento del DOM
  └─ Notifica eliminación

// Perfil Admin
btn-perfil-admin → verPerfil(event)
  └─ Redirige a admin-perfil.html

// Cerrar Sesión
btn-cerrar-sesion → cerrarSesion(event)
  └─ Confirma cierre de sesión
  └─ Limpia localStorage
  └─ Redirige a login-admin.html
```

## 🎯 Cómo Utilizarlo

### En HTML
```html
<link rel="stylesheet" href="../css/admin-alimentacion/styles.css"/>
<script src="../js/admin-alimentacion/admin-alimentacion.js"></script>
```

### Personalizar Funciones
Edita `admin-alimentacion.js` según tus necesidades:

```javascript
// Ejemplo: Cambiar comportamiento de Nuevo Plan
function abrirNuevoPlan(event) {
  efecto_click(event);
  // Tu código aquí
}
```

## 🔧 Personalización

### Colores
Modifica en `css/admin-alimentacion/styles.css`:
```css
.btn-primary { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); }
.btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.btn-danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
```

### Velocidad de Animaciones
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  /* Cambia 0.3s */
```

### Notificaciones
Personaliza timing en `admin-alimentacion.js`:
```javascript
setTimeout(() => notif.remove(), 3000);  // 3 segundos
```

## 📱 Responsive
- Mobile: Botones apilados verticalmente
- Tablet: Dos columnas
- Desktop: Layout optimizado

## 🐛 Debugging

Abre la consola del navegador (F12) para ver:
```javascript
console.log('Datos generados al ' + new Date().toLocaleString());
```

## 📦 Dependencias
- HTML: admin-alimentacion.html
- CSS: shared.css, admin-pages.css, admin-alimentacion/styles.css
- JS: auth.js, script.js, admin-alimentacion/admin-alimentacion.js

## ✅ Checklist de Implementación
- [x] Crear carpeta admin-alimentacion
- [x] Implementar JavaScript con eventos
- [x] Agregar estilos hermosos
- [x] Crear notificaciones
- [x] Animaciones de botones
- [x] Animaciones de tarjetas
- [x] Filtrado y búsqueda
- [x] Efectos hover y active
- [x] Responsive design

---

**Últimas actualizaciones**: Marzo 2026
**Desarrollador**: Sistema Automatizado PetCard
