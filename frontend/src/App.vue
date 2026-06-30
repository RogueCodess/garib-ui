<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <AppSidebar />
    <RouterView />
  </div>
</template>

<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
</script>
