<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="colorClass"
  >
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const colorClass = computed(() => {
  const map = {
    'Active': 'bg-green-100 text-green-800',
    'Delivered': 'bg-blue-100 text-blue-800',
    'In Repair': 'bg-orange-100 text-orange-800',
    'Expired': 'bg-red-100 text-red-800',
    'Expiring Soon': 'bg-yellow-100 text-yellow-800',
    'Unknown': 'bg-gray-100 text-gray-600',
    'Open': 'bg-yellow-100 text-yellow-800',
    'Work In Progress': 'bg-blue-100 text-blue-800',
    'Closed': 'bg-green-100 text-green-800',
    'Paid': 'bg-green-100 text-green-800',
  }
  return map[props.status] ?? 'bg-gray-100 text-gray-600'
})
</script>
