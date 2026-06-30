import { describe, it, expect } from 'vitest'
import { warrantyStatus } from './useSerial'

describe('warrantyStatus', () => {
  const DAY = 24 * 60 * 60 * 1000

  it('returns Unknown when no purchase date and no expiry date', () => {
    expect(warrantyStatus(365, null, null)).toBe('Unknown')
  })

  it('returns Active when expiry date is far in the future', () => {
    const future = new Date(Date.now() + 200 * DAY).toISOString().slice(0, 10)
    expect(warrantyStatus(365, null, future)).toBe('Active')
  })

  it('returns Expiring Soon when expiry date is within 30 days', () => {
    const soon = new Date(Date.now() + 15 * DAY).toISOString().slice(0, 10)
    expect(warrantyStatus(365, null, soon)).toBe('Expiring Soon')
  })

  it('returns Expired when expiry date is in the past', () => {
    const past = new Date(Date.now() - 10 * DAY).toISOString().slice(0, 10)
    expect(warrantyStatus(365, null, past)).toBe('Expired')
  })

  it('computes Active from purchaseDate + warrantyPeriod when expiryDate is null (v15 fallback)', () => {
    const purchase = new Date(Date.now() - 30 * DAY).toISOString().slice(0, 10)
    expect(warrantyStatus(365, purchase, null)).toBe('Active')
  })

  it('computes Expired from purchaseDate + warrantyPeriod when expiryDate is null', () => {
    const purchase = new Date(Date.now() - 400 * DAY).toISOString().slice(0, 10)
    expect(warrantyStatus(365, purchase, null)).toBe('Expired')
  })

  it('computes Expiring Soon from purchaseDate + warrantyPeriod when expiryDate is null', () => {
    const purchase = new Date(Date.now() - 345 * DAY).toISOString().slice(0, 10)
    expect(warrantyStatus(365, purchase, null)).toBe('Expiring Soon')
  })

  it('prefers expiryDate over computed date when both provided', () => {
    const purchase = new Date(Date.now() - 400 * DAY).toISOString().slice(0, 10)
    const future = new Date(Date.now() + 200 * DAY).toISOString().slice(0, 10)
    expect(warrantyStatus(365, purchase, future)).toBe('Active')
  })

  it('returns Unknown when warrantyPeriodDays is 0 (no warranty configured)', () => {
    // 0 is falsy — treated as "no warranty period set"
    const purchase = new Date(Date.now() - 30 * DAY).toISOString().slice(0, 10)
    expect(warrantyStatus(0, purchase, null)).toBe('Unknown')
  })

  it('returns Active when purchaseDate is in the future (pre-registered serial)', () => {
    // Future purchaseDate + warrantyPeriodDays → computed expiry also future → Active
    // Bar will show 0% width but status "Active" — this is intentional/documented behavior
    const futurePurchase = new Date(Date.now() + 30 * DAY).toISOString().slice(0, 10)
    expect(warrantyStatus(365, futurePurchase, null)).toBe('Active')
  })
})
