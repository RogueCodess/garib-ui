<template>

    <main class="flex-1 overflow-y-auto p-6 max-w-2xl">
      <div class="mb-4">
        <router-link to="/claims" class="text-sm text-blue-600 hover:underline">← Back to Claims</router-link>
      </div>

      <ErrorBanner :message="error" />

      <p v-if="claimDoc.loading" class="text-sm text-gray-500">Loading…</p>

      <div v-else-if="claimDoc.data" class="space-y-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">{{ claimDoc.data.name }}</h1>
          <p class="text-xs text-gray-400 mt-1">Created: {{ formatDate(claimDoc.data.creation) }}</p>
        </div>

        <!-- Read-only fields -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <h2 class="text-sm font-semibold text-gray-700">Claim Details</h2>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-500">Serial No</span>
              <p class="font-medium">{{ claimDoc.data.serial_no || '—' }}</p>
            </div>
            <div>
              <span class="text-gray-500">Item</span>
              <p class="font-medium">{{ claimDoc.data.item_code || '—' }}</p>
            </div>
            <div>
              <span class="text-gray-500">Customer</span>
              <p class="font-medium">{{ claimDoc.data.customer || '—' }}</p>
            </div>
          </div>
          <div v-if="claimDoc.data.description" class="text-sm">
            <span class="text-gray-500">Problem Description</span>
            <p class="mt-1 whitespace-pre-wrap">{{ claimDoc.data.description }}</p>
          </div>
        </div>

        <!-- Editable fields -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 class="text-sm font-semibold text-gray-700">Update Claim</h2>

          <div>
            <label class="block text-xs text-gray-500 mb-1">Status</label>
            <select v-model="editStatus" class="border border-gray-300 rounded px-3 py-1.5 text-sm w-full max-w-xs">
              <option>Open</option>
              <option>Work In Progress</option>
              <option>Closed</option>
            </select>
          </div>

          <div>
            <label class="block text-xs text-gray-500 mb-1">Assigned Technician</label>
            <input
              v-model="editTechnician"
              type="text"
              placeholder="Technician name"
              class="border border-gray-300 rounded px-3 py-1.5 text-sm w-full max-w-xs"
            />
          </div>

          <div>
            <label class="block text-xs text-gray-500 mb-1">Resolution Notes</label>
            <textarea
              v-model="editNotes"
              rows="4"
              placeholder="Enter resolution notes…"
              class="border border-gray-300 rounded px-3 py-1.5 text-sm w-full resize-y"
            />
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="saveChanges"
              :disabled="saving"
              class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
            <span v-if="savedMsg" class="text-sm text-green-600">Saved.</span>
          </div>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ErrorBanner from '@/components/ErrorBanner.vue'
import { useClaimDoc, saveClaim } from '@/resources/claims'

const route = useRoute()
const claimName = route.params.claimName

const claimDoc = useClaimDoc(claimName)

const editStatus = ref('')
const editTechnician = ref('')
const editNotes = ref('')
const saving = ref(false)
const savedMsg = ref(false)
const error = ref('')

watch(
  () => claimDoc.data,
  (doc) => {
    if (!doc) return
    editStatus.value = doc.status ?? 'Open'
    editTechnician.value = doc.custom_assigned_technician ?? ''
    editNotes.value = doc.custom_resolution_notes ?? ''
  },
  { immediate: true },
)

watch(
  () => claimDoc.error,
  (e) => {
    if (e) error.value = e?.message ?? 'Failed to load claim'
  },
)

async function saveChanges() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    const updatedDoc = {
      ...claimDoc.data,
      status: editStatus.value,
      custom_assigned_technician: editTechnician.value,
      custom_resolution_notes: editNotes.value,
    }
    const saver = saveClaim(updatedDoc)
    await saver.submit()
    savedMsg.value = true
    setTimeout(() => { savedMsg.value = false }, 2000)
    claimDoc.fetch()
  } catch (e) {
    error.value = e?.message ?? 'Save failed'
  } finally {
    saving.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.slice(0, 10)
}
</script>
