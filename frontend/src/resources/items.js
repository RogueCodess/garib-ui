import { createListResource, createResource } from 'frappe-ui'

const COMPANY = 'Garib Appliances'

export function useItemList() {
  return createListResource({
    doctype: 'Item',
    // NOTE: actual_qty is NOT a field on Item (it lives on Bin) — including it
    // makes Frappe reject the whole query ("Field not permitted in query"),
    // returning an empty list. Stock-on-hand is merged in from Bin separately.
    fields: [
      'item_code', 'item_name', 'item_group', 'brand',
      'custom_capacity', 'custom_ac_type', 'warranty_period',
      'has_serial_no', 'is_stock_item',
    ],
    filters: [['Item Default', 'company', '=', COMPANY]],
    orderBy: 'item_name asc',
    pageLength: 500,
    auto: true,
  })
}

export function useItemPrices() {
  return createListResource({
    doctype: 'Item Price',
    fields: ['name', 'item_code', 'price_list_rate', 'currency'],
    filters: { price_list: 'Standard Selling' },
    pageLength: 500,
    auto: true,
  })
}

export function updateItemPrice(itemPriceName, newRate) {
  return createResource({
    url: 'frappe.client.set_value',
    params: {
      doctype: 'Item Price',
      name: itemPriceName,
      fieldname: 'price_list_rate',
      value: newRate,
    },
    auto: false,
  })
}

export function useItemDoc(itemCode) {
  return createResource({
    url: 'frappe.client.get',
    params: { doctype: 'Item', name: itemCode },
    auto: false,
  })
}

export function saveItem(doc) {
  return createResource({
    url: 'frappe.client.save',
    params: { doc },
    auto: false,
  })
}

/**
 * Client-side filter of a flat item list.
 * @param {Object[]} items
 * @param {{ brand?: string, ac_type?: string, item_group?: string, inStockOnly?: boolean }} filters
 * @param {string} search - matches item_code or item_name (case-insensitive)
 */
export function filterItems(items, filters, search) {
  const q = search.toLowerCase().trim()
  return items.filter(item => {
    if (filters.brand && item.brand !== filters.brand) return false
    if (filters.ac_type && item.custom_ac_type !== filters.ac_type) return false
    if (filters.item_group && item.item_group !== filters.item_group) return false
    if (filters.inStockOnly && !(item.actual_qty > 0)) return false
    if (q && !item.item_code.toLowerCase().includes(q) && !item.item_name.toLowerCase().includes(q)) return false
    return true
  })
}

export function matchesSearch(item, search) {
  const q = search.toLowerCase().trim()
  if (!q) return true
  return item.item_code.toLowerCase().includes(q) || item.item_name.toLowerCase().includes(q)
}
