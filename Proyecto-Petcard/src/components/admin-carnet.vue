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