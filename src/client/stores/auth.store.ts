import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../types/auth.types.js';
import * as authService from '../services/auth.service.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => user.value !== null);
  const fullName = computed(() => {
    if (!user.value) return '';
    const parts = [user.value.firstName, user.value.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : user.value.email;
  });

  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      user.value = await authService.login({ email, password });
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      user.value = await authService.register({ email, password, firstName, lastName });
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await authService.logout();
    } finally {
      user.value = null;
    }
  }

  async function fetchUser(): Promise<void> {
    try {
      user.value = await authService.fetchCurrentUser();
    } catch {
      user.value = null;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    fullName,
    login,
    register,
    logout,
    fetchUser,
    clearError,
  };
});

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { error?: { message?: string } } } }).response;
    if (response?.data?.error?.message) {
      return response.data.error.message;
    }
  }
  if (err instanceof Error) return err.message;
  return 'Une erreur est survenue';
}
