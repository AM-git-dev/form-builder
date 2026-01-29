<script setup lang="ts">
import type { FormStep } from '../../types/form.types.js';
import FieldRenderer from './FieldRenderer.vue';

defineProps<{
  step: FormStep;
  formData: Record<string, unknown>;
  getError: (fieldId: string) => string | undefined;
}>();

const emit = defineEmits<{
  fieldChange: [fieldId: string, value: unknown];
}>();
</script>

<template>
  <div
    role="tabpanel"
    :aria-label="`Etape: ${step.title}`"
  >
    <h3
      v-if="step.title"
      class="text-lg font-semibold text-gray-800 mb-2"
    >
      {{ step.title }}
    </h3>
    <p
      v-if="step.description"
      class="text-sm text-gray-500 mb-6"
    >
      {{ step.description }}
    </p>

    <div class="space-y-5">
      <FieldRenderer
        v-for="field in step.fields"
        :key="field.id"
        :field="field"
        :model-value="formData[field.id]"
        :error="getError(field.id)"
        @update:model-value="emit('fieldChange', field.id, $event)"
      />
    </div>

    <div
      v-if="step.fields.length === 0"
      class="text-center py-8 text-gray-400"
      role="status"
    >
      Cette etape ne contient aucun champ.
    </div>
  </div>
</template>
