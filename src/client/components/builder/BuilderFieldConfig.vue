<script setup lang="ts">
import { ref, watch } from 'vue';
import { useBuilderStore } from '../../stores/builder.store.js';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import type { FieldOption } from '../../types/form.types.js';

const store = useBuilderStore();

const label = ref('');
const placeholder = ref('');
const required = ref(false);
const options = ref<FieldOption[]>([]);

function hasOptions(): boolean {
  const type = store.selectedField?.type;
  return type === 'SELECT' || type === 'RADIO' || type === 'CHECKBOX';
}

watch(
  () => store.selectedField,
  (field) => {
    if (field) {
      label.value = field.label;
      placeholder.value = field.placeholder ?? '';
      required.value = field.required;
      options.value = field.options ? field.options.map((o) => ({ ...o })) : [];
    }
  },
  { immediate: true },
);

function saveField(): void {
  if (!store.selectedField) return;
  store.updateFieldAction(store.selectedField.id, {
    label: label.value,
    placeholder: placeholder.value || null,
    required: required.value,
    options: hasOptions() ? options.value : undefined,
  });
}

function addOption(): void {
  options.value.push({ label: '', value: '' });
}

function removeOption(index: number): void {
  options.value.splice(index, 1);
  saveField();
}

function handleClosePanel(): void {
  store.selectField(null);
}

function handleDeleteField(): void {
  if (!store.selectedField) return;
  store.removeField(store.selectedField.id);
}
</script>

<template>
  <aside
    v-if="store.selectedField"
    class="w-72 lg:w-80 bg-white border-l border-gray-200 p-4 lg:p-6 overflow-y-auto shrink-0"
    aria-label="Configuration du champ selectionne"
    role="complementary"
  >
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-sm font-semibold text-gray-900">Configuration</h3>
      <button
        class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
        aria-label="Fermer le panneau de configuration"
        @click="handleClosePanel"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <form
      class="space-y-5"
      @submit.prevent="saveField"
    >
      <BaseInput
        v-model="label"
        label="Label"
        placeholder="Nom du champ"
        required
        @blur="saveField"
      />

      <BaseInput
        v-model="placeholder"
        label="Placeholder"
        placeholder="Texte indicatif"
        @blur="saveField"
      />

      <fieldset>
        <legend class="sr-only">Options du champ</legend>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="required"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            @change="saveField"
          />
          <span class="text-sm text-gray-700">Champ requis</span>
        </label>
      </fieldset>

      <!-- Options for SELECT, RADIO, CHECKBOX -->
      <fieldset v-if="hasOptions()">
        <legend class="label mb-2">Options</legend>
        <div class="space-y-2">
          <div
            v-for="(option, index) in options"
            :key="index"
            class="flex items-center gap-2"
          >
            <label :for="`option-label-${index}`" class="sr-only">
              Label de l'option {{ index + 1 }}
            </label>
            <input
              :id="`option-label-${index}`"
              v-model="options[index].label"
              class="input-field flex-1"
              placeholder="Label"
              @blur="saveField"
            />
            <label :for="`option-value-${index}`" class="sr-only">
              Valeur de l'option {{ index + 1 }}
            </label>
            <input
              :id="`option-value-${index}`"
              v-model="options[index].value"
              class="input-field w-24"
              placeholder="Valeur"
              @blur="saveField"
            />
            <button
              type="button"
              class="text-gray-400 hover:text-red-500 shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-0.5"
              :aria-label="`Supprimer l'option ${option.label || index + 1}`"
              @click="removeOption(index)"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
        <button
          type="button"
          class="mt-2 text-sm text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded px-1"
          @click="addOption"
        >
          + Ajouter une option
        </button>
      </fieldset>
    </form>

    <div class="mt-8 pt-4 border-t border-gray-200">
      <BaseButton
        variant="danger"
        size="sm"
        class="w-full"
        aria-label="Supprimer ce champ du formulaire"
        @click="handleDeleteField"
      >
        Supprimer ce champ
      </BaseButton>
    </div>
  </aside>
</template>
