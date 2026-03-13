import { defineStore } from 'pinia'
import type { Showcase } from '~/types/entities.types'
import { useDictionaryStore } from './dictionaryStore'

interface ShowcaseState {
  data: Showcase | null
  loading: boolean
  error: string | null
}

export const useShowcaseStore = defineStore('showcase', {
  state: (): ShowcaseState => ({
    data: null,
    loading: false,
    error: null
  }),

  getters: {
    slides: (state) => state.data?.slides || [],
    collections: (state) => state.data?.collections || [],
    showcaseName: (state) => state.data?.name || ''
  },

  actions: {
    async fetchMainPage() {
      if (this.data) return this.data

      this.loading = true
      this.error = null

      try {
        const response = await $fetch<any>('/api/main')

        const dictionaryStore = useDictionaryStore()
        dictionaryStore.setAllEntities(response.dictionaries)
        this.data = response.showcase
        
        return this.data

      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load data'
        console.error('Showcase fetch error:', err)
        return null
      } finally {
        this.loading = false
      }
    }
  }
})
