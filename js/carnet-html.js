// ===== CARNET DE VACUNAS HTML =====

let usuarioActual = null;
let mascotasCarnet = [];

function obtenerUsuarioActual() {
  try {
    const raw = localStorage.getItem('petcard_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function obtenerUsuarioActual() {
  try {
    const raw = localStorage.getItem('petcard_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function cargarMascotasParaCarnet() {
  try {
    usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
      mostrarError('Debes iniciar sesión');
      return;
    }

    const mascotas = await obtenerMascotasPorCliente(usuarioActual.ID_usuario);
    mascotasCarnet = mascotas || [];
    const select = document.getElementById('mascota-carnet');
    if (select) {
      select.innerHTML = '<option value="">Selecciona una mascota</option>' + 
        mascotasCarnet.map(m => `<option value="${m.ID_mascota}">${m.Nombre} - ${m.Especie || ''}</option>`).join('');
      
      select.addEventListener('change', cargarVacunas);
    }
  } catch (error) {
    console.error('Error cargando mascotas:', error);
    mostrarError('Error al cargar mascotas');
  }
}

async function cargarVacunas() {
  try {
    const select = document.getElementById('mascota-carnet');
    if (!select?.value) {
      const container = document.getElementById('vacunas-container');
      if (container) container.innerHTML = '<p>Selecciona una mascota para ver su historial de vacunas.</p>';
      mostrarDatosMascota(null);
      return;
    }

    const mascota = mascotasCarnet.find(m => String(m.ID_mascota) === String(select.value));
    mostrarDatosMascota(mascota);

    const vacunas = await obtenerVacunasPorMascota(select.value);
    mostrarVacunas(vacunas);
  } catch (error) {
    console.error('Error cargando vacunas:', error);
    mostrarError('Error al cargar vacunas');
  }
}

function mostrarVacunas(vacunas) {
  const container = document.getElementById('vacunas-container');
  if (!container) return;

  if (!vacunas || vacunas.length === 0) {
    container.innerHTML = '<p>No hay vacunas registradas para esta mascota.</p>';
    return;
  }

  container.innerHTML = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 8px;">Vacuna</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Laboratorio</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Fecha Aplicación</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Próxima Dosis</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${vacunas.map(v => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${v.Nombre_vacuna || v.Vacuna || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${v.Laboratorio || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${v.Fecha_aplicacion || v.FechaAplicacion || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${v.Proxima_dosis || v.ProximaDosis || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${v.Estado || (v.Fecha_aplicacion ? 'Aplicada' : 'Pendiente')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function mostrarDatosMascota(mascota) {
  const nombre = document.getElementById('info-mascota-nombre');
  const especie = document.getElementById('info-mascota-especie');
  const raza = document.getElementById('info-mascota-raza');
  const idElemento = document.getElementById('info-mascota-id');
  const actualizacion = document.getElementById('info-mascota-actualizacion');
  const proxima = document.getElementById('info-mascota-proxima');

  if (!nombre || !especie || !raza || !idElemento || !actualizacion || !proxima) return;

  if (!mascota) {
    nombre.textContent = '-';
    especie.textContent = '-';
    raza.textContent = '-';
    idElemento.textContent = '-';
    actualizacion.textContent = '-';
    proxima.textContent = '-';
    return;
  }

  nombre.textContent = mascota.Nombre || '-';
  especie.textContent = mascota.Especie || '-';
  raza.textContent = mascota.Raza || '-';
  idElemento.textContent = mascota.ID_mascota || '-';
  actualizacion.textContent = mascota.Ultima_actualizacion || '-';
  proxima.textContent = mascota.Proxima_cita || '-';
}

function mostrarError(msg) {
  const container = document.getElementById('vacunas-container');
  if (container) {
    container.innerHTML = `<p style="color: red;">${msg}</p>`;
  }
}

// Cargar mascotas al abrir la página
document.addEventListener('DOMContentLoaded', cargarMascotasParaCarnet);
