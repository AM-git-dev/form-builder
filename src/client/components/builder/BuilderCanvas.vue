<script setup lang="ts">
import { useBuilderStore } from '../../stores/builder.store.js';
import BuilderFieldCard from './BuilderFieldCard.vue';

const store = useBuilderStore();
</script>

<template>
  <div
    class="flex-1 p-4 sm:p-6 overflow-y-auto"
    role="tabpanel"
    :id="store.activeStep ? `step-panel-${store.activeStep.id}` : undefined"
    :aria-labelledby="store.activeStep ? `step-tab-${store.activeStep.id}` : undefined"
  >
    <div v-if="store.activeStep" class="max-w-2xl mx-auto space-y-3">
      <!-- Step description -->
      <div v-if="store.activeStep.description" class="mb-6">
        <p class="text-sm text-gray-500">
          {{ store.activeStep.description }}
        </p>
      </div>

      <!-- Fields list -->
      <template v-if="store.activeStepFields.length > 0">
        <BuilderFieldCard
          v-for="field in store.activeStepFields"
          :key="field.id"
          :field="field"
        />
      </template>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16 text-center"
        role="status"
      >
        <p class="text-gray-400 text-lg mb-2">Aucun champ</p>
        <p class="text-gray-400 text-sm">
          Cliquez sur un type de champ dans la barre laterale pour l'ajouter
        </p>
      </div>
    </div>

    <!-- No active step fallback -->
    <div
      v-else
      class="flex items-center justify-center h-full"
      role="status"
    >
      <p class="text-gray-400">Aucune etape selectionnee</p>
    </div>
  </div>
</template>
