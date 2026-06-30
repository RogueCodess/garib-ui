<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs text-gray-400 font-mono uppercase tracking-wide">Serial No</p>
        <p class="text-lg font-semibold text-gray-900">{{ serial.name }}</p>
      </div>
      <StatusBadge :status="serial.status" />
    </div>

    <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
      <div>
        <p class="text-gray-400 text-xs">Item</p>
        <p class="text-gray-800">{{ serial.item_code }}</p>
      </div>
      <div>
        <p class="text-gray-400 text-xs">Warehouse</p>
        <p class="text-gray-800">{{ serial.warehouse || '—' }}</p>
      </div>
      <div>
        <p class="text-gray-400 text-xs">Customer</p>
        <p class="text-gray-800">{{ serial.customer || '—' }}</p>
      </div>
      <div>
        <p class="text-gray-400 text-xs">Warranty Status</p>
        <StatusBadge :status="warrantyStatusValue" />
      </div>
    </div>

    <WarrantyBar
      :warranty-period-days="warrantyPeriodDays"
      :purchase-date="serial.purchase_date"
      :warranty-expiry-date="serial.warranty_expiry_date"
    />
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'
import WarrantyBar from './WarrantyBar.vue'
import { warrantyStatus } from '@/composables/useSerial'
import { computed } from 'vue'

const props = defineProps({
  serial: { type: Object, required: true },
  warrantyPeriodDays: { type: Number, default: null },
})

const warrantyStatusValue = computed(() =>
  warrantyStatus(
    props.warrantyPeriodDays,
    props.serial.purchase_date ?? null,
    props.serial.warranty_expiry_date ?? null,
  )
)
</script>
