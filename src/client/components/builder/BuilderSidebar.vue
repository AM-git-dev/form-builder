<script setup lang="ts">
import { FIELD_TYPES } from '../../utils/constants.js';
import type { FieldType } from '../../types/form.types.js';
import { useBuilderStore } from '../../stores/builder.store.js';

const store = useBuilderStore();

function handleAddField(type: FieldType): void {
  store.addField(type);
}
</script>

<template>
  <aside
    class="w-48 lg:w-56 bg-white border-r border-gray-200 p-3 lg:p-4 overflow-y-auto shrink-0"
    aria-label="Palette des types de champs"
  >
    <h3
      id="fields-palette-heading"
      class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
    >
      Champs
    </h3>
    <div
      class="space-y-2"
      role="list"
      aria-labelledby="fields-palette-heading"
    >
      <button
        v-for="field in FIELD_TYPES"
        :key="field.type"
        role="listitem"
        class="w-full flex items-center gap-2 lg:gap-3 px-2.5 lg:px-3 py-2 lg:py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        :aria-label="`Ajouter un champ ${field.label}`"
        @click="handleAddField(field.type)"
      >
        <span
          class="text-base w-5 text-center shrink-0"
          aria-hidden="true"
        >
          {{ field.icon }}
        </span>
        <span class="truncate">{{ field.label }}</span>
      </button>
    </div>
  </aside>
</template>
