import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShowcaseStore } from '~/stores/showcaseStore'
import { useDictionaryStore } from '~/stores/dictionaryStore'

describe('showcaseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchMainPage loads and stores main page data', async () => {
    const mockResponse = {
      showcase: {
        oid: 'showcase:1',
        name: 'Home',
        slides: [
          {
            oid: 'slide:1',
            title: {
              oid: 'movie:1',
              title: 'Movie',
              genres: ['genre:1'],
              labels: [],
              assets: [],
            },
          },
        ],
      },
      dictionaries: {
        'genre:1': { oid: 'genre:1', name: 'Genre' }
      }
    }

    const mockFetch = vi.fn().mockResolvedValue(mockResponse)
    // @ts-expect-error: global mock for Nuxt $fetch
    vi.stubGlobal('$fetch', mockFetch)

    const store = useShowcaseStore()
    await store.fetchMainPage()

    expect(mockFetch).toHaveBeenCalledWith('/api/main')
    expect(store.data).toBeDefined()
    expect(store.slides).toHaveLength(1)
    expect(store.showcaseName).toBe('Home')
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()

    vi.unstubAllGlobals()
  })

  it('fetchMainPage handles an error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    // @ts-expect-error: global mock for Nuxt $fetch
    vi.stubGlobal('$fetch', mockFetch)

    const store = useShowcaseStore()
    await store.fetchMainPage()

    expect(store.error).toBe('Network error')
    expect(store.loading).toBe(false)
    expect(store.data).toBeNull()

    consoleSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('fetchMainPage returns cached data without a second request', async () => {
    const mockResponse = {
      showcase: {
        oid: 'showcase:1',
        name: 'Home',
        slides: [],
      },
      dictionaries: {
        'genre:1': { oid: 'genre:1', name: 'Genre' }
      }
    }

    const mockFetch = vi.fn().mockResolvedValue(mockResponse)
    // @ts-expect-error: global mock for Nuxt $fetch
    vi.stubGlobal('$fetch', mockFetch)

    const store = useShowcaseStore()
    const dictionaryStore = useDictionaryStore()

    // First call: loads data.
    await store.fetchMainPage()
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Second call: should return cached data without another request.
    const cached = await store.fetchMainPage()
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(cached).toEqual({
      showcase: store.data,
      dictionaries: dictionaryStore.entities
    })

    vi.unstubAllGlobals()
  })

  it('slides and collections getters work for empty and populated state', () => {
    const store = useShowcaseStore()

    expect(store.slides).toEqual([])
    expect(store.collections).toEqual([])
    expect(store.showcaseName).toBe('')

    const showcase: any = {
      name: 'Home showcase',
      slides: [{ oid: 'slide:1' }],
      collections: [{ oid: 'collection:1' }]
    }

    // @ts-expect-error direct assignment for getters test
    store.data = showcase

    expect(store.slides).toEqual(showcase.slides)
    expect(store.collections).toEqual(showcase.collections)
    expect(store.showcaseName).toBe('Home showcase')
  })
})
