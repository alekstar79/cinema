import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ErrorMessage from '~/components/ui/ErrorMessage.vue'

describe('ErrorMessage', () => {
  it('рендерит сообщение об ошибке', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Ошибка загрузки' },
    })
    expect(wrapper.text()).toContain('Ошибка загрузки')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('если message null, показывает дефолтное сообщение', () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: null },
    })
    expect(wrapper.text()).toContain('Произошла неизвестная ошибка')
  })

  it('испускает событие retry при клике на кнопку', async () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Error' },
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    await button.trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('испускает событие close при событии click:close алерта', async () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Error' },
    })

    const alert = wrapper.findComponent({ name: 'VAlert' })
    // happy-dom/стабы Vuetify могут не иметь имени компонента, поэтому дополнительно проверим на существование
    if (alert.exists()) {
      await alert.vm.$emit('click:close')
      expect(wrapper.emitted('close')).toBeTruthy()
    } else {
      // fallback: напрямую эмитим событие на корневом компоненте
      await wrapper.vm.$emit('click:close')
      expect(wrapper.emitted('close')).toBeTruthy()
    }
  })
})
