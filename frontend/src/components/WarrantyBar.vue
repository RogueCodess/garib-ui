<template>
  <div class="space-y-1">
    <div class="flex justify-between text-xs text-gray-500">
      <span>{{ purchaseLabel }}</span>
      <span>{{ expiryLabel }}</span>
    </div>
    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all"
        :class="barColor"
        :style="{ width: barWidth + '%' }"
      />
    </div>
    <div class="text-xs text-right" :class="textColor">{{ statusLabel }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { warrantyStatus } from '@/composables/useSerial'

const props = defineProps({
  warrantyPeriodDays: { type: Number, default: null },
  purchaseDate: { type: String, default: null },
  warrantyExpiryDate: { type: String, default: null },
})

const DAY = 24 * 60 * 60 * 1000

const effectiveExpiry = computed(() => {
  if (props.warrantyExpiryDate) return new Date(props.warrantyExpiryDate)
  if (props.purchaseDate && props.warrantyPeriodDays)
    return new Date(new Date(props.purchaseDate).getTime() + props.warrantyPeriodDays * DAY)
  return null
})

const status = computed(() =>
  warrantyStatus(props.warrantyPeriodDays, props.purchaseDate, props.warrantyExpiryDate)
)

const barWidth = computed(() => {
  if (!props.purchaseDate || !effectiveExpiry.value) return 0
  const total = effectiveExpiry.value.getTime() - new Date(props.purchaseDate).getTime()
  const elapsed = Date.now() - new Date(props.purchaseDate).getTime()
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
})

const barColor = computed(() => ({
  'Active': 'bg-green-500',
  'Expiring Soon': 'bg-yellow-400',
  'Expired': 'bg-red-500',
  'Unknown': 'bg-gray-300',
}[status.value] ?? 'bg-gray-300'))

const textColor = computed(() => ({
  'Active': 'text-green-700',
  'Expiring Soon': 'text-yellow-700',
  'Expired': 'text-red-700',
  'Unknown': 'text-gray-500',
}[status.value] ?? 'text-gray-500'))

const statusLabel = computed(() => {
  if (status.value === 'Unknown') return 'Warranty dates unavailable'
  if (!effectiveExpiry.value) return status.value
  const daysLeft = Math.ceil((effectiveExpiry.value.getTime() - Date.now()) / DAY)
  if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} days ago`
  return `${daysLeft} days remaining`
})

const purchaseLabel = computed(() =>
  props.purchaseDate ? new Date(props.purchaseDate).toLocaleDateString() : '—'
)
const expiryLabel = computed(() =>
  effectiveExpiry.value ? effectiveExpiry.value.toLocaleDateString() : '—'
)
</script>
