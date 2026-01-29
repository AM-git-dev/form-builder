<script setup lang="ts">
defineProps<{
  currentStep: number;
  totalSteps: number;
  progress: number;
}>();
</script>

<template>
  <div
    v-if="totalSteps > 1"
    class="mb-8"
    role="progressbar"
    :aria-valuenow="progress"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-label="`Etape ${currentStep + 1} sur ${totalSteps}`"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium text-gray-600">
        Etape {{ currentStep + 1 }} / {{ totalSteps }}
      </span>
      <span class="text-sm text-gray-400">{{ progress }}%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        class="h-full bg-primary-600 rounded-full transition-all duration-300 ease-out"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>
