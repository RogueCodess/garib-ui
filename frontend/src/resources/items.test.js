import { describe, it, expect } from 'vitest'
import { filterItems, matchesSearch } from './items'

describe('filterItems', () => {
  const items = [
    { item_code: 'AC-SAM-12K', item_name: 'Samsung 12K', item_group: 'Split', brand: 'Samsung', custom_ac_type: 'Split', actual_qty: 3 },
    { item_code: 'AC-LG-18K', item_name: 'LG 18K', item_group: 'Window', brand: 'LG', custom_ac_type: 'Window', actual_qty: 0 },
    { item_code: 'ACC-STAB', item_name: 'Stabilizer', item_group: 'Accessories', brand: 'Generic', custom_ac_type: '', actual_qty: 5 },
  ]

  it('returns all items when no filters', () => {
    expect(filterItems(items, {}, '')).toHaveLength(3)
  })

  it('filters by brand', () => {
    const result = filterItems(items, { brand: 'Samsung' }, '')
    expect(result).toHaveLength(1)
    expect(result[0].brand).toBe('Samsung')
  })

  it('filters by ac_type', () => {
    const result = filterItems(items, { ac_type: 'Window' }, '')
    expect(result).toHaveLength(1)
    expect(result[0].custom_ac_type).toBe('Window')
  })

  it('filters in-stock only', () => {
    const result = filterItems(items, { inStockOnly: true }, '')
    expect(result).toHaveLength(2)
    result.forEach(i => expect(i.actual_qty).toBeGreaterThan(0))
  })

  it('filters by search query on item_code', () => {
    const result = filterItems(items, {}, 'sam')
    expect(result).toHaveLength(1)
    expect(result[0].item_code).toBe('AC-SAM-12K')
  })

  it('filters by search query on item_name', () => {
    const result = filterItems(items, {}, 'stabil')
    expect(result).toHaveLength(1)
    expect(result[0].item_code).toBe('ACC-STAB')
  })

  it('combines brand filter and search', () => {
    const result = filterItems(items, { brand: 'LG' }, 'lg')
    expect(result).toHaveLength(1)
    expect(result[0].brand).toBe('LG')
  })
})
