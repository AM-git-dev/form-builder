<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api.js';
import AppLayout from '../components/layouts/AppLayout.vue';
import BaseButton from '../components/ui/BaseButton.vue';

interface FieldInfo {
  id: string;
  label: string;
  type: string;
}

interface SubmissionData {
  id: string;
  data: Record<string, unknown>;
  completedAt: string | null;
  createdAt: string;
}

const route = useRoute();
const router = useRouter();
const formId = route.params.id as string;

const formTitle = ref('');
const fields = ref<FieldInfo[]>([]);
const submissions = ref<SubmissionData[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const page = ref(1);
const totalPages = ref(1);
const total = ref(0);

const displayFields = computed(() => fields.value.slice(0, 5));

async function fetchData(): Promise<void> {
  isLoading.value = true;
  error.value = null;
  try {
    const [formRes, subRes] = await Promise.all([
      api.get(`/forms/${formId}`),
      api.get(`/forms/${formId}/submissions`, {
        params: { page: page.value, limit: 20 },
      }),
    ]);

    const form = formRes.data.data;
    formTitle.value = form.title;
    fields.value = form.steps.flatMap((step: { fields: FieldInfo[] }) => step.fields);

    submissions.value = subRes.data.data;
    totalPages.value = subRes.data.meta?.totalPages ?? 1;
    total.value = subRes.data.meta?.total ?? 0;
  } catch {
    error.value = 'Impossible de charger les soumissions.';
  } finally {
    isLoading.value = false;
  }
}

async function goToPage(p: number): Promise<void> {
  page.value = p;
  await fetchData();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(fetchData);
</script>

<template>
  <AppLayout>
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <button
            class="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-2 flex items-center gap-1"
            @click="router.push('/dashboard')"
          >
            <span aria-hidden="true">&larr;</span> Retour au dashboard
          </button>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
            Reponses : {{ formTitle }}
          </h1>
          <p class="text-sm text-gray-400 mt-1">{{ total }} reponse(s) au total</p>
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
        <p class="text-gray-400">Chargement des reponses...</p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="text-center py-12"
        role="alert"
      >
        <p class="text-red-500 mb-4">{{ error }}</p>
        <BaseButton variant="secondary" @click="fetchData()">
          Reessayer
        </BaseButton>
      </div>

      <!-- Empty -->
      <div
        v-else-if="submissions.length === 0"
        class="text-center py-16"
        role="status"
      >
        <p class="text-gray-400 text-lg mb-2">Aucune reponse</p>
        <p class="text-gray-400 text-sm">Les reponses apparaitront ici une fois le formulaire soumis.</p>
      </div>

      <!-- Table -->
      <div v-else>
        <div class="overflow-x-auto bg-white rounded-xl border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  v-for="field in displayFields"
                  :key="field.id"
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate max-w-[200px]"
                >
                  {{ field.label }}
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(submission, index) in submissions"
                :key="submission.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                  {{ (page - 1) * 20 + index + 1 }}
                </td>
                <td
                  v-for="field in displayFields"
                  :key="field.id"
                  class="px-4 py-3 text-sm text-gray-700 truncate max-w-[200px]"
                  :title="formatValue(submission.data[field.id])"
                >
                  {{ formatValue(submission.data[field.id]) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                  {{ formatDate(submission.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between mt-4"
          role="navigation"
          aria-label="Pagination des reponses"
        >
          <p class="text-sm text-gray-400">
            Page {{ page }} sur {{ totalPages }}
          </p>
          <div class="flex gap-2">
            <BaseButton
              variant="ghost"
              size="sm"
              :disabled="page <= 1"
              @click="goToPage(page - 1)"
            >
              Precedent
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              :disabled="page >= totalPages"
              @click="goToPage(page + 1)"
            >
              Suivant
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
