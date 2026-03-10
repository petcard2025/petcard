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

