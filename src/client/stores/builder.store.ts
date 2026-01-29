import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Form, FormStep, FormField, FieldType } from '../types/form.types.js';
import * as formsService from '../services/forms.service.js';

export const useBuilderStore = defineStore('builder', () => {
  // State
  const form = ref<Form | null>(null);
  const activeStepId = ref<string | null>(null);
  const selectedFieldId = ref<string | null>(null);
  const isDirty = ref(false);
  const isSaving = ref(false);
  const isLoading = ref(false);
  const isPreviewMode = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const steps = computed<FormStep[]>(() => {
    if (!form.value) return [];
    return [...form.value.steps].sort((a, b) => a.order - b.order);
  });

  const activeStep = computed<FormStep | null>(() => {
    if (!activeStepId.value || !form.value) return null;
    return form.value.steps.find((s) => s.id === activeStepId.value) ?? null;
  });

  const activeStepFields = computed<FormField[]>(() => {
    if (!activeStep.value) return [];
    return [...activeStep.value.fields].sort((a, b) => a.order - b.order);
  });

  const selectedField = computed<FormField | null>(() => {
    if (!selectedFieldId.value || !activeStep.value) return null;
    return (
      activeStep.value.fields.find((f) => f.id === selectedFieldId.value) ??
      null
    );
  });

  const formId = computed<string | null>(() => form.value?.id ?? null);

  // Actions

  async function initBuilder(id?: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      if (id) {
        form.value = await formsService.fetchFormById(id);
      } else {
        form.value = await formsService.createForm({
          title: 'Nouveau formulaire',
        });
      }
      if (form.value.steps.length > 0) {
        activeStepId.value = steps.value[0].id;
      }
      isDirty.value = false;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de chargement';
    } finally {
      isLoading.value = false;
    }
  }

  async function saveForm(): Promise<void> {
    if (!form.value || isSaving.value) return;
    isSaving.value = true;
    try {
      await formsService.updateForm(form.value.id, {
        title: form.value.title,
        description: form.value.description,
        settings: form.value.settings,
      });
      isDirty.value = false;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de sauvegarde';
    } finally {
      isSaving.value = false;
    }
  }

  function updateFormTitle(title: string): void {
    if (!form.value) return;
    form.value.title = title;
    isDirty.value = true;
  }

  function updateFormDescription(description: string): void {
    if (!form.value) return;
    form.value.description = description || null;
    isDirty.value = true;
  }

  // Steps

  async function addStep(title?: string): Promise<void> {
    if (!form.value) return;
    try {
      const step = await formsService.createStep(form.value.id, {
        title: title ?? `Etape ${form.value.steps.length + 1}`,
      });
      const newStep: FormStep = { ...step, fields: step.fields ?? [] };
      form.value.steps.push(newStep);
      activeStepId.value = newStep.id;
      isDirty.value = true;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout de l'etape";
    }
  }

  async function updateStep(
    stepId: string,
    input: { title?: string; description?: string | null },
  ): Promise<void> {
    if (!form.value) return;
    try {
      const updated = await formsService.updateStep(
        form.value.id,
        stepId,
        input,
      );
      const index = form.value.steps.findIndex((s) => s.id === stepId);
      if (index !== -1) {
        form.value.steps[index] = { ...form.value.steps[index], ...updated };
      }
      isDirty.value = true;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de mise a jour';
    }
  }

  async function removeStep(stepId: string): Promise<void> {
    if (!form.value || form.value.steps.length <= 1) return;
    try {
      await formsService.deleteStep(form.value.id, stepId);
      form.value.steps = form.value.steps.filter((s) => s.id !== stepId);
      if (activeStepId.value === stepId) {
        activeStepId.value = steps.value[0]?.id ?? null;
      }
      isDirty.value = true;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de suppression';
    }
  }

  function setActiveStep(stepId: string): void {
    activeStepId.value = stepId;
    selectedFieldId.value = null;
  }

  async function reorderStepsAction(stepIds: string[]): Promise<void> {
    if (!form.value) return;
    try {
      await formsService.reorderSteps(form.value.id, stepIds);
      stepIds.forEach((id, index) => {
        const step = form.value!.steps.find((s) => s.id === id);
        if (step) step.order = index;
      });
      isDirty.value = true;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de reordonnancement';
    }
  }

  // Fields

  async function addField(type: FieldType): Promise<void> {
    if (!form.value || !activeStepId.value) return;
    try {
      const field = await formsService.createField(
        form.value.id,
        activeStepId.value,
        {
          type,
          label: `Nouveau champ ${type.toLowerCase()}`,
        },
      );
      const step = form.value.steps.find(
        (s) => s.id === activeStepId.value,
      );
      if (step) {
        step.fields.push(field);
        selectedFieldId.value = field.id;
      }
      isDirty.value = true;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout du champ";
    }
  }

  async function updateFieldAction(
    fieldId: string,
    input: Partial<FormField>,
  ): Promise<void> {
    if (!form.value || !activeStepId.value) return;
    try {
      const updated = await formsService.updateField(
        form.value.id,
        activeStepId.value,
        fieldId,
        input,
      );
      const step = form.value.steps.find(
        (s) => s.id === activeStepId.value,
      );
      if (step) {
        const index = step.fields.findIndex((f) => f.id === fieldId);
        if (index !== -1) {
          step.fields[index] = { ...step.fields[index], ...updated };
        }
      }
      isDirty.value = true;
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Erreur de mise a jour du champ';
    }
  }

  async function removeField(fieldId: string): Promise<void> {
    if (!form.value || !activeStepId.value) return;
    try {
      await formsService.deleteField(
        form.value.id,
        activeStepId.value,
        fieldId,
      );
      const step = form.value.steps.find(
        (s) => s.id === activeStepId.value,
      );
      if (step) {
        step.fields = step.fields.filter((f) => f.id !== fieldId);
      }
      if (selectedFieldId.value === fieldId) {
        selectedFieldId.value = null;
      }
      isDirty.value = true;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de suppression';
    }
  }

  function selectField(fieldId: string | null): void {
    selectedFieldId.value = fieldId;
  }

  async function reorderFieldsAction(fieldIds: string[]): Promise<void> {
    if (!form.value || !activeStepId.value) return;
    try {
      await formsService.reorderFields(
        form.value.id,
        activeStepId.value,
        fieldIds,
      );
      const step = form.value.steps.find(
        (s) => s.id === activeStepId.value,
      );
      if (step) {
        fieldIds.forEach((id, index) => {
          const field = step.fields.find((f) => f.id === id);
          if (field) field.order = index;
        });
      }
      isDirty.value = true;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de reordonnancement';
    }
  }

  async function publishFormAction(): Promise<void> {
    if (!form.value) return;
    try {
      const updated = await formsService.publishForm(form.value.id);
      form.value.status = updated.status;
      form.value.publishedAt = updated.publishedAt;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur de publication';
    }
  }

  function togglePreview(): void {
    isPreviewMode.value = !isPreviewMode.value;
  }

  function resetBuilder(): void {
    form.value = null;
    activeStepId.value = null;
    selectedFieldId.value = null;
    isDirty.value = false;
    isPreviewMode.value = false;
    error.value = null;
  }

  return {
    // State
    form,
    activeStepId,
    selectedFieldId,
    isDirty,
    isSaving,
    isLoading,
    isPreviewMode,
    error,
    // Getters
    steps,
    activeStep,
    activeStepFields,
    selectedField,
    formId,
    // Actions
    initBuilder,
    saveForm,
    updateFormTitle,
    updateFormDescription,
    addStep,
    updateStep,
    removeStep,
    setActiveStep,
    reorderStepsAction,
    addField,
    updateFieldAction,
    removeField,
    selectField,
    reorderFieldsAction,
    publishFormAction,
    togglePreview,
    resetBuilder,
  };
});
