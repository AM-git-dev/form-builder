<script setup lang="ts">
import type { FormSettings } from '../../types/form.types.js';

const props = defineProps<{
  settings: FormSettings;
}>();

const successMessage = props.settings.successMessage || 'Merci ! Votre reponse a ete enregistree avec succes.';
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center py-12"
    role="status"
    aria-live="polite"
  >
    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
      <svg
        class="h-8 w-8 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 class="text-xl font-bold text-gray-900 mb-3">Reponse envoyee</h2>
    <p class="text-gray-500 max-w-md">{{ successMessage }}</p>
    <a
      v-if="settings.redirectUrl"
      :href="settings.redirectUrl"
      class="mt-6 inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 px-5 py-2.5 text-sm"
    >
      Continuer
    </a>
  </div>
</template>
