<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <AppSidebar />

    <main class="flex-1 overflow-y-auto p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Warranty Claims</h1>
      </div>

      <!-- Status filter chips -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button
          v-for="s in STATUS_OPTIONS"
          :key="s"
          @click="selectStatus(s)"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium border transition-colors',
            activeStatus === s
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
          ]"
        >
          {{ s }}
        </button>
      </div>

      <ErrorBanner :message="error" />

      <!-- Loading -->
      <p v-if="claimList.loading" class="text-sm text-gray-500">Loading…</p>

      <!-- Empty -->
      <p v-else-if="!claimList.data?.length" class="text-sm text-gray-500">
        No claims found.
      </p>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-600">Claim ID</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-600">Serial No</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-600">Item</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th scope="col" class="px-4 py-3 text-left font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="claim in claimList.data"
              :key="claim.name"
              class="hover:bg-gray-50 cursor-pointer"
              tabindex="0"
              @click="goToDetail(claim.name)"
              @keydown.enter="goToDetail(claim.name)"
            >
              <td class="px-4 py-3 font-mono text-xs text-blue-600">{{ claim.name }}</td>
              <td class="px-4 py-3 text-gray-700">{{ claim.serial_no || '—' }}</td>
              <td class="px-4 py-3 text-gray-700">{{ claim.item_code || '—' }}</td>
              <td class="px-4 py-3 text-gray-700">{{ claim.customer || '—' }}</td>
              <td class="px-4 py-3">
                <StatusBadge :status="claim.status" />
              </td>
              <td class="px-4 py-3 text-gray-500">{{ formatDate(claim.creation) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import ErrorBanner from '@/components/ErrorBanner.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useClaimList } from '@/resources/claims'

const router = useRouter()

const STATUS_OPTIONS = ['All', 'Open', 'Work In Progress', 'Closed']
const activeStatus = ref('All')
const error = ref('')

// Use a reactive ref so the template re-renders when the filter changes
const activeFilter = ref(null)
const claimList = computed(() => useClaimList(activeFilter.value))

function selectStatus(s) {
  activeStatus.value = s
  activeFilter.value = s === 'All' ? null : s
}

function goToDetail(name) {
  router.push(`/claims/${name}`)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.slice(0, 10)
}

watch(() => claimList.value?.error, (e) => {
  if (e) error.value = e?.message ?? 'Failed to load claims'
})
</script>
