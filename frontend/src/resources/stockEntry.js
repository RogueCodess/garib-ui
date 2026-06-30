import { createResource } from 'frappe-ui'

/**
 * Insert a Material Receipt Stock Entry.
 * Returns a createResource instance (auto: false).
 * Call .submit() to execute.
 */
export function insertStockEntry(entryDoc) {
  return createResource({
    url: 'frappe.client.insert',
    params: { doc: entryDoc },
    auto: false,
  })
}

/**
 * Submit a Stock Entry after insert.
 * Must pass the exact `modified` timestamp from the inserted doc
 * to avoid concurrency conflicts (ERPNext v15 requirement).
 */
export function submitStockEntry(name, modified) {
  return createResource({
    url: 'frappe.client.submit',
    params: { doc: { doctype: 'Stock Entry', name, modified } },
    auto: false,
  })
}

/**
 * Fetch a Stock Entry doc (used to get modified timestamp after insert).
 */
export function getStockEntry(name) {
  return createResource({
    url: 'frappe.client.get',
    params: { doctype: 'Stock Entry', name },
    auto: false,
  })
}
