(function(){
  const PETS_KEY = 'pc_pets_v1';
  function qs(sel){ return document.querySelector(sel) }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)) }

  function loadPets(){ try{ return JSON.parse(localStorage.getItem(PETS_KEY) || '[]'); }catch{ return [] } }
  function getPetById(id){ return loadPets().find(p=>p.id===id) }

  function formatRow(v){
    return `
      <tr>
        <td><span class="status-icon" style="color:${v.estado==='aplicada'? 'var(--green)': v.estado==='atrasada'? 'var(--red)':'var(--yellow)'}">${v.estado==='aplicada'? '✓': v.estado==='atrasada'? '✖' : '⚠'}</span></td>
        <td class="vacuna-nombre" style="color:var(--purple);">${escapeHtml(v.nombre)}</td>
        <td>${escapeHtml(v.fechaProgramada||'')}</td>
        <td>${escapeHtml(v.fechaAplicada||'')}</td>
        <td>${escapeHtml(v.lote||'')}</td>
        <td>${escapeHtml(v.observaciones||'')}</td>
      </tr>`;
  }

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  function renderPet(pet){
    if(!pet) return;
    // update info panel
    const info = qs('.card .info-row'); // not used directly, update specific fields
    const infoMap = {
      '.info-row:nth-of-type(1) strong': pet.nombre || '',
    }
    // better to set by selecting known nodes
    const infoBlock = qs('.card .card-title') // dummy
    // Update sidebar info fields by matching labels
    const rows = qsAllInfoRows();
    if(rows){
      setInfo('Mascota', pet.nombre);
      // derive especie/raza from tipo (if contains '•')
      setInfo('Especie', (pet.tipo||'').split('•')[0] || pet.tipo || '');
      setInfo('Raza', (pet.tipo||'').split('•')[1] ? (pet.tipo.split('•')[1].trim()): '');
      setInfo('ID', pet.id || '');
      setInfo('Última actualización', pet.ultima || '');
      // Próxima cita left as existing or empty
    }

    // render vacunas
    const tbody = qs('.table-wrapper table tbody');
    if(!tbody) return;
    const vacunas = pet.vacunas || getSampleVacunas();
    tbody.innerHTML = vacunas.map(formatRow).join('');

    // render próximas vacunas (sidebar)
    const proximaContainer = qsa('.proxima-vac');
    // simple: update first two entries if present
    const next = vacunas.filter(v=> v.estado !== 'aplicada').slice(0,2);
    if(next.length>0){
      const nodes = qsa('.proxima-vac');
      nodes.forEach((n,i)=>{
        if(next[i]){
          const name = n.querySelector('.vacuna-nombre2'); if(name) name.textContent = next[i].nombre;
          const badge = n.querySelector('.badge'); if(badge){ badge.textContent = next[i].estado==='atrasada'? 'Atrasada' : (next[i].estado==='proxima'? 'Próxima Dosis':'Pendiente'); badge.className = 'badge '+(next[i].estado==='atrasada' ? 'badge-red' : (next[i].estado==='proxima'? 'badge-yellow':'badge-yellow')) }
          const when = n.querySelector('div[style*="Próxima"]'); if(when) when.textContent = 'Próxima: '+(next[i].fechaProgramada||'');
        }
      })
    }

    // update estatistics
    const applied = vacunas.filter(v=> v.estado==='aplicada').length;
    const pending = vacunas.length - applied;
    const pct = Math.round((applied / (vacunas.length || 1))*100);
    const pctNode = qs('.pct-number'); if(pctNode) pctNode.textContent = pct + '%';
    const appliedNode = qsa('.vac-stats .vac-stat-row strong')[0]; if(appliedNode) appliedNode.textContent = applied;
    const pendNode = qsa('.vac-stats .vac-stat-row strong')[1]; if(pendNode) pendNode.textContent = pending;

    // update info block specifics
    const infoRows = qsa('.card .info-row');
    // mapping by order in HTML
    if(infoRows[0]) infoRows[0].querySelector('strong').textContent = pet.nombre || '';
    if(infoRows[1]) infoRows[1].querySelector('strong').textContent = (pet.tipo||'').split('•')[0] || '';
    if(infoRows[2]) infoRows[2].querySelector('strong').textContent = ((pet.tipo||'').split('•')[1]||'').trim() || '';
    if(infoRows[3]) infoRows[3].querySelector('strong').textContent = pet.id || '';
    if(infoRows[4]) infoRows[4].querySelector('strong').textContent = pet.ultima || '';
    if(infoRows[5]) infoRows[5].querySelector('strong').textContent = ''; // próxima cita leave
  }

  function qsAllInfoRows(){ return qsa('.card .info-row') }

  function getSampleVacunas(){
    return [
      { nombre:'Antirrábica', fechaProgramada:'13 Mar 2024', fechaAplicada:'13 Mar 2024', lote:'A8-004-001', observaciones:'Sin novedad', estado:'aplicada'},
      { nombre:'Múltiple (DHPP)', fechaProgramada:'13 Mar 2024', fechaAplicada:'13 Mar 2024', lote:'A8-004-001', observaciones:'Sin novedad', estado:'aplicada'},
      { nombre:'Bordetella', fechaProgramada:'13 Mar 2024', fechaAplicada:'4 May 2024', lote:'A8-004-001', observaciones:'Leve reacción', estado:'atrasada'},
      { nombre:'Lyme', fechaProgramada:'15 Mar 2024', fechaAplicada:'5 Mar 2024', lote:'A8-004-001', observaciones:'Sin novedad', estado:'aplicada'},
      { nombre:'Parvovirus', fechaProgramada:'20 Jun 2024', fechaAplicada:'20 Jun 2024', lote:'A8-004-001', observaciones:'Sin novedad', estado:'aplicada'}
    ];
  }

  function populateSelect(pets){
    const sel = qs('#select-mascota'); if(!sel) return;
    sel.innerHTML = '';
    pets.forEach(p=>{
      const opt = document.createElement('option'); opt.value = p.id; opt.textContent = (p.nombre + (p.tipo? ' – '+p.tipo : '')); sel.appendChild(opt);
    })
    sel.addEventListener('change', function(){ const pet = getPetById(this.value); if(pet) renderPet(pet); });
  }

  // downloadPdf removed — printing via browser is provided instead

  document.addEventListener('DOMContentLoaded', function(){
    const pets = loadPets();
    if(pets.length===0){ // initialize from existing DOM entries if any
      // nothing to do, leave select as-is
    } else {
      populateSelect(pets);
    }

    // if query param ?pet=ID provided, select that
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('pet');
    if(petId){ const pet = getPetById(petId); if(pet){ qs('#select-mascota').value = petId; renderPet(pet); } }

    // attach print button (download removed)
    const btnPrint = qs('#btn-imprimir'); if(btnPrint) btnPrint.addEventListener('click', function(){ const area = qs('.table-wrapper'); if(!area) return; const w = window.open('', '_blank'); if(!w){ alert('Permite ventanas emergentes'); return } w.document.write('<html><head><title>Imprimir Carnet</title><link rel="stylesheet" href="../css/shared.css"></head><body>'+area.innerHTML+'</body></html>'); w.document.close(); setTimeout(()=>w.print(),200); });

  });

})();
