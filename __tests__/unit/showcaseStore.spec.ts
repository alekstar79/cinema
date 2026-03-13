import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShowcaseStore } from '~/stores/showcaseStore'
import { createShowcaseApi } from '~/services/api/endpoints/showcase'

vi.stubGlobal('useRuntimeConfig', () => ({
  public: { apiBaseUrl: '/api' }
}))

vi.mock('~/services/api/endpoints/showcase', () => ({
  createShowcaseApi: vi.fn(() => ({
    getMainPage: vi.fn(),
  })),
}))

vi.mock('~/services/api/endpoints/dictionaries', () => ({
  createDictionariesApi: vi.fn(() => ({
    getEntity: vi.fn(),
  })),
}))

describe('showcaseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchMainPage загружает и резолвит данные', async () => {
    const mockRawData = {
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
    }

    const mockGetMainPage = vi.fn().mockResolvedValue(mockRawData)
    vi.mocked(createShowcaseApi).mockImplementation(() => ({
      getMainPage: mockGetMainPage,
    }))

    const store = useShowcaseStore()
    await store.fetchMainPage()

    expect(mockGetMainPage).toHaveBeenCalled()
    expect(store.data).toBeDefined()
    expect(store.slides).toHaveLength(1)
    expect(store.showcaseName).toBe('Главная')
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchMainPage обрабатывает ошибку', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


    const mockGetMainPage = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.mocked(createShowcaseApi).mockImplementation(() => ({
      getMainPage: mockGetMainPage,
    }))

    const store = useShowcaseStore()
    await store.fetchMainPage()

    expect(store.error).toBe('Network error')
    expect(store.loading).toBe(false)
    expect(store.data).toBeNull()

    consoleSpy.mockRestore()
  })
})
