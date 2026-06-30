import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ReceiveStockPage from './ReceiveStockPage.vue'

// Mock all frappe-ui resources
vi.mock('@/resources/stockEntry', () => ({
  insertStockEntry: vi.fn(() => ({ submit: vi.fn() })),
  submitStockEntry: vi.fn(() => ({ submit: vi.fn() })),
  getStockEntry: vi.fn(() => ({ fetch: vi.fn(), data: null })),
}))

vi.mock('@/resources/serials', () => ({
  useSerialDoc: vi.fn(() => ({ fetch: vi.fn(), data: null })),
}))

vi.mock('@/resources/stock', () => ({
  GA_WAREHOUSES: [
    'Showroom - GA', 'Main Store - GA', 'Service Repair - GA', 'Stores - GA',
  ],
}))

vi.mock('@/components/AppSidebar.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components/ErrorBanner.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components/SerialCard.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/router', () => ({ cachedUser: { value: 'admin@example.com' } }))

function mountPage() {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: ReceiveStockPage }] })
  return mount(ReceiveStockPage, { global: { plugins: [router] } })
}

describe('ReceiveStockPage', () => {
  it('submit button is disabled when supplier is empty', async () => {
    const wrapper = mountPage()
    const btn = wrapper.find('[data-testid="submit-btn"]')
    expect(btn.element.disabled).toBe(true)
  })

  it('submit button is disabled when there are no line items with item_code', async () => {
    const wrapper = mountPage()
    await wrapper.find('[data-testid="supplier-input"]').setValue('Test Supplier')
    const btn = wrapper.find('[data-testid="submit-btn"]')
    expect(btn.element.disabled).toBe(true)
  })

  it('submit button is disabled when line item has no qty', async () => {
    const wrapper = mountPage()
    await wrapper.find('[data-testid="supplier-input"]').setValue('Test Supplier')
    await wrapper.find('[data-testid="item-code-0"]').setValue('AC-SAM-12K')
    const btn = wrapper.find('[data-testid="submit-btn"]')
    expect(btn.element.disabled).toBe(true)
  })

  it('submit button is disabled when line item has no serials', async () => {
    const wrapper = mountPage()
    await wrapper.find('[data-testid="supplier-input"]').setValue('Test Supplier')
    await wrapper.find('[data-testid="item-code-0"]').setValue('AC-SAM-12K')
    await wrapper.find('[data-testid="item-qty-0"]').setValue('2')
    const btn = wrapper.find('[data-testid="submit-btn"]')
    expect(btn.element.disabled).toBe(true)
  })

  it('submit button is enabled when supplier + item + qty + serials filled', async () => {
    const wrapper = mountPage()
    await wrapper.find('[data-testid="supplier-input"]').setValue('Test Supplier')
    await wrapper.find('[data-testid="item-code-0"]').setValue('AC-SAM-12K')
    await wrapper.find('[data-testid="item-qty-0"]').setValue('2')
    await wrapper.find('[data-testid="item-serials-0"]').setValue('SN001\nSN002')
    const btn = wrapper.find('[data-testid="submit-btn"]')
    expect(btn.element.disabled).toBe(false)
  })
})
