<template>
  <div
    v-if="visible"
    class="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-4"
  >
    <span class="flex-1 text-sm">{{ message }}</span>
    <button
      class="text-xs underline hover:no-underline shrink-0"
      @click="$emit('retry')"
    >
      Retry
    </button>
    <button
      class="text-red-400 hover:text-red-600 shrink-0"
      @click="visible = false"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
})
defineEmits(['retry'])

const visible = ref(!!props.message)
watch(() => props.message, (val) => { visible.value = !!val })
</script>
