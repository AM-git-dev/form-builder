<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBuilderStore } from '../stores/builder.store.js';
import AppLayout from '../components/layouts/AppLayout.vue';
import BuilderToolbar from '../components/builder/BuilderToolbar.vue';
import BuilderSidebar from '../components/builder/BuilderSidebar.vue';
import BuilderStepTabs from '../components/builder/BuilderStepTabs.vue';
import BuilderCanvas from '../components/builder/BuilderCanvas.vue';
import BuilderFieldConfig from '../components/builder/BuilderFieldConfig.vue';
import BuilderPreview from '../components/builder/BuilderPreview.vue';

const route = useRoute();
const store = useBuilderStore();

onMounted(() => {
  const formId = route.params.id as string | undefined;
  store.initBuilder(formId);
});

onUnmounted(() => {
  store.resetBuilder();
});
</script>

<template>
  <AppLayout>
    <!-- Loading state -->
    <div
      v-if="store.isLoading"
      class="flex items-center justify-center h-full"
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

    <!-- Error state -->
    <div
      v-else-if="store.error"
      class="flex items-center justify-center h-full"
      role="alert"
    >
      <div class="text-center max-w-md px-4">
        <p class="text-red-500 mb-4">{{ store.error }}</p>
        <button
          class="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 px-4 py-2 text-sm"
          @click="store.initBuilder()"
        >
          Reessayer
        </button>
      </div>
    </div>

    <!-- Success state: builder interface -->
    <div v-else-if="store.form" class="flex flex-col h-full">
      <BuilderToolbar />

      <div class="flex flex-1 overflow-hidden">
        <!-- Left: field palette (hidden in preview mode and on small screens) -->
        <BuilderSidebar
          v-if="!store.isPreviewMode"
          class="hidden sm:flex sm:flex-col"
        />

        <!-- Center -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <BuilderStepTabs v-if="!store.isPreviewMode" />

          <BuilderPreview v-if="store.isPreviewMode" />
          <BuilderCanvas v-else />
        </div>

        <!-- Right: field config (hidden on small screens) -->
        <BuilderFieldConfig
          v-if="!store.isPreviewMode"
          class="hidden lg:block"
        />
      </div>
    </div>

    <!-- Empty state (no form and no loading/error) -->
    <div
      v-else
      class="flex items-center justify-center h-full"
      role="status"
    >
      <p class="text-gray-400">Aucun formulaire charge</p>
    </div>
  </AppLayout>
</template>
