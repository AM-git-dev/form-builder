<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { computed } from 'vue';
import { useAuth } from '../../composables/useAuth.js';

const route = useRoute();
const { fullName, handleLogout } = useAuth();

interface NavItem {
  to: string;
  label: string;
  ariaLabel: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', ariaLabel: 'Aller au tableau de bord' },
  { to: '/builder', label: 'Nouveau formulaire', ariaLabel: 'Creer un nouveau formulaire' },
];

const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      class="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col"
      aria-label="Navigation principale"
    >
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-primary-600">Form Builder</h1>
      </div>

      <nav class="flex-1 p-4 space-y-1" aria-label="Menu principal">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :aria-label="item.ariaLabel"
          :aria-current="route.path.startsWith(item.to) ? 'page' : undefined"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            route.path.startsWith(item.to)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 truncate" :title="fullName">
            {{ fullName }}
          </span>
          <button
            class="text-sm text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1"
            @click="handleLogout"
          >
            Quitter
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile header -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <header
        class="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200"
        role="banner"
      >
        <h1 class="text-lg font-bold text-primary-600">Form Builder</h1>
        <nav class="flex items-center gap-3" aria-label="Navigation mobile">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :aria-label="item.ariaLabel"
            :aria-current="route.path.startsWith(item.to) ? 'page' : undefined"
            :class="[
              'text-xs font-medium px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
              route.path.startsWith(item.to)
                ? 'text-primary-700 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            {{ item.label }}
          </RouterLink>
          <button
            class="text-xs text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
            @click="handleLogout"
          >
            Quitter
          </button>
        </nav>
      </header>

      <!-- Main content -->
      <main class="flex-1 overflow-auto">
        <slot>
          <RouterView />
        </slot>
      </main>
    </div>
  </div>
</template>
