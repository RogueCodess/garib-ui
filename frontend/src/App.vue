<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <AppSidebar />
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
</script>
