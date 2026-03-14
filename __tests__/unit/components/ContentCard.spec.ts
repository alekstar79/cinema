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
    title: 'Test movie',
    synopsis: 'Short description.',
    age: 12,
    genres: [{ oid: 'genre:1', name: 'Drama' }],
    labels: [{ oid: 'label:2', name: 'Hit' }],
    assets: [{ oid: 'asset:1', asset_type: 'Poster' as const, resize_url: 'https://i.test/{w}x{h}/poster.jpg' }],
    url: '/content/movies/123',
  }

  it('renders title, synopsis, genres, and labels', () => {
    const wrapper = mount(ContentCard, {
      props: { content: mockContent },
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Test movie')
    expect(wrapper.text()).toContain('Short description.')
    expect(wrapper.text()).toContain('Drama')
    expect(wrapper.text()).toContain('Hit')
  })

  it('truncates a long synopsis', () => {
    const longSynopsis = 'a'.repeat(150)
    const content = { ...mockContent, synopsis: longSynopsis }
    const wrapper = mount(ContentCard, {
      props: { content },
      global: { plugins: [router] },
    })

    const text = wrapper.text()
    expect(text).toContain('…')
  })

  it('renders without poster when no poster asset exists', () => {
    const contentNoPoster = { ...mockContent, assets: [] }
    const wrapper = mount(ContentCard, {
      props: { content: contentNoPoster },
      global: { plugins: [router] },
    })

    const img = wrapper.find('.v-img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBeUndefined()
  })

  it('links to the expected URL', () => {
    const wrapper = mount(ContentCard, {
      props: { content: mockContent },
      global: { plugins: [router] },
    })

    const nuxtLink = wrapper.findComponent({ name: 'NuxtLink' })
    expect(nuxtLink.exists()).toBe(true)
    expect(nuxtLink.props('to')).toBe('/content/movies/123')
  })

  it('passes an SVG placeholder via lazy-src', () => {
    const wrapper = mount(ContentCard, {
      props: { content: mockContent },
      global: { plugins: [router] },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('lazy-src')).toContain('data:image/svg+xml')
  })
})
