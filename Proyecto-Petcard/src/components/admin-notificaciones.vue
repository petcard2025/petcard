<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuarioLogueado, cerrarSesion } = useAuth()
</script>

<template>

     <nav class="navbar">
    <router-link to="/admin" class="nav-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>PETCARD</router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/admin-alimentacion">Alimentación</router-link></li>
      <li><router-link to="/admin-carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/admin-notificaciones" class="active">Notificaciones</router-link></li>
      <li><router-link to="/admin-servicios">Servicios</router-link></li>
      <li><router-link to="/admin-citas">Citas</router-link></li>
    </ul>
    <div class="nav-actions"><span style="color: white; margin-right: 1rem; font-weight: 500;">{{ usuarioLogueado ? usuarioLogueado.Nombre : 'Admin' }}</span><router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" title="Ver Perfil" style="text-decoration:none;display:inline-block;">👤</router-link><button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button></div>
  </nav>
  <div class="page-wrapper">
    <div class="gestion-header">
      <div><div class="gestion-title">Gestión de Notificaciones</div><div class="gestion-sub">Administra todas las notificaciones del sistema</div></div>
      <div class="gestion-btns">
        <button class="btn btn-success btn-sm" id="btn-nueva-notif">+ Nueva Notificación</button>
      </div>
    </div>
    <div class="search-filter">
      <div class="search-wrap"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Buscar notificaciones..." id="input-buscar"/></div>
      <select class="filter-select" id="select-filtro"><option>Todos</option><option>Enviada</option><option>Borrador</option></select>
    </div>
    <div class="cards-grid-2">
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <div style="display:flex; align-items:center; gap:.5rem; margin-bottom:.3rem;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/></svg>
              <span class="admin-card-title">Recordatorio de Vacunación</span>
            </div>
            <div style="display:flex; gap:.4rem;">
              <span class="badge badge-green">Enviada</span>
              <span class="badge badge-red">Alta</span>
              <span class="badge badge-blue">user</span>
            </div>
          </div>
        </div>
        <div class="admin-card-body">
          <div class="admin-card-meta" style="margin-top:.5rem;">Es hora de la vacuna anual de rabia para su mascota</div>
          <div class="admin-card-meta">Creado por: Sistema</div>
          <div class="admin-card-meta">Fecha: 2024-09-10</div>
          <div class="admin-card-meta">Enviado a: 45 usuarios</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" id="btn-editar-1">Editar</button>
          <button class="btn btn-danger btn-sm" id="btn-eliminar-1">Eliminar</button>
        </div>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <div style="display:flex; align-items:center; gap:.5rem; margin-bottom:.3rem;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/></svg>
              <span class="admin-card-title">Nueva Promoción Disponible</span>
            </div>
            <div style="display:flex; gap:.4rem;">
              <span class="badge badge-gray">Borrador</span>
              <span class="badge badge-yellow">Media</span>
              <span class="badge badge-blue">user</span>
            </div>
          </div>
        </div>
        <div class="admin-card-body">
          <div class="admin-card-meta" style="margin-top:.5rem;">20% de descuento en servicios de grooming este mes</div>
          <div class="admin-card-meta">Creado por: Admin</div>
          <div class="admin-card-meta">Fecha: 2024-09-08</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-success btn-sm" id="btn-enviar-2">Enviar</button>
          <button class="btn btn-secondary btn-sm" id="btn-editar-2">Editar</button>
          <button class="btn btn-danger btn-sm" id="btn-eliminar-2">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
  <footer class="footer" style="margin-top:2rem;"><div class="footer-grid"><div class="footer-brand"><span class="nav-logo" style="color:#fff;display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>PetCard</span><p>Comprometidos con brindar toda la atención profesional.</p></div><div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p></div><div class="footer-col"><h4>Horarios</h4><p class="footer-emergency">Emergencias 24/7</p></div></div><div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div></footer>
 
</template>