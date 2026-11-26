<script setup>
// Banner superior de las vistas: foto del módulo con una capa oscura
// (mismo estilo que el banner de Inicio). El subtítulo va en el slot.
defineProps({
  titulo: { type: String, required: true },
  imagen: { type: String, required: true }
})
</script>

<template>
  <section class="page-hero" :style="{ '--hero-img': `url('${imagen}')` }">
    <div class="page-hero-inner">
      <h1>{{ titulo }}</h1>
      <p v-if="$slots.default"><slot /></p>
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  /* capa oscura + foto + degradado de respaldo (se ve solo si la foto no carga) */
  background:
    linear-gradient(rgba(0, 0, 0, .55), rgba(0, 0, 0, .55)),
    var(--hero-img) center / cover no-repeat,
    linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  color: #fff;
  text-align: center;
  min-height: 230px;
  padding: 3rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-hero-inner { max-width: 720px; }
.page-hero h1 {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 2.1rem;
  margin: 0 0 .5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, .35);
}
.page-hero p {
  font-size: 1rem;
  line-height: 1.6;
  opacity: .95;
  margin: 0;
}
@media (max-width: 640px) {
  .page-hero { min-height: 180px; padding: 2rem 1rem; }
  .page-hero h1 { font-size: 1.5rem; }
}
</style>
