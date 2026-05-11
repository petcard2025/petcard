// ============================================================
// admin-alimentacion.js — Gestión de Alimentación
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  inicializarEventos();
});

// ── INICIALIZACIÓN DE EVENTOS ──
function inicializarEventos() {
  // Botones de acciones principales
  const btnGenerar = document.getElementById('btn-generar');
  const btnNuevoPlan = document.getElementById('btn-nuevo-plan');
  
  // Botones de edición y eliminación
  const btnEditarMax = document.getElementById('btn-editar-max');
  const btnEliminarMax = document.getElementById('btn-eliminar-max');
  const btnEditarLuna = document.getElementById('btn-editar-luna');
  const btnEliminarLuna = document.getElementById('btn-eliminar-luna');
  
  // Botones de admin
  const btnPerfilAdmin = document.getElementById('btn-perfil-admin');
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  
  // Buscar y filtro
  const inputBuscar = document.getElementById('input-buscar');
  const selectFiltro = document.getElementById('select-filtro');

  if (btnGenerar) btnGenerar.addEventListener('click', generarDatos);
  if (btnNuevoPlan) btnNuevoPlan.addEventListener('click', abrirNuevoPlan);
  
  if (btnEditarMax) btnEditarMax.addEventListener('click', () => editarPlan('Max'));
  if (btnEliminarMax) btnEliminarMax.addEventListener('click', () => eliminarPlan('Max'));
  if (btnEditarLuna) btnEditarLuna.addEventListener('click', () => editarPlan('Luna'));
  if (btnEliminarLuna) btnEliminarLuna.addEventListener('click', () => eliminarPlan('Luna'));
  
  if (btnPerfilAdmin) btnPerfilAdmin.addEventListener('click', verPerfil);
  if (btnCerrarSesion) btnCerrarSesion.addEventListener('click', cerrarSesion);
  
  if (inputBuscar) inputBuscar.addEventListener('input', filtrarPlanes);
  if (selectFiltro) selectFiltro.addEventListener('change', filtrarPlanes);
}

// ── EFECTO VISUAL PARA BOTONES ──
function efecto_click(event) {
  const btn = event.currentTarget;
  
  // Agregar clase de animación
  btn.classList.add('btn-clicked');
  
  // Crear efecto ripple
  const ripple = document.createElement('div');
  ripple.classList.add('ripple');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  
  btn.appendChild(ripple);
  
  // Remover ripple después de la animación
  setTimeout(() => ripple.remove(), 600);
  
  // Remover clase de click
  setTimeout(() => btn.classList.remove('btn-clicked'), 200);
}

// ── GENERAR DATOS ──
function generarDatos(event) {
  efecto_click(event);
  mostrarNotificacion('Generando datos...', 'info');
  
  setTimeout(() => {
    mostrarNotificacion('✓ Datos generados exitosamente', 'success');
    console.log('Datos generados al ' + new Date().toLocaleString());
  }, 1500);
}

// ── NUEVO PLAN ──
function abrirNuevoPlan(event) {
  efecto_click(event);
  mostrarNotificacion('Abriendo formulario de nuevo plan...', 'info');
  
  setTimeout(() => {
    // Aquí puedes abrir un modal o redirigir a una página
    alert('Formulario de Nuevo Plan\n\n(Implementar según tu lógica)');
    mostrarNotificacion('Formulario listo', 'success');
  }, 800);
}

// ── EDITAR PLAN ──
function editarPlan(mascota, event) {
  mostrarNotificacion(`Editando plan de ${mascota}...`, 'info');
  
  setTimeout(() => {
    // Aquí puedes abrir un modal o formulario
    alert(`Editar Plan de Alimentación\n\nMascota: ${mascota}\n\n(Implementar según tu lógica)`);
    mostrarNotificacion(`✓ Plan de ${mascota} actualizado`, 'success');
  }, 1200);
}

// ── ELIMINAR PLAN ──
function eliminarPlan(mascota, event) {
  if (confirm(`¿Estás seguro de que deseas eliminar el plan de ${mascota}?`)) {
    mostrarNotificacion(`Eliminando plan de ${mascota}...`, 'warning');
    
    setTimeout(() => {
      const card = event?.currentTarget?.closest('.admin-card');
      if (card) {
        card.classList.add('eliminar-animacion');
        setTimeout(() => {
          card.remove();
          mostrarNotificacion(`✓ Plan de ${mascota} eliminado`, 'success');
        }, 400);
      } else {
        mostrarNotificacion(`✓ Plan de ${mascota} eliminado`, 'success');
      }
    }, 800);
  }
}

// ── VER PERFIL ──
function verPerfil(event) {
  efecto_click(event);
  mostrarNotificacion('Cargando perfil...', 'info');
  
  setTimeout(() => {
    window.location.href = '../html/admin-perfil.html';
  }, 600);
}

// ── CERRAR SESIÓN ──
function cerrarSesion(event) {
  efecto_click(event);
  
  if (confirm('¿Deseas cerrar sesión?')) {
    mostrarNotificacion('Cerrando sesión...', 'warning');
    
    setTimeout(() => {
      localStorage.removeItem('admin_token');
      window.location.href = '../html/login-admin.html';
    }, 1200);
  }
}

// ── FILTRAR PLANES ──
function filtrarPlanes() {
  const busqueda = document.getElementById('input-buscar')?.value.toLowerCase() || '';
  const filtro = document.getElementById('select-filtro')?.value || 'Todos';
  const cards = document.querySelectorAll('.admin-card');
  
  cards.forEach(card => {
    const titulo = card.querySelector('.admin-card-title')?.textContent.toLowerCase() || '';
    const badge = card.querySelector('.badge')?.textContent || '';
    
    const coincideBusqueda = titulo.includes(busqueda);
    const coincideFiltro = filtro === 'Todos' || badge.includes(filtro);
    
    card.style.display = coincideBusqueda && coincideFiltro ? 'block' : 'none';
    if (coincideBusqueda && coincideFiltro) {
      card.classList.add('fade-in');
    }
  });
}

// ── NOTIFICACIONES ──
function mostrarNotificacion(mensaje, tipo = 'info') {
  // Crear contenedor si no existe
  let container = document.getElementById('notificaciones-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notificaciones-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }

  // Crear notificación
  const notif = document.createElement('div');
  notif.className = `notificacion notificacion-${tipo}`;
  notif.textContent = mensaje;
  notif.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
    min-width: 250px;
  `;

  // Estilos por tipo
  if (tipo === 'success') {
    notif.style.backgroundColor = '#10b981';
    notif.style.color = 'white';
  } else if (tipo === 'error') {
    notif.style.backgroundColor = '#ef4444';
    notif.style.color = 'white';
  } else if (tipo === 'warning') {
    notif.style.backgroundColor = '#f59e0b';
    notif.style.color = 'white';
  } else {
    notif.style.backgroundColor = '#3b82f6';
    notif.style.color = 'white';
  }

  container.appendChild(notif);

  // Remover después de 3 segundos
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Estilos de animación globales
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes eliminar {
    0% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(100%); }
  }

  .fade-in {
    animation: fadeIn 0.3s ease;
  }

  .eliminar-animacion {
    animation: eliminar 0.4s ease forwards;
  }

  .btn:active {
    transform: scale(0.98);
  }

  .btn-clicked {
    position: relative;
    overflow: hidden;
  }

  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Mejoras visuales para botones */
  .btn {
    position: relative;
    transition: all 0.3s ease;
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .btn-primary:hover {
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
  }

  .btn-success:hover {
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
  }

  .btn-danger:hover {
    box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
  }

  .btn-secondary:hover {
    box-shadow: 0 8px 16px rgba(107, 114, 128, 0.3);
  }
`;
document.head.appendChild(style);
