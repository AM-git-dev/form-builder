import { ref, reactive } from 'vue';
import type { Form, EventType } from '../types/form.types.js';
import api from '../services/api.js';
import { useStepNavigation } from './useStepNavigation.js';
import { useFormValidation } from './useFormValidation.js';

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function useFormRenderer(formId: string) {
  const form = ref<Form | null>(null);
  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const isSubmitted = ref(false);
  const error = ref<string | null>(null);
  const formData = reactive<Record<string, unknown>>({});
  const sessionId = generateSessionId();

  const navigation = useStepNavigation(() => form.value?.steps ?? []);
  const validation = useFormValidation();

  async function loadForm(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/forms/${formId}/schema`);
      form.value = response.data.data;
      await trackEvent('FORM_VIEW');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 404) {
        error.value = 'Ce formulaire est introuvable ou n\'est plus disponible.';
      } else {
        error.value = 'Impossible de charger le formulaire. Veuillez reessayer.';
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function trackEvent(type: EventType, metadata?: Record<string, unknown>): Promise<void> {
    try {
      await api.post(`/forms/${formId}/events`, {
        type,
        sessionId,
        stepId: navigation.currentStep.value?.id ?? null,
        metadata: metadata ?? null,
      });
    } catch {
      // tracking silencieux — ne pas bloquer l'UX
    }
  }

  function handleFieldChange(fieldId: string, value: unknown): void {
    formData[fieldId] = value;
    validation.clearFieldError(fieldId);
  }

  async function handleNext(): Promise<boolean> {
    const currentFields = navigation.currentStep.value?.fields ?? [];
    const isValid = validation.validateFields(currentFields, formData);
    if (!isValid) return false;

    await trackEvent('STEP_COMPLETE', {
      stepIndex: navigation.currentStepIndex.value,
      stepId: navigation.currentStep.value?.id,
    });

    navigation.goToNext();
    return true;
  }

  function handlePrevious(): void {
    validation.clearErrors();
    navigation.goToPrevious();
  }

  async function handleSubmit(): Promise<boolean> {
    const currentFields = navigation.currentStep.value?.fields ?? [];
    const isValid = validation.validateFields(currentFields, formData);
    if (!isValid) return false;

    isSubmitting.value = true;
    try {
      await api.post(`/forms/${formId}/submissions`, {
        data: { ...formData },
        sessionId,
      });
      await trackEvent('FORM_SUBMIT');
      isSubmitted.value = true;
      return true;
    } catch {
      error.value = 'Erreur lors de l\'envoi. Veuillez reessayer.';
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  function markFormStarted(): void {
    trackEvent('FORM_START');
  }

  return {
    form,
    isLoading,
    isSubmitting,
    isSubmitted,
    error,
    formData,
    sessionId,
    navigation,
    validation,
    loadForm,
    trackEvent,
    handleFieldChange,
    handleNext,
    handlePrevious,
    handleSubmit,
    markFormStarted,
  };
}
