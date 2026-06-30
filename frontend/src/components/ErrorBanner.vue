<template>
  <div
    v-if="visible"
    role="alert"
    aria-live="assertive"
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
      aria-label="Dismiss error"
      class="text-red-400 hover:text-red-600 shrink-0"
      @click="dismissed = true"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
})
defineEmits(['retry'])

const dismissed = ref(false)

// Reset dismissed whenever the message changes (even to the same value)
watch(
  () => props.message,
  () => { dismissed.value = false },
)

const visible = computed(() => !!props.message && !dismissed.value)
</script>
