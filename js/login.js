const Storage = (() => {
  const prefix = 'petcard_';
  const key = (k) => prefix + k;

  function save(k, v) { localStorage.setItem(key(k), JSON.stringify(v)); }
  function load(k, fallback = null) { const v = localStorage.getItem(key(k)); return v ? JSON.parse(v) : fallback; }

  return {
    save, load,
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
})();

document.addEventListener('DOMContentLoaded', () => {
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
        const user = { email, password, createdAt: Date.now(), profile: {} };
        Storage.addOrUpdateUser(user);
        Storage.setCurrent(user);
        try{ window.showToast && window.showToast('Cuenta creada y sesión iniciada', 'success', 1200); }catch(e){}
        setTimeout(()=>{ location.href = 'inicio.html'; }, 900);
      }
    });

    const toggle = loginForm.querySelector('#togglePassword') || loginForm.querySelector('[data-toggle-password]');
    if (toggle && pwEl) {
      toggle.addEventListener('click', (ev) => {
        ev.preventDefault();
        pwEl.type = pwEl.type === 'password' ? 'text' : 'password';
        if (toggle.tagName.toLowerCase() === 'button') toggle.textContent = pwEl.type === 'password' ? '👁️' : '🙈';
      });
    }
  }
});
