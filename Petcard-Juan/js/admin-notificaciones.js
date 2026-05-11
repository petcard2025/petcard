document.addEventListener("DOMContentLoaded", function () {

const btnNueva = document.getElementById("btn-nueva-notif");

/* NUEVA NOTIFICACION */

btnNueva.addEventListener("click", function(){

/* FONDO OSCURO DEL MODAL */

const fondo = document.createElement("div");
fondo.style.position = "fixed";
fondo.style.top = "0";
fondo.style.left = "0";
fondo.style.width = "100%";
fondo.style.height = "100%";
fondo.style.background = "rgba(0,0,0,0.6)";
fondo.style.display = "flex";
fondo.style.alignItems = "center";
fondo.style.justifyContent = "center";
fondo.style.zIndex = "9999";
fondo.style.backdropFilter = "blur(3px)";

/* FORMULARIO */

const form = document.createElement("div");
form.style.background = "#ffffff";
form.style.padding = "25px";
form.style.borderRadius = "12px";
form.style.width = "350px";
form.style.display = "flex";
form.style.flexDirection = "column";
form.style.gap = "12px";
form.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
form.style.fontFamily = "Arial, sans-serif";
form.style.animation = "fadeIn 0.3s ease";

/* TITULO */

const titulo = document.createElement("h2");
titulo.textContent = "Registro";
titulo.style.textAlign = "center";
titulo.style.marginBottom = "10px";
titulo.style.color = "#333";

/* INPUT NOMBRE */

const inputNombre = document.createElement("input");
inputNombre.placeholder = "Nombre";
inputNombre.style.padding = "10px";
inputNombre.style.border = "1px solid #ccc";
inputNombre.style.borderRadius = "6px";
inputNombre.style.fontSize = "14px";

/* INPUT EMAIL */

const inputEmail = document.createElement("input");
inputEmail.placeholder = "Correo electrónico";
inputEmail.style.padding = "10px";
inputEmail.style.border = "1px solid #ccc";
inputEmail.style.borderRadius = "6px";
inputEmail.style.fontSize = "14px";

/* BOTON GUARDAR */

const botonGuardar = document.createElement("button");
botonGuardar.textContent = "Guardar";
botonGuardar.style.padding = "10px";
botonGuardar.style.border = "none";
botonGuardar.style.borderRadius = "6px";
botonGuardar.style.background = "#4CAF50";
botonGuardar.style.color = "white";
botonGuardar.style.fontSize = "15px";
botonGuardar.style.cursor = "pointer";

/* BOTON CANCELAR */

const botonCancelar = document.createElement("button");
botonCancelar.textContent = "Cancelar";
botonCancelar.style.padding = "10px";
botonCancelar.style.border = "none";
botonCancelar.style.borderRadius = "6px";
botonCancelar.style.background = "#e74c3c";
botonCancelar.style.color = "white";
botonCancelar.style.fontSize = "15px";
botonCancelar.style.cursor = "pointer";

/* CERRAR MODAL */

botonCancelar.onclick = () => {
  document.body.removeChild(fondo);
};

/* ARMAR FORMULARIO */

form.appendChild(titulo);
form.appendChild(inputNombre);
form.appendChild(inputEmail);
form.appendChild(botonGuardar);
form.appendChild(botonCancelar);

fondo.appendChild(form);
document.body.appendChild(fondo);

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






