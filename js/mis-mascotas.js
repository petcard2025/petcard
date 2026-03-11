<<<<<<< HEAD
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
=======
(function(){
  const STORAGE_KEY = 'pc_pets_v1';
  function qs(sel, ctx){ return (ctx||document).querySelector(sel) }
  function qsa(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)) }

  function loadPets(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); if(!raw) return initPetsFromDOM(); return JSON.parse(raw); }catch(e){ return initPetsFromDOM(); }
  }
  function savePets(pets){ localStorage.setItem(STORAGE_KEY, JSON.stringify(pets)) }

  function initPetsFromDOM(){
    const cards = qsa('.mascota-card');
    const pets = cards.map(card => {
      const id = card.querySelector('.mascota-actions [data-id]')?.dataset.id || ('p_'+Date.now()+Math.random().toString(16).slice(2,6));
      const pet = readPetFromCard(card);
      pet.id = id;
      return pet;
    });
    savePets(pets);
    return pets;    
  }

  function readPetFromCard(card){
    const nombre = (card.querySelector('.mascota-nombre')||{}).textContent || '';
    const tipo = (card.querySelector('.mascota-tipo')||{}).textContent || '';
    const peso = (card.querySelector('.mascota-datos .dato-item:nth-of-type(1) strong')||{}).textContent || '';
    const color = (card.querySelector('.mascota-datos .dato-item:nth-of-type(2) strong')||{}).textContent || '';
    const ultima = (card.querySelector('.mascota-datos .dato-item:nth-of-type(3) strong')||{}).textContent || '';
    const microchip = (card.querySelector('.microchip-tag')||{}).textContent.replace('Microchip:','').trim();
    const avatar = (card.querySelector('.mascota-avatar')||{}).textContent || '';
    return { nombre: nombre.trim(), tipo: tipo.trim(), peso: peso.trim(), color: color.trim(), ultima: ultima.trim(), microchip: microchip.trim(), avatar };
  }

  function renderGrid(){
    const grid = qs('#mascotas-grid'); if(!grid) return;
    const pets = loadPets();
    grid.innerHTML = '';
    pets.forEach(p => grid.appendChild(createCardElement(p)));
    attachCardHandlers();
  }

  function createCardElement(p){
    const div = document.createElement('div'); div.className='mascota-card card';
    div.dataset.id = p.id;
    div.innerHTML = `
      <div class="mascota-top">
        <div class="mascota-avatar" style="background:#fef3c7;">${p.avatar||'🐶'}</div>
        <div class="mascota-info">
          <div class="mascota-nombre">${escapeHtml(p.nombre)}</div>
          <div class="mascota-tipo">${escapeHtml(p.tipo)}</div>
        </div>
        <div class="mascota-actions">
          <button class="btn-icon btn-edit" data-id="${p.id}" title="Editar">...</button>
          <button class="btn-icon delete-btn" data-id="${p.id}" title="Eliminar">...</button>
        </div>
      </div>
      <div class="mascota-datos">
        <div class="dato-item">Peso: <strong>${escapeHtml(p.peso)}</strong></div>
        <div class="dato-item">Color: <strong>${escapeHtml(p.color)}</strong></div>
        <div class="dato-item">Última visita: <strong>${escapeHtml(p.ultima)}</strong></div>
      </div>
      <div class="microchip-tag">Microchip: ${escapeHtml(p.microchip)}</div>
      <div class="mascota-btns">
        <button class="btn btn-secondary btn-sm btn-vacunas" data-id="${p.id}">Vacunas</button>
        <button class="btn btn-primary btn-sm btn-cita" data-id="${p.id}">Cita</button>
      </div>
    `;
    return div;
  }

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  function attachCardHandlers(){
    // card click (open details) — ignore clicks on action buttons
    qsa('.mascota-card').forEach(card=>{
      card.style.cursor='pointer';
      card.addEventListener('click', function(e){
        if(e.target.closest('.mascota-actions') || e.target.closest('.mascota-btns') || e.target.closest('.btn-edit') || e.target.closest('.delete-btn')) return;
        const id = this.dataset.id || (this.getAttribute('data-id')); const pet = getPetById(id); if(pet) buildModal(pet);
      });
    });

    // vacuna / cita buttons: support both dynamically-rendered cards (class-based) and static DOM (id-based)
    qsa('.mascota-btns button').forEach(b=>{
      // derive pet id from data-id or from id suffix (btn-vacunas-<id>)
      const petId = b.dataset.id || (b.id && b.id.split('-').pop());
      if(!petId) return;
      const txt = (b.textContent||'').trim().toLowerCase();
      const isVacunas = b.classList.contains('btn-vacunas') || (b.id && b.id.indexOf('vacunas')>-1) || txt.startsWith('vacuna') || txt.startsWith('vacunas');
      const isCita = b.classList.contains('btn-cita') || (b.id && b.id.indexOf('cita')>-1) || txt.startsWith('cita');
      if(isVacunas){ b.addEventListener('click', function(e){ e.stopPropagation(); openVaccineEditor(this.dataset.id || petId); }); }
      if(isCita){ b.addEventListener('click', function(e){ e.stopPropagation(); const id = this.dataset.id || petId; window.location.href = 'citas.html?mascota='+encodeURIComponent(id); }); }
    });

    // delete buttons (already have class 'delete-btn')
    qsa('.delete-btn').forEach(btn=> btn.addEventListener('click', function(e){ e.stopPropagation(); if(!confirm('Eliminar mascota?')) return; const id = this.dataset.id || (this.id && this.id.split('-').pop()); deletePet(id); try{ window.showToast && window.showToast('Mascota eliminada', 'success', 1200); }catch(err){} }));

    // edit buttons: support both .btn-edit class and static buttons with id 'btn-editar-<id>' or .btn-icon in .mascota-actions
    qsa('.mascota-actions .btn-icon, .mascota-actions button').forEach(btn=>{
      const isEdit = btn.title==='Editar' || (btn.id && btn.id.indexOf('editar')>-1) || btn.classList.contains('btn-edit');
      if(!isEdit) return;
      btn.addEventListener('click', function(e){ e.stopPropagation(); const id = this.dataset.id || (this.id && this.id.split('-').pop()); openEditForm(id); });
    });
  }

  function getPetById(id){ return loadPets().find(p=>p.id===id) }

  function buildModal(pet){
    const overlay = document.createElement('div');
    overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.background='rgba(0,0,0,0.4)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex=9999;
    const box = document.createElement('div');
    box.style.width='520px'; box.style.maxWidth='95%'; box.style.background='#fff'; box.style.borderRadius='8px'; box.style.padding='1rem'; box.style.boxShadow='0 6px 24px rgba(0,0,0,0.2)'; box.id='pet-print-area';
    box.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem;">
        <h2 style="margin:0">${escapeHtml(pet.nombre)}</h2>
        <div style="display:flex; gap:.5rem">
          <button class="btn btn-outline-primary" id="btn-imprimir">Imprimir</button>
          <button class="btn btn-primary" id="btn-descargar">Descargar PDF</button>
          <button class="btn btn-outline-primary" id="btn-cerrar">Cerrar</button>
        </div>
      </div>
      <div style="display:flex; gap:1rem;">
        <div style="flex:1">
          <div style="font-weight:700; margin-bottom:.25rem">Tipo</div>
          <div style="margin-bottom:.5rem">${escapeHtml(pet.tipo)}</div>
          <div style="font-weight:700; margin-bottom:.25rem">Peso</div>
          <div style="margin-bottom:.5rem">${escapeHtml(pet.peso)}</div>
          <div style="font-weight:700; margin-bottom:.25rem">Color</div>
          <div style="margin-bottom:.5rem">${escapeHtml(pet.color)}</div>
          <div style="font-weight:700; margin-bottom:.25rem">Última visita</div>
          <div style="margin-bottom:.5rem">${escapeHtml(pet.ultima)}</div>
          <div style="font-weight:700; margin-bottom:.25rem">Microchip</div>
          <div style="margin-bottom:.5rem">${escapeHtml(pet.microchip)}</div>
        </div>
        <div style="width:140px; text-align:center;">
          <div style="font-size:48px">${pet.avatar || '🐶'}</div>
        </div>
      </div>
    `;
    overlay.appendChild(box); document.body.appendChild(overlay);
    qs('#btn-cerrar', overlay).addEventListener('click', ()=> overlay.remove());
    qs('#btn-imprimir', overlay).addEventListener('click', ()=> printElement(box));
    qs('#btn-descargar', overlay).addEventListener('click', ()=> downloadPdfById(pet.id));
  }

  // Vaccine editor modal: edit/add/delete vaccines for a pet and save to localStorage
  function openVaccineEditor(petId){
    const pet = getPetById(petId); if(!pet){ alert('Mascota no encontrada'); return }
    const overlay = document.createElement('div'); overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.background='rgba(0,0,0,0.45)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex=9999;
    const box = document.createElement('div'); box.style.width='720px'; box.style.maxWidth='96%'; box.style.maxHeight='90vh'; box.style.overflow='auto'; box.style.background='#fff'; box.style.borderRadius='8px'; box.style.padding='1rem';
    box.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem;">
        <h3 style="margin:0">Vacunas — ${escapeHtml(pet.nombre)}</h3>
        <div style="display:flex; gap:.5rem">
          <button class="btn btn-outline-primary" id="vac-close">Cerrar</button>
        </div>
      </div>
      <div id="vac-list">
      </div>
      <hr />
      <div style="display:flex; gap:.5rem; align-items:center; margin-top:.5rem;">
        <input id="vac-nombre" class="form-control" placeholder="Vacuna (ej. Antirrábica)" style="flex:1" />
        <input id="vac-fecha-programada" type="date" class="form-control" style="max-width:150px" />
        <input id="vac-fecha-aplicada" type="date" class="form-control" style="max-width:150px" />
        <input id="vac-lote" class="form-control" placeholder="Lote" style="max-width:120px" />
        <button class="btn btn-primary" id="vac-add">Agregar</button>
      </div>
    `;
    overlay.appendChild(box); document.body.appendChild(overlay);

    function renderVacList(){
      const list = box.querySelector('#vac-list'); list.innerHTML = '';
      const vacunas = pet.vacunas || [];
      if(vacunas.length===0){ list.innerHTML = '<div style="color:var(--muted)">No hay vacunas registradas.</div>'; return }
      const table = document.createElement('table'); table.style.width='100%'; table.innerHTML = `<thead><tr><th>Estado</th><th>Vacuna</th><th>Fecha Programada</th><th>Fecha Aplicada</th><th>Lote</th><th>Observaciones</th><th></th></tr></thead>`;
      const tbody = document.createElement('tbody');
      vacunas.forEach((v,idx)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${v.estado==='aplicada'? '✓' : (v.estado==='atrasada' ? '✖' : '⚠')}</td>
          <td><input class="form-control vac-edit-nombre" value="${escapeHtml(v.nombre)}" /></td>
          <td><input type="date" class="form-control vac-edit-programada" value="${v.fechaProgramada||''}" /></td>
          <td><input type="date" class="form-control vac-edit-aplicada" value="${v.fechaAplicada||''}" /></td>
          <td><input class="form-control vac-edit-lote" value="${escapeHtml(v.lote||'')}" /></td>
          <td><input class="form-control vac-edit-obs" value="${escapeHtml(v.observaciones||'')}" /></td>
          <td style="white-space:nowrap"><button class="btn btn-primary btn-sm vac-save" data-idx="${idx}">Guardar</button> <button class="btn btn-outline-primary btn-sm vac-toggle" data-idx="${idx}">${v.estado==='aplicada'? 'Desmarcar':'Marcar aplicada'}</button> <button class="btn btn-outline-danger btn-sm vac-del" data-idx="${idx}">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody); list.appendChild(table);

      // bind inside modal
      Array.from(list.querySelectorAll('.vac-save')).forEach(btn=> btn.addEventListener('click', function(){ const i = Number(this.dataset.idx); const row = tbody.children[i]; const nombre = row.querySelector('.vac-edit-nombre').value.trim(); const prog = row.querySelector('.vac-edit-programada').value; const ap = row.querySelector('.vac-edit-aplicada').value; const lote = row.querySelector('.vac-edit-lote').value.trim(); const obs = row.querySelector('.vac-edit-obs').value.trim(); pet.vacunas[i] = { nombre, fechaProgramada: prog, fechaAplicada: ap, lote, observaciones: obs, estado: ap? 'aplicada' : (prog && new Date(prog) < new Date() ? 'atrasada' : 'proxima') }; savePetUpdates(); renderVacList(); }));
      Array.from(list.querySelectorAll('.vac-toggle')).forEach(btn=> btn.addEventListener('click', function(){ const i = Number(this.dataset.idx); const v = pet.vacunas[i]; if(!v) return; v.estado = v.estado==='aplicada'? 'proxima' : 'aplicada'; if(v.estado==='aplicada' && !v.fechaAplicada) v.fechaAplicada = new Date().toISOString().slice(0,10); savePetUpdates(); renderVacList(); }));
      Array.from(list.querySelectorAll('.vac-del')).forEach(btn=> btn.addEventListener('click', function(){ const i = Number(this.dataset.idx); if(!confirm('Eliminar vacuna?')) return; pet.vacunas.splice(i,1); savePetUpdates(); renderVacList(); }));
    }

    function savePetUpdates(){ const pets = loadPets(); const idx = pets.findIndex(pp=>pp.id===pet.id); if(idx>-1){ pets[idx] = {...pets[idx], vacunas: pet.vacunas}; savePets(pets); renderGrid(); } }

    box.querySelector('#vac-add').addEventListener('click', function(){ const nombre = box.querySelector('#vac-nombre').value.trim(); const prog = box.querySelector('#vac-fecha-programada').value; const ap = box.querySelector('#vac-fecha-aplicada').value; const lote = box.querySelector('#vac-lote').value.trim(); if(!nombre){ alert('Nombre de vacuna requerido'); return } pet.vacunas = pet.vacunas || []; const estado = ap? 'aplicada' : (prog && new Date(prog) < new Date() ? 'atrasada' : 'proxima'); pet.vacunas.push({ nombre, fechaProgramada: prog, fechaAplicada: ap, lote, observaciones:'', estado }); savePetUpdates(); box.querySelector('#vac-nombre').value=''; box.querySelector('#vac-fecha-programada').value=''; box.querySelector('#vac-fecha-aplicada').value=''; box.querySelector('#vac-lote').value=''; renderVacList(); });

    box.querySelector('#vac-close').addEventListener('click', ()=> overlay.remove());
    renderVacList();
  }

  function printElement(el){
    const w = window.open('', '_blank');
    if(!w) { alert('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes.'); return }
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Imprimir - ${document.title}</title><link rel="stylesheet" href="../css/shared.css"></head><body>${el.innerHTML}</body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
    setTimeout(()=>{ w.print(); }, 300);
  }

  async function downloadPdfById(id){
    const pet = getPetById(id); if(!pet){ alert('Datos no disponibles'); return }
    try{
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({unit:'pt', format:'a4'});
      const margin = 40; let y = 40;
      doc.setFontSize(18); doc.text(pet.nombre || 'Mascota', margin, y); y += 28;
      doc.setFontSize(12);
      doc.text('Tipo: ' + (pet.tipo||''), margin, y); y += 18;
      doc.text('Peso: ' + (pet.peso||''), margin, y); y += 18;
      doc.text('Color: ' + (pet.color||''), margin, y); y += 18;
      doc.text('Última visita: ' + (pet.ultima||''), margin, y); y += 18;
      doc.text('Microchip: ' + (pet.microchip||''), margin, y); y += 28;
      doc.save((pet.nombre||'mascota') + '.pdf');
    } catch (err){ console.error(err); alert('No se pudo generar PDF automáticamente. Usa Imprimir para guardar como PDF.'); }
  }

  // Add / Edit / Delete
  function openAddForm(){
    openPetForm();
  }
  function openEditForm(id){
    const pet = getPetById(id); if(!pet) return; openPetForm(pet);
  }

  function openPetForm(pet){
    const isEdit = !!(pet && pet.id);
    const overlay = document.createElement('div'); overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.background='rgba(0,0,0,0.4)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex=9999;
    const box = document.createElement('div'); box.style.width='420px'; box.style.background='#fff'; box.style.padding='1rem'; box.style.borderRadius='8px';
    box.innerHTML = `
      <h3 style="margin-top:0">${isEdit? 'Editar Mascota':'Agregar Mascota'}</h3>
      <div style="display:flex; flex-direction:column; gap:.5rem">
        <input id="f-nombre" class="form-control" placeholder="Nombre" value="${escapeHtml(pet?.nombre||'')}">
        <input id="f-tipo" class="form-control" placeholder="Tipo / Raza" value="${escapeHtml(pet?.tipo||'')}">
        <input id="f-peso" class="form-control" placeholder="Peso" value="${escapeHtml(pet?.peso||'')}">
        <input id="f-color" class="form-control" placeholder="Color" value="${escapeHtml(pet?.color||'')}">
        <input id="f-ultima" type="date" class="form-control" placeholder="Última visita" value="${pet?.ultima||''}">
        <input id="f-microchip" class="form-control" placeholder="Microchip" value="${escapeHtml(pet?.microchip||'')}">
        <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:.5rem">
          <button class="btn btn-outline-primary" id="f-cancel">Cancelar</button>
          <button class="btn btn-primary" id="f-save">${isEdit? 'Guardar':'Agregar'}</button>
        </div>
      </div>
    `;
    overlay.appendChild(box); document.body.appendChild(overlay);
    qs('#f-cancel', overlay).addEventListener('click', ()=> overlay.remove());
    qs('#f-save', overlay).addEventListener('click', ()=>{
      const nombre = qs('#f-nombre', overlay).value.trim(); const tipo = qs('#f-tipo', overlay).value.trim(); const peso = qs('#f-peso', overlay).value.trim(); const color = qs('#f-color', overlay).value.trim(); const ultima = qs('#f-ultima', overlay).value; const microchip = qs('#f-microchip', overlay).value.trim();
      if(!nombre){ alert('Nombre requerido'); return }
      const pets = loadPets();
      if(isEdit){ const idx = pets.findIndex(pp=>pp.id===pet.id); if(idx>-1){ pets[idx] = {...pets[idx], nombre, tipo, peso, color, ultima, microchip }; savePets(pets); renderGrid(); overlay.remove(); try{ window.showToast && window.showToast('Datos actualizados', 'success', 1500); }catch(e){}; return } }
      const newPet = { id: 'p_'+Date.now(), nombre, tipo, peso, color, ultima, microchip, avatar: '🐶' };
      pets.push(newPet); savePets(pets); renderGrid(); overlay.remove(); try{ window.showToast && window.showToast('Mascota agregada', 'success', 1500); }catch(e){}
    });
  }

  function deletePet(id){ const pets = loadPets().filter(p=>p.id!==id); savePets(pets); renderGrid(); }

  document.addEventListener('DOMContentLoaded', function(){
    // render from storage or DOM
    renderGrid();
    const btnAdd = qs('#btn-agregar-mascota'); if(btnAdd) btnAdd.addEventListener('click', function(){ openAddForm(); });
>>>>>>> bbb4f82ecf2c54b8c12711a15c4f64977f82c109
  });

})();
