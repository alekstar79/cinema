import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDictionaryStore } from '~/stores/dictionaryStore'

describe('dictionaryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('setEntity и getEntity работают', () => {
    const store = useDictionaryStore()
    const entity = { oid: 'genre:1', name: 'Test' }

    store.setEntity('genre:1', entity)
    expect(store.getEntity('genre:1')).toStrictEqual(entity) // замена toBe на toStrictEqual
    expect(store.getEntity('unknown')).toBeUndefined()
  })

  it('clear очищает хранилище', () => {
    const store = useDictionaryStore()
    store.setEntity('genre:1', {})
    store.clear()
    expect(store.getEntity('genre:1')).toBeUndefined()
  })

  it('getEntitiesByType возвращает только сущности нужного типа', () => {
    const store = useDictionaryStore()

    store.setEntity('genre:1', { oid: 'genre:1', name: 'Жанр 1' })
    store.setEntity('genre:2', { oid: 'genre:2', name: 'Жанр 2' })
    store.setEntity('label:1', { oid: 'label:1', name: 'Метка' })

    const genres = store.getEntitiesByType('genre')
    const labels = store.getEntitiesByType('label')

    expect(genres).toHaveLength(2)
    expect(genres.every((g: any) => g.oid.startsWith('genre:'))).toBe(true)
    expect(labels).toHaveLength(1)
    expect(labels[0].oid).toBe('label:1')
  })

  it('setAllEntities мержит сущности с существующим состоянием', () => {
    const store = useDictionaryStore()

    store.setEntity('genre:1', { oid: 'genre:1', name: 'Жанр 1' })

    store.setAllEntities({
      'genre:2': { oid: 'genre:2', name: 'Жанр 2' },
      'label:1': { oid: 'label:1', name: 'Метка' }
    })

    expect(store.getEntity('genre:1')).toEqual({ oid: 'genre:1', name: 'Жанр 1' })
    expect(store.getEntity('genre:2')).toEqual({ oid: 'genre:2', name: 'Жанр 2' })
    expect(store.getEntity('label:1')).toEqual({ oid: 'label:1', name: 'Метка' })
  })
})
