(function() {
  'use strict';

  const SELECCION_SERVICIO_KEY = 'petcard_servicio_seleccionado';

  function init() {
    configurarBotonesAgendar();
    configurarEmergencias();
    // Opcional: destacar botones si hay usuario logueado
    actualizarSesionUI();
  }

  // Botones "Agendar Cita"
  function configurarBotonesAgendar() {
    const botones = document.querySelectorAll('[id^="btn-agendar-"]');
    botones.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const servicio = e.currentTarget.dataset.servicio;
        if (servicio) {
          localStorage.setItem(SELECCION_SERVICIO_KEY, servicio);
        }
        // Redirige a la página de citas
        window.location.href = 'citas.html';
      });
    });
  }

  // Emergencias: Llamar o Chat
  function configurarEmergencias() {
    const btnLlamar = document.getElementById('btn-llamar');
    const btnChat = document.getElementById('btn-chat');

    if (btnLlamar) {
      btnLlamar.addEventListener('click', () => {
        window.location.href = 'tel:+12345678901'; // llamada al número de emergencia
      });
    }

    if (btnChat) {
      btnChat.addEventListener('click', () => {
        alert('Redirigiendo al chat de urgencias...');
        // Aquí podrías poner window.location.href = 'chat-urgencias.html';
      });
    }
  }

  // Actualizar UI según sesión
  function actualizarSesionUI() {
    // Aquí podrías leer localStorage y cambiar los botones de Iniciar Sesión/Registrarse
    const btnsSesion = document.querySelectorAll('#btn-cerrar-sesion');
    const usuario = localStorage.getItem('petcard_usuario_sesion');
    if (usuario) {
      btnsSesion.forEach(btn => {
        btn.textContent = 'Cerrar Sesión';
        btn.onclick = () => {
          localStorage.removeItem('petcard_usuario_sesion');
          window.location.reload();
        };
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
