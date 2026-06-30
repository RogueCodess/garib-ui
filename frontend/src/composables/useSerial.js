/**
 * Resolve the effective warranty expiry date from available data.
 * Prefers explicit warrantyExpiryDate over computed from purchaseDate + period.
 * @returns {Date|null}
 */
export function resolveExpiry(warrantyPeriodDays, purchaseDate, warrantyExpiryDate) {
  const DAY = 24 * 60 * 60 * 1000
  if (warrantyExpiryDate) return new Date(warrantyExpiryDate)
  if (purchaseDate && warrantyPeriodDays)
    return new Date(new Date(purchaseDate).getTime() + warrantyPeriodDays * DAY)
  return null
}

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
  const expiry = resolveExpiry(warrantyPeriodDays, purchaseDate, warrantyExpiryDate)
  if (!expiry) return 'Unknown'
  const daysLeft = (expiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  if (daysLeft < 0) return 'Expired'
  if (daysLeft <= 30) return 'Expiring Soon'
  return 'Active'
}
