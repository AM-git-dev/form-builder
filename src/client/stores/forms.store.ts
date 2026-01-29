import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Form } from '../types/form.types.js';
import type { PaginationMeta } from '../types/api.types.js';
import * as formsService from '../services/forms.service.js';

export const useFormsStore = defineStore('forms', () => {
  const forms = ref<Form[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  async function fetchForms(page = 1, limit = 20): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await formsService.fetchForms(page, limit);
      forms.value = result.forms;
      pagination.value = result.meta;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de chargement';
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteForm(id: string): Promise<void> {
    try {
      await formsService.deleteForm(id);
      forms.value = forms.value.filter((f) => f.id !== id);
      pagination.value.total -= 1;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de suppression';
    }
  }

  return {
    forms,
    isLoading,
    error,
    pagination,
    fetchForms,
    deleteForm,
  };
});
