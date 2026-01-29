<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function handleGoHome(): void {
  router.push('/');
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-50">
    <h1 class="text-6xl font-bold text-gray-300">404</h1>
    <p class="mt-4 text-lg text-gray-600">Page introuvable</p>
    <button
      class="btn-primary mt-6"
      @click="handleGoHome"
    >
      Retour a l'accueil
    </button>
  </div>
</template>
