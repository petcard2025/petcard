const STORAGE_KEYS = {
  usuarios: 'petcard_usuarios',
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

  // No mostrar botones en páginas de login o registro
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

  const nombre = user.nombre || user.email || 'Usuario';
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

function handleLogin() {
  const tipoDocEl = document.getElementById('tipo-documento');
  const numDocEl = document.getElementById('numero-documento');
  const passwordEl = document.getElementById('contrasena');

  if (!tipoDocEl || !numDocEl || !passwordEl) return;

  const tipoDoc = tipoDocEl.value;
  const numDoc = numDocEl.value.trim();
  const password = passwordEl.value;

  if (!tipoDoc) { showError('Por favor selecciona el tipo de documento.'); return; }
  if (!numDoc) { showError('Por favor ingresa tu número de documento.'); return; }
  if (numDoc.length < 4) { showError('El número de documento no es válido.'); return; }
  if (!password) { showError('Por favor ingresa tu contraseña.'); return; }
  if (password.length < 6) { showError('La contraseña debe tener al menos 6 caracteres.'); return; }

  const usuarios = JSON.parse(localStorage.getItem(STORAGE_KEYS.usuarios) || '[]');
  const usuario = usuarios.find(u => u.documento === numDoc && u.tipoDocumento === tipoDoc && u.password === password);

  if (!usuario) {
    showError('Credenciales incorrectas. Verifica tus datos o crea una cuenta.');
    return;
  }

  showSuccess(`¡Bienvenido/a, ${usuario.nombre}! Redirigiendo...`);
  setCurrentUser(usuario);
  updateAuthSection();

  setTimeout(() => {
    window.location.href = './inicio.html';
  }, 1500);
}

// Si la página tiene un botón de ingresar, podemos asignar el evento aquí.
function setupLoginPageListeners() {
  const btnIngresar = document.getElementById('btn-ingresar');
  if (btnIngresar) {
    btnIngresar.addEventListener('click', handleLogin);
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      // Solo ejecutar en páginas de login donde exista el formulario.
      const hasLoginFields = document.getElementById('tipo-documento') && document.getElementById('numero-documento');
      if (hasLoginFields) handleLogin();
    }
  });

  const toggle = document.querySelector('.eye-btn');
  if (toggle) {
    toggle.addEventListener('click', (ev) => {
      ev.preventDefault();
      togglePassword();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateAuthSection();
  setupLoginPageListeners();
});
