/* JS para Alimentación: horarios, historial, alternativas y marcación de comidas */
(function(){
  function qs(id){return document.getElementById(id)}
  function qsa(sel){return Array.from(document.querySelectorAll(sel))}

  const STORAGE_KEY = 'pc_alimentacion_horarios_v1';
  const HIST_KEY = 'pc_alimentacion_historial_v1';

  function loadHorarios(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]') }catch{ return [] }
  }
  function saveHorarios(h){ localStorage.setItem(STORAGE_KEY, JSON.stringify(h)) }

  function loadHist(){ try{ return JSON.parse(localStorage.getItem(HIST_KEY)||'[]') }catch{ return [] } }
  function saveHist(h){ localStorage.setItem(HIST_KEY, JSON.stringify(h)) }

  function todayStr(){ const d=new Date(); return d.toISOString().slice(0,10) }

  function renderHorarios(){
    const list = qs('comidas-list'); if(!list) return;
    const horarios = loadHorarios();
    if(horarios.length===0){ list.innerHTML = '<div style="color:var(--muted)">No hay horarios. Agrega uno arriba.</div>'; renderProximas([]); return }

    horarios.sort((a,b)=> a.hora.localeCompare(b.hora));
    list.innerHTML = '';
    horarios.forEach(h=>{
      const done = h.lastCompleted === todayStr();
      const item = document.createElement('div');
      item.className = 'comida-item';
      item.dataset.id = h.id;
      item.innerHTML = `
        <div class="comida-icon ${done? 'green-ic':'gray'}"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div>
          <div class="comida-name">${h.nombre}</div>
          <div class="comida-hora">${h.hora}</div>
        </div>
        <div class="comida-cal">${h.cal || ''} cal</div>
        <div class="comida-status ${done? 'green-check':''}">
          ${done? '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>' : '<button class="btn btn-outline-primary btn-sm btn-marcar" data-id="'+h.id+'">Marcar</button>'}
        </div>
      `;
      list.appendChild(item);
    })

    // attach marcar buttons
    qsa('.btn-marcar').forEach(b=> b.addEventListener('click', function(){
      const id = this.dataset.id; marcarComidaPorId(id);
    }))

    renderProximas(horarios);
  }

  function renderProximas(horarios){
    const container = document.querySelector('.sidebar .card .card-title') && qsa('.sidebar .card').find(c=> /Próximas Comidas/.test((c.querySelector('.card-title')||{}).textContent));
    if(!container) return;
    const holder = container.querySelectorAll('.proxima-comida');
    // remove existing dynamic items (except the Marcar button which is last child)
    const items = Array.from(container.querySelectorAll('[data-dynamic="proxima"]'));
    items.forEach(i=>i.remove());

    const h = horarios || loadHorarios();
    const today = new Date();
    const now = today.getHours()*60 + today.getMinutes();
    // pick next 2 upcoming
    const upcoming = h.slice().sort((a,b)=>a.hora.localeCompare(b.hora)).filter(item=>{
      const [hh,mm] = item.hora.split(':').map(s=>parseInt(s));
      const minutes = hh*60 + mm;
      // include all, but will pick those later than now first
      return true;
    });

    // find upcoming after now
    const afterNow = upcoming.filter(item=>{ const [hh,mm]=item.hora.split(':').map(Number); return (hh*60+mm) >= now });
    const pick = (afterNow.length? afterNow : upcoming).slice(0,2);

    pick.forEach(p=>{
      const div = document.createElement('div');
      div.className = 'proxima-comida';
      div.setAttribute('data-dynamic','proxima');
      div.innerHTML = `<div><div style="font-weight:700; font-size:.875rem;">${p.nombre}</div><div style="font-size:.78rem; color:var(--muted);">Próxima: ${p.hora}</div></div><span class="badge badge-red">${p.cal||''} cal</span>`;
      // insert before the marker button (which is last element)
      const marker = container.querySelector('#btn-marcar-comida');
      if(marker) container.insertBefore(div, marker);
      else container.appendChild(div);
    })
  }

  function addHorario(nombre, hora, cal){
    if(!nombre || !hora) { alert('Nombre y hora son requeridos'); return }
    const horarios = loadHorarios();
    const item = { id: 'h_'+Date.now(), nombre, hora, cal: cal || '', lastCompleted: null };
    horarios.push(item); saveHorarios(horarios); renderHorarios();
  }

  function marcarComidaPorId(id){
    const horarios = loadHorarios();
    const item = horarios.find(h=>h.id===id); if(!item) return;
    item.lastCompleted = todayStr(); saveHorarios(horarios); renderHorarios(); alert('Comida marcada como completada.');
  }

  function marcarProxima(){
    const horarios = loadHorarios(); if(horarios.length===0){ alert('No hay horarios configurados'); return }
    const today = new Date(); const now = today.getHours()*60 + today.getMinutes();
    // find first not completed today after now
    const sorted = horarios.slice().sort((a,b)=>a.hora.localeCompare(b.hora));
    let target = sorted.find(h=>{ const [hh,mm]=h.hora.split(':').map(Number); const mins=hh*60+mm; return mins>=now && h.lastCompleted!==todayStr() });
    if(!target) target = sorted.find(h=> h.lastCompleted!==todayStr());
    if(!target){ alert('No hay comidas pendientes para hoy'); return }
    target.lastCompleted = todayStr(); saveHorarios(horarios); renderHorarios(); alert('Se marcó '+target.nombre+' como completada.');
  }

  // Muestra un modal sencillo para seleccionar qué comida marcar como completada
  function showMarcarSelector(){
    const horarios = loadHorarios();
    if(!horarios || horarios.length===0){ alert('No hay horarios configurados'); return }

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.background = 'rgba(0,0,0,0.4)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex = 9999;

    const box = document.createElement('div');
    box.style.background='#fff'; box.style.padding='1rem'; box.style.borderRadius='8px'; box.style.width='320px'; box.style.maxHeight='80vh'; box.style.overflow='auto';
    box.innerHTML = '<h3 style="margin:0 0 .5rem">Marcar Comida</h3>';

    const form = document.createElement('div');
    horarios.slice().sort((a,b)=>a.hora.localeCompare(b.hora)).forEach(h=>{
      const row = document.createElement('div'); row.style.display='flex'; row.style.alignItems='center'; row.style.justifyContent='space-between'; row.style.padding='.4rem 0';
      row.innerHTML = `<label style="flex:1"><input type="radio" name="selComida" value="${h.id}" style="margin-right:.5rem"> <strong>${h.nombre}</strong> <span style="color:var(--muted); font-size:.85rem">${h.hora}</span></label><span style="margin-left:.5rem; color:var(--muted);">${h.cal||''} cal</span>`;
      form.appendChild(row);
    });

    const controls = document.createElement('div'); controls.style.display='flex'; controls.style.gap='.5rem'; controls.style.marginTop='1rem'; controls.style.justifyContent='flex-end';
    const btnCancel = document.createElement('button'); btnCancel.className='btn btn-outline-primary'; btnCancel.textContent='Cancelar';
    const btnOk = document.createElement('button'); btnOk.className='btn btn-primary'; btnOk.textContent='Marcar';
    controls.appendChild(btnCancel); controls.appendChild(btnOk);

    box.appendChild(form); box.appendChild(controls); overlay.appendChild(box); document.body.appendChild(overlay);

    btnCancel.addEventListener('click', function(){ overlay.remove(); });
    btnOk.addEventListener('click', function(){
      const sel = overlay.querySelector('input[name="selComida"]:checked');
      if(!sel){ alert('Selecciona una comida'); return }
      const id = sel.value; marcarComidaPorId(id); overlay.remove();
    });
  }

  // Tabs
  function setupTabs(){
    qsa('#tabs .tab').forEach(tab=>{
      tab.addEventListener('click', function(){
        qsa('#tabs .tab').forEach(t=>t.classList.remove('active'));
        this.classList.add('active');
        const target = this.dataset.tab;
        // show/hide sections
        qs('plan-content').style.display = (target==='plan')? 'block':'none';
        qs('historial-content').style.display = (target==='historial')? 'block':'none';
        qs('alternativas-content').style.display = (target==='alternativas')? 'block':'none';
        if(target==='historial') renderHistorial();
      })
    })
  }

  function renderHistorial(){
    const hist = loadHist(); const node = qs('historial-list'); if(!node) return;
    if(hist.length===0){ node.innerHTML = '<div style="color:var(--muted)">No hay registros.</div>'; return }
    node.innerHTML = '';
    hist.slice().reverse().forEach(h=>{
      const d = document.createElement('div'); d.style.padding = '.5rem 0'; d.style.borderBottom='1px solid var(--border)';
      d.innerHTML = `<div style="font-weight:700">${h.nuevo}</div><div style="font-size:.85rem;color:var(--muted)">${h.fecha} — ${h.notas||''}</div>`;
      node.appendChild(d);
    })
  }

  function setupAlternativas(){
    qsa('.alt-apply').forEach(b=> b.addEventListener('click', function(){
      const name = this.dataset.name; if(!name) return;
      // aplicar alternativa: guardar en historial y actualizar alimento recomendado
      const hist = loadHist();
      const entry = { fecha: new Date().toLocaleString(), anterior: document.querySelector('.alimento-nombre')?.textContent || '', nuevo: name, notas: 'Aplicada desde Alternativas' };
      hist.push(entry); saveHist(hist);
      // actualizar UI
      const alName = document.querySelector('.alimento-nombre'); if(alName) alName.textContent = name;
      alert('Alternativa aplicada: '+name);
      renderHistorial();
    }))
  }

  document.addEventListener('DOMContentLoaded', function(){
    // attach add comida
    const btnAdd = qs('btn-add-comida'); if(btnAdd) btnAdd.addEventListener('click', function(e){ e.preventDefault(); addHorario(qs('input-comida-nombre').value.trim(), qs('input-comida-hora').value, qs('input-comida-cal').value.trim()); qs('input-comida-nombre').value=''; qs('input-comida-hora').value=''; qs('input-comida-cal').value=''; });

    const btnMarcar = qs('btn-marcar-comida'); if(btnMarcar) btnMarcar.addEventListener('click', function(e){ e.preventDefault(); showMarcarSelector(); });

    setupTabs(); renderHorarios(); setupAlternativas();
  });

})();
