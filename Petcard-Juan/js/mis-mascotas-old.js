// Aplicación de Mascotas - PetCard
(function(){
  console.log('✓ mis-mascotas.js loaded');
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
      if(isVacunas){ b.addEventListener('click', function(e){ e.stopPropagation(); const id = this.dataset.id || petId; window.location.href = 'carnet-vacunas.html?mascota='+encodeURIComponent(id); }); }
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
    const avatarOptions = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🦆', '🦅', '🦉', '🦋', '🐢', '🐍', '🐢', '🦎', '🦗', '🦑', '🐙', '🐚', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐴', '🦄', '🦋', '🦚', '🦜', '🦢'];
    let selectedAvatar = (pet?.avatar || '🐶');
    
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;
    
    const box = document.createElement('div');
    box.style.width = '420px';
    box.style.maxWidth = '95%';
    box.style.background = '#fff';
    box.style.padding = '1rem';
    box.style.borderRadius = '8px';
    
    box.innerHTML = '<h3 style="margin-top:0; margin-bottom:1rem;">' + (isEdit ? 'Editar Mascota' : 'Agregar Mascota') + '</h3>' +
      '<div style="display:flex; flex-direction:column; gap:0.5rem;">' +
      '<div style="margin-bottom:0.5rem;"><label style="display:block; font-weight:700; margin-bottom:0.5rem;">Avatar</label><div id="avatar-selector" style="display:grid; grid-template-columns:repeat(8,1fr); gap:0.5rem; margin-bottom:1rem;"></div></div>' +
      '<input id="f-nombre" class="form-control" placeholder="Nombre" value="' + escapeHtml(pet?.nombre||'') + '">' +
      '<input id="f-tipo" class="form-control" placeholder="Tipo / Raza" value="' + escapeHtml(pet?.tipo||'') + '">' +
      '<input id="f-peso" class="form-control" placeholder="Peso" value="' + escapeHtml(pet?.peso||'') + '">' +
      '<input id="f-color" class="form-control" placeholder="Color" value="' + escapeHtml(pet?.color||'') + '">' +
      '<input id="f-ultima" type="date" class="form-control" value="' + (pet?.ultima||'') + '">' +
      '<input id="f-microchip" class="form-control" placeholder="Microchip" value="' + escapeHtml(pet?.microchip||'') + '">' +
      '<div style="display:flex; gap:0.5rem; justify-content:flex-end; margin-top:1rem;">' +
      '<button type="button" class="btn btn-outline-primary" id="f-cancel">Cancelar</button>' +
      '<button type="button" class="btn btn-primary" id="f-save">' + (isEdit ? 'Guardar' : 'Agregar') + '</button>' +
      '</div></div>';
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    const avatarSelector = box.querySelector('#avatar-selector');
    avatarOptions.forEach(function(emoji){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.padding = '0.5rem';
      btn.style.border = (emoji === selectedAvatar) ? '2px solid #3b82f6' : '2px solid #ddd';
      btn.style.borderRadius = '6px';
      btn.style.background = (emoji === selectedAvatar) ? '#f0f9ff' : 'transparent';
      btn.style.fontSize = '1.5rem';
      btn.style.cursor = 'pointer';
      btn.textContent = emoji;
      btn.addEventListener('click', function(e){
        e.preventDefault();
        const allBtns = box.querySelectorAll('#avatar-selector button');
        allBtns.forEach(function(b){
          b.style.border = '2px solid #ddd';
          b.style.background = 'transparent';
        });
        this.style.border = '2px solid #3b82f6';
        this.style.background = '#f0f9ff';
        selectedAvatar = emoji;
      });
      avatarSelector.appendChild(btn);
    });
    
    const cancelBtn = qs('#f-cancel', overlay);
    if(cancelBtn){
      cancelBtn.addEventListener('click', function(){ overlay.remove(); });
    }
    
    const saveBtn = qs('#f-save', overlay);
    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        const nombre = (qs('#f-nombre', overlay)?.value || '').trim();
        const tipo = (qs('#f-tipo', overlay)?.value || '').trim();
        const peso = (qs('#f-peso', overlay)?.value || '').trim();
        const color = (qs('#f-color', overlay)?.value || '').trim();
        const ultima = qs('#f-ultima', overlay)?.value || '';
        const microchip = (qs('#f-microchip', overlay)?.value || '').trim();
        
        if(!nombre){ 
          alert('Nombre es requerido'); 
          return; 
        }
        
        const pets = loadPets();
        
        if(isEdit){
          const idx = pets.findIndex(function(pp){ return pp.id === pet.id; });
          if(idx > -1){
            pets[idx] = { id: pet.id, nombre: nombre, tipo: tipo, peso: peso, color: color, ultima: ultima, microchip: microchip, avatar: selectedAvatar };
            savePets(pets);
            renderGrid();
            overlay.remove();
            alert('✓ Mascota actualizada');
          }
        } else {
          const newPet = { id: 'p_' + Date.now(), nombre: nombre, tipo: tipo, peso: peso, color: color, ultima: ultima, microchip: microchip, avatar: selectedAvatar };
          pets.push(newPet);
          savePets(pets);
          renderGrid();
          overlay.remove();
          alert('✓ Mascota agregada');
        }
      });
    }
  }

  function openAddForm(){
    console.log('openAddForm called');
    openPetForm();
  }
  
  function openEditForm(id){
    const pet = getPetById(id); 
    if(!pet) return; 
    openPetForm(pet);
  }

  function deletePet(id){ 
    const pets = loadPets().filter(p=>p.id!==id); 
    savePets(pets); 
    renderGrid(); 
  }

  document.addEventListener('DOMContentLoaded', function(){
    console.log('DOMContentLoaded fired');
    renderGrid();
    const btnAdd = qs('#btn-agregar-mascota');
    console.log('btnAdd element:', btnAdd);
    if(btnAdd){
      btnAdd.addEventListener('click', function(){
        console.log('Button clicked');
        openAddForm();
      });
    }
  });

})();
