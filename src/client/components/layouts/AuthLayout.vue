<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-primary-600">Form Builder</h1>
        <p class="mt-2 text-gray-500">Creez des formulaires performants</p>
      </div>
      <div class="card p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
