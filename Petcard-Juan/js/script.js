/* script.js - código común para todas las páginas */

// visual toggle para inputs dentro de .input-wrapper
function attachPasswordToggles(){
  document.querySelectorAll('.input-wrapper .input-icon').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const input = btn.previousElementSibling;
      if(input){
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    });
  });
}

function showLoading(button, text){
  button.classList.add('btn-loading');
  button.innerHTML = '<span class="spinner"></span> ' + text;
}

function hideLoading(button, text){
  button.classList.remove('btn-loading');
  button.innerHTML = text;
}

function handleLogin(btn, email, password){
  const correo = email.value.trim();
  const clave = password.value.trim();

  if(!correo || !clave){
    alert("⚠️ Completa todos los campos");
    return;
  }

  showLoading(btn, 'Verificando...');

  setTimeout(()=>{
    const isAdminPage = window.location.pathname.includes('admin');
    const stored = isAdminPage
      ? JSON.parse(localStorage.getItem('petcardAdmin')||'{}')
      : JSON.parse(localStorage.getItem('usuarioPetcard')||'{}');
    const valid = correo === stored.email && clave === stored.password;

    if(valid){
      btn.innerHTML = '✅ Entrando...';
      setTimeout(()=>{
        window.location.href = isAdminPage ? 'dashboard.html' : 'inicio.html';
      },700);
    }else{
      alert('❌ Credenciales incorrectas');
      hideLoading(btn, 'Iniciar Sesión');
    }
  },1800);
}

function initLoginForm(){
  const btnLogin = document.getElementById('btn-login');
  const email = document.getElementById('input-email');
  const password = document.getElementById('input-password');

  if(btnLogin && email && password){
    btnLogin.addEventListener('click', ()=> handleLogin(btnLogin,email,password));
    document.addEventListener('keydown',(e)=>{
      if(e.key === 'Enter'){
        btnLogin.click();
      }
    });
  }
}

function initUserRegistration(){
  const btn = document.getElementById('crear');
  if(!btn) return;

  if(!localStorage.getItem("adminPetcard")){
    localStorage.setItem("adminPetcard",
      JSON.stringify({
        email:"admin@petcard.com",
        password:"1234",
        rol:"admin"
      })
    );
  }

  btn.onclick = ()=>{
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const email = document.getElementById('email');
    const telefono = document.getElementById('telefono');
    const password = document.getElementById('password');
    const confirm = document.getElementById('confirm');
    const terminos = document.getElementById('terminos');

    const usuario = {
      nombre:nombre.value.trim(),
      apellido:apellido.value.trim(),
      email:email.value.trim(),
      telefono:telefono.value.trim(),
      password:password.value.trim(),
      rol:"usuario"
    };

    if(Object.values(usuario).some(v=>v==="")){
      alert("Completa todos los campos");
      return;
    }

    if(usuario.password!==confirm.value.trim()){
      alert("Las contraseñas no coinciden");
      return;
    }

    if(!terminos.checked){
      alert("Acepta los términos");
      return;
    }

    showLoading(btn, 'Creando cuenta...');

    setTimeout(()=>{
      localStorage.setItem("usuarioPetcard", JSON.stringify(usuario));
      btn.innerHTML="✅ Cuenta creada";
      setTimeout(()=>{
        location.href="login.html";
      },900);
    },1200);
  };
}

function initAdminRegistration(){
  const btnCrear = document.getElementById('btn-crear-cuenta');
  if(!btnCrear) return;

  const nombre = document.getElementById("input-nombre");
  const apellido = document.getElementById("input-apellido");
  const email = document.getElementById("input-email");
  const telefono = document.getElementById("input-telefono");
  const password = document.getElementById("input-password");
  const confirm = document.getElementById("input-confirm");
  const terminos = document.getElementById("chk-terminos");

  btnCrear.addEventListener('click', ()=>{
    const datos={
      nombre:nombre.value.trim(),
      apellido:apellido.value.trim(),
      email:email.value.trim(),
      telefono:telefono.value.trim(),
      password:password.value.trim()
    };

    if(!datos.nombre || !datos.apellido || !datos.email ||
       !datos.telefono || !datos.password){
      alert("⚠️ Completa todos los campos");
      return;
    }

    if(datos.password.length<4){
      alert("⚠️ Contraseña muy corta");
      return;
    }

    if(datos.password!==confirm.value.trim()){
      alert("❌ Las contraseñas no coinciden");
      return;
    }

    if(!terminos.checked){
      alert("⚠️ Debes aceptar los términos");
      return;
    }

    showLoading(btnCrear, 'Creando cuenta...');

    setTimeout(()=>{
      localStorage.setItem("petcardAdmin", JSON.stringify(datos));
      btnCrear.innerHTML="✅ Cuenta creada";
      setTimeout(()=>{
        window.location.href="login-admin.html";
      },900);
    },1500);
  });
}

function updateNavbar(){
  const usuarioNombre = document.getElementById('usuarioNombre');
  const btnSesion = document.getElementById('btnSesion');
  if(usuarioNombre){
    const user = JSON.parse(localStorage.getItem('usuarioPetcard')||'{}');
    if(user && user.nombre){
      usuarioNombre.textContent = user.nombre;
      if(btnSesion){
        btnSesion.textContent = 'Cerrar Sesión';
        btnSesion.onclick = ()=>{
          localStorage.removeItem('usuarioPetcard');
          location.reload();
        };
      }
    }
  }
}

// inicialización global

document.addEventListener('DOMContentLoaded',()=>{
  attachPasswordToggles();
  initLoginForm();
  initUserRegistration();
  initAdminRegistration();
  updateNavbar();
});

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.style.display = 'block';
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => {
    el.style.display = 'none';
  });
}

const btn = document.getElementById("crear");
btn.onclick = () => {
  clearErrors();

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm").value.trim();
  const terminos = document.getElementById("terminos");

  let hasError = false;

  if (!nombre) {
    showError('error-nombre', 'El nombre es requerido');
    hasError = true;
  }
  if (!apellido) {
    showError('error-apellido', 'El apellido es requerido');
    hasError = true;
  }
  if (!email) {
    showError('error-email', 'El correo es requerido');
    hasError = true;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    showError('error-email', 'Ingresa un correo válido');
    hasError = true;
  }
  if (!telefono) {
    showError('error-telefono', 'El teléfono es requerido');
    hasError = true;
  }
  if (!password) {
    showError('error-password', 'La contraseña es requerida');
    hasError = true;
  }
  if (password !== confirm) {
    showError('error-confirm', 'Las contraseñas no coinciden');
    hasError = true;
  }
  if (!terminos.checked) {
    showError('error-terminos', 'Debes aceptar los términos');
    hasError = true;
  }

  if (hasError) return;

  const usuario = { nombre, apellido, email, telefono, password, rol: "usuario" };

  btn.classList.add("btn-loading");
  btn.innerHTML = '<span class="spinner"></span> Creando cuenta...';

  setTimeout(() => {
    // Guardar en array para soportar múltiples usuarios
    const usuarios = JSON.parse(localStorage.getItem("usuariosPetcard") || "[]");
    const yaExiste = usuarios.find(u => u.email === usuario.email);
    if (yaExiste) {
      btn.classList.remove("btn-loading");
      btn.innerHTML = "Crear Cuenta";
      showError('error-email', 'Ya existe una cuenta con ese correo');
      return;
    }
    usuarios.push(usuario);
    localStorage.setItem("usuariosPetcard", JSON.stringify(usuarios));
    // También guardar sesión activa
    localStorage.setItem("petcardUser", usuario.nombre || usuario.email);
    localStorage.setItem("petcardRol", "usuario");
    btn.innerHTML = "✅ Cuenta creada";
    setTimeout(() => { location.href = "./inicio.html"; }, 900);
  }, 1200);
};
