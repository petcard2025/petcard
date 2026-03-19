<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const cerrarSesion = () => {
  alert('Cierre de sesión no configurado aún')
}
</script>

<template>
  <nav class="navbar">
    <router-link to="/admin" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/admin-alimentacion" class="active">Alimentación</router-link></li>
      <li><router-link to="/admin-carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/admin-notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/admin-servicios">Servicios</router-link></li>
      <li><router-link to="/admin-citas">Citas</router-link></li>
    </ul>
    <div class="nav-actions">
      <span id="admin-nombre" style="color: white; margin-right: 1rem; font-weight: 500;"></span>
      <router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" title="Ver Perfil" style="text-decoration:none;display:inline-block;">👤</router-link>
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="gestion-header">
      <div>
        <div class="gestion-title">Gestión de Planes de Alimentación</div>
        <div class="gestion-sub">Administra todos los planes de alimentación de las mascotas</div>
      </div>
      <div class="gestion-btns">
        <button class="btn btn-primary btn-sm" id="btn-generar">Generar Datos</button>
        <button class="btn btn-success btn-sm" id="btn-nuevo-plan">+ Nuevo Plan</button>
      </div>
    </div>

    <div class="search-filter" style="margin-bottom:1.25rem;">
      <div class="search-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar por mascota o plan..." id="input-buscar"/>
      </div>
      <select class="filter-select" id="select-filtro">
        <option>Todos</option>
        <option>Activo</option>
        <option>Pendiente</option>
      </select>
    </div>

    <div class="cards-grid-2" id="planes-grid">
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">Max</div>
            <div class="admin-card-tipo">Perro</div>
          </div>
          <span class="badge badge-green">Activo</span>
        </div>
        <div class="admin-card-body">
          <div class="detail">Premium Adulto</div>
          <div class="admin-card-meta">350 cal/día • 2 veces/día</div>
          <div class="admin-card-meta">Creado por: Dr. García</div>
          <div class="admin-card-meta">Fecha: 2024-09-10</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm">Editar</button>
          <button class="btn btn-danger btn-sm">Eliminar</button>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">Luna</div>
            <div class="admin-card-tipo">Gato</div>
          </div>
          <span class="badge badge-yellow">Pendiente</span>
        </div>
        <div class="admin-card-body">
          <div class="detail">Sensible Digestivo</div>
          <div class="admin-card-meta">280 cal/día • 3 veces/día</div>
          <div class="admin-card-meta">Creado por: Dra. López</div>
          <div class="admin-card-meta">Fecha: 2024-09-08</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm">Editar</button>
          <button class="btn btn-danger btn-sm">Eliminar</button>
        </div>
      </div>
    </div>

    <footer class="footer" style="margin-top:2rem;">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="nav-logo" style="color:#fff;display:flex;">PetCard</span>
          <p>Comprometidos con brindar toda la atención profesional.</p>
        </div>
        <div class="footer-col">
          <h4>Servicios</h4>
          <ul>
            <li><a href="#">Consulta Generales</a></li>
            <li><a href="#">Vacunación</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contacto</h4>
          <p>+1 234 567 8901</p>
        </div>
        <div class="footer-col">
          <h4>Horarios</h4>
          <p>Lun - Vie: 8:00 AM - 7:00 PM</p>
        </div>
      </div>
      <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
    </footer>
  </div> </template>

<style scoped>
/* Pega aquí tu CSS para que se vea bien */
</style>
  