<script setup lang="ts">
import { computed } from 'vue';
import type { FunnelStep } from '../../types/analytics.types.js';

const props = defineProps<{
  steps: FunnelStep[];
  totalStarts: number;
}>();

const funnelData = computed(() => {
  if (props.steps.length === 0 || props.totalStarts === 0) return [];

  return props.steps.map((step, index) => {
    const percentage = (step.completions / props.totalStarts) * 100;
    const widthPercent = Math.max(percentage, 15);
    const previousCount = index === 0
      ? props.totalStarts
      : props.steps[index - 1].completions;
    const lost = previousCount - step.completions;

    return {
      ...step,
      percentage: Math.round(percentage * 10) / 10,
      widthPercent,
      lost,
      previousCount,
    };
  });
});

function getFunnelColor(index: number, total: number): string {
  if (total <= 1) return 'bg-primary-500';
  const colors = ['bg-primary-400', 'bg-primary-500', 'bg-primary-600', 'bg-primary-700', 'bg-primary-800'];
  const colorIndex = Math.min(Math.floor((index / (total - 1)) * (colors.length - 1)), colors.length - 1);
  return colors[colorIndex];
}

function getDropColor(dropRate: number): string {
  if (dropRate > 50) return 'text-red-500';
  if (dropRate > 25) return 'text-amber-500';
  return 'text-gray-400';
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-base font-semibold text-gray-900">Funnel de conversion</h3>
      <span class="text-xs text-gray-400">Base : {{ totalStarts }} demarrages</span>
    </div>

    <div v-if="steps.length === 0 || totalStarts === 0" class="text-center py-8 text-gray-400 text-sm">
      Aucune donnee de funnel disponible.
    </div>

    <div v-else class="flex flex-col items-center" role="img" aria-label="Funnel de conversion par etape">
      <!-- Start bar -->
      <div class="w-full mb-1 text-center">
        <div
          class="mx-auto rounded-t-lg bg-gray-100 py-2 px-4 transition-all duration-500"
          style="width: 100%"
        >
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Demarrages
          </span>
          <span class="block text-lg font-bold text-gray-800">
            {{ totalStarts }}
          </span>
        </div>
      </div>

      <!-- Steps -->
      <template v-for="(step, index) in funnelData" :key="step.stepOrder">
        <!-- Drop-off zone between steps -->
        <div class="flex items-center justify-center gap-2 py-1.5 w-full">
          <div class="flex-1 border-t border-dashed border-gray-200" />
          <span
            v-if="step.lost > 0"
            class="text-xs font-medium shrink-0"
            :class="getDropColor(step.dropOffRate)"
          >
            -{{ step.lost }} ({{ step.dropOffRate }}%)
          </span>
          <span v-else class="text-xs text-green-500 font-medium shrink-0">
            aucune perte
          </span>
          <div class="flex-1 border-t border-dashed border-gray-200" />
        </div>

        <!-- Funnel bar -->
        <div
          class="transition-all duration-500 rounded-lg py-2.5 px-4 text-center text-white relative"
          :class="getFunnelColor(index, funnelData.length)"
          :style="{ width: `${step.widthPercent}%`, minWidth: '120px' }"
        >
          <span class="block text-xs font-medium opacity-80 truncate">
            {{ step.stepTitle }}
          </span>
          <span class="block text-base font-bold leading-tight">
            {{ step.completions }}
          </span>
          <span class="block text-xs opacity-70">
            {{ step.percentage }}%
          </span>
          <span class="sr-only">
            Etape {{ step.stepTitle }}: {{ step.completions }} completions soit {{ step.percentage }}% des demarrages
          </span>
        </div>
      </template>

      <!-- Final result -->
      <div class="flex items-center justify-center gap-2 py-1.5 w-full">
        <div class="flex-1 border-t border-dashed border-gray-200" />
        <span class="text-xs text-gray-400 shrink-0">resultat final</span>
        <div class="flex-1 border-t border-dashed border-gray-200" />
      </div>
      <div
        class="rounded-lg py-3 px-6 text-center bg-green-500 text-white transition-all duration-500"
        :style="{
          width: `${funnelData.length > 0 ? Math.max((funnelData[funnelData.length - 1].completions / totalStarts) * 100, 12) : 12}%`,
          minWidth: '100px'
        }"
      >
        <span class="block text-xs font-medium opacity-80">Soumissions</span>
        <span class="block text-lg font-bold leading-tight">
          {{ funnelData.length > 0 ? funnelData[funnelData.length - 1].completions : 0 }}
        </span>
      </div>
    </div>
  </div>
</template>
