(function() {
  'use strict';

  const ADMIN_SESION_KEY = 'petcard_admin_sesion';
  let adminActual = null;

  function init() {
    // Cargar admin actual
    cargarAdminActual();
    // Configurar eventos
    configurarEventos();
    // Actualizar UI
    actualizarUI();
  }

  function cargarAdminActual() {
    const sesion = localStorage.getItem(ADMIN_SESION_KEY);
    if (sesion) {
      adminActual = JSON.parse(sesion);
    } else {
      // Si no hay sesión activa, redirige al login
      window.location.href = 'login-admin.html';
    }
  }

  function configurarEventos() {
    // Botón editar perfil
    const btnEditar = document.getElementById('btn-editar-perfil');
    if (btnEditar) btnEditar.addEventListener('click', toggleModoEdicion);

    // Botón cerrar sesión banner
    const btnCerrar = document.getElementById('btn-cerrar-perfil');
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarSesion);

    // Botón cerrar sesión navbar
    const btnCerrarNav = document.getElementById('btn-cerrar-sesion');
    if (btnCerrarNav) btnCerrarNav.addEventListener('click', cerrarSesion);

    // Botones acciones rápidas
    const btnInicio = document.getElementById('btn-ir-inicio');
    if (btnInicio) btnInicio.addEventListener('click', () => window.location.href = 'admin-inicio.html');

    const btnAlimentacion = document.getElementById('btn-alimentacion');
    if (btnAlimentacion) btnAlimentacion.addEventListener('click', () => window.location.href = 'admin-alimentacion.html');

    const btnCarnet = document.getElementById('btn-carnet');
    if (btnCarnet) btnCarnet.addEventListener('click', () => window.location.href = 'admin-carnet.html');
  }

  function actualizarUI() {
    if (!adminActual) return;

    // Nombre en navbar
    const nombreNav = document.getElementById('admin-nombre');
    if (nombreNav) nombreNav.textContent = `${adminActual.nombre} ${adminActual.apellido || ''}`.trim();

    // Nombre en banner
    const nombreTitulo = document.getElementById('perfil-nombre-titulo');
    if (nombreTitulo) nombreTitulo.textContent = `${adminActual.nombre} ${adminActual.apellido || ''}`.trim();

    // Llenar formulario
    const inputNombre = document.getElementById('input-nombre');
    const inputEmail = document.getElementById('input-email');
    const inputTelefono = document.getElementById('input-telefono');
    const inputDireccion = document.getElementById('input-direccion');
    const adminId = document.getElementById('admin-id');

    if (inputNombre) inputNombre.value = `${adminActual.nombre} ${adminActual.apellido || ''}`.trim();
    if (inputEmail) inputEmail.value = adminActual.email || '';
    if (inputTelefono) inputTelefono.value = adminActual.telefono || '';
    if (inputDireccion) inputDireccion.value = adminActual.direccion || '';
    if (adminId) adminId.textContent = adminActual.id || 'admin_001';

    // Deshabilitar inputs inicialmente
    deshabilitarInputs(true);
  }

  function toggleModoEdicion() {
    const inputs = document.querySelectorAll('#input-nombre, #input-email, #input-telefono, #input-direccion');
    const btnEditar = document.getElementById('btn-editar-perfil');

    const enModoEdicion = inputs[0] && !inputs[0].disabled;

    if (enModoEdicion) {
      // Guardar cambios
      guardarCambios();
      deshabilitarInputs(true);
      if (btnEditar) btnEditar.innerHTML = `Editar`;
    } else {
      // Activar modo edición
      deshabilitarInputs(false);
      if (btnEditar) btnEditar.innerHTML = `Guardar`;
    }
  }

  function deshabilitarInputs(disabled) {
    const inputs = document.querySelectorAll('#input-nombre, #input-email, #input-telefono, #input-direccion');
    inputs.forEach(input => {
      input.disabled = disabled;
      input.classList.toggle('form-control-disabled', disabled);
    });
  }

  function guardarCambios() {
    if (!adminActual) return;

    const inputNombre = document.getElementById('input-nombre');
    const inputEmail = document.getElementById('input-email');
    const inputTelefono = document.getElementById('input-telefono');
    const inputDireccion = document.getElementById('input-direccion');

    const nombreCompleto = inputNombre.value.trim();
    const email = inputEmail.value.trim();
    const telefono = inputTelefono.value.trim();

    if (!nombreCompleto || !email) {
      alert('⚠️ Nombre y email son obligatorios');
      return;
    }

    const partesNombre = nombreCompleto.split(' ');
    const nombre = partesNombre[0] || '';
    const apellido = partesNombre.slice(1).join(' ') || '';

    adminActual.nombre = nombre;
    adminActual.apellido = apellido;
    adminActual.email = email;
    adminActual.telefono = telefono;
    adminActual.direccion = inputDireccion.value.trim();

    localStorage.setItem(ADMIN_SESION_KEY, JSON.stringify(adminActual));
    actualizarUI();
    alert('✅ Perfil actualizado correctamente');
  }

  function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem(ADMIN_SESION_KEY);
      window.location.href = 'login-admin.html';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
