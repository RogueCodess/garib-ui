<template>

    <main class="flex-1 overflow-y-auto p-6">
      <!-- Page header -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Items</h1>
      </div>

      <!-- Error banner -->
      <ErrorBanner :message="itemList.error?.message" />

      <!-- Search + filters bar -->
      <div class="mb-4 flex flex-wrap gap-3 items-center">
        <!-- Search -->
        <input
          v-model="search"
          type="text"
          placeholder="Search item code or name…"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <!-- Brand filter -->
        <select v-model="filters.brand" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option value="">All Brands</option>
          <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
        </select>

        <!-- AC Type filter -->
        <select v-model="filters.ac_type" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option value="">All Types</option>
          <option value="Split">Split</option>
          <option value="Window">Window</option>
          <option value="Portable">Portable</option>
          <option value="Inverter">Inverter</option>
        </select>

        <!-- In-stock toggle -->
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" v-model="filters.inStockOnly" class="rounded" />
          In stock only
        </label>

        <!-- Clear filters -->
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="text-sm text-blue-600 hover:underline"
        >
          Clear filters
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="itemList.loading" class="text-center py-12 text-gray-500">
        Loading items…
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredItems.length === 0" class="text-center py-12 text-gray-500">
        No items match your filters.
      </div>

      <!-- Items table -->
      <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500">Item Code</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500">Group</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500">Brand</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500">Capacity</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500">Type</th>
              <th scope="col" class="px-4 py-3 text-right font-medium text-gray-500">Price (SRD)</th>
              <th scope="col" class="px-4 py-3 text-right font-medium text-gray-500">Stock</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="item in filteredItems"
              :key="item.item_code"
              class="hover:bg-blue-50 cursor-pointer transition-colors"
              tabindex="0"
              @click="router.push(`/items/${item.item_code}`)"
              @keydown.enter="router.push(`/items/${item.item_code}`)"
            >
              <td class="px-4 py-3 font-mono text-xs text-blue-700">{{ item.item_code }}</td>
              <td class="px-4 py-3 text-gray-900">{{ item.item_name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ item.item_group }}</td>
              <td class="px-4 py-3 text-gray-600">{{ item.brand }}</td>
              <td class="px-4 py-3 text-gray-600">{{ item.custom_capacity || '—' }}</td>
              <td class="px-4 py-3 text-gray-600">{{ item.custom_ac_type || '—' }}</td>
              <td class="px-4 py-3 text-right text-gray-900">{{ priceFor(item.item_code) }}</td>
              <td class="px-4 py-3 text-right">
                <span :class="item.actual_qty > 0 ? 'text-green-700' : 'text-gray-400'">
                  {{ item.actual_qty ?? 0 }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import ErrorBanner from '@/components/ErrorBanner.vue'
import { useItemList, useItemPrices, filterItems } from '@/resources/items'

const router = useRouter()

const itemList = useItemList()
const priceList = useItemPrices()

const search = ref('')
const filters = reactive({ brand: '', ac_type: '', inStockOnly: false })

const hasActiveFilters = computed(() =>
  search.value.trim() || filters.brand || filters.ac_type || filters.inStockOnly
)

function clearFilters() {
  search.value = ''
  filters.brand = ''
  filters.ac_type = ''
  filters.inStockOnly = false
}

const brands = computed(() => {
  const items = itemList.data ?? []
  return [...new Set(items.map(i => i.brand).filter(Boolean))].sort()
})

const filteredItems = computed(() => {
  const items = itemList.data ?? []
  return filterItems(items, filters, search.value)
})

const priceMap = computed(() => {
  const map = new Map()
  for (const p of priceList.data ?? []) {
    map.set(p.item_code, p.price_list_rate)
  }
  return map
})

function priceFor(itemCode) {
  const rate = priceMap.value.get(itemCode)
  return rate != null
    ? `SRD ${Number(rate).toLocaleString('nl-SR', { minimumFractionDigits: 2 })}`
    : '—'
}
</script>
