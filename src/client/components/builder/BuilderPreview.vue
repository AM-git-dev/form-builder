<script setup lang="ts">
import { computed } from 'vue';
import { useBuilderStore } from '../../stores/builder.store.js';
import { FIELD_TYPES } from '../../utils/constants.js';

const store = useBuilderStore();

const TEXT_INPUT_TYPES = ['TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'DATE'] as const;

function getInputType(fieldType: string): string {
  const typeMap: Record<string, string> = {
    TEXT: 'text',
    EMAIL: 'email',
    PHONE: 'tel',
    NUMBER: 'number',
    DATE: 'date',
  };
  return typeMap[fieldType] ?? 'text';
}

function getFieldIcon(fieldType: string): string {
  return FIELD_TYPES.find((f) => f.type === fieldType)?.icon ?? '?';
}

const hasMultipleSteps = computed(() => store.steps.length > 1);
</script>

<template>
  <div class="flex-1 p-4 sm:p-8 overflow-y-auto bg-gray-100">
    <div
      class="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8"
      role="region"
      aria-label="Apercu du formulaire"
    >
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        {{ store.form?.title ?? 'Sans titre' }}
      </h2>
      <p
        v-if="store.form?.description"
        class="text-gray-500 mb-8"
      >
        {{ store.form.description }}
      </p>

      <!-- Step indicator -->
      <nav
        v-if="hasMultipleSteps"
        class="flex items-center gap-2 mb-8"
        aria-label="Progression des etapes"
      >
        <template v-for="(step, index) in store.steps" :key="step.id">
          <div
            :class="[
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
              store.activeStepId === step.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-500',
            ]"
            :aria-label="`Etape ${index + 1}: ${step.title}${store.activeStepId === step.id ? ' (etape courante)' : ''}`"
            :aria-current="store.activeStepId === step.id ? 'step' : undefined"
          >
            {{ index + 1 }}
          </div>
          <div
            v-if="index < store.steps.length - 1"
            class="flex-1 h-0.5 bg-gray-200"
            aria-hidden="true"
          />
        </template>
      </nav>

      <!-- Active step title -->
      <h3
        v-if="store.activeStep && hasMultipleSteps"
        class="text-lg font-semibold text-gray-800 mb-6"
      >
        {{ store.activeStep.title }}
      </h3>

      <!-- Fields preview -->
      <div class="space-y-5">
        <div
          v-for="field in store.activeStepFields"
          :key="field.id"
        >
          <label class="label">
            {{ field.label }}
            <span
              v-if="field.required"
              class="text-red-500 ml-0.5"
              aria-hidden="true"
            >*</span>
            <span v-if="field.required" class="sr-only">(requis)</span>
          </label>

          <!-- Text-based inputs -->
          <input
            v-if="TEXT_INPUT_TYPES.includes(field.type as typeof TEXT_INPUT_TYPES[number])"
            :type="getInputType(field.type)"
            :placeholder="field.placeholder ?? ''"
            class="input-field"
            disabled
            :aria-label="field.label"
          />

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'TEXTAREA'"
            :placeholder="field.placeholder ?? ''"
            class="input-field"
            rows="3"
            disabled
            :aria-label="field.label"
          />

          <!-- Select -->
          <select
            v-else-if="field.type === 'SELECT'"
            class="input-field"
            disabled
            :aria-label="field.label"
          >
            <option value="">{{ field.placeholder || 'Selectionnez...' }}</option>
            <option
              v-for="opt in field.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>

          <!-- Radio -->
          <fieldset
            v-else-if="field.type === 'RADIO'"
            class="mt-1"
          >
            <legend class="sr-only">{{ field.label }}</legend>
            <div class="space-y-2">
              <label
                v-for="opt in field.options"
                :key="opt.value"
                class="flex items-center gap-2 cursor-default"
              >
                <input
                  type="radio"
                  disabled
                  class="h-4 w-4 text-primary-600 border-gray-300"
                  :name="`preview-radio-${field.id}`"
                />
                <span class="text-sm text-gray-700">{{ opt.label }}</span>
              </label>
            </div>
          </fieldset>

          <!-- Checkbox -->
          <fieldset
            v-else-if="field.type === 'CHECKBOX'"
            class="mt-1"
          >
            <legend class="sr-only">{{ field.label }}</legend>
            <div class="space-y-2">
              <label
                v-for="opt in field.options"
                :key="opt.value"
                class="flex items-center gap-2 cursor-default"
              >
                <input
                  type="checkbox"
                  disabled
                  class="h-4 w-4 rounded text-primary-600 border-gray-300"
                />
                <span class="text-sm text-gray-700">{{ opt.label }}</span>
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="store.activeStepFields.length === 0"
        class="text-center py-12 text-gray-400"
        role="status"
      >
        Aucun champ dans cette etape
      </div>
    </div>
  </div>
</template>
