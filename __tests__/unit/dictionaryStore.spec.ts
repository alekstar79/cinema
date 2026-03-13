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
})
