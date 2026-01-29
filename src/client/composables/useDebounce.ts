import { ref, onUnmounted } from 'vue';
import type { Ref } from 'vue';

/**
 * Creates a debounced version of the provided function.
 * Automatically clears the pending timeout when the component unmounts.
 *
 * @param fn - The function to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns An object containing the debounced function, a reactive pending flag, and a cancel function
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): {
  debouncedFn: (...args: Parameters<T>) => void;
  isPending: Ref<boolean>;
  cancel: () => void;
} {
  const isPending = ref(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function cancel(): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    isPending.value = false;
  }

  function debouncedFn(...args: Parameters<T>): void {
    cancel();
    isPending.value = true;
    timeoutId = setTimeout(() => {
      fn(...args);
      isPending.value = false;
      timeoutId = null;
    }, delay);
  }

  onUnmounted(() => {
    cancel();
  });

  return { debouncedFn, isPending, cancel };
}
