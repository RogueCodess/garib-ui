<template>

    <main class="flex-1 overflow-y-auto p-6 max-w-3xl">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Receive Stock</h1>
        <p class="text-sm text-gray-500 mt-1">Record incoming stock from a supplier.</p>
      </div>

      <ErrorBanner :message="error" />

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Supplier -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
          <input
            v-model="supplier"
            data-testid="supplier-input"
            type="text"
            placeholder="Supplier name"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Target warehouse -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Warehouse</label>
          <select v-model="targetWarehouse" class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full max-w-sm">
            <option v-for="wh in GA_WAREHOUSES" :key="wh" :value="wh">{{ wh }}</option>
          </select>
        </div>

        <!-- Line items -->
        <div>
          <h2 class="text-sm font-medium text-gray-700 mb-3">Items to Receive</h2>
          <div class="space-y-4">
            <div
              v-for="(line, idx) in lines"
              :key="idx"
              class="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Item Code</label>
                  <input
                    v-model="line.itemCode"
                    :data-testid="`item-code-${idx}`"
                    type="text"
                    placeholder="e.g. AC-SAM-12K"
                    class="border border-gray-300 rounded px-3 py-1.5 text-sm w-full"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Qty</label>
                  <input
                    v-model.number="line.qty"
                    :data-testid="`item-qty-${idx}`"
                    type="number"
                    min="1"
                    placeholder="0"
                    class="border border-gray-300 rounded px-3 py-1.5 text-sm w-full"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Serial Numbers (one per line)</label>
                <textarea
                  v-model="line.serials"
                  :data-testid="`item-serials-${idx}`"
                  rows="3"
                  placeholder="SN001&#10;SN002&#10;SN003"
                  class="border border-gray-300 rounded px-3 py-1.5 text-sm w-full resize-y"
                />
              </div>
              <button
                v-if="lines.length > 1"
                type="button"
                @click="removeLine(idx)"
                class="mt-2 text-xs text-red-500 hover:underline"
              >
                Remove item
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="addLine"
            class="mt-3 text-sm text-blue-600 hover:underline"
          >
            + Add another item
          </button>
        </div>

        <!-- Submit -->
        <div class="flex items-center gap-4">
          <button
            type="submit"
            data-testid="submit-btn"
            :disabled="!isValid || submitting"
            class="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ submitting ? 'Submitting…' : 'Receive Stock' }}
          </button>
        </div>
      </form>

      <!-- Success: received serials -->
      <div v-if="receivedSerials.length" class="mt-8">
        <h2 class="text-sm font-medium text-gray-700 mb-3">Received Serials</h2>
        <div class="space-y-3">
          <SerialCard
            v-for="s in receivedSerials"
            :key="s.name"
            :serial="s"
          />
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import ErrorBanner from '@/components/ErrorBanner.vue'
import SerialCard from '@/components/SerialCard.vue'
import { insertStockEntry, submitStockEntry } from '@/resources/stockEntry'
import { useSerialDoc } from '@/resources/serials'
import { GA_WAREHOUSES } from '@/resources/stock'

const supplier = ref('')
const targetWarehouse = ref('Main Store - GA')
const lines = reactive([{ itemCode: '', qty: null, serials: '' }])
const submitting = ref(false)
const error = ref('')
const receivedSerials = ref([])

function addLine() {
  lines.push({ itemCode: '', qty: null, serials: '' })
}

function removeLine(idx) {
  lines.splice(idx, 1)
}

function parseSerials(text) {
  return text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
}

const isValid = computed(() => {
  if (!supplier.value.trim()) return false
  const validLines = lines.filter(l =>
    l.itemCode.trim() && l.qty > 0 && parseSerials(l.serials).length > 0
  )
  return validLines.length > 0
})

async function submitForm() {
  if (!isValid.value || submitting.value) return
  submitting.value = true
  error.value = ''
  receivedSerials.value = []

  try {
    const items = lines
      .filter(l => l.itemCode.trim() && l.qty > 0 && parseSerials(l.serials).length > 0)
      .map(l => ({
        item_code: l.itemCode.trim(),
        qty: l.qty,
        t_warehouse: targetWarehouse.value,
        // ERPNext v15: the legacy serial_no text field is only honored when
        // use_serial_batch_fields is set; otherwise a Serial & Batch Bundle is
        // required and the submit fails. This flag makes v15 auto-create the
        // Serial No records from the typed list on submit.
        use_serial_batch_fields: 1,
        serial_no: parseSerials(l.serials).join('\n'),
      }))

    const entryDoc = {
      doctype: 'Stock Entry',
      stock_entry_type: 'Material Receipt',
      supplier: supplier.value.trim(),
      to_warehouse: targetWarehouse.value,
      items,
    }

    // Insert (docstatus 0). frappe.client.insert returns the full inserted doc,
    // including name, current modified timestamp, and the items child rows.
    const inserter = insertStockEntry(entryDoc)
    await inserter.submit()
    const insertedDoc = inserter.data

    // Submit the full inserted doc — frappe.client.submit rebuilds the document
    // from the dict it receives (it does not reload from the DB), so the whole
    // doc with its items must be passed, not just the name.
    const submitter = submitStockEntry(insertedDoc)
    await submitter.submit()

    // Load received serials
    const allSerials = lines.flatMap(l => parseSerials(l.serials))
    const serialDocs = await Promise.all(
      allSerials.map(async (sn) => {
        const res = useSerialDoc(sn)
        await res.fetch()
        return res.data
      })
    )
    receivedSerials.value = serialDocs.filter(Boolean)

    // Reset form
    supplier.value = ''
    targetWarehouse.value = 'Main Store - GA'
    lines.splice(0, lines.length, { itemCode: '', qty: null, serials: '' })
  } catch (e) {
    error.value = e?.message ?? 'Submit failed'
  } finally {
    submitting.value = false
  }
}
</script>
