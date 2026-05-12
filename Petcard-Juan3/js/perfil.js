(function() {
    'use strict';

    // Claves de localStorage
    const USUARIOS_KEY = 'petcard_usuarios';
    const SESION_KEY = 'petcard_sesion';

    // Elementos del DOM
    let usuarioActual = null;

    function init() {
        console.log('Inicializando perfil.js');

        // Cargar datos del usuario actual
        cargarUsuarioActual();

        // Configurar eventos
        configurarEventos();

        // Actualizar UI
        actualizarUI();
    }

    function cargarUsuarioActual() {
        try {
            const sesion = localStorage.getItem(SESION_KEY);
            if (sesion) {
                usuarioActual = JSON.parse(sesion);
                console.log('Usuario cargado:', usuarioActual);
            } else {
                console.log('No hay sesión activa');
                // Redirigir al login si no hay sesión
                window.location.href = 'login-usuario.html';
                return;
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
            window.location.href = 'login-usuario.html';
        }
    }

    function configurarEventos() {
        // Botón editar perfil
        const btnEditar = document.getElementById('btn-editar-perfil');
        if (btnEditar) {
            btnEditar.addEventListener('click', toggleModoEdicion);
        }

        // Botón cerrar sesión
        const btnCerrar = document.getElementById('btn-cerrar-perfil');
        if (btnCerrar) {
            btnCerrar.addEventListener('click', cerrarSesion);
        }

        // Botones de acción rápida
        configurarBotonesAccion();
    }

    function configurarBotonesAccion() {
        const btnMascotas = document.getElementById('btn-gestionar-mascotas');
        const btnCita = document.getElementById('btn-programar-cita');
        const btnCarnet = document.getElementById('btn-ver-carnet');
        const btnConfigurar = document.getElementById('btn-configurar');

        if (btnMascotas) {
            btnMascotas.addEventListener('click', () => {
                window.location.href = 'mis-mascotas.html';
            });
        }

        if (btnCita) {
            btnCita.addEventListener('click', () => {
                window.location.href = 'citas.html';
            });
        }

        if (btnCarnet) {
            btnCarnet.addEventListener('click', () => {
                window.location.href = 'carnet-vacunas.html';
            });
        }

        if (btnConfigurar) {
            btnConfigurar.addEventListener('click', () => {
                window.location.href = 'notificaciones.html';
            });
        }
    }

    function actualizarUI() {
        if (!usuarioActual) return;

        // Actualizar banner de perfil
        const nombreElement = document.querySelector('.perfil-info h2');
        if (nombreElement) {
            nombreElement.textContent = `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`.trim();
        }

        // Llenar formulario con datos actuales
        const inputNombre = document.getElementById('input-nombre');
        const inputEmail = document.getElementById('input-email');
        const inputTelefono = document.getElementById('input-telefono');
        const inputDireccion = document.getElementById('input-direccion');
        const inputEmergencia = document.getElementById('input-emergencia');

        if (inputNombre) inputNombre.value = `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`.trim();
        if (inputEmail) inputEmail.value = usuarioActual.email || '';
        if (inputTelefono) inputTelefono.value = usuarioActual.telefono || '';
        if (inputDireccion) inputDireccion.value = usuarioActual.direccion || '';
        if (inputEmergencia) inputEmergencia.value = usuarioActual.emergencia || '';

        // Deshabilitar inputs inicialmente
        deshabilitarInputs(true);
    }

    function toggleModoEdicion() {
        const inputs = document.querySelectorAll('#input-nombre, #input-email, #input-telefono, #input-direccion, #input-emergencia');
        const btnEditar = document.getElementById('btn-editar-perfil');

        const enModoEdicion = inputs[0] && !inputs[0].disabled;

        if (enModoEdicion) {
            // Guardar cambios
            guardarCambios();
            deshabilitarInputs(true);
            if (btnEditar) {
                btnEditar.innerHTML = `
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                `;
            }
        } else {
            // Entrar en modo edición
            deshabilitarInputs(false);
            if (btnEditar) {
                btnEditar.innerHTML = `
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7"/>
                    </svg>
                    Guardar
                `;
            }
        }
    }

    function deshabilitarInputs(disabled) {
        const inputs = document.querySelectorAll('#input-nombre, #input-email, #input-telefono, #input-direccion, #input-emergencia');
        inputs.forEach(input => {
            input.disabled = disabled;
            input.classList.toggle('form-control-disabled', disabled);
        });
    }

    function guardarCambios() {
        if (!usuarioActual) return;

        const inputNombre = document.getElementById('input-nombre');
        const inputEmail = document.getElementById('input-email');
        const inputTelefono = document.getElementById('input-telefono');
        const inputDireccion = document.getElementById('input-direccion');
        const inputEmergencia = document.getElementById('input-emergencia');

        // Validar datos
        const nombreCompleto = inputNombre.value.trim();
        const email = inputEmail.value.trim();
        const telefono = inputTelefono.value.trim();

        if (!nombreCompleto || !email) {
            alert('⚠️ Nombre y email son obligatorios');
            return;
        }

        if (!isValidEmail(email)) {
            alert('⚠️ Email no válido');
            return;
        }

        // Separar nombre y apellido
        const partesNombre = nombreCompleto.split(' ');
        const nombre = partesNombre[0] || '';
        const apellido = partesNombre.slice(1).join(' ') || '';

        // Actualizar datos del usuario
        usuarioActual.nombre = nombre;
        usuarioActual.apellido = apellido;
        usuarioActual.email = email;
        usuarioActual.telefono = telefono;
        usuarioActual.direccion = inputDireccion.value.trim();
        usuarioActual.emergencia = inputEmergencia.value.trim();

        // Guardar en localStorage
        try {
            // Actualizar en la lista de usuarios
            const usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY) || '[]');
            const index = usuarios.findIndex(u => u.documento === usuarioActual.documento && u.tipoDocumento === usuarioActual.tipoDocumento);
            if (index !== -1) {
                usuarios[index] = { ...usuarios[index], ...usuarioActual };
                localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
            }

            // Actualizar sesión
            localStorage.setItem(SESION_KEY, JSON.stringify(usuarioActual));

            // Actualizar UI
            actualizarUI();

            alert('✅ Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error guardando cambios:', error);
            alert('❌ Error al guardar los cambios');
        }
    }

    function cerrarSesion() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem(SESION_KEY);
            window.location.href = 'login-usuario.html';
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();