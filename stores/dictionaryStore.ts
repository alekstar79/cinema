import { defineStore } from 'pinia'

interface DictionaryState {
  entities: Record<string, any>
}

export const useDictionaryStore = defineStore('dictionary', {
  state: (): DictionaryState => ({
    entities: {},
  }),

  getters: {
    getEntity: (state) => (oid: string) => state.entities[oid],
    getEntitiesByType: (state) => (type: string) => {
      return Object.values(state.entities).filter(entity => entity.oid?.startsWith(`${type}:`))
    }
  },

  actions: {
    setEntity(oid: string, data: any) {
      this.entities[oid] = data
    },
    setAllEntities(entities: Record<string, any>) {
      if (entities && typeof entities === 'object') {
        this.entities = { ...this.entities, ...entities }
      }
    },
    clear() {
      this.entities = {}
    }
  }
})
