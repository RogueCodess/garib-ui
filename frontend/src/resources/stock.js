import { createListResource } from 'frappe-ui'

export const GA_WAREHOUSES = [
  'Showroom - GA',
  'Main Store - GA',
  'Service Repair - GA',
  'Stores - GA',
]

const COMPANY = 'Garib Appliances'

export function useBinList() {
  return createListResource({
    doctype: 'Bin',
    fields: ['item_code', 'warehouse', 'actual_qty'],
    filters: [['Warehouse', 'company', '=', COMPANY]],
    pageLength: 2000,
    auto: true,
  })
}

/**
 * Pivot a flat Bin list into { [item_code]: { [warehouse]: qty } }.
 * @param {Array<{item_code: string, warehouse: string, actual_qty: number}>} bins
 * @returns {Object}
 */
export function pivotBins(bins) {
  if (!bins) return {}
  const map = {}
  for (const bin of bins) {
    if (!map[bin.item_code]) map[bin.item_code] = {}
    map[bin.item_code][bin.warehouse] =
      (map[bin.item_code][bin.warehouse] ?? 0) + bin.actual_qty
  }
  return map
}
