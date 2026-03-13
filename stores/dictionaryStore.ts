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
  },

  actions: {
    setEntity(oid: string, data: any) {
      this.entities[oid] = data
    },

    clear() {
      this.entities = {}
    }
  }
})
