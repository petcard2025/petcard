(function() {
  'use strict';

  const ADMIN_SESION_KEY = 'petcard_admin_sesion';
  const USUARIO_SESION_KEY = 'petcard_current_user';

  // Sistema global de autenticación
  window.PetCardAuth = {
    getAdminActual: () => {
      try {
        const sesion = localStorage.getItem(ADMIN_SESION_KEY);
        return sesion ? JSON.parse(sesion) : null;
      } catch (e) {
        return null;
      }
    },

    getUsuarioActual: () => {
      try {
        const sesion = localStorage.getItem(USUARIO_SESION_KEY);
        return sesion ? JSON.parse(sesion) : null;
      } catch (e) {
        return null;
      }
    },

    cerrarSesionAdmin: () => {
      localStorage.removeItem(ADMIN_SESION_KEY);
      window.location.href = 'login-admin.html';
    },

    cerrarSesionUsuario: () => {
      localStorage.removeItem(USUARIO_SESION_KEY);
      window.location.href = 'login-usuario.html';
    },

    verificarSesionAdmin: () => {
      const admin = window.PetCardAuth.getAdminActual();
      if (!admin) {
        window.location.href = 'login-admin.html';
        return null;
      }
      return admin;
    },

    verificarSesionUsuario: () => {
      const usuario = window.PetCardAuth.getUsuarioActual();
      if (!usuario) {
        window.location.href = 'login-usuario.html';
        return null;
      }
      return usuario;
    },

    actualizarNavbarAdmin: () => {
      const admin = window.PetCardAuth.getAdminActual();
      if (!admin) return;

      const nombreElement = document.getElementById('admin-nombre');
      if (nombreElement) {
        nombreElement.textContent = `${admin.nombre} ${admin.apellido || ''}`.trim();
      }

      // Configurar botón cerrar sesión
      const btnCerrar = document.getElementById('btn-cerrar-sesion');
      if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
          if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            window.PetCardAuth.cerrarSesionAdmin();
          }
        });
      }

      // Configurar botón perfil
      const btnPerfil = document.getElementById('btn-perfil-admin');
      if (btnPerfil) {
        btnPerfil.addEventListener('click', () => {
          window.location.href = 'admin-perfil.html';
        });
      }
    },

    actualizarNavbarUsuario: () => {
      const usuario = window.PetCardAuth.getUsuarioActual();
      if (!usuario) return;

      const nombreElement = document.getElementById('usuario-nombre');
      if (nombreElement) {
        nombreElement.textContent = `${usuario.nombre} ${usuario.apellido || ''}`.trim();
      }

      // Configurar botón cerrar sesión
      const btnCerrar = document.getElementById('btn-cerrar-sesion');
      if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
          if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            window.PetCardAuth.cerrarSesionUsuario();
          }
        });
      }
    }
  };

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Auto actualizar navbar
      window.PetCardAuth.actualizarNavbarAdmin();
      window.PetCardAuth.actualizarNavbarUsuario();
    });
  } else {
    window.PetCardAuth.actualizarNavbarAdmin();
    window.PetCardAuth.actualizarNavbarUsuario();
  }
})();
