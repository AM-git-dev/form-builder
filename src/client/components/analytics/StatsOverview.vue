<script setup lang="ts">
import type { FormOverview } from '../../types/analytics.types.js';

defineProps<{
  overview: FormOverview;
}>();

function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR');
}
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <p class="text-sm text-gray-500 mb-1">Vues</p>
      <p class="text-2xl font-bold text-gray-900">{{ formatNumber(overview.totalViews) }}</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <p class="text-sm text-gray-500 mb-1">Demarrages</p>
      <p class="text-2xl font-bold text-gray-900">{{ formatNumber(overview.totalStarts) }}</p>
      <p class="text-xs text-gray-400 mt-1">{{ overview.startRate }}% des vues</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <p class="text-sm text-gray-500 mb-1">Soumissions</p>
      <p class="text-2xl font-bold text-primary-600">{{ formatNumber(overview.totalSubmissions) }}</p>
      <p class="text-xs text-gray-400 mt-1">{{ overview.completionRate }}% des demarrages</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <p class="text-sm text-gray-500 mb-1">Taux de conversion</p>
      <p class="text-2xl font-bold text-green-600">{{ overview.conversionRate }}%</p>
      <p class="text-xs text-gray-400 mt-1">vues &rarr; soumissions</p>
    </div>
  </div>
</template>
