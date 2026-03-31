// ===== REGISTRO HTML versión con API REAL =====

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}

function clearFieldError(id) {
  const el = document.getElementById(id);
  el.textContent = '';
  el.style.display = 'none';
}

function clearAllErrors() {
  ['nombre','apellido','email','telefono','password','confirm','terminos']
    .forEach(id => clearFieldError('error-' + id));
  document.getElementById('success-banner').style.display = 'none';
}

async function handleRegistro() {
  clearAllErrors();

  const nombre    = document.getElementById('nombre').value.trim();
  const apellido  = document.getElementById('apellido').value.trim();
  const email     = document.getElementById('email').value.trim();
  const telefono  = document.getElementById('telefono').value.trim();
  const password  = document.getElementById('password').value;
  const confirm   = document.getElementById('confirm').value;
  const terminos  = document.getElementById('terminos').checked;

  let valid = true;

  if (!nombre) { showFieldError('error-nombre', 'El nombre es obligatorio.'); valid = false; }
  if (!apellido) { showFieldError('error-apellido', 'El apellido es obligatorio.'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('error-email', 'Ingresa un correo válido.'); valid = false;
  }
  if (!telefono || !/^\d{7,15}$/.test(telefono.replace(/\s/g,''))) {
    showFieldError('error-telefono', 'Ingresa un teléfono válido (solo números).'); valid = false;
  }
  if (!password || password.length < 6) {
    showFieldError('error-password', 'La contraseña debe tener al menos 6 caracteres.'); valid = false;
  }
  if (password !== confirm) {
    showFieldError('error-confirm', 'Las contraseñas no coinciden.'); valid = false;
  }
  if (!terminos) {
    showFieldError('error-terminos', 'Debes aceptar los términos y condiciones.'); valid = false;
  }

  if (!valid) return;

  const btn = document.getElementById('crear');
  btn.innerHTML = '<span class="spinner"></span> Procesando...';
  btn.classList.add('btn-loading');
  btn.disabled = true;

  try {
    // ===== REGISTRO: Conectar con API =====
    const nombreCompleto = `${nombre} ${apellido}`;
    const response = await registroUser(nombreCompleto, email, telefono, password, 'cliente');
    
    if (response && response.ID_usuario) {
      const banner = document.getElementById('success-banner');
      banner.textContent = `¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...`;
      banner.style.display = 'block';

      setTimeout(() => {
        window.location.href = './login-usuario.html';
      }, 1800);
    } else {
      showFieldError('error-email', response.error || 'Error al crear la cuenta');
    }
  } catch (error) {
    showFieldError('error-email', error.message || 'Error al conectar con el servidor');
  } finally {
    btn.innerHTML = 'Crear Cuenta';
    btn.classList.remove('btn-loading');
    btn.disabled = false;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('crear');
  if (btn) {
    btn.addEventListener('click', handleRegistro);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleRegistro();
  });
});
