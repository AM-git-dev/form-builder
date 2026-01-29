<script setup lang="ts">
import type { FormField } from '../../types/form.types.js';

const props = defineProps<{
  field: FormField;
  modelValue: unknown;
  error?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
}>();

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

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  emit('update:modelValue', target.value);
}

function handleCheckboxChange(optionValue: string, checked: boolean): void {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] as string[] : [];
  if (checked) {
    current.push(optionValue);
  } else {
    const index = current.indexOf(optionValue);
    if (index > -1) current.splice(index, 1);
  }
  emit('update:modelValue', current);
}
</script>

<template>
  <div class="space-y-1.5">
    <label
      :for="`field-${field.id}`"
      class="block text-sm font-medium text-gray-700"
    >
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
      :id="`field-${field.id}`"
      :type="getInputType(field.type)"
      :value="modelValue ?? ''"
      :placeholder="field.placeholder ?? ''"
      :required="field.required"
      :aria-invalid="!!error"
      :aria-describedby="error ? `field-error-${field.id}` : undefined"
      :minlength="field.validation?.minLength"
      :maxlength="field.validation?.maxLength"
      :min="field.validation?.min"
      :max="field.validation?.max"
      class="input-field"
      :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': error }"
      :autocomplete="field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : undefined"
      @input="handleInput"
    />

    <!-- Textarea -->
    <textarea
      v-else-if="field.type === 'TEXTAREA'"
      :id="`field-${field.id}`"
      :value="(modelValue as string) ?? ''"
      :placeholder="field.placeholder ?? ''"
      :required="field.required"
      :aria-invalid="!!error"
      :aria-describedby="error ? `field-error-${field.id}` : undefined"
      :minlength="field.validation?.minLength"
      :maxlength="field.validation?.maxLength"
      rows="4"
      class="input-field"
      :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': error }"
      @input="handleInput"
    />

    <!-- Select -->
    <select
      v-else-if="field.type === 'SELECT'"
      :id="`field-${field.id}`"
      :value="(modelValue as string) ?? ''"
      :required="field.required"
      :aria-invalid="!!error"
      :aria-describedby="error ? `field-error-${field.id}` : undefined"
      class="input-field"
      :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': error }"
      @change="handleInput"
    >
      <option value="" disabled>{{ field.placeholder || 'Selectionnez...' }}</option>
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
      :aria-describedby="error ? `field-error-${field.id}` : undefined"
    >
      <legend class="sr-only">{{ field.label }}</legend>
      <div class="space-y-2 mt-1">
        <label
          v-for="opt in field.options"
          :key="opt.value"
          class="flex items-center gap-2.5 cursor-pointer"
        >
          <input
            type="radio"
            :name="`field-${field.id}`"
            :value="opt.value"
            :checked="modelValue === opt.value"
            :required="field.required"
            class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            @change="emit('update:modelValue', opt.value)"
          />
          <span class="text-sm text-gray-700">{{ opt.label }}</span>
        </label>
      </div>
    </fieldset>

    <!-- Checkbox -->
    <fieldset
      v-else-if="field.type === 'CHECKBOX'"
      :aria-describedby="error ? `field-error-${field.id}` : undefined"
    >
      <legend class="sr-only">{{ field.label }}</legend>
      <div class="space-y-2 mt-1">
        <label
          v-for="opt in field.options"
          :key="opt.value"
          class="flex items-center gap-2.5 cursor-pointer"
        >
          <input
            type="checkbox"
            :value="opt.value"
            :checked="Array.isArray(modelValue) && (modelValue as string[]).includes(opt.value)"
            class="h-4 w-4 rounded text-primary-600 border-gray-300 focus:ring-primary-500"
            @change="handleCheckboxChange(opt.value, ($event.target as HTMLInputElement).checked)"
          />
          <span class="text-sm text-gray-700">{{ opt.label }}</span>
        </label>
      </div>
    </fieldset>

    <!-- Error message -->
    <p
      v-if="error"
      :id="`field-error-${field.id}`"
      class="text-sm text-red-600 mt-1"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
