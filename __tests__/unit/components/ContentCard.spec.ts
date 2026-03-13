import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import ContentCard from '~/components/content/ContentCard.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: {} }],
})

describe('ContentCard', () => {
  const mockContent = {
    oid: 'movie:123',
    title: 'Тестовый фильм',
    synopsis: 'Краткое описание.',
    age: 12,
    genres: [{ oid: 'genre:1', name: 'Драма' }],
    labels: [{ oid: 'label:2', name: 'Хит' }],
    assets: [{ oid: 'asset:1', asset_type: 'Poster' as const, resize_url: 'https://i.test/{w}x{h}/poster.jpg' }],
    url: '/content/movies/123',
  }

  it('рендерит название, синопсис, жанры и метки', () => {
    const wrapper = mount(ContentCard, {
      props: { content: mockContent },
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Тестовый фильм')
    expect(wrapper.text()).toContain('Краткое описание.')
    expect(wrapper.text()).toContain('Драма')
    expect(wrapper.text()).toContain('Хит')
  })

  it('обрезает длинный синопсис', () => {
    const longSynopsis = 'а'.repeat(150)
    const content = { ...mockContent, synopsis: longSynopsis }
    const wrapper = mount(ContentCard, {
      props: { content },
      global: { plugins: [router] },
    })

    const text = wrapper.text()
    expect(text).toContain('…')
  })

  it('показывает заглушку если нет постера', () => {
    const contentNoPoster = { ...mockContent, assets: [] }
    const wrapper = mount(ContentCard, {
      props: { content: contentNoPoster },
      global: { plugins: [router] },
    })

    const img = wrapper.find('.v-img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBeUndefined()
  })

  it('содержит ссылку на правильный URL', () => {
    const wrapper = mount(ContentCard, {
      props: { content: mockContent },
      global: { plugins: [router] },
    })

    const nuxtLink = wrapper.findComponent({ name: 'NuxtLink' })
    expect(nuxtLink.exists()).toBe(true)
    expect(nuxtLink.props('to')).toBe('/content/movies/123')
  })
})
