<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFormsStore } from '../stores/forms.store.js';
import AppLayout from '../components/layouts/AppLayout.vue';
import BaseButton from '../components/ui/BaseButton.vue';

const router = useRouter();
const formsStore = useFormsStore();

onMounted(() => {
  formsStore.fetchForms();
});

function handleCreateForm(): void {
  router.push('/builder');
}

function handleEditForm(id: string): void {
  router.push(`/builder/${id}`);
}

function handleViewAnalytics(id: string): void {
  router.push(`/forms/${id}/analytics`);
}

function handleViewSubmissions(id: string): void {
  router.push(`/forms/${id}/submissions`);
}

function handleDeleteForm(id: string): void {
  if (confirm('Etes-vous sur de vouloir supprimer ce formulaire ?')) {
    formsStore.deleteForm(id);
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Brouillon',
    PUBLISHED: 'Publie',
    ARCHIVED: 'Archive',
  };
  return labels[status] ?? status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PUBLISHED: 'bg-green-100 text-green-700',
    ARCHIVED: 'bg-amber-100 text-amber-700',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-700';
}
</script>

<template>
  <AppLayout>
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Mes formulaires</h1>
        <BaseButton
          variant="primary"
          aria-label="Creer un nouveau formulaire"
          @click="handleCreateForm"
        >
          + Nouveau formulaire
        </BaseButton>
      </div>

      <!-- Loading state -->
      <div
        v-if="formsStore.isLoading"
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
        <p class="text-gray-400">Chargement des formulaires...</p>
      </div>

      <!-- Error state -->
      <div
        v-else-if="formsStore.error"
        class="text-center py-12"
        role="alert"
      >
        <p class="text-red-500 mb-4">{{ formsStore.error }}</p>
        <BaseButton
          variant="secondary"
          aria-label="Reessayer le chargement"
          @click="formsStore.fetchForms()"
        >
          Reessayer
        </BaseButton>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="formsStore.forms.length === 0"
        class="text-center py-16"
        role="status"
      >
        <p class="text-gray-400 text-lg mb-2">Aucun formulaire</p>
        <p class="text-gray-400 text-sm mb-6">Creez votre premier formulaire pour commencer</p>
        <BaseButton
          variant="primary"
          aria-label="Creer votre premier formulaire"
          @click="handleCreateForm"
        >
          Creer un formulaire
        </BaseButton>
      </div>

      <!-- Success state: Forms list -->
      <div
        v-else
        class="grid gap-4"
        role="list"
        aria-label="Liste des formulaires"
      >
        <article
          v-for="form in formsStore.forms"
          :key="form.id"
          role="listitem"
          class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3 mb-1 flex-wrap">
              <h3 class="text-base font-semibold text-gray-900 truncate">
                {{ form.title }}
              </h3>
              <span
                :class="[
                  'inline-flex rounded-full px-2 py-0.5 text-xs font-medium shrink-0',
                  getStatusColor(form.status),
                ]"
                role="status"
              >
                {{ getStatusLabel(form.status) }}
              </span>
            </div>
            <p class="text-sm text-gray-400">
              {{ form.steps?.length ?? 0 }} etape(s)
              <span aria-hidden="true"> &middot; </span>
              Cree le {{ new Date(form.createdAt).toLocaleDateString('fr-FR') }}
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0 flex-wrap">
            <BaseButton
              variant="ghost"
              size="sm"
              :aria-label="`Editer le formulaire ${form.title}`"
              @click="handleEditForm(form.id)"
            >
              Editer
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              :aria-label="`Voir les reponses du formulaire ${form.title}`"
              @click="handleViewSubmissions(form.id)"
            >
              Reponses
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              :aria-label="`Voir les analytics du formulaire ${form.title}`"
              @click="handleViewAnalytics(form.id)"
            >
              Analytics
            </BaseButton>
            <button
              class="text-gray-300 hover:text-red-500 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
              :aria-label="`Supprimer le formulaire ${form.title}`"
              @click="handleDeleteForm(form.id)"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </article>
      </div>
    </div>
  </AppLayout>
</template>
