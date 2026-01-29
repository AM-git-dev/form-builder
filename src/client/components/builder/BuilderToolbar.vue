<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseButton from '../ui/BaseButton.vue';
import { useBuilderStore } from '../../stores/builder.store.js';

const store = useBuilderStore();

const publicUrl = computed(() => {
  if (!store.form) return '';
  return `${window.location.origin}/f/${store.form.id}`;
});

const isPublished = computed(() => store.form?.status === 'PUBLISHED');

const copySuccess = ref(false);

async function handleCopyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(publicUrl.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch {
    // Fallback silencieux si le clipboard n'est pas disponible
  }
}
</script>

<template>
  <header
    class="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-200"
    role="toolbar"
    aria-label="Barre d'outils du formulaire"
  >
    <div class="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
      <label for="form-title-input" class="sr-only">Titre du formulaire</label>
      <input
        id="form-title-input"
        :value="store.form?.title ?? ''"
        class="text-base sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-500 rounded px-1 py-0.5 min-w-0 flex-1 max-w-xs sm:max-w-md"
        placeholder="Titre du formulaire"
        aria-label="Titre du formulaire"
        @input="store.updateFormTitle(($event.target as HTMLInputElement).value)"
      />
      <span
        v-if="store.isDirty"
        class="text-xs text-amber-500 font-medium shrink-0"
        role="status"
        aria-live="polite"
      >
        Non sauvegarde
      </span>
      <span
        v-if="isPublished"
        class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 shrink-0"
        role="status"
      >
        Publie
      </span>
    </div>

    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <BaseButton
        variant="ghost"
        size="sm"
        :aria-label="store.isPreviewMode ? 'Retourner a l editeur' : 'Voir l apercu'"
        @click="store.togglePreview()"
      >
        <span class="hidden sm:inline">{{ store.isPreviewMode ? 'Editeur' : 'Apercu' }}</span>
        <span class="sm:hidden">{{ store.isPreviewMode ? 'Edit' : 'Vue' }}</span>
      </BaseButton>

      <BaseButton
        variant="secondary"
        size="sm"
        :loading="store.isSaving"
        :disabled="!store.isDirty && !store.isSaving"
        aria-label="Sauvegarder le formulaire"
        @click="store.saveForm()"
      >
        Sauvegarder
      </BaseButton>

      <BaseButton
        v-if="!isPublished"
        variant="primary"
        size="sm"
        aria-label="Publier le formulaire"
        @click="store.publishFormAction()"
      >
        Publier
      </BaseButton>

      <button
        v-if="isPublished"
        class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1"
        aria-label="Copier le lien public du formulaire"
        @click="handleCopyLink"
      >
        {{ copySuccess ? 'Copie !' : 'Copier le lien' }}
      </button>
    </div>
  </header>
</template>
