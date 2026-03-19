<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>

      <nav class="navbar">
    <router-link to="/notificaciones" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas">Citas</router-link></li>
      <li><router-link to="/alimentacion">Alimentación</router-link></li>
      <li><router-link to="/carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/perfil">Mi Perfil</router-link></li>
      <li><router-link to="/notificaciones" class="active">Notificaciones</router-link></li>
    </ul>
    <div id="auth-section" class="auth-section">
      <button class="btn-auth" @click="alert('Login no configurado aún')">Iniciar sesión</button>
      <button class="btn-auth" @click="alert('Registro no configurado aún')">Registrarse</button>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="two-col" style="grid-template-columns:260px 1fr;">

      <!-- SIDEBAR FILTROS -->
      <div class="sidebar">
        <div class="card">
          <div class="card-title">Filtrar por categoría</div>
          <ul class="filtros-list">
            <li class="filtro-item active" data-cat="todas" id="filtro-todas">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
              Todas <span class="filtro-count">7</span>
            </li>
            <li class="filtro-item" data-cat="citas" id="filtro-citas">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Citas <span class="filtro-count">0</span>
            </li>
            <li class="filtro-item" data-cat="vacunas" id="filtro-vacunas">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Vacunas <span class="filtro-count">1</span>
            </li>
            <li class="filtro-item" data-cat="alimentacion" id="filtro-alim">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
              Alimentación <span class="filtro-count">2</span>
            </li>
            <li class="filtro-item" data-cat="medicamentos" id="filtro-med">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.5 22l5-16.5m5.5 14l-4.5-16m-8 14.5L3 17"/></svg>
              Medicamentos <span class="filtro-count">1</span>
            </li>
            <li class="filtro-item" data-cat="resultados" id="filtro-res">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
              Resultados <span class="filtro-count">0</span>
            </li>
          </ul>

          <div class="config-section">
            <div class="card-title" style="font-size:.85rem; margin-bottom:.75rem;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              Configuración
            </div>
            <div class="config-row">
              <span>Notificar por email</span>
              <label class="toggle">
                <input type="checkbox" id="chk-email" checked/>
                <span class="slider"></span>
              </label>
            </div>
            <div class="config-row">
              <span>Marcar todas automáticamente</span>
              <label class="toggle">
                <input type="checkbox" id="chk-auto"/>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL NOTIFICACIONES -->
      <div>
        <div class="notif-header">
          <h2 class="notif-title">Todas las notificaciones</h2>
          <div style="display:flex; align-items:center; gap:.75rem;">
            <button class="btn btn-danger btn-sm" id="btn-marcar-leidas">Marcar como leídas</button>
            <span class="badge badge-blue">8 notificaciones</span>
          </div>
        </div>

        <div class="notif-list" id="notif-list">

          <div class="notif-item" data-cat="citas">
            <div class="notif-icon blue"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div class="notif-body">
              <div class="notif-titulo">Cita programada para Max</div>
              <div class="notif-desc">Tienes una cita programada para Max el 25 de Abril a las 10:30 AM en PetCard.</div>
              <div class="notif-tiempo">8 horas</div>
            </div>
            <span class="badge badge-blue">ACTIVA</span>
            <div class="notif-dots">• • •</div>
          </div>

          <div class="notif-item" data-cat="vacunas">
            <div class="notif-icon yellow"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <div class="notif-body">
              <div class="notif-titulo">Vacuna próxima a vencer</div>
              <div class="notif-desc">La vacuna Antirrábica de Max vence el 2 de Mayo. <a href="#" class="link">Programa una cita con el veterinario.</a></div>
              <div class="notif-tiempo">2 horas</div>
            </div>
            <span class="badge badge-yellow" style="white-space:nowrap;">HOY</span>
            <div class="notif-dots">• • •</div>
          </div>

          <div class="notif-item" data-cat="alimentacion">
            <div class="notif-icon orange"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg></div>
            <div class="notif-body">
              <div class="notif-titulo">Hora de alimentar a Luna</div>
              <div class="notif-desc">Es hora de darle su comida a Luna. Dale 200g, cantidad recomendada / kg.</div>
              <div class="notif-tiempo">7 horas</div>
            </div>
            <div class="notif-dots">• • •</div>
          </div>

          <div class="notif-item" data-cat="medicamentos">
            <div class="notif-icon green"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.5 22l5-16.5m5.5 14l-4.5-16m-8 14.5L3 17"/></svg></div>
            <div class="notif-body">
              <div class="notif-titulo">Recordatorio de medicamento</div>
              <div class="notif-desc">Dale el medicamento Glucosamina a Max como se le indicó con la consulta.</div>
              <div class="notif-tiempo">6 horas</div>
            </div>
            <span class="badge badge-green">RECORDATORIO</span>
            <div class="notif-dots">• • •</div>
          </div>

          <div class="notif-item" data-cat="resultados">
            <div class="notif-icon purple"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <div class="notif-body">
              <div class="notif-titulo">Resultado de análisis listo</div>
              <div class="notif-desc">Los resultados del análisis de sangre de Max están listos. Pueden verse desde el sistema.</div>
              <div class="notif-tiempo">4 horas</div>
            </div>
            <span class="badge badge-blue">LISTO</span>
            <div class="notif-dots">• • •</div>
          </div>

          <div class="notif-item" data-cat="citas">
            <div class="notif-icon blue"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div class="notif-body">
              <div class="notif-titulo">Confirmación de cita</div>
              <div class="notif-desc">Tu cita para el 23 de abril a las 2:00 PM ha sido <a href="#" class="link">confirmada.</a></div>
              <div class="notif-tiempo">1 hora</div>
            </div>
            <span class="badge badge-green">CONFIRMADA</span>
            <div class="notif-dots">• • •</div>
          </div>

          <div class="notif-item">
            <div class="notif-icon gray"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg></div>
            <div class="notif-body">
              <div class="notif-titulo">Nuevo servicio disponible</div>
              <div class="notif-desc">Ahora puedes <a href="#" class="link">agendar servicios de emergencia 24/7</a> a través de nuestra aplicación.</div>
              <div class="notif-tiempo">2 días</div>
            </div>
            <span class="badge badge-gray">NUEVA</span>
            <div class="notif-dots">• • •</div>
          </div>

          <div class="notif-item">
            <div class="notif-icon red"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></div>
            <div class="notif-body">
              <div class="notif-titulo">Recordatorio de emergencia</div>
              <div class="notif-desc">Recuerda que tenemos servicio de emergencia disponible los fines de semana y fechas especiales.</div>
              <div class="notif-tiempo">3 días</div>
            </div>
            <div class="notif-dots">• • •</div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="footer" style="margin-top:2rem;">
    <div class="footer-grid">
      <div class="footer-brand"><span class="nav-logo" style="color:#fff; margin-bottom:.5rem; display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>PetCard</span><p>Comprometidos con brindar toda la atención profesional que tu mascota.</p></div>
      <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li><li><a href="#">Cirugías</a></li><li><a href="#">Emergencias</a></li></ul></div>
      <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p><p>info@petcard.com</p><p>Calle Principal 123, Ciudad</p></div>
      <div class="footer-col"><h4>Horarios</h4><p>Lunes - Viernes: 8:00 AM - 7:00 PM</p><p>Sábados: 9:00 AM - 6:00 PM</p><p>Domingos: 10:00 AM - 4:00 PM</p><p class="footer-emergency">Emergencias 24/7</p></div>
    </div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>


  <template></template>