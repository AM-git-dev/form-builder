<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api.js';
import type { FormOverview, FunnelStep, TimelinePoint } from '../types/analytics.types.js';
import AppLayout from '../components/layouts/AppLayout.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import StatsOverview from '../components/analytics/StatsOverview.vue';
import FunnelChart from '../components/analytics/FunnelChart.vue';
import TimelineChart from '../components/analytics/TimelineChart.vue';

const route = useRoute();
const router = useRouter();
const formId = route.params.id as string;

const formTitle = ref('');
const overview = ref<FormOverview | null>(null);
const funnel = ref<FunnelStep[]>([]);
const timeline = ref<TimelinePoint[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

async function fetchAnalytics(): Promise<void> {
  isLoading.value = true;
  error.value = null;
  try {
    const [formRes, overviewRes, funnelRes, timelineRes] = await Promise.all([
      api.get(`/forms/${formId}`),
      api.get(`/analytics/forms/${formId}/overview`),
      api.get(`/analytics/forms/${formId}/funnel`),
      api.get(`/analytics/forms/${formId}/timeline`),
    ]);

    formTitle.value = formRes.data.data.title;
    overview.value = overviewRes.data.data;
    funnel.value = funnelRes.data.data;
    timeline.value = timelineRes.data.data;
  } catch {
    error.value = 'Impossible de charger les analytics.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchAnalytics);
</script>

<template>
  <AppLayout>
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <button
            class="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-2 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            @click="router.push('/dashboard')"
          >
            <span aria-hidden="true">&larr;</span> Retour au dashboard
          </button>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
            Analytics : {{ formTitle }}
          </h1>
        </div>
        <div class="flex gap-2">
          <BaseButton
            variant="ghost"
            size="sm"
            @click="router.push(`/forms/${formId}/submissions`)"
          >
            Voir les reponses
          </BaseButton>
          <BaseButton
            variant="ghost"
            size="sm"
            @click="router.push(`/builder/${formId}`)"
          >
            Editer
          </BaseButton>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="isLoading"
        class="text-center py-12"
        role="status"
        aria-live="polite"
      >
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
        <p class="text-gray-400">Chargement des analytics...</p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="text-center py-12"
        role="alert"
      >
        <p class="text-red-500 mb-4">{{ error }}</p>
        <BaseButton variant="secondary" @click="fetchAnalytics()">
          Reessayer
        </BaseButton>
      </div>

      <!-- Data -->
      <div v-else-if="overview" class="space-y-6">
        <StatsOverview :overview="overview" />
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart :steps="funnel" :total-starts="overview?.totalStarts ?? 0" />
          <TimelineChart :data="timeline" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>
