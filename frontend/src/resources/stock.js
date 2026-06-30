import { createListResource } from 'frappe-ui'

export const GA_WAREHOUSES = [
  'Showroom - GA',
  'Main Store - GA',
  'Service Repair - GA',
  'Stores - GA',
]

export function useBinList() {
  return createListResource({
    doctype: 'Bin',
    fields: ['item_code', 'warehouse', 'actual_qty'],
    // Bin's warehouse is a LINK, not a child table — filtering as
    // [['Warehouse', 'company', ...]] makes Frappe attempt a child-table join
    // and 500s ("Unknown column tabWarehouse.parenttype"). Filter the warehouse
    // field directly against the known GA warehouse list instead.
    filters: [['warehouse', 'in', GA_WAREHOUSES]],
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
