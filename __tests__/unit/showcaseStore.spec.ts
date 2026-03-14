import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShowcaseStore } from '~/stores/showcaseStore'
import { useDictionaryStore } from '~/stores/dictionaryStore'

describe('showcaseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchMainPage загружает и резолвит данные', async () => {
    const mockResponse = {
      showcase: {
        oid: 'showcase:1',
        name: 'Главная',
        slides: [
          {
            oid: 'slide:1',
            title: {
              oid: 'movie:1',
              title: 'Фильм',
              genres: ['genre:1'],
              labels: [],
              assets: [],
            },
          },
        ],
      },
      dictionaries: {
        'genre:1': { oid: 'genre:1', name: 'Жанр' }
      }
    }

    const mockFetch = vi.fn().mockResolvedValue(mockResponse)
    // @ts-expect-error: глобальный мок для Nuxt $fetch
    vi.stubGlobal('$fetch', mockFetch)

    const store = useShowcaseStore()
    await store.fetchMainPage()

    expect(mockFetch).toHaveBeenCalledWith('/api/main')
    expect(store.data).toBeDefined()
    expect(store.slides).toHaveLength(1)
    expect(store.showcaseName).toBe('Главная')
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()

    vi.unstubAllGlobals()
  })

  it('fetchMainPage обрабатывает ошибку', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    // @ts-expect-error: глобальный мок для Nuxt $fetch
    vi.stubGlobal('$fetch', mockFetch)

    const store = useShowcaseStore()
    await store.fetchMainPage()

    expect(store.error).toBe('Network error')
    expect(store.loading).toBe(false)
    expect(store.data).toBeNull()

    consoleSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('fetchMainPage возвращает кешированные данные без повторного запроса', async () => {
    const mockResponse = {
      showcase: {
        oid: 'showcase:1',
        name: 'Главная',
        slides: [],
      },
      dictionaries: {
        'genre:1': { oid: 'genre:1', name: 'Жанр' }
      }
    }

    const mockFetch = vi.fn().mockResolvedValue(mockResponse)
    // @ts-expect-error: глобальный мок для Nuxt $fetch
    vi.stubGlobal('$fetch', mockFetch)

    const store = useShowcaseStore()
    const dictionaryStore = useDictionaryStore()

    // Первый вызов — загружаем данные
    await store.fetchMainPage()
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Второй вызов — должны получить кеш и не ходить в сеть
    const cached = await store.fetchMainPage()
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(cached).toEqual({
      showcase: store.data,
      dictionaries: dictionaryStore.entities
    })

    vi.unstubAllGlobals()
  })

  it('slides и collections работают при пустом и заполненном состоянии', () => {
    const store = useShowcaseStore()

    expect(store.slides).toEqual([])
    expect(store.collections).toEqual([])
    expect(store.showcaseName).toBe('')

    const showcase: any = {
      name: 'Главная витрина',
      slides: [{ oid: 'slide:1' }],
      collections: [{ oid: 'collection:1' }]
    }

    // @ts-expect-error прямое присвоение для теста геттеров
    store.data = showcase

    expect(store.slides).toEqual(showcase.slides)
    expect(store.collections).toEqual(showcase.collections)
    expect(store.showcaseName).toBe('Главная витрина')
  })
})
