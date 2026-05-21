  (function() {
    'use strict';

    const ADMIN_SESION_KEY = 'petcard_admin_sesion';
    let adminActual = null;

    function init() {
      console.log('Inicializando admin-inicio.js');

      // Verificar sesión
      cargarAdminActual();

      // Configurar eventos
      configurarEventos();

      // Actualizar UI
      actualizarUI();
    }

    function cargarAdminActual() {
      try {
        const sesion = localStorage.getItem(ADMIN_SESION_KEY);
        if (sesion) {
          adminActual = JSON.parse(sesion);
          console.log('Admin cargado:', adminActual);
        } else {
          console.log('No hay sesión de admin activa');
          // Redirigir al login si no hay sesión
          window.location.href = 'login-admin.html';
          return;
        }
      } catch (error) {
        console.error('Error cargando admin:', error);
        window.location.href = 'login-admin.html';
      }
    }

    function configurarEventos() {
      // Botón cerrar sesión
      const btnCerrar = document.getElementById('btn-cerrar-sesion');
      if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarSesion);
      }

      // Botón perfil admin
      const btnPerfil = document.getElementById('btn-perfil-admin');
      if (btnPerfil) {
        btnPerfil.addEventListener('click', () => {
          window.location.href = 'admin-perfil.html';
        });
      }

      // Botones de acción
      const btnAgendar = document.getElementById('btn-agendar');
      if (btnAgendar) {
        btnAgendar.addEventListener('click', () => {
          window.location.href = 'admin-citas.html';
        });
      }

      const btnServicios = document.getElementById('btn-servicios');
      if (btnServicios) {
        btnServicios.addEventListener('click', () => {
          window.location.href = 'admin-servicios.html';
        });
      }

      const btnAgendarCta = document.getElementById('btn-agendar-cta');
      if (btnAgendarCta) {
        btnAgendarCta.addEventListener('click', () => {
          window.location.href = 'admin-citas.html';
        });
      }

      const btnVerCta = document.getElementById('btn-ver-cta');
      if (btnVerCta) {
        btnVerCta.addEventListener('click', () => {
          window.location.href = 'admin-servicios.html';
        });
      }
    }

    function actualizarUI() {
      if (!adminActual) return;

      // Mostrar nombre del admin en la navbar
      const nombreElement = document.getElementById('admin-nombre');
      if (nombreElement) {
        nombreElement.textContent = `${adminActual.nombre} ${adminActual.apellido || ''}`.trim();
      }
    }

    function cerrarSesion() {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem(ADMIN_SESION_KEY);
        window.location.href = 'login-admin.html';
      }
    }

    // Inicializar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();