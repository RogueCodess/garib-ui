import { createListResource, createResource } from 'frappe-ui'

const COMPANY = 'Garib Appliances'

// Garib Appliances product/service categories. Used to scope the Items list
// AND the New Item form so the two stay consistent. We filter by item_group
// (a direct Item field) rather than the company on the item_defaults child
// table: the child-table filter [['Item Default','company',...]] resolves to an
// empty set through frappe-ui's frappe.client.get_list path, and this also
// cleanly excludes leftover non-GA (Soeram) items in other groups.
export const GA_ITEM_GROUPS = [
  'Split', 'Window', 'Portable', 'Inverter',
  'Accessories', 'Spare Parts', 'Services',
]

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
    filters: [['item_group', 'in', GA_ITEM_GROUPS]],
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

// Leaf (non-group) Item Groups, for the New Item form's group dropdown.
export function useItemGroups() {
  return createListResource({
    doctype: 'Item Group',
    fields: ['name'],
    filters: [['is_group', '=', 0]],
    orderBy: 'name asc',
    pageLength: 100,
    auto: true,
  })
}

// Brands, for the New Item form's brand dropdown.
export function useBrands() {
  return createListResource({
    doctype: 'Brand',
    fields: ['name'],
    orderBy: 'name asc',
    pageLength: 100,
    auto: true,
  })
}

/**
 * Create a new Item. company is attached via item_defaults so the item shows
 * up in the company-filtered Items list. stock_uom defaults to 'Nos' (the
 * convention used by existing GA items). Naming is by item_code.
 */
export function createItem({ itemCode, itemName, itemGroup, brand, hasSerialNo }) {
  return createResource({
    url: 'frappe.client.insert',
    params: {
      doc: {
        doctype: 'Item',
        item_code: itemCode,
        item_name: itemName,
        item_group: itemGroup,
        brand: brand || undefined,
        stock_uom: 'Nos',
        is_stock_item: 1,
        has_serial_no: hasSerialNo ? 1 : 0,
        item_defaults: [
          { company: COMPANY, default_warehouse: 'Main Store - GA' },
        ],
      },
    },
    auto: false,
  })
}

/**
 * Create a Standard Selling Item Price (SRD) for an item.
 */
export function createItemPrice({ itemCode, rate }) {
  return createResource({
    url: 'frappe.client.insert',
    params: {
      doc: {
        doctype: 'Item Price',
        item_code: itemCode,
        price_list: 'Standard Selling',
        price_list_rate: rate,
        selling: 1,
        currency: 'SRD',
      },
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
