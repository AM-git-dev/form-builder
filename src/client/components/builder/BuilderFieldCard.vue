<script setup lang="ts">
import { computed } from 'vue';
import type { FormField } from '../../types/form.types.js';
import { FIELD_TYPES } from '../../utils/constants.js';
import { useBuilderStore } from '../../stores/builder.store.js';

const props = defineProps<{
  field: FormField;
}>();

const store = useBuilderStore();

const fieldMeta = computed(() =>
  FIELD_TYPES.find((f) => f.type === props.field.type),
);

const isSelected = computed(() => store.selectedFieldId === props.field.id);

function handleSelect(): void {
  store.selectField(props.field.id);
}

function handleDelete(): void {
  store.removeField(props.field.id);
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleSelect();
  }
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    handleDelete();
  }
}
</script>

<template>
  <div
    role="button"
    :tabindex="0"
    :aria-label="`Champ ${field.label}, type ${fieldMeta?.label ?? field.type}${field.required ? ', requis' : ''}`"
    :aria-pressed="isSelected"
    :class="[
      'group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
      isSelected
        ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-400'
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
    ]"
    @click="handleSelect"
    @keydown="handleKeydown"
  >
    <!-- Drag handle -->
    <span
      class="text-gray-300 cursor-grab active:cursor-grabbing select-none"
      aria-hidden="true"
      title="Glisser pour reordonner"
    >
      &#x2807;&#x2807;
    </span>

    <!-- Icon + Label -->
    <span
      class="text-base w-5 text-center shrink-0"
      aria-hidden="true"
    >
      {{ fieldMeta?.icon ?? '?' }}
    </span>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-900 truncate">
        {{ field.label }}
      </p>
      <p class="text-xs text-gray-400">
        {{ fieldMeta?.label ?? field.type }}
      </p>
    </div>

    <!-- Required badge -->
    <span
      v-if="field.required"
      class="text-xs text-amber-600 font-medium shrink-0"
    >
      Requis
    </span>

    <!-- Delete -->
    <button
      class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-0.5"
      :aria-label="`Supprimer le champ ${field.label}`"
      @click.stop="handleDelete"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</template>
