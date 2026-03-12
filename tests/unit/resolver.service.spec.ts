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

  it('should collect and resolve OIDs', async () => {
    const input = {
      movie: 'movie:123',
      genres: ['genre:1', 'genre:2'],
      nested: { label: 'label:5' }
    }
    mockStore.getEntity.mockReturnValue(null)
    mockFetcher.mockImplementation((type, id) => Promise.resolve({ oid: `${type}:${id}`, name: `Resolved ${type}` }))

    const result = await resolver.resolve(input)

    expect(mockFetcher).toHaveBeenCalledTimes(4)
    expect(mockFetcher).toHaveBeenCalledWith('movie', '123')
    expect(mockFetcher).toHaveBeenCalledWith('genre', '1')
    expect(mockStore.setEntity).toHaveBeenCalledTimes(4)
    expect(result).toEqual({
      movie: { oid: 'movie:123', name: 'Resolved movie' },
      genres: [
        { oid: 'genre:1', name: 'Resolved genre' },
        { oid: 'genre:2', name: 'Resolved genre' }
      ],
      nested: { label: { oid: 'label:5', name: 'Resolved label' } }
    })
  })

  it('should use cached entities', async () => {
    const input = { genre: 'genre:1' }
    mockStore.getEntity.mockReturnValue({ oid: 'genre:1', name: 'Cached' })

    const result = await resolver.resolve(input)

    expect(mockFetcher).not.toHaveBeenCalled()
    expect(result).toEqual({ genre: { oid: 'genre:1', name: 'Cached' } })
  })
})