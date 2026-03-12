import { defineStore } from 'pinia'
import type { Showcase } from '~/types/entities.types'
import { showcaseApi } from '~/services/api'
import { useDictionaryStore } from './dictionaryStore'
import { EntityResolver } from '~/services/resolver/entityResolver.service'
import { createDictionariesApi } from '~/services/api/endpoints/dictionaries'

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
      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const clientBase = config.public.apiBaseUrl
        const serverBase = process.env.API_BASE_URL || 'https://cms.test.ksfr.tech/api/v1'
        const apiBase = import.meta.server ? serverBase : clientBase

        const rawData = await showcaseApi.getMainPage()
        const dictionaryStore = useDictionaryStore()
        const dictionariesApi = createDictionariesApi(apiBase)
        const resolver = new EntityResolver(dictionaryStore, dictionariesApi.getEntity)
        this.data = await resolver.resolve(rawData)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load showcase'
        console.error('Showcase fetch error:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
