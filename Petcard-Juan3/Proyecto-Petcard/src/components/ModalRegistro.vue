<template>
  <div class="modal-overlay" @click.self="$emit('cancelar')">
    <div class="modal-dialog">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ registroEditar ? 'Editar Registro de Vacuna' : 'Nuevo Registro de Vacuna' }}
        </h5>
        <button type="button" class="btn-close" @click="$emit('cancelar')"></button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="mascota" class="form-label">Nombre de la Mascota *</label>
          <input
            v-model="formData.mascota"
            id="mascota"
            type="text"
            class="form-control"
            placeholder="Ej: Firulais"
          />
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label for="tipo" class="form-label">Tipo *</label>
            <select v-model="formData.tipo" id="tipo" class="form-select">
              <option value="" disabled>Seleccionar...</option>
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Conejo">Conejo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div class="form-group col">
            <label for="raza" class="form-label">Raza *</label>
            <input
              v-model="formData.raza"
              id="raza"
              type="text"
              class="form-control"
              placeholder="Ej: Golden Retriever"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="vacuna" class="form-label">Nombre de Vacuna *</label>
          <input
            v-model="formData.vacuna"
            id="vacuna"
            type="text"
            class="form-control"
            placeholder="Ej: Antirrábica"
          />
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label for="lote" class="form-label">Lote *</label>
            <input
              v-model="formData.lote"
              id="lote"
              type="text"
              class="form-control"
              placeholder="Ej: ABC123"
            />
          </div>

          <div class="form-group col">
            <label for="veterinario" class="form-label">Veterinario *</label>
            <input
              v-model="formData.veterinario"
              id="veterinario"
              type="text"
              class="form-control"
              placeholder="Ej: Dr. López"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label for="aplicada" class="form-label">Fecha Aplicada *</label>
            <input
              v-model="formData.aplicada"
              id="aplicada"
              type="date"
              class="form-control"
            />
          </div>

          <div class="form-group col">
            <label for="proxima" class="form-label">Próxima Dosis *</label>
            <input
              v-model="formData.proxima"
              id="proxima"
              type="date"
              class="form-control"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="estado" class="form-label">Estado *</label>
          <select v-model="formData.estado" id="estado" class="form-select">
            <option value="">Seleccionar...</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Completada">Completada</option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="$emit('cancelar')">
          Cancelar
        </button>
        <button type="button" class="btn btn-primary" @click="guardar">
          {{ registroEditar ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  registroEditar: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['guardar', 'cancelar'])

const formData = ref({
  mascota: '',
  tipo: '',
  raza: '',
  vacuna: '',
  lote: '',
  aplicada: '',
  proxima: '',
  veterinario: '',
  estado: ''
})

// Cargar datos si es edición
watch(
  () => props.registroEditar,
  (nuevoValor) => {
    if (nuevoValor) {
      formData.value = { ...nuevoValor }
    } else {
      formData.value = {
        mascota: '',
        tipo: '',
        raza: '',
        vacuna: '',
        lote: '',
        aplicada: '',
        proxima: '',
        veterinario: '',
        estado: ''
      }
    }
  },
  { immediate: true }
)

const guardar = () => {
  emit('guardar', formData.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.btn-close:hover {
  color: #1f2937;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-control,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-control:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-dialog {
    width: 95%;
  }
}
</style>
