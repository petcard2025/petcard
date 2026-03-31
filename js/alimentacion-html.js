// ===== ALIMENTACIÓN HTML =====

let usuarioActual = null;

function obtenerUsuarioActual() {
  try {
    const raw = localStorage.getItem('petcard_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function cargarMascotasParaAlimentacion() {
  try {
    usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
      mostrarError('Debes iniciar sesión');
      return;
    }

    const mascotas = await obtenerMascotasPorCliente(usuarioActual.ID_usuario);
    const select = document.getElementById('mascota-alimentacion');
    if (select) {
      select.innerHTML = '<option value="">Selecciona una mascota</option>' + 
        mascotas.map(m => `<option value="${m.ID_mascota}">${m.Nombre}</option>`).join('');
      
      select.addEventListener('change', cargarAlimentacion);
    }
  } catch (error) {
    console.error('Error cargando mascotas:', error);
    mostrarError('Error al cargar mascotas');
  }
}

async function cargarAlimentacion() {
  try {
    const select = document.getElementById('mascota-alimentacion');
    if (!select?.value) {
      const container = document.getElementById('alimentacion-container');
      if (container) container.innerHTML = '<p>Selecciona una mascota</p>';
      return;
    }

    const planes = await obtenerAlimentacionPorMascota(select.value);
    mostrarAlimentacion(planes);
  } catch (error) {
    console.error('Error cargando alimentación:', error);
    mostrarError('Error al cargar planes de alimentación');
  }
}

function mostrarAlimentacion(planes) {
  const container = document.getElementById('alimentacion-container');
  if (!container) return;

  if (planes.length === 0) {
    container.innerHTML = '<p>No hay planes de alimentación registrados para esta mascota</p>';
    return;
  }

  container.innerHTML = planes.map(plan => `
    <div class="plan-card card">
      <h3>Plan de Alimentación</h3>
      <p><strong>Tipo de dieta:</strong> ${plan.Tipo_dieta}</p>
      <p><strong>Frecuencia:</strong> ${plan.Frecuencia}</p>
      <p><strong>Alergias:</strong> ${plan.Alergias || 'Ninguna'}</p>
      <p><strong>Horario:</strong> ${plan.Horario}</p>
      <p><strong>Calorías:</strong> ${plan.Calorias}</p>
      <p><strong>Suplementos:</strong> ${plan.Suplementos || 'Ninguno'}</p>
      <p><strong>Comidas:</strong> ${plan.Comidas}</p>
      <p><strong>Observaciones:</strong> ${plan.Observaciones || 'N/A'}</p>
    </div>
  `).join('');
}

function mostrarError(msg) {
  const container = document.getElementById('alimentacion-container');
  if (container) {
    container.innerHTML = `<p style="color: red;">${msg}</p>`;
  }
}

// Cargar mascotas al abrir la página
document.addEventListener('DOMContentLoaded', cargarMascotasParaAlimentacion);
