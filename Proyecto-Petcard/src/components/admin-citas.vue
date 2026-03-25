<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
document.addEventListener("DOMContentLoaded", function () {

const btnNueva = document.getElementById("btn-nueva-cita");

if(btnNueva){
btnNueva.addEventListener("click", abrirFormulario);
}

activarBotones();

});

function activarBotones(){

document.querySelectorAll(".btn-eliminar").forEach(btn=>{
btn.onclick=function(){
this.closest(".admin-card").remove();
};
});

document.querySelectorAll(".btn-confirmar").forEach(btn=>{
btn.onclick=function(){

const badge=this.closest(".admin-card").querySelector(".badge");

badge.textContent="Confirmada";
badge.classList.remove("badge-yellow");
badge.classList.add("badge-green");

};
});

document.querySelectorAll(".btn-completar").forEach(btn=>{
btn.onclick=function(){

const badge=this.closest(".admin-card").querySelector(".badge");

badge.textContent="Completada";

};
});

document.querySelectorAll(".btn-editar").forEach(btn=>{
btn.onclick=function(){
editarCita(this.closest(".admin-card"));
};
});

}

function abrirFormulario(){

const modal=document.createElement("div");

modal.innerHTML=`

<div style="
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.5);
display:flex;
align-items:center;
justify-content:center;
z-index:1000;
">

<div style="background:white;padding:20px;border-radius:10px;width:350px">

<h3>Nueva Cita</h3>

<input id="m-mascota" placeholder="Mascota" style="width:100%;margin-bottom:6px">

<input id="m-dueno" placeholder="Propietario" style="width:100%;margin-bottom:6px">

<input id="m-servicio" placeholder="Servicio" style="width:100%;margin-bottom:6px">

<input id="m-veterinario" placeholder="Veterinario" style="width:100%;margin-bottom:6px">

<input type="date" id="m-fecha" style="width:100%;margin-bottom:6px">

<input type="time" id="m-hora" style="width:100%;margin-bottom:6px">

<input id="m-nota" placeholder="Nota" style="width:100%;margin-bottom:10px">

<button id="guardar-cita" class="btn btn-success btn-sm">Guardar</button>
<button id="cancelar-cita" class="btn btn-danger btn-sm">Cancelar</button>

</div>

</div>

`;

document.body.appendChild(modal);

document.getElementById("cancelar-cita").onclick=function(){
modal.remove();
};

document.getElementById("guardar-cita").onclick=function(){

const mascota=document.getElementById("m-mascota").value;
const dueno=document.getElementById("m-dueno").value;
const servicio=document.getElementById("m-servicio").value;
const veterinario=document.getElementById("m-veterinario").value;
const fecha=document.getElementById("m-fecha").value;
const hora=document.getElementById("m-hora").value;
const nota=document.getElementById("m-nota").value;

if(!mascota || !dueno || !servicio || !fecha || !hora){

alert("Completa todos los campos");

return;

}

crearTarjeta(
mascota,
dueno,
servicio,
veterinario,
fecha,
hora,
nota
);

modal.remove();

};

}

function crearTarjeta(mascota,dueno,servicio,veterinario,fecha,hora,nota){

const grid=document.querySelector(".cards-grid-2");

const card=document.createElement("div");

card.className="admin-card";

card.innerHTML=`

<div class="admin-card-header">

<div>

<div style="display:flex;gap:.5rem;align-items:center;">
<span class="admin-card-title">${mascota}</span>
<span class="badge badge-yellow">Pendiente</span>
</div>

<div class="admin-card-tipo">${dueno}</div>

</div>

</div>

<div class="admin-card-body">

<div class="detail">${servicio}</div>
<div class="admin-card-meta">con ${veterinario}</div>
<div class="admin-card-meta">${fecha}</div>
<div class="admin-card-meta">${hora}</div>
<div class="admin-card-meta">${nota}</div>

</div>

<div class="admin-card-actions">

<button class="btn btn-success btn-sm btn-confirmar">Confirmar</button>
<button class="btn btn-primary btn-sm btn-completar">Completar</button>
<button class="btn btn-secondary btn-sm btn-editar">Editar</button>
<button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>

</div>

`;

grid.appendChild(card);

activarBotones();

}

function editarCita(card){

const mascota=card.querySelector(".admin-card-title").textContent;

alert("Editar cita de "+mascota+" (puedes ampliar esta función)");

}
</script>

<template>

    <nav class="navbar">
    <router-link to="/admin" class="nav-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>PETCARD</router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/admin-alimentacion">Alimentación</router-link></li>
      <li><router-link to="/admin-carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/admin-notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/admin-servicios">Servicios</router-link></li>
      <li><router-link to="/admin-citas" class="active">Citas</router-link></li>
    </ul>
    <div class="nav-actions"><span id="admin-nombre" style="color: white; margin-right: 1rem; font-weight: 500;"></span><router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" title="Ver Perfil" style="text-decoration:none;display:inline-block;">👤</router-link><button class="btn btn-danger btn-sm" onclick="alert('Cierre de sesión no configurado aún')">Cerrar Sesión</button></div>
  </nav>
  <div class="page-wrapper">
    <div class="gestion-header">
      <div><div class="gestion-title">Gestión de Citas</div><div class="gestion-sub">Administra todas las citas veterinarias</div></div>
      <div class="gestion-btns">
        <button class="btn btn-success btn-sm" id="btn-nueva-cita">+ Nueva Cita</button>
      </div>
    </div>
    <div class="search-filter">
      <div class="search-wrap"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Buscar por mascota, propietario o servicio..." id="input-buscar"/></div>
      <select class="filter-select" id="select-filtro"><option>Todos</option><option>Confirmada</option><option>Pendiente</option><option>Completada</option></select>
    </div>
    <div class="cards-grid-2">
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <div style="display:flex; gap:.5rem; align-items:center;">
              <span class="admin-card-title">Max</span>
              <span class="badge badge-green">Confirmada</span>
            </div>
            <div class="admin-card-tipo" style="display:flex; align-items:center; gap:.3rem;">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Juan Pérez
            </div>
          </div>
        </div>
        <div class="admin-card-body">
          <div class="detail">Consulta General</div>
          <div class="admin-card-meta" style="color:var(--text-secondary); margin-bottom:.2rem;">con Dr. García</div>
          <div class="admin-card-meta"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 2024-09-15</div>
          <div class="admin-card-meta"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 10:00</div>
          <div class="admin-card-meta" style="font-style:italic; color:var(--muted);">"Primera consulta"</div>
          <div class="admin-card-meta">Creada: 2024-09-10</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-primary btn-sm" id="btn-completar-max">Marcar Completada</button>
          <button class="btn btn-secondary btn-sm" id="btn-editar-max">Editar</button>
          <button class="btn btn-danger btn-sm" id="btn-eliminar-max">Eliminar</button>
        </div>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <div style="display:flex; gap:.5rem; align-items:center;">
              <span class="admin-card-title">Luna</span>
              <span class="badge badge-yellow">Pendiente</span>
            </div>
            <div class="admin-card-tipo" style="display:flex; align-items:center; gap:.3rem;">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              María González
            </div>
          </div>
        </div>
        <div class="admin-card-body">
          <div class="detail">Vacunación</div>
          <div class="admin-card-meta" style="color:var(--text-secondary); margin-bottom:.2rem;">con Dra. López</div>
          <div class="admin-card-meta"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 2024-09-18</div>
          <div class="admin-card-meta"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 14:30</div>
          <div class="admin-card-meta" style="font-style:italic; color:var(--muted);">"Vacuna anual"</div>
          <div class="admin-card-meta">Creada: 2024-09-08</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-success btn-sm" id="btn-confirmar-luna">Confirmar</button>
          <button class="btn btn-secondary btn-sm" id="btn-cancelar-luna">Cancelar</button>
          <button class="btn btn-secondary btn-sm" id="btn-editar-luna">Editar</button>
          <button class="btn btn-danger btn-sm" id="btn-eliminar-luna">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
  <footer class="footer" style="margin-top:2rem;"><div class="footer-grid"><div class="footer-brand"><span class="nav-logo" style="color:#fff;display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>PetCard</span></div><div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p></div><div class="footer-col"><h4>Horarios</h4><p class="footer-emergency">Emergencias 24/7</p></div></div><div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div></footer>

</template>
<script>document.addEventListener("DOMContentLoaded", function () {

const btnNueva = document.getElementById("btn-nueva-cita");

if(btnNueva){
btnNueva.addEventListener("click", abrirFormulario);
}

activarBotones();

});

function activarBotones(){

document.querySelectorAll(".btn-eliminar").forEach(btn=>{
btn.onclick=function(){
this.closest(".admin-card").remove();
};
});

document.querySelectorAll(".btn-confirmar").forEach(btn=>{
btn.onclick=function(){

const badge=this.closest(".admin-card").querySelector(".badge");

badge.textContent="Confirmada";
badge.classList.remove("badge-yellow");
badge.classList.add("badge-green");

};
});

document.querySelectorAll(".btn-completar").forEach(btn=>{
btn.onclick=function(){

const badge=this.closest(".admin-card").querySelector(".badge");

badge.textContent="Completada";

};
});

document.querySelectorAll(".btn-editar").forEach(btn=>{
btn.onclick=function(){
editarCita(this.closest(".admin-card"));
};
});

}

function abrirFormulario(){

const modal=document.createElement("div");

modal.innerHTML=`

<div style="
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.5);
display:flex;
align-items:center;
justify-content:center;
z-index:1000;
">

<div style="background:white;padding:20px;border-radius:10px;width:350px">

<h3>Nueva Cita</h3>

<input id="m-mascota" placeholder="Mascota" style="width:100%;margin-bottom:6px">

<input id="m-dueno" placeholder="Propietario" style="width:100%;margin-bottom:6px">

<input id="m-servicio" placeholder="Servicio" style="width:100%;margin-bottom:6px">

<input id="m-veterinario" placeholder="Veterinario" style="width:100%;margin-bottom:6px">

<input type="date" id="m-fecha" style="width:100%;margin-bottom:6px">

<input type="time" id="m-hora" style="width:100%;margin-bottom:6px">

<input id="m-nota" placeholder="Nota" style="width:100%;margin-bottom:10px">

<button id="guardar-cita" class="btn btn-success btn-sm">Guardar</button>
<button id="cancelar-cita" class="btn btn-danger btn-sm">Cancelar</button>

</div>

</div>

`;

document.body.appendChild(modal);

document.getElementById("cancelar-cita").onclick=function(){
modal.remove();
};

document.getElementById("guardar-cita").onclick=function(){

const mascota=document.getElementById("m-mascota").value;
const dueno=document.getElementById("m-dueno").value;
const servicio=document.getElementById("m-servicio").value;
const veterinario=document.getElementById("m-veterinario").value;
const fecha=document.getElementById("m-fecha").value;
const hora=document.getElementById("m-hora").value;
const nota=document.getElementById("m-nota").value;

if(!mascota || !dueno || !servicio || !fecha || !hora){

alert("Completa todos los campos");

return;

}

crearTarjeta(
mascota,
dueno,
servicio,
veterinario,
fecha,
hora,
nota
);

modal.remove();

};

}

function crearTarjeta(mascota,dueno,servicio,veterinario,fecha,hora,nota){

const grid=document.querySelector(".cards-grid-2");

const card=document.createElement("div");

card.className="admin-card";

card.innerHTML=`

<div class="admin-card-header">

<div>

<div style="display:flex;gap:.5rem;align-items:center;">
<span class="admin-card-title">${mascota}</span>
<span class="badge badge-yellow">Pendiente</span>
</div>

<div class="admin-card-tipo">${dueno}</div>

</div>

</div>

<div class="admin-card-body">

<div class="detail">${servicio}</div>
<div class="admin-card-meta">con ${veterinario}</div>
<div class="admin-card-meta">${fecha}</div>
<div class="admin-card-meta">${hora}</div>
<div class="admin-card-meta">${nota}</div>

</div>

<div class="admin-card-actions">

<button class="btn btn-success btn-sm btn-confirmar">Confirmar</button>
<button class="btn btn-primary btn-sm btn-completar">Completar</button>
<button class="btn btn-secondary btn-sm btn-editar">Editar</button>
<button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>

</div>

`;

grid.appendChild(card);

activarBotones();

}

function editarCita(card){

const mascota=card.querySelector(".admin-card-title").textContent;

alert("Editar cita de "+mascota+" (puedes ampliar esta función)");

}
</script>