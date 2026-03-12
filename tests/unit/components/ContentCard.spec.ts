import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ContentCard from '~/components/content/ContentCard.vue'

describe('ContentCard', () => {
  const mockContent = {
    oid: 'movie:123',
    title: 'Test Movie',
    synopsis: 'This is a test movie.',
    age: 12,
    genres: [{ oid: 'genre:1', name: 'Drama' }],
    labels: [],
    assets: [{ asset_type: 'Poster', resize_url: 'https://example.com/{w}x{h}/poster.jpg' }],
    url: '/movie/123'
  }

  it('renders correctly', () => {
    const wrapper = mount(ContentCard, {
      props: { content: mockContent }
    })
    expect(wrapper.text()).toContain('Test Movie')
    expect(wrapper.text()).toContain('This is a test movie')
    expect(wrapper.text()).toContain('Drama')
  })

  it('truncates long synopsis', () => {
    const longSynopsis = 'a'.repeat(200)
    const content = { ...mockContent, synopsis: longSynopsis }
    const wrapper = mount(ContentCard, { props: { content } })
    expect(wrapper.text()).toContain('…')
  })

  it('shows placeholder image when no poster', () => {
    const content = { ...mockContent, assets: [] }
    const wrapper = mount(ContentCard, { props: { content } })
    const img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('src')).toBeUndefined()
  })
})