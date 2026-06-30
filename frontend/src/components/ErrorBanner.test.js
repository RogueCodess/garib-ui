import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ErrorBanner from './ErrorBanner.vue'

describe('ErrorBanner', () => {
  it('renders when message is non-empty', () => {
    const wrapper = mount(ErrorBanner, { props: { message: 'Something failed' } })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Something failed')
  })

  it('does not render when message is empty string', () => {
    const wrapper = mount(ErrorBanner, { props: { message: '' } })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('hides when dismiss button is clicked', async () => {
    const wrapper = mount(ErrorBanner, { props: { message: 'Error' } })
    await wrapper.find('[aria-label="Dismiss error"]').trigger('click')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('emits retry when retry button is clicked', async () => {
    const wrapper = mount(ErrorBanner, { props: { message: 'Error' } })
    const buttons = wrapper.findAll('button')
    const retryBtn = buttons.find(b => b.text() === 'Retry')
    await retryBtn.trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('re-shows after dismiss when message prop changes', async () => {
    const wrapper = mount(ErrorBanner, { props: { message: 'Error A' } })
    await wrapper.find('[aria-label="Dismiss error"]').trigger('click')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    await wrapper.setProps({ message: 'Error B' })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('re-shows after dismiss when the same message is set again via empty-then-same', async () => {
    const wrapper = mount(ErrorBanner, { props: { message: 'Network error' } })
    await wrapper.find('[aria-label="Dismiss error"]').trigger('click')
    await wrapper.setProps({ message: '' })
    await wrapper.setProps({ message: 'Network error' })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })
})
