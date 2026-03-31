// ===== CITAS HTML =====

let usuarioActual = null;

function obtenerUsuarioActual() {
  try {
    const raw = localStorage.getItem('petcard_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function cargarVeterinarios() {
  try {
    const vets = await obtenerVeterinarios();
    const select = document.getElementById('veterinario');
    if (select) {
      select.innerHTML = '<option value="">Selecciona un veterinario</option>' + 
        vets.map(v => `<option value="${v.ID_veterinario}">${v.Nombre} - ${v.Especialidad}</option>`).join('');
    }
  } catch (error) {
    console.error('Error cargando veterinarios:', error);
  }
}

async function cargarServicios() {
  try {
    const servicios = await obtenerServicios();
    const select = document.getElementById('select-servicio');
    if (select) {
      select.innerHTML = '<option value="">Selecciona un servicio</option>' + 
        servicios.map(s => `<option value="${s.ID_servicio}">${s.Nombre}</option>`).join('');
    }
  } catch (error) {
    console.error('Error cargando servicios:', error);
  }
}

async function cargarMascotas() {
  try {
    usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
      mostrarError('Debes iniciar sesión para agendar citas');
      return;
    }

    const mascotas = await obtenerMascotasPorCliente(usuarioActual.ID_usuario);
    const select = document.getElementById('select-mascota');
    if (select && mascotas.length > 0) {
      select.innerHTML = '<option value="">Selecciona una mascota</option>' + 
        mascotas.map(m => `<option value="${m.ID_mascota}">${m.Nombre}</option>`).join('');
    }
  } catch (error) {
    console.error('Error cargando mascotas:', error);
  }
}

async function cargarCitas() {
  try {
    const citas = await obtenerCitas();
    mostrarCitas(citas);
  } catch (error) {
    console.error('Error cargando citas:', error);
    mostrarError('Error al cargar citas');
  }
}

function mostrarCitas(citas) {
  // Las citas se mostrarían en un contenedor si existe
  const container = document.getElementById('citas-container');
  if (!container) {
    console.log('Citas cargadas:', citas);
    return;
  }

  if (citas.length === 0) {
    container.innerHTML = '<p>No hay citas disponibles</p>';
    return;
  }

  container.innerHTML = citas.map(cita => `
    <div class="cita-card card">
      <h3>${cita.Nombre_mascota}</h3>
      <p><strong>Cliente:</strong> ${cita.Nombre_cliente}</p>
      <p><strong>Fecha:</strong> ${cita.Fecha}</p>
      <p><strong>Hora:</strong> ${cita.Hora}</p>
      <p><strong>Servicio:</strong> ${cita.Nombre_servicio}</p>
      <p><strong>Veterinario:</strong> ${cita.Nombre_veterinario}</p>
      <p><strong>Motivo:</strong> ${cita.Motivo}</p>
    </div>
  `).join('');
}

function mostrarError(msg) {
  const container = document.getElementById('citas-container');
  if (container) {
    container.innerHTML = `<p style="color: red;">${msg}</p>`;
  }
}

async function agendarCita() {
  try {
    usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
      alert('Debes iniciar sesión para agendar citas');
      return;
    }

    const mascotaEl = document.getElementById('select-mascota');
    const servicioEl = document.getElementById('select-servicio');
    const veterinarioEl = document.getElementById('veterinario');
    const fechaEl = document.getElementById('input-fecha');
    const horaEl = document.getElementById('select-hora');
    const motivoEl = document.getElementById('textarea-notas');

    if (!mascotaEl?.value || !servicioEl?.value || !fechaEl?.value || !horaEl?.value) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    // Por ahora usar un veterinario por defecto (ID 1)
    const idVeterinario = 1;

    const response = await crearCita(
      usuarioActual.ID_usuario,
      mascotaEl.value,
      servicioEl.value,
      idVeterinario,
      fechaEl.value,
      horaEl.value,
      motivoEl?.value || '',
      ''
    );

    if (response && response.ID_cita) {
      alert('¡Cita agendada exitosamente!');
      cargarCitas();
      // Limpiar formulario
      mascotaEl.value = '';
      servicioEl.value = '';
      fechaEl.value = '';
      horaEl.value = '';
      if (motivoEl) motivoEl.value = '';
    }
  } catch (error) {
    alert('Error al agendar cita: ' + error.message);
  }
}

// Cargar datos al abrir la página
document.addEventListener('DOMContentLoaded', () => {
  cargarVeterinarios();
  cargarServicios();
  cargarMascotas();
  cargarCitas();

  const btnAgendar = document.getElementById('btn-agendar');
  if (btnAgendar) {
    btnAgendar.addEventListener('click', agendarCita);
  }
});
