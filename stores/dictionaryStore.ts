import { defineStore } from 'pinia'

interface DictionaryState {
  entities: Record<string, any>
}

/**
 * A simple in-memory dictionary cache for resolved entities.
 *
 * The app resolves OID references (e.g. `genre:123`) into full objects and stores
 * them here, so pages/components can reuse them without additional requests.
 */
export const useDictionaryStore = defineStore('dictionary', {
  state: (): DictionaryState => ({
    entities: {},
  }),

  getters: {
    /**
     * Returns an entity by its OID string (e.g. `genre:123`).
     */
    getEntity: (state) => (oid: string) => state.entities[oid],
    /**
     * Returns all entities of the given type by OID prefix (e.g. `genre:`).
     */
    getEntitiesByType: (state) => (type: string) => {
      return Object.values(state.entities).filter(entity => entity.oid?.startsWith(`${type}:`))
    }
  },

  actions: {
    /**
     * Stores (or overwrites) a single entity in the dictionary.
     */
    setEntity(oid: string, data: any) {
      this.entities[oid] = data
    },
    /**
     * Merges a map of entities into the current dictionary.
     */
    setAllEntities(entities: Record<string, any>) {
      if (entities && typeof entities === 'object') {
        this.entities = { ...this.entities, ...entities }
      }
    },
    /**
     * Clears the dictionary cache.
     * Useful for tests and for explicit reset flows.
     */
    clear() {
      this.entities = {}
    }
  }
})
