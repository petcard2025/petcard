<script setup>
// Pie de página compartido. Usa las clases globales (.footer, .footer-grid, ...) de shared.css,
// las mismas que ya tenía el footer escrito a mano en veterinario-citas.vue.
const anio = new Date().getFullYear()
</script>

<template>
  <footer class="footer" style="margin-top:2.5rem;">
    <div class="footer-grid">
      <div class="footer-brand">
        <span class="nav-logo" style="color:#fff;display:flex;">PetCard</span>
        <p>Comprometidos con brindar toda la atención profesional.</p>
      </div>
      <div class="footer-col">
        <h4>Servicios</h4>
        <ul>
          <li><a href="#">Consulta General</a></li>
          <li><a href="#">Vacunación</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contacto</h4>
        <p>+1 234 567 8901</p>
      </div>
      <div class="footer-col">
        <h4>Horarios</h4>
        <p>Lunes - Viernes: 8:00 AM - 7:00 PM</p>
        <p>Sábados: 9:00 AM - 6:00 PM</p>
        <p>Domingos: 10:00 AM - 4:00 PM</p>
      </div>
    </div>
    <div class="footer-bottom">© {{ anio }} PetCard. Todos los derechos reservados.</div>
  </footer>
</template>