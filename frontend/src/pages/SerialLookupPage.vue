<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <AppSidebar />

    <main class="flex-1 overflow-y-auto p-6 max-w-2xl">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Serial Number Lookup</h1>
        <p class="text-sm text-gray-500 mt-1">Search by serial number to see device status and warranty info.</p>
      </div>

      <!-- Search input -->
      <div class="flex gap-3 mb-6">
        <input
          v-model="query"
          type="text"
          aria-label="Serial number"
          placeholder="Enter serial number…"
          class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keydown.enter="doSearch"
        />
        <button
          @click="doSearch"
          :disabled="!query.trim() || searching"
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {{ searching ? 'Searching…' : 'Search' }}
        </button>
      </div>

      <ErrorBanner :message="error" />

      <!-- Results -->
      <div v-if="results.length" class="space-y-4">
        <SerialCard
          v-for="s in results"
          :key="s.name"
          :serial="s"
          :warrantyPeriodDays="warrantyDays[s.item_code]"
        />
      </div>

      <!-- No results -->
      <div v-else-if="searched && !searching" class="text-center py-12 text-gray-400 text-sm">
        No serial numbers found for "{{ lastQuery }}".
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import ErrorBanner from '@/components/ErrorBanner.vue'
import SerialCard from '@/components/SerialCard.vue'
import { searchSerials } from '@/resources/serials'
import { useItemDoc } from '@/resources/items'

const query = ref('')
const lastQuery = ref('')
const results = ref([])
const warrantyDays = reactive({})
const searching = ref(false)
const searched = ref(false)
const error = ref('')

const serialResource = searchSerials('')

async function doSearch() {
  const q = query.value.trim()
  if (!q) return
  searching.value = true
  searched.value = false
  error.value = ''
  lastQuery.value = q

  try {
    serialResource.update({
      filters: [['Serial No', 'name', 'like', `%${q}%`]],
    })
    await serialResource.list.fetch()
    results.value = serialResource.data ?? []
    searched.value = true

    // Fetch warranty period for each unique item_code
    const itemCodes = [...new Set(results.value.map(s => s.item_code).filter(Boolean))]
    await Promise.all(
      itemCodes.map(async (code) => {
        if (warrantyDays[code] !== undefined) return
        try {
          const itemRes = useItemDoc(code)
          await itemRes.fetch()
          warrantyDays[code] = itemRes.data?.warranty_period ?? null
        } catch {
          warrantyDays[code] = null
        }
      })
    )
  } catch (e) {
    error.value = e?.message ?? 'Search failed'
    results.value = []
  } finally {
    searching.value = false
  }
}
</script>
