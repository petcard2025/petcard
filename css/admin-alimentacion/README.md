# 🎨 Estilos Admin Alimentación

## Descripción
Archivo CSS especializado con efectos visuales hermosos para los botones y elementos de interacción del panel de administración de alimentación.

## 📋 Componentes Estilizados

### 1. **Botones**
- `btn-primary`: Azul (acciones principales)
- `btn-success`: Verde (acciones positivas)
- `btn-danger`: Rojo (acciones destructivas)
- `btn-secondary`: Gris (acciones secundarias)
- `btn-outline-white`: Blanco con borde (en navbar)

### 2. **Estados de Botones**
- `:hover` - Se elevan con sombra aumentada
- `:active` - Se comprimen ligeramente
- `:focus` - Muestra borde de enfoque
- Ripple effect - Efecto de onda al presionar

### 3. **Animaciones Principales**

#### Botones
```css
slideInUp       /* Animación de entrada del grid */
cardSlideIn     /* Animación de entrada de tarjeta */
cardEliminar    /* Animación de eliminación con rotación */
```

#### Notificaciones
```css
notifSlideIn    /* Slide de notificaciones desde derecha */
fadeInSmooth    /* Fade suave */
```

#### Filtros
```css
searchWrapFocus /* Cambio de estado del buscador */
filterSelectFocus /* Cambio de estado del select */
```

## 🎯 Clases Disponibles

```css
.btn                /* Clase base */
.btn-primary        /* Azul */
.btn-success        /* Verde */
.btn-danger         /* Rojo */
.btn-secondary      /* Gris */
.btn-outline-white  /* Blanco transparente */
.btn-sm             /* Pequeño */

.admin-card         /* Tarjeta principal */
.admin-card:hover   /* Efecto hover */

.badge-green        /* Badge estado activo */
.badge-yellow       /* Badge estado pendiente */

.notificacion               /* Clase base */
.notificacion-success       /* Verde */
.notificacion-error         /* Rojo */
.notificacion-warning       /* Naranja */
.notificacion-info          /* Azul */
```

## 🎨 Paleta de Colores

| Color | Uso | Valor |
|-------|-----|-------|
| Azul | Primary, Info | #2563eb |
| Verde | Success, Activo | #10b981 |
| Rojo | Danger, Error | #ef4444 |
| Naranja | Warning | #f59e0b |
| Gris | Secondary | #6b7280 |
| Blanco | Fondo | #ffffff |

## ⚡ Efectos Especiales

### Ripple Effect
- Efecto de onda al presionar botón
- Animación de 0.6 segundos
- Se expande desde el punto de clic

### Gradient Backgrounds
Todos los botones tienen gradientes lineales 135deg:
```css
linear-gradient(135deg, color1 0%, color2 100%)
```

### Shadow Elevation
```css
0 12px 24px rgba(0,0,0,0.15)  /* Hover */
0 4px 12px rgba(0,0,0,0.1)    /* Normal */
```

### Backdrop Filter
Barra de búsqueda con efecto blur:
```css
backdrop-filter: blur(10px);
```

## 📱 Media Queries

### Pantalla grande (>768px)
- Botones normales
- Layout de 2 columnas
- Notificaciones a la derecha

### Pantalla pequeña (<768px)
- Botones más pequeños
- Botones apilados verticalmente
- Notificaciones a ancho completo
- Font size reducido

## 🔧 Personalización

### Cambiar Color Primario
```css
.btn-primary {
  background: linear-gradient(135deg, #tu_color 0%, #tu_color_oscuro 100%);
}

.btn-primary:hover {
  box-shadow: 0 12px 24px rgba(tu_color, 0.35);
}
```

### Cambiar Velocidad de Animación
```css
.btn {
  transition: all 0.3s ease;  /* Cambia 0.3s a tu valor */
}
```

### Cambiar Tamaño de Botones
```css
.btn {
  padding: 10px 16px;  /* Aumenta o disminuye */
  font-size: 0.95rem;  /* Ajusta tamaño de fuente */
}
```

## 📚 Ejemplos de Uso

### Botón Principal con Efecto
```html
<button class="btn btn-primary btn-sm">Generar Datos</button>
```

### Tarjeta con Animación
```html
<div class="admin-card">
  <!-- Contenido -->
</div>
```

### Notificación
```javascript
mostrarNotificacion('Acción completada', 'success');
```

## 🎬 Duración de Animaciones

| Animación | Duración |
|-----------|----------|
| Hover | 0.3s |
| Click | 0.2s |
| Ripple | 0.6s |
| Notif In | 0.4s |
| Card Enter | 0.5s |
| Card Delete | 0.4s |

## 🔍 Debugging CSS

Habilita outline para ver límites:
```css
* {
  outline: 1px solid red;
}
```

Verifica animaciones en DevTools:
1. Abre Chrome DevTools (F12)
2. Abre Inspector
3. Ve a Animations
4. Haz clic en elementos

## ✅ Validación CSS

El CSS pasa validación W3C con:
- Prefijos de navegador incluidos
- Bez-ier curves optimizadas
- Gradientes compatibles

## 📦 Importación

En tu HTML:
```html
<link rel="stylesheet" href="../css/admin-alimentacion/styles.css">
```

## 🎯 Prioridad de Cascada

1. Estilos inline (highest)
2. admin-alimentacion/styles.css
3. admin-pages.css
4. shared.css
5. Estilos del navegador (lowest)

---

**Compatibilidad**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
**Última actualización**: Marzo 2026
