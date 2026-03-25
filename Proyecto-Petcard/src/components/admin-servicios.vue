<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>

    <nav class="navbar">
    <router-link to="/admin" class="nav-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>PETCARD</router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/admin-alimentacion">Alimentación</router-link></li>
      <li><router-link to="/admin-carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/admin-notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/admin-servicios" class="active">Servicios</router-link></li>
      <li><router-link to="/admin-citas">Citas</router-link></li>
    </ul>
    <div class="nav-actions"><span id="admin-nombre" style="color: white; margin-right: 1rem; font-weight: 500;"></span><router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" title="Ver Perfil" style="text-decoration:none;display:inline-block;">👤</router-link><button class="btn btn-danger btn-sm" onclick="alert('Cierre de sesión no configurado aún')">Cerrar Sesión</button></div>
  </nav>
  <div class="page-wrapper">
    <div class="gestion-header">
      <div><div class="gestion-title">Gestión de Servicios</div><div class="gestion-sub">Administra todos los servicios veterinarios disponibles</div></div>
      <div class="gestion-btns">
        <button class="btn btn-primary btn-sm" id="btn-generar">Generar Datos</button>
        <button class="btn btn-success btn-sm" id="btn-nuevo-servicio">+ Nuevo Servicio</button>
      </div>
    </div>
    <div class="search-filter">
      <div class="search-wrap"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Buscar servicios..." id="input-buscar"/></div>
      <select class="filter-select" id="select-filtro"><option>Todas</option><option>Activo</option><option>Inactivo</option></select>
    </div>
    <div class="cards-grid-2">
      <div class="admin-card">
        <div class="admin-card-header"><div><div class="admin-card-title">Consulta General</div><div class="admin-card-tipo">Consulta</div></div><span class="badge badge-green">Activo</span></div>
        <div class="admin-card-body">
          <span class="badge badge-blue" style="margin-bottom:.5rem;">Disponible</span>
          <div class="admin-card-meta">Examen médico completo de rutina</div>
          <div style="display:flex; justify-content:space-between; margin:.5rem 0;">
            <strong>$ 45</strong>
            <span style="display:flex; align-items:center; gap:.3rem; font-size:.8rem; color:var(--muted);"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 30 min</span>
          </div>
          <div class="admin-card-meta">Creado por: Admin</div>
          <div class="admin-card-meta">Fecha: 2024-08-15</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" id="btn-editar-1">Editar</button>
          <button class="btn btn-danger btn-sm" id="btn-eliminar-1">Eliminar</button>
        </div>
      </div>
      <div class="admin-card">
        <div class="admin-card-header"><div><div class="admin-card-title">Vacunación Básica</div><div class="admin-card-tipo">Vacunación</div></div><span class="badge badge-green">Activo</span></div>
        <div class="admin-card-body">
          <span class="badge badge-blue" style="margin-bottom:.5rem;">Disponible</span>
          <div class="admin-card-meta">Aplicación de vacunas esenciales</div>
          <div style="display:flex; justify-content:space-between; margin:.5rem 0;">
            <strong>$ 35</strong>
            <span style="display:flex; align-items:center; gap:.3rem; font-size:.8rem; color:var(--muted);"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 15 min</span>
          </div>
          <div class="admin-card-meta">Creado por: Dr. García</div>
          <div class="admin-card-meta">Fecha: 2024-08-20</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" id="btn-editar-2">Editar</button>
          <button class="btn btn-danger btn-sm" id="btn-eliminar-2">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
  <footer class="footer" style="margin-top:2rem;"><div class="footer-grid"><div class="footer-brand"><span class="nav-logo" style="color:#fff;display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>PetCard</span></div><div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p></div><div class="footer-col"><h4>Horarios</h4><p class="footer-emergency">Emergencias 24/7</p></div></div><div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div></footer>
 
</template>
<script>(function() {
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
</script>