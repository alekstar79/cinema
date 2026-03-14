import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EntityResolver } from '~/services/resolver/entityResolver.service'

describe('EntityResolver', () => {
  let mockStore: any
  let mockFetcher: any
  let resolver: EntityResolver

  beforeEach(() => {
    mockStore = {
      getEntity: vi.fn().mockReturnValue(null),
      setEntity: vi.fn(),
    }
    mockFetcher = vi.fn().mockResolvedValue({ name: 'resolved' })
    resolver = new EntityResolver(mockStore, mockFetcher)
  })

  it('collects supported OIDs and calls fetcher for missing entities', async () => {
    const input = {
      movie: 'movie:123',
      genres: ['genre:1', 'genre:2'],
      nested: { label: 'label:5' },
      ignore: 'not an oid',
    }

    await resolver.resolve(input)

    expect(mockFetcher).toHaveBeenCalledTimes(3)
    expect(mockFetcher).toHaveBeenCalledWith('genre', '1')
    expect(mockFetcher).toHaveBeenCalledWith('genre', '2')
    expect(mockFetcher).toHaveBeenCalledWith('label', '5')
  })

  it('uses cached entities from the dictionary store', async () => {
    const input = { genre: 'genre:1' }
    mockStore.getEntity.mockReturnValue({ oid: 'genre:1', name: 'Cached' })

    const result = await resolver.resolve(input)

    expect(mockFetcher).not.toHaveBeenCalled()
    expect(result).toEqual({ genre: { oid: 'genre:1', name: 'Cached' } })
  })

  it('replaces OIDs with cached objects (including arrays)', async () => {
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

    const result = await resolver.resolve(input)

    expect(result).toEqual({
      data: {
        genre: { oid: 'genre:1', name: 'Genre1' },
        items: [{ oid: 'genre:2', name: 'Genre2' }],
        deep: { label: { oid: 'label:3', name: 'Label3' } },
      },
    })
  })

  it('does not resolve unsupported types', async () => {
    const input = {
      movie: 'movie:123',
      asset: 'asset:456',
    }
    await resolver.resolve(input)

    expect(mockFetcher).not.toHaveBeenCalled()
  })

  it('handles fetch errors for person and other entity types', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const store = {
      getEntity: vi.fn().mockReturnValue(null),
      setEntity: vi.fn(),
    }

    const failingFetcher = vi.fn()
      .mockRejectedValueOnce(new Error('person error'))
      .mockRejectedValueOnce(new Error('genre error'))

    const localResolver = new EntityResolver(store, failingFetcher)

    const input = {
      personRef: 'person:1',
      genreRef: 'genre:2',
    }

    await localResolver.resolve(input)

    expect(failingFetcher).toHaveBeenCalledTimes(2)
    expect(failingFetcher).toHaveBeenCalledWith('person', '1')
    expect(failingFetcher).toHaveBeenCalledWith('genre', '2')

    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  it('loads and stores person entities on a successful response', async () => {
    const store = {
      getEntity: vi.fn().mockReturnValue(null),
      setEntity: vi.fn(),
    }

    const fetcher = vi.fn().mockResolvedValue({ oid: 'person:1', name: 'Person 1' })
    const localResolver = new EntityResolver(store, fetcher)

    const input = {
      personRef: 'person:1',
      other: 'genre:2',
    }

    await localResolver.resolve(input)

    expect(fetcher).toHaveBeenCalledWith('person', '1')
    expect(store.setEntity).toHaveBeenCalledWith('person:1', { oid: 'person:1', name: 'Person 1' })
  })

  it('replaceOIDs correctly handles arrays with objects and primitives', () => {
    const getEntity = (oid: string) => ({ oid, name: 'Entity ' + oid })
    const input = [
      'genre:1',
      { nested: 'label:2' },
      42,
    ]

    // @ts-expect-error calling a private method for coverage
    const result = (resolver as any).replaceOIDs(input, getEntity)

    expect(result[0]).toEqual({ oid: 'genre:1', name: 'Entity genre:1' })
    expect(result[1].nested).toEqual({ oid: 'label:2', name: 'Entity label:2' })
    expect(result[2]).toBe(42)
  })
})
