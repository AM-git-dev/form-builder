<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import AuthLayout from '../components/layouts/AuthLayout.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import { useAuth } from '../composables/useAuth.js';

const { handleLogin, isLoading, error, clearError } = useAuth();

const email = ref('');
const password = ref('');
const formError = ref('');

async function onSubmit(): Promise<void> {
  formError.value = '';
  clearError();
  try {
    await handleLogin(email.value, password.value);
  } catch (err: unknown) {
    formError.value = err instanceof Error ? err.message : 'Une erreur est survenue';
  }
}
</script>

<template>
  <AuthLayout>
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Connexion</h2>

    <div
      v-if="formError || error"
      class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
      role="alert"
    >
      {{ formError || error }}
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="vous@exemple.com"
        autocomplete="email"
        required
      />

      <BaseInput
        v-model="password"
        label="Mot de passe"
        type="password"
        placeholder="********"
        autocomplete="current-password"
        required
      />

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="isLoading"
        class="w-full"
      >
        Se connecter
      </BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
      Pas encore de compte ?
      <RouterLink to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
        Creer un compte
      </RouterLink>
    </p>
  </AuthLayout>
</template>
