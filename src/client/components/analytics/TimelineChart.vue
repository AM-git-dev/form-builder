<script setup lang="ts">
import { computed } from 'vue';
import type { TimelinePoint } from '../../types/analytics.types.js';

const props = defineProps<{
  data: TimelinePoint[];
}>();

const maxValue = computed(() => {
  if (props.data.length === 0) return 1;
  return Math.max(...props.data.map((d) => Math.max(d.views, d.submissions)), 1);
});

const totalViews = computed(() => props.data.reduce((sum, d) => sum + d.views, 0));
const totalSubmissions = computed(() => props.data.reduce((sum, d) => sum + d.submissions, 0));

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-gray-900">Activite (30 jours)</h3>
      <div class="flex items-center gap-4 text-xs text-gray-500">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-400" aria-hidden="true" />
          Vues ({{ totalViews }})
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-primary-500" aria-hidden="true" />
          Soumissions ({{ totalSubmissions }})
        </span>
      </div>
    </div>

    <div v-if="data.length === 0" class="text-center py-8 text-gray-400 text-sm">
      Aucune donnee disponible.
    </div>

    <div v-else class="flex items-end gap-px h-40" role="img" aria-label="Graphique d'activite sur 30 jours">
      <div
        v-for="point in data"
        :key="point.date"
        class="flex-1 flex flex-col items-center gap-px justify-end h-full group relative"
      >
        <div
          class="w-full bg-blue-200 rounded-t-sm min-h-[2px] transition-all hover:bg-blue-400"
          :style="{ height: `${(point.views / maxValue) * 100}%` }"
        />
        <div
          class="w-full bg-primary-400 rounded-t-sm min-h-[1px] transition-all hover:bg-primary-600"
          :style="{ height: `${(point.submissions / maxValue) * 100}%` }"
        />

        <!-- Tooltip -->
        <div
          class="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-10 pointer-events-none"
        >
          <p class="font-medium">{{ formatShortDate(point.date) }}</p>
          <p>{{ point.views }} vues</p>
          <p>{{ point.submissions }} soumissions</p>
        </div>
      </div>
    </div>

    <!-- X axis labels (show every 7th day) -->
    <div class="flex justify-between mt-2 text-xs text-gray-400">
      <template v-for="(point, index) in data" :key="point.date">
        <span v-if="index % 7 === 0 || index === data.length - 1">
          {{ formatShortDate(point.date) }}
        </span>
      </template>
    </div>
  </div>
</template>
