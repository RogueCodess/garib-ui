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
 *
 * `frappe.client.submit` runs `frappe.get_doc(doc).submit()` — it rebuilds the
 * document from whatever dict it receives, it does NOT reload from the DB. So
 * the FULL inserted doc (including its `items` child rows and current
 * `modified` timestamp) must be passed; a `{name, modified}` stub would submit
 * an empty entry with no items.
 */
export function submitStockEntry(doc) {
  return createResource({
    url: 'frappe.client.submit',
    params: { doc },
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
