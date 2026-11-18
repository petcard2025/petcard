<script setup>
// Lista desplegable:
//  - Al hacer clic en el campo se despliegan todas las opciones.
//  - Si `buscar` es true, el usuario puede escribir para filtrar la lista.
//  - Solo se aceptan valores de la lista (si escribe algo que no existe, se descarta).
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Selecciona una opción' },
  buscar: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  textoVacio: { type: String, default: 'Sin resultados' }
})
const emit = defineEmits(['update:modelValue'])

const abierto = ref(false)
const texto = ref(props.modelValue)
const filtrando = ref(false) // true solo cuando el usuario escribió algo
const indice = ref(-1)

watch(() => props.modelValue, (v) => { texto.value = v || '' })

const sinTildes = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const visibles = computed(() => {
  if (!props.buscar || !filtrando.value || !texto.value.trim()) return props.options
  const q = sinTildes(texto.value.trim())
  return props.options.filter(o => sinTildes(o).includes(q))
})

function abrir() {
  if (props.disabled) return
  filtrando.value = false
  abierto.value = true
  indice.value = props.options.indexOf(props.modelValue)
}

function elegir(opcion) {
  emit('update:modelValue', opcion)
  texto.value = opcion
  abierto.value = false
  filtrando.value = false
}

function alEscribir(e) {
  texto.value = e.target.value
  filtrando.value = true
  abierto.value = true
  indice.value = 0
}

// Al salir del campo: si lo escrito coincide con una opción se elige; si no, se vuelve al valor anterior
function cerrar() {
  const exacta = props.options.find(o => sinTildes(o) === sinTildes(texto.value.trim()))
  if (exacta) {
    if (exacta !== props.modelValue) emit('update:modelValue', exacta)
    texto.value = exacta
  } else {
    texto.value = props.modelValue || ''
  }
  abierto.value = false
  filtrando.value = false
}

function teclado(e) {
  if (!abierto.value && (e.key === 'ArrowDown' || e.key === 'Enter')) { e.preventDefault(); abrir(); return }
  if (!abierto.value) return
  if (e.key === 'ArrowDown') { e.preventDefault(); indice.value = Math.min(indice.value + 1, visibles.value.length - 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); indice.value = Math.max(indice.value - 1, 0) }
  else if (e.key === 'Enter') { e.preventDefault(); if (visibles.value[indice.value]) elegir(visibles.value[indice.value]) }
  else if (e.key === 'Escape') { e.preventDefault(); cerrar() }
}
</script>

<template>
  <div class="combo">
    <input
      class="form-control combo-input"
      type="text"
      autocomplete="off"
      :value="texto"
      :placeholder="placeholder"
      :readonly="!buscar"
      :disabled="disabled"
      :class="{ 'combo-readonly': !buscar }"
      @focus="abrir"
      @click="abrir"
      @input="alEscribir"
      @blur="cerrar"
      @keydown="teclado"
    />
    <svg class="combo-flecha" :class="{ 'combo-flecha-abierta': abierto }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9" /></svg>

    <ul v-if="abierto" class="combo-lista">
      <li
        v-for="(op, i) in visibles"
        :key="op"
        class="combo-opcion"
        :class="{ 'combo-activa': i === indice, 'combo-elegida': op === modelValue }"
        @mousedown.prevent="elegir(op)"
        @mousemove="indice = i"
      >{{ op }}</li>
      <li v-if="visibles.length === 0" class="combo-vacio">{{ textoVacio }}</li>
    </ul>
  </div>
</template>

<style scoped>
.combo { position: relative; width: 100%; }
.combo-input {
  width: 100%; box-sizing: border-box; padding: .55rem 2rem .55rem .7rem;
  border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #0f172a; font: inherit;
}
.combo-input:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, .15); }
.combo-input:disabled { background: #f1f5f9; cursor: not-allowed; }
.combo-readonly { cursor: pointer; caret-color: transparent; }
.combo-flecha {
  position: absolute; right: .75rem; top: 50%; transform: translateY(-50%);
  color: #64748b; pointer-events: none; transition: transform .15s;
}
.combo-flecha-abierta { transform: translateY(-50%) rotate(180deg); }
.combo-lista {
  position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 50;
  margin: 0; padding: .25rem; list-style: none;
  max-height: 220px; overflow-y: auto;
  background: #fff; border: 1px solid #cbd5e1; border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, .15);
}
.combo-opcion { padding: .45rem .6rem; border-radius: 6px; cursor: pointer; font-size: .9rem; color: #0f172a; }
.combo-activa { background: #eff6ff; color: #1d4ed8; }
.combo-elegida { font-weight: 700; }
.combo-vacio { padding: .5rem .6rem; color: #94a3b8; font-size: .85rem; }
</style>