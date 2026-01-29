<script setup lang="ts">
import { computed } from 'vue';
import type { FunnelStep } from '../../types/analytics.types.js';

const props = defineProps<{
  steps: FunnelStep[];
}>();

const maxCompletions = computed(() => {
  if (props.steps.length === 0) return 1;
  return Math.max(...props.steps.map((s) => s.completions), 1);
});
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
    <h3 class="text-base font-semibold text-gray-900 mb-4">Funnel par etape</h3>

    <div v-if="steps.length === 0" class="text-center py-8 text-gray-400 text-sm">
      Aucune donnee de funnel disponible.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="step in steps"
        :key="step.stepOrder"
        class="flex items-center gap-3"
      >
        <span class="text-sm text-gray-600 w-28 shrink-0 truncate" :title="step.stepTitle">
          {{ step.stepTitle }}
        </span>
        <div class="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
          <div
            class="h-full bg-primary-500 rounded-full transition-all duration-500"
            :style="{ width: `${(step.completions / maxCompletions) * 100}%` }"
          />
          <span class="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
            {{ step.completions }}
          </span>
        </div>
        <span
          class="text-xs font-medium shrink-0 w-16 text-right"
          :class="step.dropOffRate > 50 ? 'text-red-500' : step.dropOffRate > 25 ? 'text-amber-500' : 'text-green-500'"
        >
          -{{ step.dropOffRate }}%
        </span>
      </div>
    </div>
  </div>
</template>
