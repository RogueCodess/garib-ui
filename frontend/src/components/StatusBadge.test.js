import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it('applies green class for Active', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Active' } })
    expect(wrapper.classes()).toContain('bg-green-100')
    expect(wrapper.text()).toBe('Active')
  })

  it('applies red class for Expired', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Expired' } })
    expect(wrapper.classes()).toContain('bg-red-100')
  })

  it('applies yellow class for Expiring Soon', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Expiring Soon' } })
    expect(wrapper.classes()).toContain('bg-yellow-100')
  })

  it('applies yellow class for Open', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Open' } })
    expect(wrapper.classes()).toContain('bg-yellow-100')
  })

  it('applies blue class for Work In Progress', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Work In Progress' } })
    expect(wrapper.classes()).toContain('bg-blue-100')
  })

  it('applies gray class for unknown status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Whatever' } })
    expect(wrapper.classes()).toContain('bg-gray-100')
  })
})
