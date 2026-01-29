<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useBuilderStore } from '../../stores/builder.store.js';
import { MAX_STEPS } from '../../utils/constants.js';

const store = useBuilderStore();
const editingStepId = ref<string | null>(null);
const editTitle = ref('');
const editInputRef = ref<HTMLInputElement | null>(null);

async function startEdit(stepId: string, title: string): Promise<void> {
  editingStepId.value = stepId;
  editTitle.value = title;
  await nextTick();
  editInputRef.value?.focus();
  editInputRef.value?.select();
}

function saveEdit(): void {
  if (editingStepId.value && editTitle.value.trim()) {
    store.updateStep(editingStepId.value, { title: editTitle.value.trim() });
  }
  editingStepId.value = null;
}

function cancelEdit(): void {
  editingStepId.value = null;
}

function handleStepKeydown(event: KeyboardEvent, stepId: string, title: string): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    store.setActiveStep(stepId);
  }
  if (event.key === 'F2') {
    event.preventDefault();
    startEdit(stepId, title);
  }
}
</script>

<template>
  <div
    class="flex items-center gap-1 px-3 lg:px-4 py-2 bg-gray-100 border-b border-gray-200 overflow-x-auto"
    role="tablist"
    aria-label="Etapes du formulaire"
  >
    <div
      v-for="(step, index) in store.steps"
      :key="step.id"
      role="tab"
      :aria-selected="store.activeStepId === step.id"
      :aria-controls="`step-panel-${step.id}`"
      :id="`step-tab-${step.id}`"
      :tabindex="store.activeStepId === step.id ? 0 : -1"
      :class="[
        'group relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
        store.activeStepId === step.id
          ? 'bg-white text-primary-700 border border-b-white border-gray-200 -mb-px'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
      ]"
      @click="store.setActiveStep(step.id)"
      @dblclick="startEdit(step.id, step.title)"
      @keydown="handleStepKeydown($event, step.id, step.title)"
    >
      <template v-if="editingStepId === step.id">
        <label :for="`step-edit-${step.id}`" class="sr-only">
          Renommer l'etape {{ step.title }}
        </label>
        <input
          :id="`step-edit-${step.id}`"
          ref="editInputRef"
          v-model="editTitle"
          class="w-24 bg-transparent border-b border-primary-400 outline-none text-sm focus:border-primary-600"
          aria-label="Nouveau nom de l'etape"
          @blur="saveEdit"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
          @click.stop
        />
      </template>
      <template v-else>
        <span>{{ step.title }}</span>
        <span class="sr-only">(Etape {{ index + 1 }} sur {{ store.steps.length }})</span>
      </template>

      <button
        v-if="store.steps.length > 1 && store.activeStepId === step.id && editingStepId !== step.id"
        class="ml-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        :aria-label="`Supprimer l'etape ${step.title}`"
        @click.stop="store.removeStep(step.id)"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <button
      v-if="store.steps.length < MAX_STEPS"
      class="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
      aria-label="Ajouter une nouvelle etape"
      @click="store.addStep()"
    >
      <span aria-hidden="true">+</span> Etape
    </button>
  </div>
</template>
