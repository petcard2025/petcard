// ...existing code...
const Storage = (() => {
  const prefix = 'petcard_';
  const key = (k) => prefix + k;

  function save(k, v) {
    localStorage.setItem(key(k), JSON.stringify(v));
  }
  function load(k, fallback = null) {
    const v = localStorage.getItem(key(k));
    return v ? JSON.parse(v) : fallback;
  }
  return {
    save,
    load,
    getUsers() { return load('users', []); },
    saveUsers(users) { save('users', users); },
    addOrUpdateUser(user) {
      const users = this.getUsers();
      const i = users.findIndex(u => u.email === user.email);
      if (i >= 0) users[i] = user; else users.push(user);
      this.saveUsers(users);
    },
    findUser(email) { return this.getUsers().find(u => u.email === email) || null; },
    setCurrent(user) { save('current', user); },
    getCurrent() { return load('current', null); },
    clearCurrent() { localStorage.removeItem(key('current')); }
  };
})();// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  // --- Login handling ---
  const loginForm = document.querySelector('form[data-auth="login"]') || document.getElementById('loginForm');
  if (loginForm) {
    const emailEl = loginForm.querySelector('input[type="email"]');
    const pwEl = loginForm.querySelector('input[type="password"]');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (emailEl.value || '').trim();
      const password = pwEl.value || '';

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Correo inválido');
      if (password.length < 6) return alert('Contraseña mínimo 6 caracteres');

      const existing = Storage.findUser(email);
      if (existing) {
        if (existing.password !== password) return alert('Contraseña incorrecta');
        Storage.setCurrent(existing);
        try{ window.showToast && window.showToast('Sesión iniciada', 'success', 1200); }catch(e){}
        setTimeout(()=>{ location.href = 'inicio.html'; }, 900);
      } else {
        // crear usuario nuevo y guardar
        const user = { email, password, createdAt: Date.now(), profile: {} };
        Storage.addOrUpdateUser(user);
        Storage.setCurrent(user);
        try{ window.showToast && window.showToast('Cuenta creada y sesión iniciada', 'success', 1200); }catch(e){}
        setTimeout(()=>{ location.href = 'inicio.html'; }, 900);
      }
    });

    // optional toggle password buttons (different markup across pages)
    const toggle = loginForm.querySelector('#togglePassword') || loginForm.querySelector('[data-toggle-password]');
    if (toggle && pwEl) {
      toggle.addEventListener('click', (ev) => {
        ev.preventDefault();
        pwEl.type = pwEl.type === 'password' ? 'text' : 'password';
        if (toggle.tagName.toLowerCase() === 'button') toggle.textContent = pwEl.type === 'password' ? '👁️' : '🙈';
      });
    }
  }

  // --- Registro handling ---
  const crearBtn = document.getElementById('crear');
  if (crearBtn) {
    crearBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const nombre = (document.getElementById('nombre') || {}).value || '';
      const apellido = (document.getElementById('apellido') || {}).value || '';
      const email = ((document.getElementById('email') || {}).value || '').trim();
      const telefono = (document.getElementById('telefono') || {}).value || '';
      const password = (document.getElementById('password') || {}).value || '';
      const confirm = (document.getElementById('confirm') || {}).value || '';
      const terminos = (document.getElementById('terminos') || {}).checked;

      // clear previous errors
      ['nombre','apellido','email','telefono','password','confirm','terminos'].forEach(k=>{ const el = document.getElementById('error-'+k); if(el) el.style.display='none'; });

      let ok = true;
      if (!nombre.trim()) { const e = document.getElementById('error-nombre'); if(e){ e.textContent='Nombre requerido'; e.style.display='block'; } ok=false; }
      if (!apellido.trim()) { const e = document.getElementById('error-apellido'); if(e){ e.textContent='Apellido requerido'; e.style.display='block'; } ok=false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { const e = document.getElementById('error-email'); if(e){ e.textContent='Correo inválido'; e.style.display='block'; } ok=false; }
      if (telefono && !/^\+?[0-9\s\-]{6,20}$/.test(telefono)) { const e = document.getElementById('error-telefono'); if(e){ e.textContent='Teléfono inválido'; e.style.display='block'; } ok=false; }
      if (password.length < 6) { const e = document.getElementById('error-password'); if(e){ e.textContent='Mínimo 6 caracteres'; e.style.display='block'; } ok=false; }
      if (password !== confirm) { const e = document.getElementById('error-confirm'); if(e){ e.textContent='Las contraseñas no coinciden'; e.style.display='block'; } ok=false; }
      if (!terminos) { const e = document.getElementById('error-terminos'); if(e){ e.textContent='Debes aceptar los términos'; e.style.display='block'; } ok=false; }
      if (!ok) return;

      // check if user already exists
      const existing = Storage.findUser(email);
      if (existing) {
        if (!confirm('Ya existe una cuenta con este correo. Deseas iniciar sesión con esta cuenta?')) return;
        Storage.setCurrent(existing);
        try{ window.showToast && window.showToast('Sesión iniciada con cuenta existente', 'success', 1200); }catch(e){}
        setTimeout(()=>{ location.href = 'inicio.html'; }, 900);
        return;
      }

      const user = { email, password, createdAt: Date.now(), profile: { nombre, apellido, telefono } };
      Storage.addOrUpdateUser(user);
      Storage.setCurrent(user);
      try{ window.showToast && window.showToast('Cuenta creada', 'success', 1200); }catch(e){}
      setTimeout(()=>{ location.href = 'inicio.html'; }, 900);
    });
  }
});