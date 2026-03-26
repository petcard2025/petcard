<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { usuarioLogueado, cerrarSesion, irALogin, irARegistro } = useAuth()
</script>

<template>

    <nav class="navbar">
    <router-link to="/citas" class="nav-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>PETCARD</router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas" class="active">Citas</router-link></li>
      <li><router-link to="/alimentacion">Alimentación</router-link></li>
      <li><router-link to="/carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/perfil">Mi Perfil</router-link></li>
      <li><router-link to="/notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/mis-mascotas">Mis Mascotas</router-link></li>
    </ul>
    <div id="auth-section" class="auth-section">
      <template v-if="usuarioLogueado">
        <span class="usuario-nombre">{{ usuarioLogueado.Nombre }}</span>
        <button class="btn-auth btn-logout" @click="cerrarSesion">Cerrar sesión</button>
      </template>
      <template v-else>
        <button class="btn-auth" @click="irALogin">Iniciar sesión</button>
        <button class="btn-auth" @click="irARegistro">Registrarse</button>
      </template>
    </div>
  </nav>

  <div class="hero"><h1>Agendamiento de Citas</h1><p>Programa tu atención veterinaria que tu mascota necesita</p></div>

  <div class="page-wrapper" style="margin-top:2rem;">
    <div class="two-col">
      <!-- FORMULARIO -->
      <div class="card">
        <div class="card-title" style="color:var(--purple);">
          <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Agendar Nueva Cita
        </div>
        <div class="form-row">
          <div class="form-group"><label>Seleccionar Mascota <span class="req">*</span></label><select class="form-control" id="select-mascota"><option value="" disabled selected>Selecciona mascota</option><option>Max</option><option>Luna</option><option>Coco</option></select></div>
          <div class="form-group"><label>Servicio <span class="req">*</span></label><select class="form-control" id="select-servicio"><option value="" disabled selected>Seleccionar servicio</option><option>Consulta General</option><option>Vacunación</option><option>Cirugía</option><option>Emergencia</option><option>Análisis Clínicos</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Fecha <span class="req">*</span></label><input type="date" class="form-control" id="input-fecha"/></div>
          <div class="form-group"><label>Hora <span class="req">*</span></label><select class="form-control" id="select-hora"><option value="" disabled selected>Seleccionar hora</option><option>08:00 AM</option><option>09:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>02:00 PM</option><option>03:00 PM</option><option>04:00 PM</option></select></div>
        </div>
        <div class="form-group"><label>Notas adicionales</label><textarea class="form-control" id="textarea-notas" placeholder="Describe los síntomas o información relevante para el veterinario..."></textarea></div>
        <div style="display:flex; gap:1rem; margin-top:1rem;">
          <router-link to="/citas" class="btn btn-primary btn-full" style="display:inline-block;text-align:center;text-decoration:none;">Agendar Cita</router-link>
          <router-link to="/perfil" class="btn btn-outline-primary" style="display:inline-block;text-align:center;text-decoration:none;">Ver Perfil</router-link>
        </div>
      </div>

      <!-- SIDEBAR -->
      <div class="sidebar">
        <!-- Próximas Citas -->
        <div class="card">
          <div class="card-title" style="color:var(--orange);"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Próximas Citas</div>
          <div style="padding:.65rem 0; border-bottom:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; margin-bottom:.2rem;"><span style="font-weight:700; font-size:.9rem;">Consulta General</span><span class="badge badge-green">Confirmada</span></div>
            <div style="font-size:.8rem; color:var(--muted);">15 de ene, 2024 · 10:00 AM</div>
            <div style="font-size:.8rem; color:var(--muted);">Mascota: <strong>Max</strong></div>
          </div>
          <div style="padding:.65rem 0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:.2rem;"><span style="font-weight:700; font-size:.9rem;">Vacunación</span><span class="badge badge-yellow">Pendiente</span></div>
            <div style="font-size:.8rem; color:var(--muted);">20 de ene, 2024 · 2:00 PM</div>
            <div style="font-size:.8rem; color:var(--muted);">Mascota: <strong>Luna</strong></div>
          </div>
          <a href="#" class="ver-todas" id="link-ver-todas">Ver todas las Citas</a>
        </div>

        <!-- Contacto -->
        <div class="card">
          <div class="card-title" style="color:var(--green);"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.28 11.8 19.79 19.79 0 011.21 3.22 2 2 0 013.22 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>Contacto</div>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:.5rem;">
            <li style="display:flex; gap:.5rem; font-size:.83rem; color:var(--muted);"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.28 11.8 19.79 19.79 0 011.21 3.22 2 2 0 013.22 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>+1 234 567 8901</li>
            <li style="display:flex; gap:.5rem; font-size:.83rem; color:var(--muted);"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>info@petcard.com</li>
            <li style="display:flex; gap:.5rem; font-size:.83rem; color:var(--muted);"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><div>Lun – Vie: 8:00 AM – 6:00 PM<br>Sáb: 9:00 AM – 4:00 PM<br>Dom: 10:00 AM – 4:00 PM</div></li>
          </ul>
          <p style="color:var(--red); font-weight:700; font-size:.83rem; margin-top:.5rem;">🔴 Emergencias 24/7</p>
        </div>

        <!-- Servicios Populares -->
        <div class="card">
          <div class="card-title" style="color:var(--purple);"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>Servicios Populares</div>
          <div class="servicio-pop"><div><div class="sp-nombre">Consulta General</div><div class="sp-dur">30 min</div></div><strong>$50</strong></div>
          <div class="servicio-pop"><div><div class="sp-nombre">Vacunación</div><div class="sp-dur">15 min</div></div><strong>$35</strong></div>
          <div class="servicio-pop"><div><div class="sp-nombre">Cirugía</div><div class="sp-dur">2-4 horas</div></div><strong>$200+</strong></div>
          <div class="servicio-pop"><div><div class="sp-nombre">Emergencia</div><div class="sp-dur">Variable</div></div><strong>$100+</strong></div>
          <button class="btn btn-primary btn-full" style="margin-top:.85rem;" id="btn-ver-todos-servicios">Ver Todos los Servicios</button>
        </div>
      </div>
    </div>
  </div>

  <footer class="footer" style="margin-top:2rem;">
    <div class="footer-grid"><div class="footer-brand"><span class="nav-logo" style="color:#fff;display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="white" opacity=".2"/></svg>PetCard</span><p>Comprometidos con brindar toda la atención profesional que tu mascota.</p></div><div class="footer-col"><h4>Servicios</h4><ul><li><a href="#">Consulta Generales</a></li><li><a href="#">Vacunación</a></li><li><a href="#">Cirugías</a></li><li><a href="#">Emergencias</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p>+1 234 567 8901</p><p>info@petcard.com</p><p>Calle Principal 123, Ciudad</p></div><div class="footer-col"><h4>Horarios</h4><p>Lunes - Viernes: 8:00 AM - 7:00 PM</p><p>Sábados: 9:00 AM - 6:00 PM</p><p>Domingos: 10:00 AM - 4:00 PM</p><p class="footer-emergency">Emergencias 24/7</p></div></div>
    <div class="footer-bottom">© 2024 PetCard. Todos los derechos reservados.</div>
  </footer>



</template><//template>

<script>

(function () {
	function qs(id) { return document.getElementById(id); }

	function loadCitas() {
		try { return JSON.parse(localStorage.getItem('citas') || '[]'); }
		catch { return []; }
	}

	function saveCitas(citas) { localStorage.setItem('citas', JSON.stringify(citas)); }

	function formatDate(fecha) {
		try { return new Date(fecha).toLocaleDateString(); } catch { return fecha; }
	}

	function crearEntradaCita(cita) {
		const cont = document.createElement('div');
		cont.style.padding = '.65rem 0';
		cont.innerHTML = `
			<div style="display:flex; justify-content:space-between; margin-bottom:.2rem;"><span style="font-weight:700; font-size:.9rem;">${cita.servicio}</span><span class="badge badge-yellow">${cita.estado || 'Pendiente'}</span></div>
			<div style="font-size:.8rem; color:var(--muted);">${formatDate(cita.fecha)} · ${cita.hora}</div>
			<div style="font-size:.8rem; color:var(--muted);">Mascota: <strong>${cita.mascota}</strong></div>
		`;
		return cont;
	}

	function updateUpcomingList() {
		const cards = Array.from(document.querySelectorAll('.sidebar .card'));
		const target = cards.find(c => c.querySelector('.card-title') && /Próximas Citas/.test(c.querySelector('.card-title').textContent));
		if (!target) return;

		// Remove previously inserted dynamic list (we mark it with data-dynamic)
		const existing = target.querySelectorAll('[data-dynamic="cita"]');
		existing.forEach(n => n.remove());

		const citas = loadCitas();
		// show up to 3 próximas citas
		const próximas = citas.slice().sort((a,b)=> new Date(a.fecha) - new Date(b.fecha)).slice(0,3);
		if (próximas.length === 0) return;

		const ref = target.querySelector('.ver-todas') || target.lastElementChild;
		próximas.forEach(cita => {
			const nodo = crearEntradaCita(cita);
			nodo.setAttribute('data-dynamic', 'cita');
			target.insertBefore(nodo, ref);
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		const btn = qs('btn-agendar');
		if (!btn) return;

		btn.addEventListener('click', function (e) {
			e.preventDefault();
			const mascota = qs('select-mascota').value;
			const servicio = qs('select-servicio').value;
			const fecha = qs('input-fecha').value;
			const hora = qs('select-hora').value;
			const notas = qs('textarea-notas').value;

			if (!mascota || !servicio || !fecha || !hora) {
				alert('Por favor complete los campos obligatorios: Mascota, Servicio, Fecha y Hora.');
				return;
			}

			const cita = {
				id: 'cita_' + Date.now(),
				mascota, servicio, fecha, hora, notas,
				estado: 'Pendiente',
				createdAt: new Date().toISOString()
			};

			const citas = loadCitas();
			citas.push(cita);
			saveCitas(citas);

			// feedback y limpieza
			alert('Cita agendada correctamente para ' + mascota + ' el ' + formatDate(fecha) + ' a las ' + hora + '.');
			qs('select-mascota').selectedIndex = 0;
			qs('select-servicio').selectedIndex = 0;
			qs('input-fecha').value = '';
			qs('select-hora').selectedIndex = 0;
			qs('textarea-notas').value = '';

			updateUpcomingList();
		});

		// Redirigir al ver mascotas
		const btnVerMascotas = qs('btn-ver-mascotas');
		if (btnVerMascotas) {
			btnVerMascotas.addEventListener('click', function (ev) {
				ev.preventDefault();
				window.location.href = 'mis-mascotas.html';
			});
		}

		// inicializar lista de próximas citas al cargar
		updateUpcomingList();

		// Preseleccionar servicio si viene en la query string: ?servicio=Vacunaci%C3%B3n
		try {
			const params = new URLSearchParams(window.location.search);
			const servicioParam = params.get('servicio');
			if (servicioParam) {
				const sel = qs('select-servicio');
				if (sel) {
					const lower = servicioParam.toLowerCase();
					for (let i = 0; i < sel.options.length; i++) {
						const optText = (sel.options[i].text || '').toLowerCase();
						if (optText === lower || optText.includes(lower)) {
							sel.selectedIndex = i;
							break;
						}
					}
					const fechaInput = qs('input-fecha');
					if (fechaInput) fechaInput.focus();
				}
			}
		} catch (err) {
			// ignore
		}
	});
})();


</script>

<style>
.usuario-nombre {
  color: #0f172a;
  font-weight: 600;
  margin-right: 1rem;
  font-size: 0.95rem;
}

.btn-logout {
  background-color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-logout:hover {
  background-color: #c82333;
  border-color: #c82333;
}
</style>