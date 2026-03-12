(function() {
  'use strict';

  const ADMIN_SESION_KEY = 'petcard_admin_sesion';
  const SERVICIOS_KEY = 'petcard_servicios';
  let adminActual = null;
  let servicios = [];

  // Inicialización
  function init() {
    cargarAdminActual();
    cargarServicios();
    actualizarUI();
    configurarEventos();
  }

  function cargarAdminActual() {
    try {
      const sesion = localStorage.getItem(ADMIN_SESION_KEY);
      if (!sesion) throw 'No hay sesión activa';
      adminActual = JSON.parse(sesion);
      document.getElementById('admin-nombre').textContent = adminActual.nombre + ' ' + (adminActual.apellido || '');
    } catch (err) {
      console.log('Redirigiendo a login:', err);
      window.location.href = 'login-admin.html';
    }
  }

  function cargarServicios() {
    const data = localStorage.getItem(SERVICIOS_KEY);
    servicios = data ? JSON.parse(data) : [];
  }

  function guardarServicios() {
    localStorage.setItem(SERVICIOS_KEY, JSON.stringify(servicios));
  }

  function configurarEventos() {
    // Cerrar sesión
    const btnCerrar = document.getElementById('btn-cerrar-sesion');
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarSesion);

    // Perfil
    const btnPerfil = document.getElementById('btn-perfil-admin');
    if (btnPerfil) btnPerfil.addEventListener('click', () => {
      window.location.href = 'admin-perfil.html';
    });

    // Generar Datos
    const btnGenerar = document.getElementById('btn-generar');
    if (btnGenerar) btnGenerar.addEventListener('click', generarDatos);

    // Nuevo Servicio
    const btnNuevo = document.getElementById('btn-nuevo-servicio');
    if (btnNuevo) btnNuevo.addEventListener('click', nuevoServicio);

    // Búsqueda y filtro
    const inputBuscar = document.getElementById('input-buscar');
    const selectFiltro = document.getElementById('select-filtro');
    if (inputBuscar) inputBuscar.addEventListener('input', renderServicios);
    if (selectFiltro) selectFiltro.addEventListener('change', renderServicios);

    // Editar/Eliminar botones dinámicos
    document.querySelector('.cards-grid-2').addEventListener('click', (e) => {
      const id = e.target.closest('.admin-card')?.querySelector('.btn-secondary, .btn-danger')?.id?.split('-')[2];
      if (!id) return;

      if (e.target.closest('.btn-secondary')) editarServicio(id);
      if (e.target.closest('.btn-danger')) eliminarServicio(id);
    });
  }

  function cerrarSesion() {
    if (confirm('¿Deseas cerrar sesión?')) {
      localStorage.removeItem(ADMIN_SESION_KEY);
      window.location.href = 'login-admin.html';
    }
  }

  function generarDatos() {
    if (!confirm('Generar servicios de ejemplo sobrescribirá los existentes. Continuar?')) return;
    servicios = [
      { id: '1', nombre: 'Consulta General', tipo: 'Consulta', descripcion: 'Examen médico completo de rutina', precio: 45, duracion: 30, estado: 'Activo', creador: 'Admin', fecha: '2024-08-15' },
      { id: '2', nombre: 'Vacunación Básica', tipo: 'Vacunación', descripcion: 'Aplicación de vacunas esenciales', precio: 35, duracion: 15, estado: 'Activo', creador: 'Dr. García', fecha: '2024-08-20' }
    ];
    guardarServicios();
    renderServicios();
  }

  function nuevoServicio() {
    const nombre = prompt('Nombre del servicio:');
    if (!nombre) return alert('Nombre requerido');
    const tipo = prompt('Tipo de servicio:') || 'General';
    const precio = parseFloat(prompt('Precio:') || 0);
    const duracion = parseInt(prompt('Duración (min):') || 0);
    const descripcion = prompt('Descripción:') || '';
    const estado = 'Activo';
    const id = (Date.now()).toString();

    servicios.push({ id, nombre, tipo, descripcion, precio, duracion, estado, creador: adminActual.nombre, fecha: new Date().toISOString().split('T')[0] });
    guardarServicios();
    renderServicios();
  }

  function editarServicio(id) {
    const s = servicios.find(s => s.id === id);
    if (!s) return alert('Servicio no encontrado');
    const nombre = prompt('Nombre:', s.nombre);
    if (!nombre) return;
    s.nombre = nombre;
    s.tipo = prompt('Tipo:', s.tipo) || s.tipo;
    s.descripcion = prompt('Descripción:', s.descripcion) || s.descripcion;
    s.precio = parseFloat(prompt('Precio:', s.precio) || s.precio);
    s.duracion = parseInt(prompt('Duración (min):', s.duracion) || s.duracion);
    s.estado = prompt('Estado (Activo/Inactivo):', s.estado) || s.estado;
    guardarServicios();
    renderServicios();
  }

  function eliminarServicio(id) {
    if (!confirm('¿Eliminar este servicio?')) return;
    servicios = servicios.filter(s => s.id !== id);
    guardarServicios();
    renderServicios();
  }

  function renderServicios() {
    const grid = document.querySelector('.cards-grid-2');
    if (!grid) return;
    grid.innerHTML = '';

    const busqueda = (document.getElementById('input-buscar')?.value || '').toLowerCase();
    const filtro = document.getElementById('select-filtro')?.value;

    servicios
      .filter(s => s.nombre.toLowerCase().includes(busqueda) && (filtro === 'Todas' || s.estado === filtro))
      .forEach(s => {
        const card = document.createElement('div');
        card.className = 'admin-card';
        card.innerHTML = `
          <div class="admin-card-header">
            <div>
              <div class="admin-card-title">${s.nombre}</div>
              <div class="admin-card-tipo">${s.tipo}</div>
            </div>
            <span class="badge ${s.estado==='Activo'?'badge-green':'badge-red'}">${s.estado}</span>
          </div>
          <div class="admin-card-body">
            <span class="badge badge-blue" style="margin-bottom:.5rem;">Disponible</span>
            <div class="admin-card-meta">${s.descripcion}</div>
            <div style="display:flex; justify-content:space-between; margin:.5rem 0;">
              <strong>$ ${s.precio}</strong>
              <span style="display:flex; align-items:center; gap:.3rem; font-size:.8rem; color:var(--muted);">
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg> ${s.duracion} min
              </span>
            </div>
            <div class="admin-card-meta">Creado por: ${s.creador}</div>
            <div class="admin-card-meta">Fecha: ${s.fecha}</div>
          </div>
          <div class="admin-card-actions">
            <button class="btn btn-secondary btn-sm" id="btn-editar-${s.id}">Editar</button>
            <button class="btn btn-danger btn-sm" id="btn-eliminar-${s.id}">Eliminar</button>
          </div>
        `;
        grid.appendChild(card);
      });
  }

  function actualizarUI() {
    renderServicios();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
