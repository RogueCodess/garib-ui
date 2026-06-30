<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <AppSidebar />

    <main class="flex-1 overflow-y-auto p-6 max-w-4xl">
      <!-- Back link -->
      <button @click="router.push('/items')" class="mb-4 text-sm text-blue-600 hover:underline flex items-center gap-1">
        ← Back to Items
      </button>

      <ErrorBanner :message="itemDoc.error?.message" />

      <!-- Loading -->
      <div v-if="itemDoc.loading" class="text-center py-12 text-gray-500">Loading…</div>

      <template v-else-if="item">
        <!-- Header -->
        <div class="mb-6">
          <p class="text-xs font-mono text-gray-400 mb-1">{{ item.item_code }}</p>
          <h1 class="text-2xl font-semibold text-gray-900">{{ item.item_name }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ item.item_group }} · {{ item.brand }}</p>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-2 gap-6 mb-8">
          <!-- Capacity (editable) -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Capacity</label>
            <input
              v-model="editCapacity"
              type="text"
              class="border border-gray-300 rounded px-3 py-1.5 text-sm w-full"
              placeholder="e.g. 12000 BTU"
            />
          </div>

          <!-- AC Type (editable) -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">AC Type</label>
            <select v-model="editAcType" class="border border-gray-300 rounded px-3 py-1.5 text-sm w-full">
              <option value="">—</option>
              <option value="Split">Split</option>
              <option value="Window">Window</option>
              <option value="Portable">Portable</option>
              <option value="Inverter">Inverter</option>
            </select>
          </div>

          <!-- Selling price (editable) -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Selling Price (SRD)</label>
            <input
              v-model="editPrice"
              type="number"
              step="0.01"
              class="border border-gray-300 rounded px-3 py-1.5 text-sm w-full"
              placeholder="0.00"
            />
          </div>

          <!-- Warranty period (read-only) -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Warranty Period</label>
            <p class="text-sm text-gray-900">{{ item.warranty_period ? `${item.warranty_period} days` : '—' }}</p>
          </div>
        </div>

        <!-- Description -->
        <div v-if="item.description" class="mb-8">
          <h2 class="text-sm font-medium text-gray-500 mb-2">Description</h2>
          <p class="text-sm text-gray-700 whitespace-pre-line">{{ item.description }}</p>
        </div>

        <!-- Save button -->
        <div class="mb-8 flex gap-3 items-center">
          <button
            @click="saveChanges"
            :disabled="saving"
            class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
          <ErrorBanner :message="saveError" />
        </div>

        <!-- Stock per warehouse -->
        <div class="mb-8">
          <h2 class="text-sm font-medium text-gray-700 mb-3">Stock by Warehouse</h2>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="wh in GA_WAREHOUSES"
              :key="wh"
              class="bg-white border border-gray-200 rounded-lg p-3"
            >
              <p class="text-xs text-gray-500 mb-1">{{ wh }}</p>
              <p class="text-lg font-semibold" :class="stockAt(wh) > 0 ? 'text-green-700' : 'text-gray-400'">
                {{ stockAt(wh) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Serial numbers (serialized items only) -->
        <div v-if="item.has_serial_no">
          <h2 class="text-sm font-medium text-gray-700 mb-3">Serial Numbers</h2>
          <div v-if="serialList.loading" class="text-sm text-gray-500">Loading serials…</div>
          <div v-else-if="!serials.length" class="text-sm text-gray-400">No serial numbers found.</div>
          <div v-else class="space-y-3">
            <SerialCard
              v-for="s in serials"
              :key="s.name"
              :serial="s"
              :warrantyPeriodDays="item.warranty_period"
            />
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import ErrorBanner from '@/components/ErrorBanner.vue'
import SerialCard from '@/components/SerialCard.vue'
import { useItemDoc, saveItem, useItemPrices, updateItemPrice } from '@/resources/items'
import { useBinList, GA_WAREHOUSES } from '@/resources/stock'
import { searchSerials } from '@/resources/serials'

const router = useRouter()
const route = useRoute()

const itemCode = computed(() => route.params.itemCode)

// Resources
const itemDoc = useItemDoc(itemCode.value)
const binList = useBinList()
const priceList = useItemPrices()

// Fetch item doc when route param is ready
watch(itemCode, (code) => {
  if (code) {
    itemDoc.update({ params: { doctype: 'Item', name: code } })
    itemDoc.fetch()
  }
}, { immediate: true })

const item = computed(() => itemDoc.data)

// Serials — only fetch when item is serialized
const serialList = searchSerials('')
const serials = computed(() => serialList.data ?? [])

watch(item, (it) => {
  if (it?.has_serial_no && it.item_code) {
    serialList.update({ filters: [['Serial No', 'item_code', '=', it.item_code]] })
    serialList.fetch()
  }
})

// Editable fields — initialized from item doc
const editCapacity = ref('')
const editAcType = ref('')
const editPrice = ref('')

watch(item, (it) => {
  if (!it || saving.value) return
  editCapacity.value = it.custom_capacity ?? ''
  editAcType.value = it.custom_ac_type ?? ''
}, { immediate: true })

// Price lookup
const priceMap = computed(() => {
  const map = new Map()
  for (const p of priceList.data ?? []) map.set(p.item_code, p)
  return map
})

watch(priceMap, (map) => {
  const row = map.get(itemCode.value)
  if (row) editPrice.value = row.price_list_rate
}, { immediate: true })

// Stock lookup
const binMap = computed(() => {
  const map = {}
  for (const b of binList.data ?? []) {
    if (b.item_code === itemCode.value) map[b.warehouse] = b.actual_qty
  }
  return map
})

function stockAt(warehouse) {
  return binMap.value[warehouse] ?? 0
}

// Save
const saving = ref(false)
const saveError = ref('')

async function saveChanges() {
  saving.value = true
  saveError.value = ''
  try {
    // Save item fields
    const saver = saveItem({
      ...item.value,
      custom_capacity: editCapacity.value,
      custom_ac_type: editAcType.value,
    })
    await saver.submit()

    // Update price if changed
    const priceRow = priceMap.value.get(itemCode.value)
    if (priceRow && editPrice.value !== priceRow.price_list_rate) {
      const updater = updateItemPrice(priceRow.name, Number(editPrice.value))
      await updater.submit()
    }

    // Reload item
    itemDoc.fetch()
    priceList.reload()
  } catch (e) {
    saveError.value = e?.message ?? 'Save failed'
  } finally {
    saving.value = false
  }
}
</script>
