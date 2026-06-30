import { createListResource, createResource } from 'frappe-ui'

export function useClaimList(statusFilter) {
  return createListResource({
    doctype: 'Warranty Claim',
    fields: ['name', 'serial_no', 'item_code', 'customer', 'status', 'creation'],
    filters: statusFilter && statusFilter !== 'All'
      ? [['status', '=', statusFilter]]
      : [],
    // Must be a bare column — a 'Warranty Claim.creation' prefix renders as
    // unquoted SQL (table name has a space) and 500s the whole list.
    orderBy: 'creation desc',
    pageLength: 100,
    auto: true,
  })
}

export function useClaimDoc(claimName) {
  return createResource({
    url: 'frappe.client.get',
    params: { doctype: 'Warranty Claim', name: claimName },
    auto: true,
  })
}

export function updateClaimStatus(claimName, status) {
  return createResource({
    url: 'frappe.client.set_value',
    params: {
      doctype: 'Warranty Claim',
      name: claimName,
      fieldname: 'status',
      value: status,
    },
    auto: false,
  })
}

export function saveClaim(doc) {
  return createResource({
    url: 'frappe.client.save',
    params: { doc },
    auto: false,
  })
}
