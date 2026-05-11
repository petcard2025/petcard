// ============================================================
// admin-alimentacion.js — Gestión de Alimentación
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  inicializarEventos();
});

// ── INICIALIZACIÓN DE EVENTOS ──
function inicializarEventos() {
  // Botones de acciones principales
  const btnGenerar = document.getElementById('btn-generar');
  const btnNuevoPlan = document.getElementById('btn-nuevo-plan');
  
  // Botones de edición y eliminación
  const btnEditarMax = document.getElementById('btn-editar-max');
  const btnEliminarMax = document.getElementById('btn-eliminar-max');
  const btnEditarLuna = document.getElementById('btn-editar-luna');
  const btnEliminarLuna = document.getElementById('btn-eliminar-luna');
  
  // Botones de admin
  const btnPerfilAdmin = document.getElementById('btn-perfil-admin');
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  
  // Buscar y filtro
  const inputBuscar = document.getElementById('input-buscar');
  const selectFiltro = document.getElementById('select-filtro');

  if (btnGenerar) btnGenerar.addEventListener('click', generarDatos);
  if (btnNuevoPlan) btnNuevoPlan.addEventListener('click', abrirNuevoPlan);
  
  if (btnEditarMax) btnEditarMax.addEventListener('click', (e) => editarPlan('Max', e));
  if (btnEliminarMax) btnEliminarMax.addEventListener('click', (e) => eliminarPlan('Max', e));
  if (btnEditarLuna) btnEditarLuna.addEventListener('click', (e) => editarPlan('Luna', e));
  if (btnEliminarLuna) btnEliminarLuna.addEventListener('click', (e) => eliminarPlan('Luna', e));
  
  if (btnPerfilAdmin) btnPerfilAdmin.addEventListener('click', verPerfil);
  if (btnCerrarSesion) btnCerrarSesion.addEventListener('click', cerrarSesion);
  
  if (inputBuscar) inputBuscar.addEventListener('input', filtrarPlanes);
  if (selectFiltro) selectFiltro.addEventListener('change', filtrarPlanes);
}

// ── EFECTO VISUAL PARA BOTONES ──
function efecto_click(event) {
  const btn = event.currentTarget;
  
  // Agregar clase de animación
  btn.classList.add('btn-clicked');
  
  // Crear efecto ripple
  const ripple = document.createElement('div');
  ripple.classList.add('ripple');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  
  btn.appendChild(ripple);
  
  // Remover ripple después de la animación
  setTimeout(() => ripple.remove(), 600);
  
  // Remover clase de click
  setTimeout(() => btn.classList.remove('btn-clicked'), 200);
}

// ── GENERAR DATOS ──
function generarDatos(event) {
  efecto_click(event);
  mostrarNotificacion('Generando datos...', 'info');
  
  // convertir el grid de planes a PDF
  setTimeout(async () => {
    try {
      const grid = document.getElementById('planes-grid');
      const canvas = await html2canvas(grid, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('planes_alimentacion.pdf');
      mostrarNotificacion('✓ PDF descargado listo para imprimir', 'success');
    } catch (err) {
      console.error(err);
      mostrarNotificacion('Error al generar PDF', 'error');
    }
  }, 1200);
}

// ── NUEVO PLAN ──
function abrirNuevoPlan(event) {
  efecto_click(event);
  mostrarNotificacion('Abriendo formulario de nuevo plan...', 'info');
  
  const modal = crearModalNuevoPlan();
  document.body.appendChild(modal);
  
  const btnGuardar = modal.querySelector('.btn-guardar-modal');
  btnGuardar.addEventListener('click', () => {
    // leer valores
    const nombre = modal.querySelector('#input-mascota').value || 'Sin nombre';
    const tipo = modal.querySelector('#input-tipo').value || 'Desconocido';
    const plan = modal.querySelector('#input-plan').value || '';
    const calorias = modal.querySelector('#input-calorias').value || '0';
    const frecuencia = modal.querySelector('#input-frecuencia').value || '';
    const creador = modal.querySelector('#input-creador').value || 'Admin';
    const fecha = modal.querySelector('#input-fecha').value || new Date().toISOString().split('T')[0];

    agregarTarjeta(nombre, tipo, plan, calorias, frecuencia, creador, fecha);
    modal.remove();
    mostrarNotificacion(`✓ Nuevo plan para ${nombre} creado`, 'success');
  });
  
  const btnCancelar = modal.querySelector('.btn-cancelar-modal');
  btnCancelar.addEventListener('click', () => modal.remove());
}

// ── EDITAR PLAN ──
function editarPlan(mascota, event) {
  efecto_click(event);
  const card = event.currentTarget.closest('.admin-card');
  
  if (!card) return;
  
  // Obtener datos actuales
  const titulo = card.querySelector('.admin-card-title').textContent;
  const tipo = card.querySelector('.admin-card-tipo').textContent;
  const detail = card.querySelector('.detail').textContent;
  const metas = card.querySelectorAll('.admin-card-meta');
  const calorias = metas[0].textContent.match(/\d+/)?.[0] || '';
  const frecuencia = metas[0].textContent.split('•')[1]?.trim() || '';
  const creador = metas[1].textContent.replace('Creado por: ', '');
  const fecha = metas[2].textContent.replace('Fecha: ', '');
  
  // Crear modal
  const modal = crearModalEditar(titulo, tipo, detail, calorias, frecuencia, creador, fecha);
  document.body.appendChild(modal);
  
  // Evento guardar
  const btnGuardar = modal.querySelector('.btn-guardar-modal');
  btnGuardar.addEventListener('click', () => {
    const nuevoDetail = modal.querySelector('#input-plan').value;
    const nuevasCalorias = modal.querySelector('#input-calorias').value;
    const nuevaFrecuencia = modal.querySelector('#input-frecuencia').value;
    
    // Actualizar tarjeta
    card.querySelector('.detail').textContent = nuevoDetail;
    metas[0].textContent = `⏱ ${nuevasCalorias} cal/día • ${nuevaFrecuencia}`;
    
    // Cerrar modal
    modal.remove();
    mostrarNotificacion(`✓ Plan de ${titulo} actualizado exitosamente`, 'success');
  });
  
  // Evento cancelar
  const btnCancelar = modal.querySelector('.btn-cancelar-modal');
  btnCancelar.addEventListener('click', () => {
    modal.remove();
  });
}

// ── CREAR MODAL DE NUEVO PLAN ──
function crearModalNuevoPlan() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Nuevo Plan de Alimentación</h2>
        <button class="modal-close btn-cancelar-modal" aria-label="Cerrar">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Mascota</label>
          <input type="text" id="input-mascota" placeholder="Nombre de la mascota" class="form-input">
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <input type="text" id="input-tipo" placeholder="Perro / Gato" class="form-input">
        </div>
        <div class="form-group">
          <label>Plan de Alimentación</label>
          <input type="text" id="input-plan" placeholder="Descripción" class="form-input">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Calorías/día</label>
            <input type="number" id="input-calorias" placeholder="ej: 350" class="form-input">
          </div>
          <div class="form-group">
            <label>Frecuencia</label>
            <input type="text" id="input-frecuencia" placeholder="ej: 2 veces/día" class="form-input">
          </div>
        </div>
        <div class="form-group">
          <label>Creado por</label>
          <input type="text" id="input-creador" placeholder="Admin" class="form-input">
        </div>
        <div class="form-group">
          <label>Fecha</label>
          <input type="date" id="input-fecha" class="form-input" value="` + new Date().toISOString().split('T')[0] + `">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-cancelar-modal">Cancelar</button>
        <button class="btn btn-primary btn-guardar-modal">Crear Plan</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  return modal;
}

// ── CREAR MODAL DE EDICIÓN ──
function crearModalEditar(titulo, tipo, detail, calorias, frecuencia, creador, fecha) {
  const modal = document.createElement('div');

  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Editar Plan de Alimentación</h2>
        <button class="modal-close btn-cancelar-modal" aria-label="Cerrar">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label>Mascota</label>
          <input type="text" value="${titulo}" disabled class="form-input">
        </div>
        
        <div class="form-group">
          <label>Tipo</label>
          <input type="text" value="${tipo}" disabled class="form-input">
        </div>
        
        <div class="form-group">
          <label>Plan de Alimentación</label>
          <input type="text" id="input-plan" value="${detail}" class="form-input">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Calorías/día</label>
            <input type="number" id="input-calorias" value="${calorias}" class="form-input">
          </div>
          <div class="form-group">
            <label>Frecuencia</label>
            <input type="text" id="input-frecuencia" value="${frecuencia}" placeholder="ej: 2 veces/día" class="form-input">
          </div>
        </div>
        
        <div class="form-group">
          <label>Creado por</label>
          <input type="text" value="${creador}" disabled class="form-input">
        </div>
        
        <div class="form-group">
          <label>Fecha</label>
          <input type="text" value="${fecha}" disabled class="form-input">
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary btn-cancelar-modal">Cancelar</button>
        <button class="btn btn-primary btn-guardar-modal">Guardar Cambios</button>
      </div>
    </div>
  `;
  
  // Cerrar al hacer clic en overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  return modal;
}

// ── AGREGAR NUEVA TARJETA ──
function agregarTarjeta(nombre, tipo, plan, calorias, frecuencia, creador, fecha) {
  const grid = document.getElementById('planes-grid');
  if (!grid) return;

  // construir HTML de tarjeta
  const card = document.createElement('div');
  card.className = 'admin-card';
  card.innerHTML = `
    <div class="admin-card-header">
      <div>
        <div class="admin-card-title">${nombre}</div>
        <div class="admin-card-tipo">${tipo}</div>
      </div>
      <span class="badge badge-green">Activo</span>
    </div>
    <div class="admin-card-body">
      <div class="detail">${plan}</div>
      <div class="admin-card-meta">⏱ ${calorias} cal/día • ${frecuencia}</div>
      <div class="admin-card-meta">Creado por: ${creador}</div>
      <div class="admin-card-meta">Fecha: ${fecha}</div>
    </div>
    <div class="admin-card-actions">
      <button class="btn btn-secondary btn-sm btn-editar">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Editar
      </button>
      <button class="btn btn-danger btn-sm btn-eliminar">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        Eliminar
      </button>
    </div>
  `;

  // insertar y animar
  grid.appendChild(card);
  card.classList.add('fade-in');

  // adjuntar eventos a los nuevos botones
  const btnEd = card.querySelector('.btn-editar');
  const btnEl = card.querySelector('.btn-eliminar');
  if (btnEd) btnEd.addEventListener('click', (e) => editarPlan(nombre, e));
  if (btnEl) btnEl.addEventListener('click', (e) => eliminarPlan(nombre, e));
}

// ── ELIMINAR PLAN ──
function eliminarPlan(mascota, event) {
  if (confirm(`¿Estás seguro de que deseas eliminar el plan de ${mascota}?`)) {
    efecto_click(event);
    mostrarNotificacion(`Eliminando plan de ${mascota}...`, 'warning');
    
    setTimeout(() => {
      const card = event.currentTarget.closest('.admin-card');
      if (card) {
        card.classList.add('card-eliminar');
        setTimeout(() => {
          card.remove();
          mostrarNotificacion(`✓ Plan de ${mascota} eliminado`, 'success');
        }, 400);
      } else {
        mostrarNotificacion(`✓ Plan de ${mascota} eliminado`, 'success');
      }
    }, 800);
  }
}

// ── VER PERFIL ──
function verPerfil(event) {
  efecto_click(event);
  mostrarNotificacion('Cargando perfil...', 'info');
  
  setTimeout(() => {
    window.location.href = '../html/admin-perfil.html';
  }, 600);
}

// ── CERRAR SESIÓN ──
function cerrarSesion(event) {
  efecto_click(event);
  
  if (confirm('¿Deseas cerrar sesión?')) {
    mostrarNotificacion('Cerrando sesión...', 'warning');
    
    setTimeout(() => {
      localStorage.removeItem('admin_token');
      window.location.href = '../html/login-admin.html';
    }, 1200);
  }
}

// ── FILTRAR PLANES ──
function filtrarPlanes() {
  const busqueda = document.getElementById('input-buscar')?.value.toLowerCase() || '';
  const filtro = document.getElementById('select-filtro')?.value || 'Todos';
  const cards = document.querySelectorAll('.admin-card');
  
  cards.forEach(card => {
    const titulo = card.querySelector('.admin-card-title')?.textContent.toLowerCase() || '';
    const badge = card.querySelector('.badge')?.textContent || '';
    
    const coincideBusqueda = titulo.includes(busqueda);
    const coincideFiltro = filtro === 'Todos' || badge.includes(filtro);
    
    card.style.display = coincideBusqueda && coincideFiltro ? 'block' : 'none';
    if (coincideBusqueda && coincideFiltro) {
      card.classList.add('fade-in');
    }
  });
}

// ── NOTIFICACIONES ──
function mostrarNotificacion(mensaje, tipo = 'info') {
  // Crear contenedor si no existe
  let container = document.getElementById('notificaciones-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notificaciones-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }

  // Crear notificación
  const notif = document.createElement('div');
  notif.className = `notificacion notificacion-${tipo}`;
  notif.textContent = mensaje;
  notif.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
    min-width: 250px;
  `;

  // Estilos por tipo
  if (tipo === 'success') {
    notif.style.backgroundColor = '#10b981';
    notif.style.color = 'white';
  } else if (tipo === 'error') {
    notif.style.backgroundColor = '#ef4444';
    notif.style.color = 'white';
  } else if (tipo === 'warning') {
    notif.style.backgroundColor = '#f59e0b';
    notif.style.color = 'white';
  } else {
    notif.style.backgroundColor = '#3b82f6';
    notif.style.color = 'white';
  }

  container.appendChild(notif);

  // Remover después de 3 segundos
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Estilos de animación globales
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes eliminar {
    0% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(100%); }
  }

  .fade-in {
    animation: fadeIn 0.3s ease;
  }

  .card-eliminar {
    animation: eliminar 0.4s ease forwards;
  }

  .btn:active {
    transform: scale(0.98);
  }

  .btn-clicked {
    position: relative;
    overflow: hidden;
  }

  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Mejoras visuales para botones */
  .btn {
    position: relative;
    transition: all 0.3s ease;
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .btn-primary:hover {
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
  }

  .btn-success:hover {
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
  }

  .btn-danger:hover {
    box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
  }

  .btn-secondary:hover {
    box-shadow: 0 8px 16px rgba(107, 114, 128, 0.3);
  }
`;
document.head.appendChild(style);
