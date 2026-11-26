<script setup>
// Campo de opción múltiple para los formularios.
//  - Selección única (por defecto): lista desplegable + "Otro (escribir)".
//  - Selección múltiple (`multiple`): botones tipo "chip" que se activan/desactivan + "Otro".
// El valor siempre es un texto (como guarda la base de datos): en modo múltiple las opciones
// elegidas se unen con `separador`.
// Si el valor guardado no está en la lista (datos antiguos), se conserva y se muestra igual.
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Selecciona una opción' },
  multiple: { type: Boolean, default: false },
  separador: { type: String, default: ', ' },
  // Opciones que no se pueden combinar con otras (ej. "Ninguna conocida")
  exclusivas: { type: Array, default: () => [] },
  permitirOtro: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const OTRO = '__otro__'
const sep = computed(() => props.separador.trim())

// ── Selección única ───────────────────────────────────────────
const modoOtro = ref(false)

const opcionesUnica = computed(() => {
  const v = props.modelValue
  if (v && !modoOtro.value && !props.options.includes(v)) return [v, ...props.options]
  return props.options
})

const valorSelect = computed(() => (modoOtro.value ? OTRO : props.modelValue))

function alCambiarSelect(e) {
  const v = e.target.value
  if (v === OTRO) {
    modoOtro.value = true
    emit('update:modelValue', '')
  } else {
    modoOtro.value = false
    emit('update:modelValue', v)
  }
}

watch(() => props.modelValue, (v) => {
  if (modoOtro.value && v && props.options.includes(v)) modoOtro.value = false
})

// ── Selección múltiple ────────────────────────────────────────
const elegidas = computed(() =>
  props.multiple
    ? props.modelValue.split(sep.value).map(s => s.trim()).filter(Boolean)
    : []
)

// Opciones de la lista + las elegidas que no estén en ella (valores propios / antiguos)
const chips = computed(() => {
  const propias = elegidas.value.filter(v => !props.options.includes(v))
  return [...props.options, ...propias]
})

const otroTexto = ref('')

function emitirLista(lista) {
  emit('update:modelValue', lista.join(props.separador))
}

function alternar(op) {
  if (props.disabled) return
  let lista = [...elegidas.value]
  if (lista.includes(op)) {
    lista = lista.filter(x => x !== op)
  } else if (props.exclusivas.includes(op)) {
    lista = [op]
  } else {
    lista = lista.filter(x => !props.exclusivas.includes(x))
    lista.push(op)
  }
  emitirLista(lista)
}

function agregarOtro() {
  const t = otroTexto.value.trim().replace(new RegExp(`\\s*${sep.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g'), ' ')
  if (!t) return
  if (!elegidas.value.includes(t)) {
    const lista = elegidas.value.filter(x => !props.exclusivas.includes(x))
    lista.push(t)
    emitirLista(lista)
  }
  otroTexto.value = ''
}
</script>

<template>
  <!-- Selección única -->
  <div v-if="!multiple" class="co-unica">
    <select class="co-select" :value="valorSelect" :disabled="disabled" @change="alCambiarSelect">
      <option value="">{{ placeholder }}</option>
      <option v-for="op in opcionesUnica" :key="op" :value="op">{{ op }}</option>
      <option v-if="permitirOtro" :value="OTRO">Otro (escribir)…</option>
    </select>
    <input
      v-if="modoOtro"
      class="co-otro"
      type="text"
      :value="modelValue"
      placeholder="Escribe aquí"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </div>

  <!-- Selección múltiple -->
  <div v-else class="co-multiple">
    <div class="co-chips">
      <button
        v-for="op in chips"
        :key="op"
        type="button"
        class="co-chip"
        :class="{ 'co-chip-on': elegidas.includes(op) }"
        :disabled="disabled"
        @click="alternar(op)"
      >
        <span class="co-check">{{ elegidas.includes(op) ? '✓' : '+' }}</span>{{ op }}
      </button>
    </div>
    <div v-if="permitirOtro" class="co-agregar">
      <input
        class="co-otro"
        type="text"
        v-model="otroTexto"
        placeholder="Otro (escribir y presionar Enter)"
        :disabled="disabled"
        @keydown.enter.prevent="agregarOtro"
      />
      <button type="button" class="co-btn" :disabled="disabled || !otroTexto.trim()" @click="agregarOtro">Agregar</button>
    </div>
    <p v-if="!elegidas.length" class="co-ayuda">{{ placeholder }}</p>
  </div>
</template>

<style scoped>
.co-unica, .co-multiple { width: 100%; display: flex; flex-direction: column; gap: .4rem; }

.co-select, .co-otro {
  width: 100%; box-sizing: border-box;
  padding: .55rem .85rem;
  border: 1.5px solid var(--border, #d1d5db);
  border-radius: var(--radius-sm, 8px);
  font-size: .9rem; font-family: inherit;
  color: var(--text, #0f172a); background: var(--white, #fff);
  outline: none; transition: border-color .2s, box-shadow .2s;
}
.co-select:focus, .co-otro:focus {
  border-color: var(--purple, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, .12);
}
.co-select:disabled, .co-otro:disabled { background: #f1f5f9; cursor: not-allowed; }

.co-chips { display: flex; flex-wrap: wrap; gap: .4rem; }
.co-chip {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .35rem .7rem; font-size: .82rem; font-family: inherit; line-height: 1.2;
  border: 1.5px solid var(--border, #d1d5db); border-radius: 999px;
  background: var(--white, #fff); color: var(--text, #0f172a);
  cursor: pointer; text-align: left; transition: background .15s, border-color .15s, color .15s;
}
.co-chip:hover:not(:disabled) { border-color: var(--purple, #2563eb); }
.co-chip-on { background: #eff6ff; border-color: var(--purple, #2563eb); color: #1d4ed8; font-weight: 700; }
.co-chip:disabled { cursor: not-allowed; opacity: .6; }
.co-check { font-weight: 700; width: .9rem; text-align: center; }

.co-agregar { display: flex; gap: .4rem; }
.co-btn {
  padding: .45rem .8rem; font-size: .82rem; font-family: inherit; font-weight: 700;
  border: 1.5px solid var(--border, #d1d5db); border-radius: var(--radius-sm, 8px);
  background: #f8fafc; color: var(--text, #0f172a); cursor: pointer; white-space: nowrap;
}
.co-btn:disabled { opacity: .5; cursor: not-allowed; }
.co-ayuda { margin: 0; font-size: .78rem; color: #94a3b8; }
</style>
