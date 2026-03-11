// Aplicación de Mascotas - PetCard
(function(){
  console.log('✓ mis-mascotas.js loaded');
  
  const STORAGE_KEY = 'pc_pets_v1';
  
  // Helpers
  function qs(sel, ctx){ return (ctx||document).querySelector(sel) }
  function qsa(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)) }
  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
  
  // Load/Save
  function loadPets(){
    try{ 
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){
      return [];
    }
  }
  
  function savePets(pets){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  }
  
  // Get pet by ID
  function getPetById(id){
    return loadPets().find(p => p.id === id);
  }
  
  // Render grid
  function renderGrid(){
    const grid = qs('#mascotas-grid');
    if(!grid) return;
    
    const pets = loadPets();
    grid.innerHTML = '';
    
    pets.forEach(pet => {
      const card = createPetCard(pet);
      grid.appendChild(card);
    });
    
    attachHandlers();
  }
  
  // Create pet card
  function createPetCard(pet){
    const div = document.createElement('div');
    div.className = 'mascota-card card';
    div.dataset.id = pet.id;
    
    div.innerHTML = `
      <div class="mascota-top">
        <div class="mascota-avatar" style="background:#fef3c7;">${pet.avatar||'🐶'}</div>
        <div class="mascota-info">
          <div class="mascota-nombre">${escapeHtml(pet.nombre)}</div>
          <div class="mascota-tipo">${escapeHtml(pet.tipo)}</div>
        </div>
        <div class="mascota-actions">
          <button class="btn-icon btn-editar" data-id="${pet.id}" title="Editar">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-eliminar" data-id="${pet.id}" title="Eliminar">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>
      <div class="mascota-datos">
        <div class="dato-item"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>Peso: <strong>${escapeHtml(pet.peso)}</strong></div>
        <div class="dato-item"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>Color: <strong>${escapeHtml(pet.color)}</strong></div>
        <div class="dato-item"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Última visita: <strong>${escapeHtml(pet.ultima)}</strong></div>
      </div>
      <div class="microchip-tag">Microchip: ${escapeHtml(pet.microchip)}</div>
      <div class="mascota-btns">
        <button class="btn btn-secondary btn-sm btn-vacunas" data-id="${pet.id}">Vacunas</button>
        <button class="btn btn-primary btn-sm btn-cita" data-id="${pet.id}">Cita</button>
      </div>
    `;
    
    return div;
  }
  
  // Attach handlers
  function attachHandlers(){
    // Edit buttons
    qsa('.btn-editar').forEach(btn => {
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        const id = this.dataset.id;
        const pet = getPetById(id);
        if(pet) showPetForm(pet);
      });
    });
    
    // Delete buttons
    qsa('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        if(!confirm('¿Eliminar esta mascota?')) return;
        const id = this.dataset.id;
        const pets = loadPets().filter(p => p.id !== id);
        savePets(pets);
        renderGrid();
      });
    });
    
    // Vacunas buttons
    qsa('.btn-vacunas').forEach(btn => {
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        const id = this.dataset.id;
        window.location.href = 'carnet-vacunas.html?mascota=' + encodeURIComponent(id);
      });
    });
    
    // Cita buttons
    qsa('.btn-cita').forEach(btn => {
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        const id = this.dataset.id;
        window.location.href = 'citas.html?mascota=' + encodeURIComponent(id);
      });
    });
  }
  
  // Show pet form (add/edit)
  function showPetForm(pet){
    const isEdit = !!(pet && pet.id);
    const avatarOptions = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🦆', '🦅', '🦉', '🦋', '🐢', '🐍', '🦎', '🦗', '🦑', '🐙', '🐚', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐴', '🦄', '🦚', '🦜', '🦢'];
    let selectedAvatar = (pet?.avatar || '🐶');
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:9999';
    
    const box = document.createElement('div');
    box.style.cssText = 'width:420px;max-width:95%;background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)';
    
    box.innerHTML = `
      <h3 style="margin-top:0;margin-bottom:1rem;">${isEdit ? 'Editar Mascota' : 'Agregar Mascota'}</h3>
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <div>
          <label style="display:block;font-weight:700;margin-bottom:0.5rem;">Avatar</label>
          <div id="avatars" style="display:grid;grid-template-columns:repeat(8,1fr);gap:0.5rem;margin-bottom:1rem;"></div>
        </div>
        <input id="nombre" class="form-control" placeholder="Nombre" value="${escapeHtml(pet?.nombre||'')}">
        <input id="tipo" class="form-control" placeholder="Tipo / Raza" value="${escapeHtml(pet?.tipo||'')}">
        <input id="peso" class="form-control" placeholder="Peso" value="${escapeHtml(pet?.peso||'')}">
        <input id="color" class="form-control" placeholder="Color" value="${escapeHtml(pet?.color||'')}"><input id="ultima" type="date" class="form-control" value="${pet?.ultima||''}">
        <input id="microchip" class="form-control" placeholder="Microchip" value="${escapeHtml(pet?.microchip||'')}">>
        <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem;">
          <button class="btn btn-outline-primary" id="cancel">Cancelar</button>
          <button class="btn btn-primary" id="save">${isEdit ? 'Guardar' : 'Agregar'}</button>
        </div>
      </div>
    `;
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    // Avatar selector
    const avatarsDiv = box.querySelector('#avatars');
    avatarOptions.forEach(emoji => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = `padding:0.5rem;border:${emoji===selectedAvatar?'2px solid #3b82f6':'2px solid #ddd'};border-radius:6px;background:${emoji===selectedAvatar?'#f0f9ff':'transparent'};font-size:1.5rem;cursor:pointer`;
      btn.textContent = emoji;
      btn.addEventListener('click', function(){
        qsa('button', avatarsDiv).forEach(b => {
          b.style.border = '2px solid #ddd';
          b.style.background = 'transparent';
        });
        this.style.border = '2px solid #3b82f6';
        this.style.background = '#f0f9ff';
        selectedAvatar = emoji;
      });
      avatarsDiv.appendChild(btn);
    });
    
    // Handlers
    box.querySelector('#cancel').addEventListener('click', () => overlay.remove());
    
    box.querySelector('#save').addEventListener('click', () => {
      const nombre = box.querySelector('#nombre').value.trim();
      const tipo = box.querySelector('#tipo').value.trim();
      const peso = box.querySelector('#peso').value.trim();
      const color = box.querySelector('#color').value.trim();
      const ultima = box.querySelector('#ultima').value;
      const microchip = box.querySelector('#microchip').value.trim();
      
      if(!nombre){ alert('Nombre es requerido'); return; }
      
      const pets = loadPets();
      
      if(isEdit){
        const idx = pets.findIndex(p => p.id === pet.id);
        if(idx > -1){
          pets[idx] = { id: pet.id, nombre, tipo, peso, color, ultima, microchip, avatar: selectedAvatar };
          savePets(pets);
          alert('✓ Mascota actualizada');
        }
      } else {
        const newPet = { id: 'p_' + Date.now(), nombre, tipo, peso, color, ultima, microchip, avatar: selectedAvatar };
        pets.push(newPet);
        savePets(pets);
        alert('✓ Mascota agregada');
      }
      
      renderGrid();
      overlay.remove();
    });
  }
  
  // Initialize
  document.addEventListener('DOMContentLoaded', function(){
    console.log('Initializing...');
    renderGrid();
    
    const btnAdd = qs('#btn-agregar-mascota');
    console.log('Button found:', btnAdd);
    
    if(btnAdd){
      btnAdd.addEventListener('click', function(){
        console.log('Add button clicked');
        showPetForm();
      });
    }
  });

})();
