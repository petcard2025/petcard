// ===== LOGIN HTML versión con API REAL =====

const STORAGE_KEYS = {
  currentUser: 'petcard_current_user'
};

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function updateAuthSection() {
  const el = document.getElementById('auth-section');
  if (!el) return;

  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'login-usuario.html' || currentPage === 'registro-usuario.html') {
    el.innerHTML = '';
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    el.innerHTML = `
      <a href="login-usuario.html" class="btn-auth">Iniciar sesión</a>
      <a href="registro-usuario.html" class="btn-auth">Registrarse</a>
    `;
    return;
  }

  const nombre = user.Nombre || user.Correo || 'Usuario';
  el.innerHTML = `
    <span class="auth-welcome">${nombre}</span>
    <button id="btn-logout" class="btn-logout">Cerrar sesión</button>
  `;

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      clearCurrentUser();
      window.location.href = 'login-usuario.html';
    });
  }
}

function showError(msg) {
  const el = document.getElementById('error-login');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  const success = document.getElementById('success-login');
  if (success) success.style.display = 'none';
}

function showSuccess(msg) {
  const el = document.getElementById('success-login');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  const error = document.getElementById('error-login');
  if (error) error.style.display = 'none';
}

function togglePassword() {
  const input = document.getElementById('contrasena');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

async function handleLogin() {
  const correoEl = document.getElementById('numero-documento');
  const passwordEl = document.getElementById('contrasena');

  if (!correoEl || !passwordEl) return;

  const correo = correoEl.value.trim();
  const password = passwordEl.value;

  if (!correo) { showError('Por favor ingresa tu correo.'); return; }
  if (!password) { showError('Por favor ingresa tu contraseña.'); return; }

  try {
    const btnIngresar = document.getElementById('btn-ingresar');
    if (btnIngresar) btnIngresar.disabled = true;

    const response = await loginUser(correo, password);
    
    if (response && response.usuario) {
      setCurrentUser(response.usuario);
      showSuccess(`¡Bienvenido/a, ${response.usuario.Nombre}!`);
      setTimeout(() => {
        window.location.href = './inicio.html';
      }, 1500);
    } else {
      showError('Datos inválidos');
    }
  } catch (error) {
    showError(error.message || 'Error al conectar con el servidor');
  } finally {
    const btnIngresar = document.getElementById('btn-ingresar');
    if (btnIngresar) btnIngresar.disabled = false;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  updateAuthSection();

  const eyeBtn = document.querySelector('.eye-btn');
  if (eyeBtn) {
    eyeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      togglePassword();
    });
  }

  const btnIngresar = document.getElementById('btn-ingresar');
  if (btnIngresar) {
    btnIngresar.addEventListener('click', handleLogin);
  }

  // Permitir Enter para login
  const contrasenaEl = document.getElementById('contrasena');
  if (contrasenaEl) {
    contrasenaEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }
});
