<template>
    <!-- NAVBAR -->
  <nav class="navbar">
    <a href="inicio.html" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/>
        <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/>
      </svg>
      PETCARD
    </a>
    <ul class="nav-links">
      <li><a href="inicio.html">Inicio</a></li>
      <li><a href="servicios.html" class="active">Servicios</a></li>
      <li><a href="citas.html">Citas</a></li>
      <li><a href="alimentacion.html">Alimentación</a></li>
      <li><a href="carnet-vacunas.html">Carnet de Vacunas</a></li>
      <li><a href="mis-mascotas.html">Mis Mascotas</a></li>
      <li><a href="perfil.html">Perfil</a></li>
    </ul>
    <div id="auth-section" class="auth-section">
      <a href="login-usuario.html" class="btn-auth">Iniciar sesión</a>
      <a href="registro-usuario.html" class="btn-auth">Registrarse</a>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <h1>Nuestros Servicios</h1>
    <p>Ofrecemos atención veterinaria integral con los más altos estándares de calidad.<br>Cada servicio está diseñado para brindar el mejor cuidado a tu mascota.</p>
  </section>

  <!-- GRID SERVICIOS -->
  <section class="section" style="background:#fff;">
    <div class="container">
      <div class="cards-grid-3" id="servicios-grid">

        <div class="servicio-card card">
          <div class="servicio-img-wrap">
            <img src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&q=80" alt="Consulta General"/>
            <span class="servicio-badge blue">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
          </div>
          <div class="servicio-body">
            <h3>Consultas Generales</h3>
            <p>Exámenes completos de salud, diagnósticos y seguimiento continuo de la salud de tu mascota veterinaria.</p>
            <div class="servicio-footer">
              <div class="stars">★★★★★ <span>5.0</span></div>
              <span class="servicio-precio">$50 – $80</span>
            </div>
            <button class="btn btn-primary btn-full" onclick="window.location.href='citas.html'" data-servicio="Consulta General" id="btn-agendar-0">Agendar Cita</button>
          </div>
        </div>

        <div class="servicio-card card">
          <div class="servicio-img-wrap">
            <img src="https://images.unsplash.com/photo-1606425271394-c3ca9aa1fc06?w=400&q=80" alt="Vacunación"/>
            <span class="servicio-badge green">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
          </div>
          <div class="servicio-body">
            <h3>Vacunación</h3>
            <p>Programa completo de vacunación para prevenir enfermedades comunes y mantener las defensas naturales.</p>
            <div class="servicio-footer">
              <div class="stars">★★★★★ <span>5.0</span></div>
              <span class="servicio-precio">$30 – $60</span>
            </div>
            <button class="btn btn-success btn-full" onclick="window.location.href='citas.html'"data-servicio="Vacunación" id="btn-agendar-1">Agendar Cita</button>
          </div>
        </div>

        <div class="servicio-card card">
          <div class="servicio-img-wrap">
            <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80" alt="Cirugías"/>
            <span class="servicio-badge purple">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/></svg>
            </span>
          </div>
          <div class="servicio-body">
            <h3>Cirugías</h3>
            <p>Procedimientos quirúrgicos con tecnología avanzada e instrumentación moderna de procedimientos especiales.</p>
            <div class="servicio-footer">
              <div class="stars">★★★★★ <span>5.0</span></div>
              <span class="servicio-precio">$200 – $800</span>
            </div>
            <button class="btn btn-primary btn-full" onclick="window.location.href='citas.html'" style="background:#7c3aed;" data-servicio="Cirugías" id="btn-agendar-2">Agendar Cita</button>
          </div>
        </div>

        <div class="servicio-card card">  
          <div class="servicio-img-wrap">
            <img src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&q=80" alt="Emergencias"/>
            <span class="servicio-badge red">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
          </div>
          <div class="servicio-body">
            <h3>Emergencias 24/7</h3>
            <p>Atención de urgencia las 24 horas. Disponibles para tipos de lesiones, accidentes y emergencias médicas.</p>
            <div class="servicio-footer">
              <div class="stars">★★★★★ <span>5.0</span></div>
              <span class="servicio-precio">$150 – $400</span>
            </div>
            <button class="btn btn-danger btn-full" onclick="window.location.href='citas.html'"  data-servicio="Emergencias" id="btn-agendar-3">Agendar Cita</button>
          </div>
        </div>

        <div class="servicio-card card">
          <div class="servicio-img-wrap">
            <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80" alt="Análisis"/>
            <span class="servicio-badge teal">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/></svg>
            </span>
          </div>
          <div class="servicio-body">
            <h3>Análisis Clínicos</h3>
            <p>Exámenes de sangre, orina y otros análisis para diagnósticos precisos y seguimiento de tratamientos.</p>
            <div class="servicio-footer">
              <div class="stars">★★★★★ <span>5.0</span></div>
              <span class="servicio-precio">$40 – $120</span>
            </div>
            <button class="btn btn-primary btn-full" onclick="window.location.href='citas.html'" style="background:#0d9488;" data-servicio="Análisis" id="btn-agendar-4">Agendar Cita</button>
          </div>
        </div>

        <div class="servicio-card card">
          <div class="servicio-img-wrap">
            <img src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80" alt="Radiografías"/>
            <span class="servicio-badge orange">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
            </span>
          </div>
          <div class="servicio-body">
            <h3>Radiografías</h3>
            <p>Imágenes diagnósticas digitales para detectar fracturas, problemas internos y monitoreo.</p>
            <div class="servicio-footer">
              <div class="stars">★★★★★ <span>5.0</span></div>
              <span class="servicio-precio">$80 – $150</span>
            </div>
            <button class="btn btn-primary btn-full" onclick="window.location.href='citas.html'" style="background:#16a34a;" data-servicio="Radiografías" id="btn-agendar-5">Agendar Cita</button>
          </div>
        </div>

        <div class="servicio-card card">
          <div class="servicio-img-wrap">
            <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80" alt="Desparasitación"/>
            <span class="servicio-badge amber">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
            </span>
          </div>
          <div class="servicio-body">
            <h3>Desparasitación</h3>
            <p>Tratamientos y medicación para la eliminación de parásitos internos y externos.</p>
            <div class="servicio-footer">
              <div class="stars">★★★★★ <span>5.0</span></div>
              <span class="servicio-precio">$25 – $60</span>
            </div>
            <button class="btn btn-primary btn-full" onclick="window.location.href='citas.html'"  style="background:#92400e;" data-servicio="Desparasitación" id="btn-agendar-6">Agendar Cita</button>
          </div>
        </div>

        <div class="servicio-card card">
          <div class="servicio-img-wrap">
            <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80" alt="Odontología"/>
            <span class="servicio-badge pink">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5z"/></svg>
            </span>
          </div>
          <div class="servicio-body">
            <h3>Odontología</h3>
            <p>Limpieza dental, extracciones y tratamientos especializados para la salud bucal.</p>
            <div class="servicio-footer">
              <div class="stars">★★★★★ <span>5.0</span></div>
              <span class="servicio-precio">$100 – $300</span>
            </div>
            <button class="btn btn-primary btn-full" onclick="window.location.href='citas.html'"  style="background:#db2777;" data-servicio="Odontología" id="btn-agendar-7">Agendar Cita</button>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- EMERGENCIAS BANNER -->
  <section class="emergencia-banner">
    <div class="emergencia-icon">
      <svg width="36" height="36" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
    <h2>Emergencias 24/7</h2>
    <p>Si tu mascota tiene una emergencia médica, no dudes en contactarnos. Estamos disponibles las 24 horas del día, los 365 días del año.</p>
    <div class="emergencia-btns">
      <button class="btn btn-outline-white btn-lg" id="btn-llamar">Llamar Emergencia</button>
      <button class="btn btn-outline-white btn-lg" id="btn-chat">Chat de Urgencia</button>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <span class="nav-logo" style="color:#fff; margin-bottom:.5rem; display:flex;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>
          PetCard
        </span>
        <p>Comprometidos con brindar toda la atención profesional que tu mascota.</p>
      </div>
      <div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li><li><a href="#">Cirugías</a></li><li><a href="#">Emergencias</a></li></ul></div>
      <div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p><p>info@petcard.com</p><p>Calle Principal 123, Ciudad</p></div>
      <div class="footer-col"><h4>Horarios</h4><p>Lunes - Viernes: 8:00 AM - 7:00 PM</p><p>Sábados: 9:00 AM - 6:00 PM</p><p>Domingos: 10:00 AM - 4:00 PM</p><p class="footer-emergency">Emergencias 24/7</p></div>
    </div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>
</template>

<style>
    /* ============================================================
   servicios.css — Pantalla de Servicios (Usuario)
   Requiere: shared.css
   ============================================================ */

/* ── TARJETAS DE SERVICIO ── */
.servicio-card {
  padding: 0;
  overflow: hidden;
  transition: box-shadow .2s, transform .2s;
}

.servicio-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
  transform: translateY(-2px);
}

.servicio-img-wrap {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.servicio-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.servicio-badge {
  position: absolute;
  top: .75rem;
  left: .75rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.servicio-badge.blue   { background: #2563eb; }
.servicio-badge.green  { background: #16a34a; }
.servicio-badge.purple { background: #7c3aed; }
.servicio-badge.red    { background: #dc2626; }
.servicio-badge.teal   { background: #0d9488; }
.servicio-badge.orange { background: #ea580c; }
.servicio-badge.amber  { background: #b45309; }
.servicio-badge.pink   { background: #db2777; }

.servicio-body {
  padding: 1.25rem;
}

.servicio-body h3 {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: .4rem;
}

.servicio-body p {
  font-size: .83rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: .75rem;
}

.servicio-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .85rem;
}

.stars {
  color: #f59e0b;
  font-size: .82rem;
}

.stars span {
  color: var(--text-secondary);
  margin-left: .25rem;
}

.servicio-precio {
  font-weight: 700;
  font-size: .9rem;
  color: var(--text);
}

/* ── EMERGENCIAS BANNER ── */
.emergencia-banner {
  background: #dc2626;
  color: #fff;
  text-align: center;
  padding: 3rem 1.5rem;
}

.emergencia-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.emergencia-banner h2 {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.6rem;
  margin-bottom: .5rem;
}

.emergencia-banner p {
  opacity: .9;
  max-width: 500px;
  margin: 0 auto 1.5rem;
  font-size: .95rem;
  line-height: 1.6;
}

.emergencia-btns {
  display: flex;
  gap: .75rem;
  justify-content: center;
  flex-wrap: wrap;
}

</style>