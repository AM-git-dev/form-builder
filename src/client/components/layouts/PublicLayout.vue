<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="flex items-start justify-center px-4 py-8 sm:py-12">
      <div class="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <slot />
      </div>
    </main>
    <footer class="text-center py-6 text-xs text-gray-300">
      Propulse par Form Builder
    </footer>
  </div>
</template>
