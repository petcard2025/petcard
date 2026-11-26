<script setup>
// Buscador con lupa:
//  - Al escribir se despliega una lista con las coincidencias (mascota y, según la vista, el cliente).
//  - La búsqueda se aplica al hacer clic en la lupa, presionar Enter o elegir una sugerencia.
//  - Si se borra el texto (o se presiona la ✕) se muestran de nuevo todos los resultados.
import { ref, computed, watch } from 'vue'
import { normalizar } from '../../utils/busqueda'

const props = defineProps({
  modelValue: { type: String, default: '' },          // texto de búsqueda ya aplicado
  sugerencias: { type: Array, default: () => [] },    // [{ valor, titulo, detalle, icono }]
  placeholder: { type: String, default: 'Buscar...' },
  maxSugerencias: { type: Number, default: 8 }
})
const emit = defineEmits(['update:modelValue'])

const texto = ref(props.modelValue)
const abierto = ref(false)
const indice = ref(-1)
const entrada = ref(null)

watch(() => props.modelValue, (v) => { texto.value = v || '' })

const visibles = computed(() => {
  const q = normalizar(texto.value)
  if (!q) return []
  const palabras = q.split(/\s+/)
  return props.sugerencias
    .filter(s => {
      const pajar = normalizar(`${s.titulo} ${s.detalle || ''}`)
      return palabras.every(p => pajar.includes(p))
    })
    .slice(0, props.maxSugerencias)
})

function aplicar(valor) {
  const v = (valor ?? texto.value).trim()
  texto.value = v
  emit('update:modelValue', v)
  abierto.value = false
  indice.value = -1
}

function clicLupa() {
  if (!texto.value.trim()) {
    aplicar('')
    entrada.value?.focus()
    return
  }
  aplicar()
}

function limpiar() {
  texto.value = ''
  aplicar('')
  entrada.value?.focus()
}

function alEscribir(e) {
  texto.value = e.target.value
  abierto.value = true
  indice.value = -1
  // Si se borró todo, se vuelve a mostrar la lista completa
  if (!texto.value.trim() && props.modelValue) aplicar('')
}

function teclado(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    abierto.value = true
    indice.value = Math.min(indice.value + 1, visibles.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    indice.value = Math.max(indice.value - 1, -1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const elegida = visibles.value[indice.value]
    aplicar(elegida ? elegida.valor : undefined)
  } else if (e.key === 'Escape') {
    abierto.value = false
  }
}

function elegir(s) {
  aplicar(s.valor)
}
</script>

<template>
  <div class="bl">
    <button type="button" class="bl-lupa" title="Buscar" aria-label="Buscar" @mousedown.prevent @click="clicLupa">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </button>

    <input
      ref="entrada"
      class="bl-input"
      type="text"
      autocomplete="off"
      :value="texto"
      :placeholder="placeholder"
      @input="alEscribir"
      @focus="abierto = true"
      @blur="abierto = false"
      @keydown="teclado"
    />

    <button v-if="texto" type="button" class="bl-x" title="Limpiar búsqueda" aria-label="Limpiar búsqueda" @mousedown.prevent @click="limpiar">✕</button>

    <ul v-if="abierto && texto.trim()" class="bl-lista">
      <li
        v-for="(s, i) in visibles"
        :key="s.valor + i"
        class="bl-item"
        :class="{ 'bl-activa': i === indice }"
        @mousedown.prevent="elegir(s)"
        @mousemove="indice = i"
      >
        <span v-if="s.icono" class="bl-ico">{{ s.icono }}</span>
        <span class="bl-textos">
          <span class="bl-titulo">{{ s.titulo }}</span>
          <span v-if="s.detalle" class="bl-detalle">{{ s.detalle }}</span>
        </span>
      </li>
      <li v-if="!visibles.length" class="bl-vacio">Sin coincidencias. Presiona la lupa para buscar igualmente.</li>
    </ul>
  </div>
</template>

<style scoped>
.bl { position: relative; flex: 1; min-width: 0; }

.bl-input {
  width: 100%; box-sizing: border-box;
  padding: .55rem 2.2rem .55rem 2.4rem;
  border: 1.5px solid var(--border, #d1d5db);
  border-radius: var(--radius-sm, 8px);
  font-size: .875rem; font-family: 'Lato', sans-serif;
  color: var(--text, #0f172a); background: var(--white, #fff);
  outline: none; transition: border-color .2s;
}
.bl-input:focus { border-color: var(--purple, #2563eb); }

.bl-lupa {
  position: absolute; left: .3rem; top: 50%; transform: translateY(-50%);
  width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; border-radius: 6px;
  color: var(--muted, #64748b); cursor: pointer; transition: background .15s, color .15s;
}
.bl-lupa:hover { background: #eff6ff; color: var(--purple, #2563eb); }

.bl-x {
  position: absolute; right: .5rem; top: 50%; transform: translateY(-50%);
  width: 1.5rem; height: 1.5rem; border: none; background: transparent;
  color: #94a3b8; font-size: .8rem; cursor: pointer; border-radius: 50%;
}
.bl-x:hover { background: #f1f5f9; color: #475569; }

.bl-lista {
  position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 60;
  margin: 0; padding: .25rem; list-style: none;
  max-height: 280px; overflow-y: auto;
  background: #fff; border: 1px solid #cbd5e1; border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, .15);
}
.bl-item { display: flex; align-items: center; gap: .55rem; padding: .45rem .6rem; border-radius: 6px; cursor: pointer; }
.bl-activa { background: #eff6ff; }
.bl-ico { font-size: 1.05rem; }
.bl-textos { display: flex; flex-direction: column; min-width: 0; }
.bl-titulo { font-size: .9rem; font-weight: 700; color: #0f172a; }
.bl-detalle { font-size: .78rem; color: #64748b; }
.bl-vacio { padding: .55rem .6rem; color: #94a3b8; font-size: .82rem; }
</style>
