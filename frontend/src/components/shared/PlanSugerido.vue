<script setup>
// Tarjeta de un plan de alimentación sugerido (generado por utils/planesAlimentacion.js).
// Se usa en la vista del usuario y en la del veterinario.
// El slot "acciones" permite agregar botones (ej. "Usar este plan").
defineProps({
  plan: { type: Object, required: true },
  destacado: { type: Boolean, default: false }
})
</script>

<template>
  <div class="ps-card" :class="{ 'ps-destacado': destacado }" :style="{ borderLeftColor: plan.color }">
    <div class="ps-head">
      <div>
        <div class="ps-title">{{ plan.icono }} {{ plan.titulo }}</div>
        <div class="ps-fuente">{{ plan.fuente }}</div>
      </div>
      <span class="ps-badge" :style="{ background: plan.color + '22', color: plan.color }">{{ plan.badge }}</span>
    </div>

    <div class="ps-grid">
      <div class="ps-item"><span>Tipo de dieta</span><strong>{{ plan.tipoDieta }}</strong></div>
      <div class="ps-item"><span>Frecuencia</span><strong>{{ plan.frecuencia }}</strong></div>
      <div class="ps-item"><span>Horario</span><strong>{{ plan.horario }}</strong></div>
      <div class="ps-item"><span>Calorías/día (est.)</span><strong>{{ plan.calorias }} kcal</strong></div>
    </div>

    <div class="ps-comidas">
      <span v-for="(c, i) in plan.comidas" :key="i" class="ps-comida">{{ c }}</span>
    </div>

    <div class="ps-extra" v-if="plan.suplementos && plan.suplementos !== 'Ninguno'">
      <strong>Suplementos:</strong> {{ plan.suplementos }}
    </div>
    <div class="ps-obs">{{ plan.observaciones }}</div>

    <div class="ps-acciones" v-if="$slots.acciones"><slot name="acciones" /></div>
  </div>
</template>

<style scoped>
.ps-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #2ecc71;
  border-radius: 10px;
  padding: 1rem 1.1rem;
  margin-bottom: 1rem;
}
.ps-destacado { box-shadow: 0 4px 14px rgba(0, 0, 0, .08); }
.ps-head { display: flex; justify-content: space-between; align-items: flex-start; gap: .75rem; margin-bottom: .75rem; }
.ps-title { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1rem; color: #1f2937; }
.ps-fuente { font-size: .75rem; color: #6b7280; margin-top: .15rem; }
.ps-badge { font-size: .72rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px; white-space: nowrap; }
.ps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .6rem; margin-bottom: .75rem; }
.ps-item { background: #f9fafb; border-radius: 8px; padding: .5rem .65rem; }
.ps-item span { display: block; font-size: .7rem; color: #6b7280; }
.ps-item strong { font-size: .85rem; color: #111827; }
.ps-comidas { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .6rem; }
.ps-comida { background: #f3f4f6; border-radius: 8px; padding: .4rem .65rem; font-size: .82rem; color: #374151; }
.ps-extra { font-size: .82rem; color: #374151; margin-bottom: .4rem; }
.ps-obs { font-size: .8rem; color: #6b7280; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: .5rem .65rem; }
.ps-acciones { display: flex; gap: .5rem; justify-content: flex-end; margin-top: .75rem; }
</style>
