<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>

    <nav class="navbar">

<router-link to="/admin" class="nav-logo">
PETCARD
</router-link>

<ul class="nav-links" style="margin-left:1.5rem;">
<li><router-link to="/admin-alimentacion">Alimentación</router-link></li>
<li><router-link to="/admin-carnet" class="active">Carnet de Vacunas</router-link></li>
<li><router-link to="/admin-notificaciones">Notificaciones</router-link></li>
<li><router-link to="/admin-servicios">Servicios</router-link></li>
<li><router-link to="/admin-citas">Citas</router-link></li>
</ul>

<div class="nav-actions">
<span id="admin-nombre" style="color:white;margin-right:1rem;font-weight:500;"></span>

<router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" title="Ver Perfil" style="text-decoration:none;display:inline-block;">
👤
</router-link>

<button class="btn btn-danger btn-sm" onclick="alert('Cierre de sesión no configurado aún')">
Cerrar Sesión
</button>

</div>

</nav>

<div class="page-wrapper">

<div class="gestion-header">

<div>
<div class="gestion-title">
Gestión de Registros de Vacunación
</div>

<div class="gestion-sub">
Administra todos los registros de vacunación de las mascotas
</div>
</div>

<div class="gestion-btns">


<button class="btn btn-success btn-sm" id="btn-nuevo-registro">
+ Nuevo Registro
</button>

</div>

</div>

<div class="search-filter">

<div class="search-wrap">

<input
type="text"
placeholder="Buscar por mascota o vacuna..."
id="input-buscar"
/>

</div>

<select class="filter-select" id="select-filtro">

<option>Todos</option>
<option>Completada</option>
<option>Pendiente</option>

</select>

</div>

<div class="cards-grid-2"></div>

</div>

<footer class="footer"></footer>

</template>
<script>// admin-carnet.js

(function(){

"use strict";

document.addEventListener("DOMContentLoaded",function(){

inicializarEventos();
cargarRegistros();

});

let registros = [];

function inicializarEventos(){

const btnNuevo=document.getElementById("btn-nuevo-registro");
if(btnNuevo){
btnNuevo.addEventListener("click",abrirModalNuevo);
}

const buscar=document.getElementById("input-buscar");
if(buscar){
buscar.addEventListener("keyup",filtrarRegistros);
}

const filtro=document.getElementById("select-filtro");
if(filtro){
filtro.addEventListener("change",filtrarRegistros);
}

}

function cargarRegistros(){
mostrarRegistros(registros);
}

function mostrarRegistros(datos){

const grid=document.querySelector(".cards-grid-2");
if(!grid) return;

grid.innerHTML=datos.map(r=>`

<div class="admin-card">

<div class="admin-card-header">

<div>
<div class="admin-card-title">${r.mascota}</div>
<div class="admin-card-tipo">${r.tipo} - ${r.raza}</div>
</div>

<span class="badge">${r.estado}</span>

</div>

<div class="admin-card-body">

<div class="detail">${r.vacuna}</div>
<div class="admin-card-meta">Lote: ${r.lote}</div>
<div class="admin-card-meta">Aplicada: ${r.aplicada}</div>
<div class="admin-card-meta">Próxima: ${r.proxima}</div>
<div class="admin-card-meta">Veterinario: ${r.veterinario}</div>

</div>

<div style="display:flex;gap:8px;margin-top:10px;">

<button class="btn btn-primary btn-sm btn-editar" data-id="${r.id}">
Editar
</button>

<button class="btn btn-danger btn-sm btn-eliminar" data-id="${r.id}">
Eliminar
</button>

</div>

</div>

`).join("");

activarBotonesTarjeta();

}

function activarBotonesTarjeta(){

document.querySelectorAll(".btn-eliminar").forEach(btn=>{

btn.addEventListener("click",function(){

const id=parseInt(this.dataset.id);

if(confirm("¿Eliminar este registro?")){

registros=registros.filter(r=>r.id!==id);
cargarRegistros();

}

});

});

document.querySelectorAll(".btn-editar").forEach(btn=>{

btn.addEventListener("click",function(){

const id=parseInt(this.dataset.id);

const registro=registros.find(r=>r.id===id);
if(!registro) return;

abrirModalEditar(registro);

});

});

}

function filtrarRegistros(){

const texto=document.getElementById("input-buscar").value.toLowerCase();
const filtro=document.getElementById("select-filtro").value;

const resultado=registros.filter(r=>{

const coincideBusqueda=
r.mascota.toLowerCase().includes(texto)||
r.vacuna.toLowerCase().includes(texto);

const coincideFiltro=
filtro==="Todos"||r.estado===filtro;

return coincideBusqueda&&coincideFiltro;

});

mostrarRegistros(resultado);

}

function abrirModalNuevo(){

const html=`

<div id="modal-registro" style="

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

<div style="background:white;padding:20px;border-radius:10px;width:400px;">

<h2>Nuevo Registro</h2>

<input id="m-mascota" placeholder="Nombre Mascota" style="width:100%;margin-bottom:8px;">
<input id="m-tipo" placeholder="Tipo (Perro/Gato)" style="width:100%;margin-bottom:8px;">
<input id="m-raza" placeholder="Raza" style="width:100%;margin-bottom:8px;">
<input id="m-vacuna" placeholder="Vacuna" style="width:100%;margin-bottom:8px;">
<input id="m-lote" placeholder="Lote" style="width:100%;margin-bottom:8px;">
<input type="date" id="m-aplicada" style="width:100%;margin-bottom:8px;">
<input type="date" id="m-proxima" style="width:100%;margin-bottom:8px;">
<input id="m-veterinario" placeholder="Veterinario" style="width:100%;margin-bottom:8px;">

<select id="m-estado" style="width:100%;margin-bottom:15px;">
<option>Pendiente</option>
<option>Completada</option>
</select>

<button id="guardar-registro" class="btn btn-success">
Guardar
</button>

<button onclick="cerrarModal()" style="margin-left:10px;">
Cancelar
</button>

</div>

</div>

`;

document.body.insertAdjacentHTML("beforeend",html);

document.getElementById("guardar-registro")
.addEventListener("click",guardarRegistro);

}

function abrirModalEditar(registro){

abrirModalNuevo();

document.getElementById("m-mascota").value=registro.mascota;
document.getElementById("m-tipo").value=registro.tipo;
document.getElementById("m-raza").value=registro.raza;
document.getElementById("m-vacuna").value=registro.vacuna;
document.getElementById("m-lote").value=registro.lote;
document.getElementById("m-aplicada").value=registro.aplicada;
document.getElementById("m-proxima").value=registro.proxima;
document.getElementById("m-veterinario").value=registro.veterinario;
document.getElementById("m-estado").value=registro.estado;

document.getElementById("guardar-registro").onclick=function(){

registro.mascota=document.getElementById("m-mascota").value;
registro.tipo=document.getElementById("m-tipo").value;
registro.raza=document.getElementById("m-raza").value;
registro.vacuna=document.getElementById("m-vacuna").value;
registro.lote=document.getElementById("m-lote").value;
registro.aplicada=document.getElementById("m-aplicada").value;
registro.proxima=document.getElementById("m-proxima").value;
registro.veterinario=document.getElementById("m-veterinario").value;
registro.estado=document.getElementById("m-estado").value;

cerrarModal();
cargarRegistros();

};

}

window.cerrarModal=function(){

const modal=document.getElementById("modal-registro");
if(modal) modal.remove();

}

function guardarRegistro(){

const mascota=document.getElementById("m-mascota").value.trim();
const tipo=document.getElementById("m-tipo").value.trim();
const raza=document.getElementById("m-raza").value.trim();
const vacuna=document.getElementById("m-vacuna").value.trim();
const lote=document.getElementById("m-lote").value.trim();
const aplicada=document.getElementById("m-aplicada").value;
const proxima=document.getElementById("m-proxima").value;
const veterinario=document.getElementById("m-veterinario").value.trim();
const estado=document.getElementById("m-estado").value;

if(!mascota||!tipo||!raza||!vacuna||!lote||!aplicada||!proxima||!veterinario){

alert("Debes completar todos los campos");

return;

}

const repetido=registros.some(r=>r.mascota.toLowerCase()===mascota.toLowerCase());

if(repetido){

alert("Ya existe un registro con ese nombre de mascota");

return;

}

registros.push({

id:registros.length+1,
mascota,
tipo,
raza,
vacuna,
lote,
aplicada,
proxima,
veterinario,
estado

});

cerrarModal();
cargarRegistros();

}

})();

</script>