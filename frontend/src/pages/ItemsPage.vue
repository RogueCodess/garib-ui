<template>

    <main class="flex-1 overflow-y-auto p-6">
      <!-- Page header -->
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Items</h1>
        <button
          @click="openNewItem"
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + New Item
        </button>
      </div>

      <!-- Error banner -->
      <ErrorBanner :message="itemList.list?.error?.message" />

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

      <!-- New Item modal -->
      <div
        v-if="showNewItem"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
        @click.self="closeNewItem"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">New Item</h2>
            <button @click="closeNewItem" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>

          <form @submit.prevent="submitNewItem" class="px-6 py-5 space-y-4">
            <ErrorBanner :message="newItemError" />

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Item Code <span class="text-red-500">*</span></label>
              <input
                v-model="newItem.itemCode"
                type="text"
                placeholder="e.g. AC-LG-18K-SPLIT"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Item Name <span class="text-red-500">*</span></label>
              <input
                v-model="newItem.itemName"
                type="text"
                placeholder="e.g. LG 18000 BTU Split AC"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Item Group <span class="text-red-500">*</span></label>
                <select v-model="newItem.itemGroup" class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full">
                  <option value="">Select…</option>
                  <option v-for="g in itemGroupOptions" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select v-model="newItem.brand" class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full">
                  <option value="">None</option>
                  <option v-for="b in brandList.data ?? []" :key="b.name" :value="b.name">{{ b.name }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Selling Price (SRD)</label>
              <input
                v-model.number="newItem.price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" v-model="newItem.hasSerialNo" class="rounded" />
              Serialized item (track individual serial numbers)
            </label>

            <div class="flex items-center gap-3 pt-2">
              <button
                type="submit"
                :disabled="!newItemValid || savingItem"
                class="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {{ savingItem ? 'Saving…' : 'Create Item' }}
              </button>
              <button type="button" @click="closeNewItem" class="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import ErrorBanner from '@/components/ErrorBanner.vue'
import {
  useItemList, useItemPrices, filterItems,
  useBrands, createItem, createItemPrice, GA_ITEM_GROUPS,
} from '@/resources/items'
import { useBinList } from '@/resources/stock'

const router = useRouter()

const itemList = useItemList()
const priceList = useItemPrices()
const binList = useBinList()
const brandList = useBrands()
const itemGroupOptions = GA_ITEM_GROUPS

// Total stock-on-hand per item_code, summed across all GA warehouses (Bin).
// Item has no actual_qty field, so stock is sourced separately and merged in.
const stockByItem = computed(() => {
  const map = {}
  for (const bin of binList.data ?? []) {
    map[bin.item_code] = (map[bin.item_code] ?? 0) + (bin.actual_qty ?? 0)
  }
  return map
})

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
  // Merge stock-on-hand onto each item so the Stock column and the
  // "in stock only" filter (which read item.actual_qty) work correctly.
  const items = (itemList.data ?? []).map(item => ({
    ...item,
    actual_qty: stockByItem.value[item.item_code] ?? 0,
  }))
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

// --- New Item modal ---
const showNewItem = ref(false)
const savingItem = ref(false)
const newItemError = ref('')
const newItem = reactive({
  itemCode: '', itemName: '', itemGroup: '', brand: '', price: null, hasSerialNo: false,
})

const newItemValid = computed(() =>
  newItem.itemCode.trim() && newItem.itemName.trim() && newItem.itemGroup
)

function openNewItem() {
  newItemError.value = ''
  Object.assign(newItem, {
    itemCode: '', itemName: '', itemGroup: '', brand: '', price: null, hasSerialNo: false,
  })
  showNewItem.value = true
}

function closeNewItem() {
  showNewItem.value = false
}

async function submitNewItem() {
  if (!newItemValid.value || savingItem.value) return
  savingItem.value = true
  newItemError.value = ''

  try {
    const creator = createItem({
      itemCode: newItem.itemCode.trim(),
      itemName: newItem.itemName.trim(),
      itemGroup: newItem.itemGroup,
      brand: newItem.brand,
      hasSerialNo: newItem.hasSerialNo,
    })
    await creator.submit()

    // Optional opening selling price
    if (newItem.price != null && newItem.price > 0) {
      const priceCreator = createItemPrice({
        itemCode: newItem.itemCode.trim(),
        rate: newItem.price,
      })
      await priceCreator.submit()
    }

    // Refresh lists so the new item appears
    await Promise.all([itemList.reload(), priceList.reload(), binList.reload()])
    showNewItem.value = false
  } catch (e) {
    newItemError.value = e?.messages?.join(', ') || e?.message || 'Failed to create item'
  } finally {
    savingItem.value = false
  }
}
</script>
