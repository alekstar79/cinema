import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EntityResolver } from '~/services/resolver/entityResolver.service'

describe('EntityResolver', () => {
  let mockStore: any
  let mockFetcher: any
  let resolver: EntityResolver

  beforeEach(() => {
    mockStore = {
      getEntity: vi.fn(),
      setEntity: vi.fn(),
    }
    mockFetcher = vi.fn()
    resolver = new EntityResolver(mockStore, mockFetcher)
  })

  it('собирает все OID из объекта', async () => {
    const input = {
      movie: 'movie:123',
      genres: ['genre:1', 'genre:2'],
      nested: { label: 'label:5' },
      ignore: 'not an oid',
    }

    mockStore.getEntity.mockReturnValue(null)
    mockFetcher.mockResolvedValue({ name: 'resolved' })

    await resolver.resolve(input)

    // В текущей реализации SUPPORTED_TYPES = ['person','genre','label','country','studio']
    // В тесте должны быть запрошены genre и label (movie игнорируется)
    expect(mockFetcher).toHaveBeenCalledTimes(3)
    expect(mockFetcher).toHaveBeenCalledWith('genre', '1')
    expect(mockFetcher).toHaveBeenCalledWith('genre', '2')
    expect(mockFetcher).toHaveBeenCalledWith('label', '5')
  })

  it('использует кешированные сущности', async () => {
    const input = { genre: 'genre:1' }

    mockStore.getEntity.mockReturnValue({ oid: 'genre:1', name: 'Cached' })
    mockFetcher.mockResolvedValue({ name: 'new' })

    const result = await resolver.resolve(input)

    expect(mockFetcher).not.toHaveBeenCalled()
    expect(result).toEqual({ genre: { oid: 'genre:1', name: 'Cached' } })
  })

  it('заменяет OID на объекты из кеша', async () => {
    const input = {
      data: {
        genre: 'genre:1',
        items: ['genre:2'],
        deep: { label: 'label:3' },
      },
    }

    mockStore.getEntity.mockImplementation((oid: any) => {
      if (oid === 'genre:1') return { oid: 'genre:1', name: 'Genre1' }
      if (oid === 'genre:2') return { oid: 'genre:2', name: 'Genre2' }
      if (oid === 'label:3') return { oid: 'label:3', name: 'Label3' }
      return null
    })

    mockFetcher.mockResolvedValue(null) // не будет вызван

    const result = await resolver.resolve(input)

    expect(result).toEqual({
      data: {
        genre: { oid: 'genre:1', name: 'Genre1' },
        items: [{ oid: 'genre:2', name: 'Genre2' }],
        deep: { label: { oid: 'label:3', name: 'Label3' } },
      },
    })
  })

  it('не резолвит неподдерживаемые типы', async () => {
    const input = {
      movie: 'movie:123',
      asset: 'asset:456',
    }

    mockStore.getEntity.mockReturnValue(null)
    mockFetcher.mockResolvedValue({})

    await resolver.resolve(input)

    expect(mockFetcher).not.toHaveBeenCalled()
  })
})
