<script setup lang="ts">
import { useRoute } from 'vue-router';
import PublicLayout from '../components/layouts/PublicLayout.vue';
import FormRenderer from '../components/renderer/FormRenderer.vue';

const route = useRoute();
const formId = route.params.id as string;
</script>

<template>
  <PublicLayout>
    <FormRenderer :form-id="formId" />
  </PublicLayout>
</template>
