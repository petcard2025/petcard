document.addEventListener("DOMContentLoaded", function () {

const btnNueva = document.getElementById("btn-nueva-notif");

/* NUEVA NOTIFICACION */

btnNueva.addEventListener("click", function(){

/* FONDO */

const fondo = document.createElement("div");
fondo.style.position="fixed";
fondo.style.top="0";
fondo.style.left="0";
fondo.style.width="100%";
fondo.style.height="100%";
fondo.style.background="rgba(0,0,0,0.5)";
fondo.style.display="flex";
fondo.style.alignItems="center";
fondo.style.justifyContent="center";
fondo.style.zIndex="999";

/* FORMULARIO */

const form = document.createElement("div");
form.style.background="white";
form.style.padding="20px";
form.style.borderRadius="8px";
form.style.width="320px";
form.style.display="flex";
form.style.flexDirection="column";
form.style.gap="8px";

form.innerHTML=`

<h3>Nueva Notificación</h3>

<label>Nombre de la Mascota</label>
<input type="text" id="mascota">

<label>Servicio</label>
<input type="text" id="servicio">

<label>Mensaje de la Notificación</label>
<textarea id="mensaje"></textarea>

<div style="display:flex;gap:10px;margin-top:10px;">
<button id="crearNotif" class="btn btn-success btn-sm">Crear</button>
<button id="cancelarNotif" class="btn btn-danger btn-sm">Cancelar</button>
</div>

`;

fondo.appendChild(form);
document.body.appendChild(fondo);

/* CANCELAR */

document.getElementById("cancelarNotif").addEventListener("click",function(){
fondo.remove();
});

/* CREAR NOTIFICACION */

document.getElementById("crearNotif").addEventListener("click",function(){

const mascota=document.getElementById("mascota").value.trim();
const servicio=document.getElementById("servicio").value.trim();
const mensaje=document.getElementById("mensaje").value.trim();

if(!mascota || !servicio || !mensaje){
alert("Debes completar todos los campos");
return;
}

const contenedor=document.querySelector(".cards-grid-2");

const card=document.createElement("div");
card.className="admin-card";

card.innerHTML=`

<div class="admin-card-header">
<div>

<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;">
<span class="admin-card-title">${mascota}</span>
</div>

<div style="display:flex;gap:.4rem;">
<span class="badge badge-green">${servicio}</span>
<span class="badge badge-gray">Borrador</span>
</div>

</div>
</div>

<div class="admin-card-body">

<div class="admin-card-meta mensaje">
${mensaje}
</div>

<div class="admin-card-meta">
Mascota: ${mascota}
</div>

<div class="admin-card-meta">
Servicio: ${servicio}
</div>

<div class="admin-card-meta">
Fecha: ${new Date().toISOString().split("T")[0]}
</div>

</div>

<div class="admin-card-actions">

<button class="btn btn-success btn-sm btn-enviar">Enviar</button>

<button class="btn btn-secondary btn-sm btn-editar">Editar</button>

<button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>

</div>

`;

contenedor.appendChild(card);

fondo.remove();

});

});

/* BOTONES DE TARJETAS */

document.addEventListener("click",function(e){

/* ELIMINAR */

if(e.target.classList.contains("btn-eliminar")){
e.target.closest(".admin-card").remove();
}

/* ENVIAR */

if(e.target.classList.contains("btn-enviar")){

const card=e.target.closest(".admin-card");
const badge=card.querySelector(".badge-gray");

if(badge){
badge.textContent="Enviada";
badge.classList.remove("badge-gray");
badge.classList.add("badge-green");
}

alert("Notificación enviada");

}

/* EDITAR */

if(e.target.classList.contains("btn-editar")){

const card=e.target.closest(".admin-card");
const mensaje=card.querySelector(".mensaje");

let nuevo=prompt("Editar mensaje",mensaje.innerText);

if(nuevo){
mensaje.innerText=nuevo;
}

}

});

});






