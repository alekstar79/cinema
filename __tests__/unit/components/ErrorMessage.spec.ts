import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ErrorMessage from '~/components/ui/ErrorMessage.vue'

describe('ErrorMessage', () => {
  it('renders the provided error message', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Loading failed' },
    })
    expect(wrapper.text()).toContain('Loading failed')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('shows a default message when message is null', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: null },
    })
    expect(wrapper.text()).toContain('An unknown error occurred')
  })

  it('emits retry when the button is clicked', async () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Error' },
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    await button.trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('emits close on the alert click:close event', async () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Error' },
    })

    const alert = wrapper.findComponent({ name: 'VAlert' })
    // happy-dom / Vuetify stubs may not expose component names consistently.
    if (alert.exists()) {
      await alert.vm.$emit('click:close')
      expect(wrapper.emitted('close')).toBeTruthy()
    } else {
      // Fallback: emit on the root wrapper.
      await wrapper.vm.$emit('click:close')
      expect(wrapper.emitted('close')).toBeTruthy()
    }
  })
})
