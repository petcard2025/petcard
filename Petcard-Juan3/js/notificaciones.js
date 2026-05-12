document.addEventListener("DOMContentLoaded", function(){

const filtros = document.querySelectorAll(".filtro-item");
const notificaciones = document.querySelectorAll(".notif-item");
const btnLeidas = document.getElementById("btn-marcar-leidas");

/* FILTRAR NOTIFICACIONES */

filtros.forEach(filtro=>{

filtro.addEventListener("click",()=>{

filtros.forEach(f=>f.classList.remove("active"));
filtro.classList.add("active");

let categoria = filtro.dataset.cat;

notificaciones.forEach(notif=>{

if(categoria==="todas"){
notif.style.display="flex";
}else{
notif.style.display =
notif.dataset.cat === categoria ? "flex":"none";
}

});

});

});

/* MARCAR TODAS COMO LEIDAS */

if(btnLeidas){
btnLeidas.addEventListener("click",()=>{

notificaciones.forEach(n=>{
n.style.opacity="0.6";
});

alert("Todas las notificaciones fueron marcadas como leídas");

});
}

/* CLICK EN NOTIFICACION */

notificaciones.forEach(n=>{

n.addEventListener("click",()=>{

n.style.background="#f0f0f0";
n.style.opacity="0.6";

});

});

});
