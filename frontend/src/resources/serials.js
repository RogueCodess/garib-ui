import { createResource, createListResource } from 'frappe-ui'

export function useSerialDoc(serialNo) {
  return createResource({
    url: 'frappe.client.get',
    params: { doctype: 'Serial No', name: serialNo },
    auto: false,
  })
}

export function searchSerials(query) {
  return createListResource({
    doctype: 'Serial No',
    fields: [
      'name', 'item_code', 'item_name', 'warehouse',
      'status', 'customer', 'warranty_expiry_date',
    ],
    filters: query ? [['Serial No', 'name', 'like', `%${query}%`]] : [],
    pageLength: 20,
    auto: false,
  })
}
