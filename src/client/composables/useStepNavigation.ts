import { ref, computed } from 'vue';
import type { FormStep } from '../types/form.types.js';

export function useStepNavigation(steps: () => FormStep[]) {
  const currentStepIndex = ref(0);

  const currentStep = computed(() => steps()[currentStepIndex.value] ?? null);

  const totalSteps = computed(() => steps().length);

  const isFirstStep = computed(() => currentStepIndex.value === 0);

  const isLastStep = computed(() => currentStepIndex.value === totalSteps.value - 1);

  const progress = computed(() => {
    if (totalSteps.value <= 1) return 100;
    return Math.round((currentStepIndex.value / (totalSteps.value - 1)) * 100);
  });

  function goToNext(): boolean {
    if (isLastStep.value) return false;
    currentStepIndex.value++;
    return true;
  }

  function goToPrevious(): boolean {
    if (isFirstStep.value) return false;
    currentStepIndex.value--;
    return true;
  }

  function goToStep(index: number): boolean {
    if (index < 0 || index >= totalSteps.value) return false;
    currentStepIndex.value = index;
    return true;
  }

  function reset(): void {
    currentStepIndex.value = 0;
  }

  return {
    currentStepIndex,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,
    goToNext,
    goToPrevious,
    goToStep,
    reset,
  };
}
