// admin-carnet.js - Gestión de registros de vacunación

(function() {
  'use strict';

  // Verificar sesión de administrador
  document.addEventListener('DOMContentLoaded', function() {
    const admin = window.PetCardAuth.verificarSesionAdmin();
    if (admin) {
      document.getElementById('admin-nombre').textContent = admin.nombre || 'Admin';
    }
    
    inicializarEventos();
    cargarRegistros();
  });

  // Estado global de registros
  let registros = [
    {
      id: 1,
      mascota: 'Max',
      tipo: 'Perro',
      vacuna: 'Rabia',
      lote: 'RAB-2024-001',
      aplicada: '2024-08-15',
      proxima: '2025-08-15',
      veterinario: 'Dr. García',
      estado: 'Completada'
    },
    {
      id: 2,
      mascota: 'Luna',
      tipo: 'Gato',
      vacuna: 'Triple Felina',
      lote: 'TF-2024-042',
      aplicada: '2024-09-01',
      proxima: '2025-09-01',
      veterinario: 'Dra. López',
      estado: 'Pendiente'
    }
  ];

  // Inicializar eventos de botones
  function inicializarEventos() {
    // Botones de navegación principal
    document.getElementById('btn-cerrar-sesion').addEventListener('click', function() {
      window.PetCardAuth.cerrarSesionAdmin();
    });

    document.getElementById('btn-perfil-admin').addEventListener('click', function() {
      window.location.href = 'admin-perfil.html';
    });

    // Botones de gestión de registros
    document.getElementById('btn-generar').addEventListener('click', generarDatos);
    document.getElementById('btn-nuevo-registro').addEventListener('click', abrirModalNuevo);

    // Búsqueda y filtros
    document.getElementById('input-buscar').addEventListener('keyup', filtrarRegistros);
    document.getElementById('select-filtro').addEventListener('change', filtrarRegistros);

    // Navegación en navbar
    document.querySelector('.nav-logo').addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'admin-inicio.html';
    });

    // Botones de editar/eliminar para registros dinámicos
    actualizarEventosRegistros();
  }

  // Cargar y mostrar registros
  function cargarRegistros() {
    const grid = document.querySelector('.cards-grid-2');
    if (!grid) return;
    
    mostrarRegistros(registros);
  }

  // Mostrar registros en la página
  function mostrarRegistros(datos) {
    const grid = document.querySelector('.cards-grid-2');
    if (!grid) return;

    if (datos.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">No hay registros que mostrar</p>';
      return;
    }

    grid.innerHTML = datos.map(registro => `
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">${registro.mascota}</div>
            <div class="admin-card-tipo">${registro.tipo}</div>
          </div>
          <span class="badge badge-${registro.estado === 'Completada' ? 'green' : 'yellow'}">
            ${registro.estado}
          </span>
        </div>
        <div class="admin-card-body">
          <div class="detail">${registro.vacuna}</div>
          <div class="admin-card-meta">Lote: ${registro.lote}</div>
          <div class="admin-card-meta">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Aplicada: ${registro.aplicada}
          </div>
          <div class="admin-card-meta">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Próxima: ${registro.proxima}
          </div>
          <div class="admin-card-meta">Veterinario: ${registro.veterinario}</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm btn-editar" data-id="${registro.id}">Editar</button>
          <button class="btn btn-danger btn-sm btn-eliminar" data-id="${registro.id}">Eliminar</button>
        </div>
      </div>
    `).join('');

    actualizarEventosRegistros();
  }

  // Actualizar eventos de botones de registros generados dinámicamente
  function actualizarEventosRegistros() {
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const registro = registros.find(r => r.id === id);
        if (registro) {
          abrirModalEditar(registro);
        }
      });
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
          registros = registros.filter(r => r.id !== id);
          cargarRegistros();
        }
      });
    });
  }

  // Filtrar registros por búsqueda y estado
  function filtrarRegistros() {
    const busqueda = document.getElementById('input-buscar').value.toLowerCase();
    const filtro = document.getElementById('select-filtro').value;

    const resultado = registros.filter(registro => {
      const coincideBusqueda = 
        registro.mascota.toLowerCase().includes(busqueda) ||
        registro.vacuna.toLowerCase().includes(busqueda) ||
        registro.veterinario.toLowerCase().includes(busqueda);
      
      const coincideFiltro = filtro === 'Todos' || registro.estado === filtro;

      return coincideBusqueda && coincideFiltro;
    });

    mostrarRegistros(resultado);
  }

  // Generar datos de ejemplo
  function generarDatos() {
    const nuevosRegistros = [
      {
        id: 3,
        mascota: 'Buddy',
        tipo: 'Perro',
        vacuna: 'Moquillo',
        lote: 'MOQ-2024-089',
        aplicada: '2024-10-10',
        proxima: '2025-10-10',
        veterinario: 'Dr. Rodríguez',
        estado: 'Completada'
      },
      {
        id: 4,
        mascota: 'Whiskers',
        tipo: 'Gato',
        vacuna: 'Leucemia Felina',
        lote: 'LF-2024-015',
        aplicada: '2024-11-05',
        proxima: '2025-05-05',
        veterinario: 'Dra. López',
        estado: 'Pendiente'
      },
      {
        id: 5,
        mascota: 'Rex',
        tipo: 'Perro',
        vacuna: 'Rabia',
        lote: 'RAB-2024-102',
        aplicada: '2024-12-01',
        proxima: '2025-12-01',
        veterinario: 'Dr. García',
        estado: 'Completada'
      }
    ];

    // Agregar solo los que no existan
    nuevosRegistros.forEach(nuevo => {
      if (!registros.find(r => r.id === nuevo.id)) {
        registros.push(nuevo);
      }
    });

    cargarRegistros();
    alert('✅ Datos generados correctamente');
  }

  // Abrir modal para nuevo registro
  function abrirModalNuevo() {
    const nuevoId = Math.max(...registros.map(r => r.id), 0) + 1;
    
    const html = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" id="modal-overlay">
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%;">
          <h2 style="margin-top: 0; color: var(--primary);">Nuevo Registro de Vacunación</h2>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre Mascota</label>
            <input type="text" id="modal-mascota" placeholder="Ej: Max" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Tipo</label>
              <select id="modal-tipo" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px;">
                <option>Perro</option>
                <option>Gato</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Estado</label>
              <select id="modal-estado" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px;">
                <option>Pendiente</option>
                <option>Completada</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Vacuna</label>
            <input type="text" id="modal-vacuna" placeholder="Ej: Rabia" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Lote</label>
            <input type="text" id="modal-lote" placeholder="Ej: RAB-2024-001" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Fecha Aplicada</label>
              <input type="date" id="modal-aplicada" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Próxima Dosis</label>
              <input type="date" id="modal-proxima" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
            </div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Veterinario</label>
            <input type="text" id="modal-veterinario" placeholder="Ej: Dr. García" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div style="display: flex; gap: 1rem;">
            <button class="btn btn-primary" onclick="guardarNuevoRegistro(${nuevoId})" style="flex: 1;">Guardar</button>
            <button class="btn btn-outline" onclick="cerrarModal()" style="flex: 1;">Cancelar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) cerrarModal();
    });
  }

  // Abrir modal para editar registro
  function abrirModalEditar(registro) {
    const html = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" id="modal-overlay">
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%;">
          <h2 style="margin-top: 0; color: var(--primary);">Editar Registro de Vacunación</h2>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre Mascota</label>
            <input type="text" id="modal-mascota" value="${registro.mascota}" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Tipo</label>
              <select id="modal-tipo" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px;">
                <option ${registro.tipo === 'Perro' ? 'selected' : ''}>Perro</option>
                <option ${registro.tipo === 'Gato' ? 'selected' : ''}>Gato</option>
                <option ${registro.tipo === 'Otro' ? 'selected' : ''}>Otro</option>
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Estado</label>
              <select id="modal-estado" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px;">
                <option ${registro.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option ${registro.estado === 'Completada' ? 'selected' : ''}>Completada</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Vacuna</label>
            <input type="text" id="modal-vacuna" value="${registro.vacuna}" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Lote</label>
            <input type="text" id="modal-lote" value="${registro.lote}" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Fecha Aplicada</label>
              <input type="date" id="modal-aplicada" value="${registro.aplicada}" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Próxima Dosis</label>
              <input type="date" id="modal-proxima" value="${registro.proxima}" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
            </div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Veterinario</label>
            <input type="text" id="modal-veterinario" value="${registro.veterinario}" style="width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div style="display: flex; gap: 1rem;">
            <button class="btn btn-primary" onclick="guardarRegistroEditado(${registro.id})" style="flex: 1;">Guardar Cambios</button>
            <button class="btn btn-outline" onclick="cerrarModal()" style="flex: 1;">Cancelar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) cerrarModal();
    });
  }

  // Funciones globales para los modales
  window.cerrarModal = function() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.remove();
  };

  window.guardarNuevoRegistro = function(id) {
    const mascota = document.getElementById('modal-mascota').value.trim();
    const tipo = document.getElementById('modal-tipo').value;
    const vacuna = document.getElementById('modal-vacuna').value.trim();
    const lote = document.getElementById('modal-lote').value.trim();
    const aplicada = document.getElementById('modal-aplicada').value;
    const proxima = document.getElementById('modal-proxima').value;
    const veterinario = document.getElementById('modal-veterinario').value.trim();
    const estado = document.getElementById('modal-estado').value;

    if (!mascota || !vacuna || !lote || !aplicada || !proxima || !veterinario) {
      alert('⚠️ Completa todos los campos');
      return;
    }

    registros.push({
      id,
      mascota,
      tipo,
      vacuna,
      lote,
      aplicada,
      proxima,
      veterinario,
      estado
    });

    window.cerrarModal();
    cargarRegistros();
    alert('✅ Registro guardado correctamente');
  };

  window.guardarRegistroEditado = function(id) {
    const mascota = document.getElementById('modal-mascota').value.trim();
    const tipo = document.getElementById('modal-tipo').value;
    const vacuna = document.getElementById('modal-vacuna').value.trim();
    const lote = document.getElementById('modal-lote').value.trim();
    const aplicada = document.getElementById('modal-aplicada').value;
    const proxima = document.getElementById('modal-proxima').value;
    const veterinario = document.getElementById('modal-veterinario').value.trim();
    const estado = document.getElementById('modal-estado').value;

    if (!mascota || !vacuna || !lote || !aplicada || !proxima || !veterinario) {
      alert('⚠️ Completa todos los campos');
      return;
    }

    const index = registros.findIndex(r => r.id === id);
    if (index !== -1) {
      registros[index] = {
        id,
        mascota,
        tipo,
        vacuna,
        lote,
        aplicada,
        proxima,
        veterinario,
        estado
      };
    }

    window.cerrarModal();
    cargarRegistros();
    alert('✅ Registro actualizado correctamente');
  };

})();
