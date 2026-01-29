<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useFormRenderer } from '../../composables/useFormRenderer.js';
import StepProgressBar from './StepProgressBar.vue';
import StepRenderer from './StepRenderer.vue';
import FormSuccess from './FormSuccess.vue';

const props = defineProps<{
  formId: string;
}>();

const renderer = useFormRenderer(props.formId);

onMounted(async () => {
  await renderer.loadForm();
});

// Track FORM_START on first user interaction
let hasStarted = false;
watch(
  () => Object.keys(renderer.formData).length,
  (count) => {
    if (count > 0 && !hasStarted) {
      hasStarted = true;
      renderer.markFormStarted();
    }
  },
);
</script>

<template>
  <!-- Loading -->
  <div
    v-if="renderer.isLoading.value"
    class="flex items-center justify-center min-h-[50vh]"
    role="status"
    aria-live="polite"
  >
    <div class="text-center">
      <svg
        class="mx-auto h-8 w-8 animate-spin text-primary-600 mb-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p class="text-gray-400">Chargement du formulaire...</p>
    </div>
  </div>

  <!-- Error -->
  <div
    v-else-if="renderer.error.value && !renderer.form.value"
    class="flex items-center justify-center min-h-[50vh]"
    role="alert"
  >
    <div class="text-center max-w-md px-4">
      <div class="mx-auto h-12 w-12 text-gray-300 mb-4">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-gray-600 text-lg font-medium mb-2">Formulaire indisponible</p>
      <p class="text-gray-400 text-sm">{{ renderer.error.value }}</p>
    </div>
  </div>

  <!-- Success -->
  <FormSuccess
    v-else-if="renderer.isSubmitted.value"
    :settings="renderer.form.value?.settings ?? {}"
  />

  <!-- Form -->
  <div v-else-if="renderer.form.value">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
      {{ renderer.form.value.title }}
    </h1>
    <p
      v-if="renderer.form.value.description"
      class="text-gray-500 mb-6"
    >
      {{ renderer.form.value.description }}
    </p>

    <StepProgressBar
      :current-step="renderer.navigation.currentStepIndex.value"
      :total-steps="renderer.navigation.totalSteps.value"
      :progress="renderer.navigation.progress.value"
    />

    <StepRenderer
      v-if="renderer.navigation.currentStep.value"
      :step="renderer.navigation.currentStep.value"
      :form-data="renderer.formData"
      :get-error="renderer.validation.getError"
      @field-change="renderer.handleFieldChange"
    />

    <!-- Submit error -->
    <p
      v-if="renderer.error.value && renderer.form.value"
      class="text-sm text-red-600 mt-4"
      role="alert"
    >
      {{ renderer.error.value }}
    </p>

    <!-- Navigation buttons -->
    <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
      <button
        v-if="!renderer.navigation.isFirstStep.value"
        type="button"
        class="inline-flex items-center justify-center rounded-lg font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 px-5 py-2.5 text-sm"
        @click="renderer.handlePrevious()"
      >
        Precedent
      </button>
      <div v-else />

      <button
        v-if="!renderer.navigation.isLastStep.value"
        type="button"
        class="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 px-5 py-2.5 text-sm"
        @click="renderer.handleNext()"
      >
        Suivant
      </button>

      <button
        v-else
        type="button"
        :disabled="renderer.isSubmitting.value"
        class="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        @click="renderer.handleSubmit()"
      >
        <svg
          v-if="renderer.isSubmitting.value"
          class="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ renderer.isSubmitting.value ? 'Envoi...' : 'Envoyer' }}
      </button>
    </div>
  </div>
</template>
