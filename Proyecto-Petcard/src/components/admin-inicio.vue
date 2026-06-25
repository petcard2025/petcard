<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuarioLogueado, isAuthenticated, cerrarSesion } = useAuth()

// ===== GUARD DE SEGURIDAD =====
onMounted(() => {
  const token = localStorage.getItem('petcard_token')
  const usuarioStr = localStorage.getItem('petcard_usuario_actual')
  let usuario = null
  try { usuario = usuarioStr ? JSON.parse(usuarioStr) : null } catch {}
  if (!token && !usuario) {
    router.push('/login-admin')
    return
  }
  const rol = usuario?.Rol
  if (rol !== 'Admin') {
    router.push('/inicio')
  }
})
</script>

<template>

<nav class="navbar">
    <router-link to="/admin" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links" style="margin-left:1.5rem;">
      <li><router-link to="/admin-alimentacion">Alimentación</router-link></li>
      <li><router-link to="/admin-carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/admin-notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/admin-servicios">Servicios</router-link></li>
      <li><router-link to="/admin-citas">Citas</router-link></li>
    </ul>
    <div class="nav-actions">
      <span style="color: white; margin-right: 1rem; font-weight: 500;">{{ isAuthenticated ? usuarioLogueado?.Nombre : 'Admin' }}</span>
      <router-link to="/admin-perfil" class="btn btn-outline-white btn-sm" title="Ver Perfil" style="text-decoration:none;display:inline-block;">👤</router-link>
      <button class="btn btn-danger btn-sm" @click="cerrarSesion">Cerrar Sesión</button>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero-inicio">
    <div class="hero-content">
      <h1>Cuidado Veterinario de Excelencia</h1>
      <p>Tu plataforma completa de cuidado veterinario. Gestiona citas, historial y salud de tus mascotas en un solo lugar.</p>
      <div class="hero-btns">
        <button class="btn btn-primary btn-lg" id="btn-agendar">Agendar Cita</button>
        <button class="btn btn-outline-white btn-lg" id="btn-servicios">Ver Servicios</button>
      </div>
    </div>
  </section>

  <!-- SERVICIOS COMPLETOS -->
  <section class="section" style="background:#fff;">
    <div class="container">
      <h2 class="section-title">Servicios Completos para tu Mascota</h2>
      <p class="section-sub">Ofrecemos una gama completa de servicios veterinarios con la más alta calidad y tecnología para asegurar el bienestar de tu mascota.</p>
      <div class="cards-grid-3">
        <div class="feature-card card">
          <div class="feature-icon blue"><svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <h3>Agendar Citas</h3>
          <p>Programa tus horarios de forma online y ten todas las citas de las mascotas de tu familia.</p>
          <router-link to="/admin-citas" class="feature-link">Agendar →</router-link>
        </div>
        <div class="feature-card card">
          <div class="feature-icon green"><svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
          <h3>Servicios Veterinarios</h3>
          <p>Consultas generales, especializadas, análisis de laboratorio, cirugías menores y mayores.</p>
          <router-link to="/admin-servicios" class="feature-link">Ver servicios →</router-link>
        </div>
        <div class="feature-card card">
          <div class="feature-icon purple"><svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
          <h3>Gestión de Mascotas</h3>
          <p>Administra el perfil completo de las mascotas, historial médico y medicamentos.</p>
          <a href="#" class="feature-link">Gestionar →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- TODO LO QUE NECESITAS -->
  <section class="section">
    <div class="container">
      <div class="two-features">
        <div class="features-text">
          <h2>Todo lo que necesitas para el cuidado de tu mascota</h2>
          <p style="color:var(--text-secondary); margin:1rem 0 1.5rem;">Nuestra plataforma integra todos los tratamientos necesarios para brindar un rango completo de cuidado veterinario.</p>
          <ul class="features-list">
            <li><span class="feat-dot blue"></span><div><strong>Historial Médico Completo</strong><p>Accede a todos tus registros, vacunas, tratamientos y medicamentos.</p></div></li>
            <li><span class="feat-dot blue"></span><div><strong>Recordatorios Automáticos</strong><p>Nunca olvides citas o fechas de vacunas con nuestros alertas de notificaciones.</p></div></li>
            <li><span class="feat-dot blue"></span><div><strong>Profesionales Certificados</strong><p>Equipo de veterinarios especializados con años de experiencia.</p></div></li>
          </ul>
        </div>
        <div><img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&q=80" alt="Mascota" style="border-radius:12px; width:100%; height:300px; object-fit:cover;"/></div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <h2>¿Tu mascota necesita atención?</h2>
    <p>No esperes más. Agenda una cita hoy mismo y dale a tu compañero el cuidado que merece.</p>
    <div class="cta-btns">
      <button class="btn btn-outline-white btn-lg" id="btn-agendar-cta">Agendar Cita Ahora</button>
      <button class="btn btn-outline-white btn-lg" id="btn-ver-cta">Ver Servicios</button>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand"><span class="nav-logo" style="color:#fff; margin-bottom:.5rem; display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>PetCard</span><p>Comprometidos con brindar toda la atención profesional que tu mascota.</p></div>
      <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li><li><a href="#">Cirugías</a></li><li><a href="#">Emergencias</a></li></ul></div>
      <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p><p>info@petcard.com</p><p>Calle Principal 123, Ciudad</p></div>
      <div class="footer-col"><h4>Horarios</h4><p>Lunes - Viernes: 8:00 AM - 7:00 PM</p><p>Sábados: 9:00 AM - 6:00 PM</p><p>Domingos: 10:00 AM - 4:00 PM</p><p class="footer-emergency">Emergencias 24/7</p></div>
    </div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>

</template>