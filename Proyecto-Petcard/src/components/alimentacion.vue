<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>

     <nav class="navbar">
    <router-link to="/alimentacion" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C17.5 22.15 21 17.25 21 12V6l-9-4z" fill="currentColor" opacity=".15"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" stroke-linecap="round"/></svg>
      PETCARD
    </router-link>
    <ul class="nav-links">
      <li><router-link to="/inicio">Inicio</router-link></li>
      <li><router-link to="/servicios">Servicios</router-link></li>
      <li><router-link to="/citas">Citas</router-link></li>
      <li><router-link to="/alimentacion" class="active">Alimentación</router-link></li>
      <li><router-link to="/carnet">Carnet de Vacunas</router-link></li>
      <li><router-link to="/perfil">Mi Perfil</router-link></li>
      <li><router-link to="/notificaciones">Notificaciones</router-link></li>
      <li><router-link to="/mis-mascotas">Mis Mascotas</router-link></li>

    </ul>
    <div id="auth-section" class="auth-section">
      <button class="btn-auth" @click="alert('Login no configurado aún')">Iniciar sesión</button>
      <button class="btn-auth" @click="alert('Registro no configurado aún')">Registrarse</button>
    </div>
  </nav>

  <div class="page-wrapper">
    <div class="two-col">

      <!-- PANEL IZQUIERDO -->
      <div>
        <!-- Selector mascota -->
        <div class="card" style="margin-bottom:1.25rem;">
          <div class="card-title" style="color:var(--orange);">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            Seleccionar Mascota
            <span style="margin-left:auto; color:var(--purple); font-weight:700; font-size:.85rem;" id="mascota-label">Max – Golden Retriever</span>
          </div>
          <p style="font-size:.85rem; color:var(--muted); margin-bottom:.75rem;">Elige tu mascota para ver el plan nutricional</p>
          <select class="form-control" id="select-mascota" style="max-width:220px;">
            <option>Max – Golden Retriever</option>
            <option>Luna – Gato Persa</option>
          </select>
        </div>

        <!-- Tabs -->
        <div class="card">
          <div class="tabs" id="tabs">
            <button class="tab active" data-tab="plan">Plan Nutricional</button>
            <button class="tab" data-tab="historial">Historial de Cambios</button>
            <button class="tab" data-tab="alternativas">Alternativas Recomendadas</button>
          </div>

          <!-- TAB PLAN NUTRICIONAL -->
          <div id="plan-content" style="display:block;">
            <!-- Stats -->
            <div class="stats-row">
            <div class="stat-box orange">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5z"/></svg>
              <div class="stat-value">1200</div>
              <div class="stat-label" style="color:var(--orange);">Calorías Diarias</div>
            </div>
            <div class="stat-box blue">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              <div class="stat-value">330g</div>
              <div class="stat-label" style="color:var(--purple);">Comidas Diarias</div>
            </div>
            <div class="stat-box green">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div class="stat-value">Diaria</div>
              <div class="stat-label" style="color:var(--green);">Frecuencia</div>
            </div>
          </div>

          <!-- Alimento recomendado -->
          <div class="alimento-rec">
            <div>
              <div class="alimento-nombre">Royal Canin Adult Golden Retriever</div>
              <div class="alimento-detalle">Tamaño de la porción: 330g total</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:.75rem; color:var(--muted);">Marca de la comida:</div>
              <div style="font-weight:700; font-size:.85rem;">Matchstick</div>
            </div>
          </div>

          <!-- Formulario para agregar comidas -->
          <div style="background:#f9fafb; padding:1rem; border-radius:6px; margin-bottom:1.5rem;">
            <h5 style="font-family:'Nunito',sans-serif; font-weight:700; margin:0 0 .75rem; color:var(--dark);">Agregar nuevo horario</h5>
            <div class="form-group" style="margin-bottom:.5rem;">
              <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Nombre</label>
              <input type="text" id="input-comida-nombre" class="form-control" placeholder="Ej: Desayuno" style="font-size:.85rem;"/>
            </div>
            <div class="form-group" style="margin-bottom:.5rem;">
              <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Hora</label>
              <input type="time" id="input-comida-hora" class="form-control" style="font-size:.85rem;"/>
            </div>
            <div class="form-group" style="margin-bottom:.75rem;">
              <label style="display:block; font-size:.85rem; color:var(--muted); margin-bottom:.25rem;">Calorías</label>
              <input type="text" id="input-comida-cal" class="form-control" placeholder="Ej: 400" style="font-size:.85rem;"/>
            </div>
            <button class="btn btn-primary btn-full" id="btn-add-comida">Agregar Comida</button>
          </div>

          <!-- Horarios -->
          <h4 style="font-family:'Nunito',sans-serif; font-weight:800; margin:1.25rem 0 .75rem;">Horarios de Alimentación</h4>
          <div class="comidas-list">
            <div class="comida-item">
              <div class="comida-icon gray"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <div>
                <div class="comida-name">Comida 1</div>
                <div class="comida-hora">07:00</div>
              </div>
              <div class="comida-cal">400 cal</div>
              <div class="comida-status"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            </div>
            <div class="comida-item">
              <div class="comida-icon green-ic"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <div>
                <div class="comida-name">Comida 2</div>
                <div class="comida-hora">13:00</div>
              </div>
              <div class="comida-cal">400 cal</div>
              <div class="comida-status green-check">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
              </div>
            </div>
            <div class="comida-item">
              <div class="comida-icon gray"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <div>
                <div class="comida-name">Comida 3</div>
                <div class="comida-hora">19:00</div>
              </div>
              <div class="comida-cal">400 cal</div>
              <div class="comida-status"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            </div>
          </div>

          <!-- Suplementos -->
          <h4 style="font-family:'Nunito',sans-serif; font-weight:800; margin:1.25rem 0 .75rem;">Suplementos</h4>
          <div class="cards-grid-2">
            <div class="suplem-card"><div class="suplem-header"><span>Omega 3</span><span class="badge badge-green">Activo</span></div><p>2 veces por semana</p></div>
            <div class="suplem-card"><div class="suplem-header"><span>Glucosamina</span><span class="badge badge-green">Activo</span></div><p>Diario</p></div>
          </div>

          <!-- Restricciones -->
          <h4 style="font-family:'Nunito',sans-serif; font-weight:800; margin:1.25rem 0 .75rem;">Restricciones Alimentarias</h4>
          <div class="restriccion-item red-border">
            <svg width="16" height="16" fill="none" stroke="#dc2626" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div><div class="rest-nombre" style="color:#dc2626;">Pollo</div><div class="rest-tipo">Alergia</div></div>
            <span class="badge badge-red" style="margin-left:auto;">Alta</span>
          </div>
          <div class="restriccion-item yellow-border">
            <svg width="16" height="16" fill="none" stroke="#ca8a04" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div><div class="rest-nombre" style="color:#ca8a04;">Lactosa</div><div class="rest-tipo">Intolerancia</div></div>
            <span class="badge badge-yellow" style="margin-left:auto;">Media</span>
          </div>

          <!-- Observaciones -->
          <h4 style="font-family:'Nunito',sans-serif; font-weight:800; margin:1.25rem 0 .75rem;">Observaciones</h4>
          <div class="observaciones">Evita dar porciones más grandes de las recomendadas. Evita premios de contenido calórico entre comidas.</div>
          </div><!-- Cierre plan-content -->

          <!-- TAB HISTORIAL DE CAMBIOS -->
          <div id="historial-content" style="display:none;">
            <h5 style="font-family:'Nunito',sans-serif; font-weight:700; margin:0 0 1rem; color:var(--dark);">Cambios Realizados en la Alimentación</h5>
            <div id="historial-list" style="max-height:500px; overflow-y:auto;">
              <div style="color:var(--muted); padding:1rem; text-align:center;">No hay cambios registrados aún.</div>
            </div>
          </div><!-- Cierre historial-content -->

          <!-- TAB ALTERNATIVAS RECOMENDADAS -->
          <div id="alternativas-content" style="display:none;">
            <h5 style="font-family:'Nunito',sans-serif; font-weight:700; margin:0 0 1rem; color:var(--dark);">Cambiar a un Alimento Alternativo</h5>
            <div class="cards-grid-2">
              <div style="background:#f5f5f5; padding:1rem; border-radius:6px;">
                <div style="font-weight:700; margin-bottom:0.5rem;">Pro Plan Adult Large Dog</div>
                <p style="font-size:.85rem; color:var(--muted); margin:0.5rem 0;">Proteína optimizada para tamaño grande</p>
                <button class="alt-apply btn btn-sm btn-primary" data-name="Pro Plan Adult Large Dog" style="margin-top:0.5rem;">Aplicar</button>
              </div>
              <div style="background:#f5f5f5; padding:1rem; border-radius:6px;">
                <div style="font-weight:700; margin-bottom:0.5rem;">Hill's Science Diet Adult</div>
                <p style="font-size:.85rem; color:var(--muted); margin:0.5rem 0;">Fórmula equilibrada para adultos</p>
                <button class="alt-apply btn btn-sm btn-primary" data-name="Hill's Science Diet Adult" style="margin-top:0.5rem;">Aplicar</button>
              </div>
              <div style="background:#f5f5f5; padding:1rem; border-radius:6px;">
                <div style="font-weight:700; margin-bottom:0.5rem;">Acana Heritage Meat</div>
                <p style="font-size:.85rem; color:var(--muted); margin:0.5rem 0;">Carne de calidad con ingredientes naturales</p>
                <button class="alt-apply btn btn-sm btn-primary" data-name="Acana Heritage Meat" style="margin-top:0.5rem;">Aplicar</button>
              </div>
              <div style="background:#f5f5f5; padding:1rem; border-radius:6px;">
                <div style="font-weight:700; margin-bottom:0.5rem;">Orijen Adult</div>
                <p style="font-size:.85rem; color:var(--muted); margin:0.5rem 0;">Alto contenido proteico biológicamente apropiado</p>
                <button class="alt-apply btn btn-sm btn-primary" data-name="Orijen Adult" style="margin-top:0.5rem;">Aplicar</button>
              </div>
            </div>
          </div><!-- Cierre alternativas-content -->
        </div><!-- Cierre card principal -->

      </div>

      <!-- SIDEBAR -->
      <div class="sidebar">

        <!-- Info mascota -->
        <div class="card">
          <div class="card-title" style="color:var(--purple);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            Información de Max
          </div>
          <div class="info-row"><span>Peso Actual:</span><strong>28 kg</strong></div>
          <div class="info-row"><span>Edad:</span><strong>3 años</strong></div>
          <div class="info-row"><span>Raza:</span><strong>Golden Retriever</strong></div>
          <div class="info-row"><span>Actividad:</span><strong>Moderada</strong></div>
        </div>

        <!-- Próximas Comidas -->
        <div class="card">
          <div class="card-title" style="color:var(--orange);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Próximas Comidas
          </div>
          <div class="proxima-comida">
            <div>
              <div style="font-weight:700; font-size:.875rem;">Comida 1</div>
              <div style="font-size:.78rem; color:var(--muted);">Próxima: 7:00 AM</div>
            </div>
            <span class="badge badge-red">400 cal</span>
          </div>
          <div class="proxima-comida">
            <div>
              <div style="font-weight:700; font-size:.875rem;">Comida 3</div>
              <div style="font-size:.78rem; color:var(--muted);">Próxima: 7:00 PM</div>
            </div>
            <span class="badge badge-red">400 cal</span>
          </div>
          <button class="btn btn-danger btn-full" style="margin-top:.75rem;" id="btn-marcar-comida">Marcar Comida Completada</button>
        </div>

        <!-- Consumo Nutricional -->
        <div class="card">
          <div class="card-title">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
            Consumo Nutricional
          </div>
          <div class="nutriente">
            <div class="nutriente-header"><span>Proteínas</span><strong>45%</strong></div>
            <div class="progress-bar"><div class="progress-fill" style="width:45%;"></div></div>
            <div style="font-size:.75rem; color:var(--muted);">Recomendado: 40-50%</div>
          </div>
          <div class="nutriente">
            <div class="nutriente-header"><span>Grasas</span><strong>20%</strong></div>
            <div class="progress-bar"><div class="progress-fill green" style="width:20%;"></div></div>
            <div style="font-size:.75rem; color:var(--muted);">Recomendado: 15-25%</div>
          </div>
          <div class="nutriente">
            <div class="nutriente-header"><span>Carbohidratos</span><strong>35%</strong></div>
            <div class="progress-bar"><div class="progress-fill" style="width:35%; background:#9ca3af;"></div></div>
            <div style="font-size:.75rem; color:var(--muted);">Recomendado: 30-40%</div>
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
<script>/* JS para Alimentación: horarios, historial, alternativas y marcación de comidas */
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
        <button class="btn btn-outline-danger btn-sm" style="margin-left:0.5rem; padding:0.25rem 0.5rem;" data-delete-id="${h.id}" title="Eliminar">✕</button>
      `;
      list.appendChild(item);
    })

    // attach marcar buttons
    qsa('.btn-marcar').forEach(b=> b.addEventListener('click', function(){
      const id = this.dataset.id; marcarComidaPorId(id);
    }))

    // attach delete buttons
    qsa('button[data-delete-id]').forEach(b=> b.addEventListener('click', function(){
      const id = this.dataset.deleteId; deleteHorarioById(id);
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
    horarios.push(item); 
    saveHorarios(horarios);
    
    // Registrar en historial
    const hist = loadHist();
    const entry = { 
      fecha: new Date().toLocaleString(), 
      accion: 'Agregar horario',
      anterior: '-',
      nuevo: nombre + ' - ' + hora + ' (' + (cal || '0') + ' cal)',
      notas: 'Se agregó nuevo horario de comida'
    };
    hist.push(entry);
    saveHist(hist);
    
    renderHorarios(); 
    alert('✓ Horario agregado: ' + nombre + ' a las ' + hora);
  }

  function marcarComidaPorId(id){
    const horarios = loadHorarios();
    const item = horarios.find(h=>h.id===id); if(!item) return;
    item.lastCompleted = todayStr(); 
    saveHorarios(horarios);
    
    // Registrar en historial
    const hist = loadHist();
    const entry = { 
      fecha: new Date().toLocaleString(), 
      accion: 'Marcar comida completada',
      anterior: 'Pendiente',
      nuevo: item.nombre + ' - ' + item.hora + ' completada',
      notas: 'Se marcó como completada hoy'
    };
    hist.push(entry);
    saveHist(hist);
    
    renderHorarios(); 
    alert('✓ ' + item.nombre + ' marcada como completada.');
  }

  function deleteHorarioById(id){
    const horarios = loadHorarios();
    const item = horarios.find(h=>h.id===id);
    if(!item) return;
    if(!confirm('¿Eliminar "' + item.nombre + '"?')) return;
    
    horarios.splice(horarios.indexOf(item), 1);
    saveHorarios(horarios);
    
    // Registrar en historial
    const hist = loadHist();
    const entry = { 
      fecha: new Date().toLocaleString(), 
      accion: 'Eliminar horario',
      anterior: item.nombre + ' - ' + item.hora + ' (' + (item.cal || '0') + ' cal)',
      nuevo: '-',
      notas: 'Se eliminó horario de comida'
    };
    hist.push(entry);
    saveHist(hist);
    
    renderHorarios();
    alert('✓ Horario eliminado.');
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
    const hist = loadHist(); 
    const node = qs('historial-list'); 
    if(!node) return;
    
    if(hist.length===0){ 
      node.innerHTML = '<div style="color:var(--muted); padding:1rem; text-align:center;">No hay cambios registrados.</div>'; 
      return;
    }
    
    node.innerHTML = '';
    hist.slice().reverse().forEach((h, idx)=>{
      const d = document.createElement('div'); 
      d.style.padding = '0.75rem'; 
      d.style.borderBottom='1px solid var(--border)';
      d.style.borderRadius = '4px';
      d.style.marginBottom = '0.5rem';
      d.style.background = idx === 0 ? '#f0f9ff' : 'transparent';
      
      let accionIcon = '📝';
      if(h.accion === 'Agregar horario') accionIcon = '➕';
      else if(h.accion === 'Marcar comida completada') accionIcon = '✓';
      else if(h.accion === 'Eliminar horario') accionIcon = '🗑️';
      else if(h.accion === 'Cambiar alimento') accionIcon = '🔄';
      
      d.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:0.75rem;">
          <div style="font-size:1.2rem; flex-shrink:0;">${accionIcon}</div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:700; color:var(--dark); margin-bottom:0.25rem;">${h.accion || 'Cambio'}</div>
            <div style="font-size:.85rem; color:var(--muted); margin-bottom:0.25rem;">
              <span style="display:block;"><strong>Anterior:</strong> ${h.anterior}</span>
              <span style="display:block;"><strong>Nuevo:</strong> ${h.nuevo}</span>
            </div>
            <div style="font-size:.75rem; color:#999; display:flex; justify-content:space-between; align-items:center;">
              <span>${h.fecha}</span>
              ${h.notas ? '<span style="color:#666; font-style:italic;">' + h.notas + '</span>' : ''}
            </div>
          </div>
        </div>
      `;
      node.appendChild(d);
    })
  }

  function setupAlternativas(){
    qsa('.alt-apply').forEach(b=> b.addEventListener('click', function(){
      const name = this.dataset.name; if(!name) return;
      // aplicar alternativa: guardar en historial y actualizar alimento recomendado
      const hist = loadHist();
      const anterior = document.querySelector('.alimento-nombre')?.textContent || 'Anterior';
      const entry = { 
        fecha: new Date().toLocaleString(), 
        accion: 'Cambiar alimento',
        anterior: anterior,
        nuevo: name,
        notas: 'Aplicada desde Alternativas Recomendadas'
      };
      hist.push(entry); saveHist(hist);
      // actualizar UI
      const alName = document.querySelector('.alimento-nombre'); if(alName) alName.textContent = name;
      alert('✓ Alternativa aplicada: '+name);
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
</script>