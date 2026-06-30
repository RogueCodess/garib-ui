import { describe, it, expect } from 'vitest'
import { pivotBins, GA_WAREHOUSES } from './stock'

describe('pivotBins', () => {
  it('builds pivot map from flat bin list', () => {
    const bins = [
      { item_code: 'AC-SAM-12K', warehouse: 'Showroom - GA', actual_qty: 2 },
      { item_code: 'AC-SAM-12K', warehouse: 'Main Store - GA', actual_qty: 5 },
      { item_code: 'AC-LG-18K',  warehouse: 'Showroom - GA', actual_qty: 0 },
    ]
    const result = pivotBins(bins)
    expect(result['AC-SAM-12K']['Showroom - GA']).toBe(2)
    expect(result['AC-SAM-12K']['Main Store - GA']).toBe(5)
    expect(result['AC-LG-18K']['Showroom - GA']).toBe(0)
  })

  it('returns empty object for empty bin list', () => {
    expect(pivotBins([])).toEqual({})
  })

  it('accumulates qty when same item+warehouse appears twice', () => {
    const bins = [
      { item_code: 'ITEM-A', warehouse: 'WH-1', actual_qty: 3 },
      { item_code: 'ITEM-A', warehouse: 'WH-1', actual_qty: 2 },
    ]
    const result = pivotBins(bins)
    expect(result['ITEM-A']['WH-1']).toBe(5)
  })

  it('returns empty object for null input', () => {
    expect(pivotBins(null)).toEqual({})
  })

  it('returns empty object for undefined input', () => {
    expect(pivotBins(undefined)).toEqual({})
  })
})

describe('GA_WAREHOUSES', () => {
  it('GA_WAREHOUSES contains exactly the 4 Garib Appliances warehouses', () => {
    expect(GA_WAREHOUSES).toContain('Showroom - GA')
    expect(GA_WAREHOUSES).toContain('Main Store - GA')
    expect(GA_WAREHOUSES).toContain('Service Repair - GA')
    expect(GA_WAREHOUSES).toContain('Stores - GA')
    expect(GA_WAREHOUSES).toHaveLength(4)
  })
})
