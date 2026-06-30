<template>
  <aside class="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen">
    <!-- Brand -->
    <div class="px-5 py-5 border-b border-gray-100">
      <p class="text-xs text-gray-400 font-medium tracking-wider uppercase">Garib Appliances</p>
      <p class="text-sm font-semibold text-gray-800 mt-0.5">Back Office</p>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-0.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        active-class="bg-blue-50 text-blue-700 font-medium"
      >
        <svg
          class="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          v-html="icons[item.icon]"
        />
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- User -->
    <div class="px-4 py-4 border-t border-gray-100">
      <p class="text-xs text-gray-500 truncate">{{ currentUser }}</p>
      <a
        href="/logout"
        class="text-xs text-gray-400 hover:text-gray-600 mt-0.5 block"
      >
        Sign out
      </a>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { cachedUser } from '@/router'

// Lucide icon path data (24×24 viewBox, stroke-based)
const icons = {
  package:
    '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  store:
    '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
  search:
    '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  inbox:
    '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
}

const navItems = [
  { path: '/items',   icon: 'package', label: 'Items' },
  { path: '/stock',   icon: 'store',   label: 'Stock' },
  { path: '/serials', icon: 'search',  label: 'Serials' },
  { path: '/receive', icon: 'inbox',   label: 'Receive' },
  { path: '/claims',  icon: 'wrench',  label: 'Warranty' },
]

const currentUser = computed(() => cachedUser.value || '')
</script>
