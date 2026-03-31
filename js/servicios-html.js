// ===== SERVICIOS HTML =====

async function cargarServicios() {
  try {
    const servicios = await obtenerServicios();
    mostrarServicios(servicios);
  } catch (error) {
    console.error('Error cargando servicios:', error);
    mostrarError('Error al cargar servicios');
  }
}

function mostrarServicios(servicios) {
  const container = document.getElementById('servicios-grid');
  if (!container) return;

  if (servicios.length === 0) {
    container.innerHTML = '<p>No hay servicios disponibles</p>';
    return;
  }

  container.innerHTML = servicios.map(servicio => `
    <div class="servicio-card card">
      <div class="servicio-body">
        <h3>${servicio.Nombre}</h3>
        <p>${servicio.Descripcion || ''}</p>
        <p><strong>Categoría:</strong> ${servicio.Categoria}</p>
        <p><strong>Precio:</strong> $${servicio.Precio}</p>
      </div>
    </div>
  `).join('');
}

function mostrarError(msg) {
  const container = document.getElementById('servicios-grid');
  if (container) {
    container.innerHTML = `<p style="color: red;">${msg}</p>`;
  }
}

// Cargar servicios al abrir la página
document.addEventListener('DOMContentLoaded', cargarServicios);
