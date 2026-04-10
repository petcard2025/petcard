// ===== MIS MASCOTAS HTML =====

let usuarioActual = null;

function obtenerUsuarioActual() {
  try {
    const raw = localStorage.getItem('petcard_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function cargarMascotas() {
  try {
    usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
      mostrarError('Debes iniciar sesión para ver tus mascotas');
      return;
    }

    const mascotas = await obtenerMascotasPorCliente(usuarioActual.ID_usuario);
    mostrarMascotas(mascotas);
  } catch (error) {
    console.error('Error cargando mascotas:', error);
    mostrarError('Error al cargar mascotas');
  }
}

function mostrarMascotas(mascotas) {
  const container = document.getElementById('mascotas-container');
  if (!container) return;

  if (mascotas.length === 0) {
    container.innerHTML = '<p>No tienes mascotas registradas. <a href="#" onclick="abrirFormularioMascota()">Agregar mascota</a></p>';
    return;
  }

  container.innerHTML = mascotas.map(mascota => `
    <div class="mascota-card card">
      <h3>${mascota.Nombre}</h3>
      <p><strong>Especie:</strong> ${mascota.Especie}</p>
      <p><strong>Raza:</strong> ${mascota.Raza}</p>
      <p><strong>Sexo:</strong> ${mascota.Sexo}</p>
      <p><strong>Fecha de nacimiento:</strong> ${mascota.Fecha_nacimiento}</p>
      <p><strong>Peso:</strong> ${mascota.Peso} kg</p>
      ${mascota.Foto ? `<img src="${mascota.Foto}" alt="${mascota.Nombre}" style="max-width: 200px;">` : ''}
    </div>
  `).join('');
}

function mostrarError(msg) {
  const container = document.getElementById('mascotas-container');
  if (container) {
    container.innerHTML = `<p style="color: red;">${msg}</p>`;
  }
}

function abrirFormularioMascota() {
  const form = document.getElementById('formulario-mascota');
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}

async function agregarMascota() {
  try {
    usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
      alert('Debes iniciar sesión');
      return;
    }

    const nombreEl = document.getElementById('nombre-mascota');
    const especieEl = document.getElementById('especie-mascota');
    const razaEl = document.getElementById('raza-mascota');
    const sexoEl = document.getElementById('sexo-mascota');
    const fechaEl = document.getElementById('fecha-mascota');
    const pesoEl = document.getElementById('peso-mascota');

    if (!nombreEl?.value || !especieEl?.value || !razaEl?.value || !sexoEl?.value || !fechaEl?.value || !pesoEl?.value) {
      alert('Por favor completa todos los campos');
      return;
    }

    const response = await crearMascota(
      usuarioActual.ID_usuario,
      nombreEl.value,
      especieEl.value,
      razaEl.value,
      sexoEl.value,
      fechaEl.value,
      pesoEl.value,
      ''
    );

    if (response && response.ID_mascota) {
      alert('¡Mascota agregada exitosamente!');
      cargarMascotas();
      abrirFormularioMascota();
    }
  } catch (error) {
    alert('Error al agregar mascota: ' + error.message);
  }
}

// Cargar mascotas al abrir la página
document.addEventListener('DOMContentLoaded', () => {
  cargarMascotas();

  const btnAgregar = document.getElementById('btn-agregar-mascota');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', abrirFormularioMascota);
  }

  const btnGuardar = document.getElementById('btn-guardar-mascota');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', agregarMascota);
  }

  const btnCancelar = document.getElementById('btn-cancelar-mascota');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', abrirFormularioMascota);
  }
});
