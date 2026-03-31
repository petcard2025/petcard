// ===== NOTIFICACIONES HTML =====

async function cargarNotificaciones() {
  try {
    const notificaciones = await obtenerNotificaciones();
    mostrarNotificaciones(notificaciones);
  } catch (error) {
    console.error('Error cargando notificaciones:', error);
    mostrarError('Error al cargar notificaciones');
  }
}

function mostrarNotificaciones(notificaciones) {
  const container = document.getElementById('notificaciones-container');
  if (!container) return;

  if (notificaciones.length === 0) {
    container.innerHTML = '<p>No hay notificaciones</p>';
    return;
  }

  container.innerHTML = notificaciones.map(notif => `
    <div class="notificacion-card card">
      <p><strong>De:</strong> ${notif.Nombre_usuario}</p>
      <p><strong>Tipo:</strong> ${notif.Tipo}</p>
      <p><strong>Canal:</strong> ${notif.Canal}</p>
      <p><strong>Mensaje:</strong> ${notif.Mensaje}</p>
      <p><strong>Fecha:</strong> ${new Date(notif.Fecha_envio).toLocaleString()}</p>
    </div>
  `).join('');
}

function mostrarError(msg) {
  const container = document.getElementById('notificaciones-container');
  if (container) {
    container.innerHTML = `<p style="color: red;">${msg}</p>`;
  }
}

// Cargar notificaciones al abrir la página
document.addEventListener('DOMContentLoaded', cargarNotificaciones);
