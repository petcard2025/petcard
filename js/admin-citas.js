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
