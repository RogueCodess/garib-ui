/**
 * Compute warranty status from available date data.
 * ERPNext v15 does not populate warrantyExpiryDate on Serial No until POS Close.
 * When it's null we fall back to: purchaseDate + warrantyPeriodDays.
 *
 * @param {number|null} warrantyPeriodDays  - Item.warranty_period (days)
 * @param {string|null} purchaseDate        - Serial No purchase_date (YYYY-MM-DD)
 * @param {string|null} warrantyExpiryDate  - Serial No warranty_expiry_date (YYYY-MM-DD)
 * @returns {'Active'|'Expiring Soon'|'Expired'|'Unknown'}
 */
export function warrantyStatus(warrantyPeriodDays, purchaseDate, warrantyExpiryDate) {
  const DAY = 24 * 60 * 60 * 1000
  const now = Date.now()

  let expiryMs = null

  if (warrantyExpiryDate) {
    expiryMs = new Date(warrantyExpiryDate).getTime()
  } else if (purchaseDate && warrantyPeriodDays) {
    expiryMs = new Date(purchaseDate).getTime() + warrantyPeriodDays * DAY
  }

  if (expiryMs === null) return 'Unknown'

  const daysLeft = (expiryMs - now) / DAY

  if (daysLeft < 0) return 'Expired'
  if (daysLeft <= 30) return 'Expiring Soon'
  return 'Active'
}
