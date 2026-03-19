<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>

     <nav class="navbar">
    <router-link to="/carnet" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas">Citas</router-link></li>
      <li><router-link to="/alimentacion">Alimentación</router-link></li>
      <li><router-link to="/carnet" class="active">Carnet de Vacunas</router-link></li>
      <li><router-link to="/perfil">Mi Perfil</router-link></li>
      <li><router-link to="/notificaciones">Notificaciones</router-link></li>
    </ul>
    <div id="auth-section" class="auth-section">
      <button class="btn-auth" @click="alert('Login no configurado aún')">Iniciar sesión</button>
      <button class="btn-auth" @click="alert('Registro no configurado aún')">Registrarse</button>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="two-col">

      <!-- PANEL PRINCIPAL -->
      <div>
        <!-- Selector + agregar mascota -->
        <div class="card" style="margin-bottom:1.25rem;">
          <div class="card-title" style="color:var(--purple);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            Seleccionar Mascota
            <button class="btn btn-success btn-sm" id="btn-agregar-mascota" style="margin-left:auto;">Agregar Mascota</button>
          </div>
          <p style="font-size:.85rem; color:var(--muted); margin-bottom:.75rem;">Elige tu mascota para ver el carnet de vacunas</p>
          <select class="form-control" id="select-mascota" style="max-width:220px;">
            <option>Max – Golden Retriever</option>
            <option>Luna – Gato Persa</option>
          </select>
        </div>

        <!-- Tabla de vacunas -->
        <div class="card">
          <div class="vacuna-header">
            <div class="card-title" style="margin-bottom:0; color:#fff;">Carnet de Vacunación</div>
            <div class="vet-info">
              <div>Veterinario: <strong>Dr. José García</strong></div>
              <div>Matrícula: <strong>47789</strong></div>
            </div>
          </div>

          <div class="table-wrapper" style="margin-top:1rem;">
            <table>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Vacuna</th>
                  <th>Fecha Programada</th>
                  <th>Fecha Aplicada</th>
                  <th>Lote</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="status-icon" style="color:var(--green);">✓</span></td>
                  <td class="vacuna-nombre" style="color:var(--purple);">Antirrábica</td>
                  <td>13 Mar 2024</td>
                  <td>13 Mar 2024</td>
                  <td>A8-004-001</td>
                  <td>Sin novedad</td>
                </tr>
                <tr>
                  <td><span class="status-icon" style="color:var(--green);">✓</span></td>
                  <td class="vacuna-nombre" style="color:var(--purple);">Múltiple (DHPP)</td>
                  <td>13 Mar 2024</td>
                  <td>13 Mar 2024</td>
                  <td>A8-004-001</td>
                  <td>Sin novedad</td>
                </tr>
                <tr>
                  <td><span class="status-icon" style="color:var(--yellow);">⚠</span></td>
                  <td class="vacuna-nombre" style="color:var(--red);">Bordetella</td>
                  <td>13 Mar 2024</td>
                  <td>4 May 2024</td>
                  <td>A8-004-001</td>
                  <td>Leve reacción</td>
                </tr>
                <tr>
                  <td><span class="status-icon" style="color:var(--green);">✓</span></td>
                  <td class="vacuna-nombre" style="color:var(--purple);">Lyme</td>
                  <td>15 Mar 2024</td>
                  <td>5 Mar 2024</td>
                  <td>A8-004-001</td>
                  <td>Sin novedad</td>
                </tr>
                <tr>
                  <td><span class="status-icon" style="color:var(--green);">✓</span></td>
                  <td class="vacuna-nombre" style="color:var(--purple);">Parvovirus</td>
                  <td>20 Jun 2024</td>
                  <td>20 Jun 2024</td>
                  <td>A8-004-001</td>
                  <td>Sin novedad</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Observaciones médicas -->
          <div class="obs-medicas">
            <h4>Observaciones Médicas:</h4>
            <ul>
              <li>Alergia: Ninguna conocida</li>
              <li>Múltiple (DHPP): Aplicada correctamente</li>
              <li>Bordetella: Próxima aplicación requerida</li>
              <li>Lyme: Programa en fecha</li>
              <li>Parvovirus: Refuerzo en fecha</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- SIDEBAR -->
      <div class="sidebar">

        <!-- Estado de vacunación -->
        <div class="card">
          <div class="card-title">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Estado de Vacunación
          </div>
          <div class="pct-display">
            <div class="pct-number">60%</div>
            <div class="pct-label">Carnet de Vacunación</div>
          </div>
          <div class="progress-bar" style="margin-bottom:1rem;"><div class="progress-fill yellow" style="width:60%;"></div></div>
          <div class="vac-stats">
            <div class="vac-stat-row"><span>Aplicadas:</span><strong>4</strong></div>
            <div class="vac-stat-row"><span>Pendientes o demorar:</span><strong>1</strong></div>
            <div class="vac-stat-row"><span>Próximas:</span><strong>3</strong></div>
          </div>
        </div>

        <!-- Próximas Vacunas -->
        <div class="card">
          <div class="card-title" style="color:var(--orange);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Próximas Vacunas
          </div>
          <div class="proxima-vac">
            <div class="proxima-vac-header">
              <span class="vacuna-nombre2">Lyme</span>
              <span class="badge badge-yellow">Próxima Dosis</span>
            </div>
            <div style="font-size:.78rem; color:var(--muted);">Próxima: 20 Jun 2024</div>
          </div>
          <div class="proxima-vac">
            <div class="proxima-vac-header">
              <span class="vacuna-nombre2">Bordetella</span>
              <span class="badge badge-red">Atrasada</span>
            </div>
            <div style="font-size:.78rem; color:var(--muted);">Próxima: 15 May 2024</div>
          </div>
          <button class="btn btn-success btn-full" style="margin-top:.75rem;" id="btn-agendar-vac">Agendar Vacunación</button>
        </div>

        <!-- Info del carnet -->
        <div class="card">
          <div class="card-title" style="color:var(--green);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Información del Carnet
          </div>
          <div class="info-row"><span>Mascota:</span><strong>Max</strong></div>
          <div class="info-row"><span>Especie:</span><strong>Canino</strong></div>
          <div class="info-row"><span>Raza:</span><strong>Golden</strong></div>
          <div class="info-row"><span>ID:</span><strong>PET001</strong></div>
          <div class="info-row"><span>Última actualización:</span><strong>20 Mar 2024</strong></div>
          <div class="info-row"><span>Próxima cita:</span><strong>15 May 2024</strong></div>
          <div style="display:flex; gap:.5rem; margin-top:1rem;">
            <button class="btn btn-secondary btn-sm" style="flex:1;" id="btn-descargar-pdf">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Descargar PDF
            </button>
            <button class="btn btn-primary btn-sm" style="flex:1;" id="btn-imprimir">Imprimir Carnet</button>
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
</template>