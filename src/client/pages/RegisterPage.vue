<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import AuthLayout from '../components/layouts/AuthLayout.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import { useAuth } from '../composables/useAuth.js';

const { handleRegister, isLoading, error, clearError } = useAuth();

const email = ref('');
const password = ref('');
const firstName = ref('');
const lastName = ref('');
const formError = ref('');

async function onSubmit(): Promise<void> {
  formError.value = '';
  clearError();
  try {
    await handleRegister(
      email.value,
      password.value,
      firstName.value || undefined,
      lastName.value || undefined,
    );
  } catch (err: unknown) {
    formError.value = err instanceof Error ? err.message : 'Une erreur est survenue';
  }
}
</script>

<template>
  <AuthLayout>
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Creer un compte</h2>

    <div
      v-if="formError || error"
      class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
      role="alert"
    >
      {{ formError || error }}
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-4">
        <BaseInput
          v-model="firstName"
          label="Prenom"
          placeholder="Jean"
          autocomplete="given-name"
        />

        <BaseInput
          v-model="lastName"
          label="Nom"
          placeholder="Dupont"
          autocomplete="family-name"
        />
      </div>

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
        placeholder="Min. 8 caracteres, 1 majuscule, 1 chiffre"
        autocomplete="new-password"
        required
      />

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="isLoading"
        class="w-full"
      >
        Creer mon compte
      </BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
      Deja un compte ?
      <RouterLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
        Se connecter
      </RouterLink>
    </p>
  </AuthLayout>
</template>
