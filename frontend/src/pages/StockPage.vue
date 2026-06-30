<template>

    <main class="flex-1 overflow-y-auto p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Stock Overview</h1>
      </div>

      <ErrorBanner :message="binList.error?.message" />

      <!-- Loading -->
      <div v-if="binList.loading" class="text-center py-12 text-gray-500">Loading stock…</div>

      <template v-else>
        <!-- Pivot table -->
        <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white mb-6">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500 min-w-48">Item</th>
                <th
                  v-for="wh in GA_WAREHOUSES"
                  :key="wh"
                  scope="col"
                  class="px-4 py-3 text-center font-medium text-gray-500 whitespace-nowrap"
                >
                  {{ whShortName(wh) }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="itemCode in itemCodes" :key="itemCode" class="hover:bg-gray-50">
                <td class="px-4 py-2 font-mono text-xs text-gray-700">{{ itemCode }}</td>
                <td
                  v-for="wh in GA_WAREHOUSES"
                  :key="wh"
                  class="px-4 py-2 text-center"
                >
                  <button
                    v-if="qtyAt(itemCode, wh) > 0"
                    :aria-label="`Show serials: ${itemCode} at ${whShortName(wh)}`"
                    @click="showDrillDown(itemCode, wh)"
                    class="inline-block min-w-8 rounded bg-green-100 text-green-800 font-semibold px-2 py-0.5 hover:bg-green-200 transition-colors"
                  >
                    {{ qtyAt(itemCode, wh) }}
                  </button>
                  <span v-else class="text-gray-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="itemCodes.length === 0" class="text-center py-8 text-gray-400 text-sm">
            No stock data available.
          </div>
        </div>

        <!-- Drill-down panel -->
        <div v-if="drillDown" class="bg-white border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-medium text-gray-900">
              {{ drillDown.itemCode }} · {{ drillDown.warehouse }}
            </h2>
            <button @click="drillDown = null" aria-label="Close drill-down" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          </div>

          <div v-if="drillSerials.loading" class="text-sm text-gray-500">Loading serials…</div>
          <div v-else-if="!drillSerials.data?.length" class="text-sm text-gray-400">No serial numbers at this location.</div>
          <div v-else class="space-y-3">
            <SerialCard
              v-for="s in drillSerials.data"
              :key="s.name"
              :serial="s"
            />
          </div>
        </div>
      </template>
    </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ErrorBanner from '@/components/ErrorBanner.vue'
import SerialCard from '@/components/SerialCard.vue'
import { useBinList, pivotBins, GA_WAREHOUSES } from '@/resources/stock'
import { searchSerials } from '@/resources/serials'

const binList = useBinList()

const pivot = computed(() => pivotBins(binList.data))

const itemCodes = computed(() => {
  return Object.keys(pivot.value).sort()
})

function qtyAt(itemCode, warehouse) {
  return pivot.value[itemCode]?.[warehouse] ?? 0
}

function whShortName(wh) {
  // "Showroom - GA" → "Showroom"
  return wh.replace(' - GA', '')
}

// Drill-down
const drillDown = ref(null)
const drillSerials = searchSerials('')

watch(drillDown, (dd) => {
  if (!dd) return
  drillSerials.update({
    filters: [
      ['Serial No', 'item_code', '=', dd.itemCode],
      ['Serial No', 'warehouse', '=', dd.warehouse],
    ],
  })
  drillSerials.setData(null)
  drillSerials.fetch()
})

function showDrillDown(itemCode, warehouse) {
  drillDown.value = { itemCode, warehouse }
}
</script>
