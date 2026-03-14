import { defineStore } from 'pinia'
import type { Showcase } from '~/types/entities.types'
import { useDictionaryStore } from './dictionaryStore'

interface ShowcaseState {
  data: Showcase | null
  loading: boolean
  error: string | null
}

/**
 * Server API response shape for `/api/main`.
 *
 * - `showcase`: main page content (slides, collections, metadata)
 * - `dictionaries`: map of resolved dictionary entities keyed by OID
 */
interface MainPageResponse {
  showcase: Showcase
  dictionaries: Record<string, any>
}

/**
 * Showcase store holds the main payload used across most pages.
 *
 * The store is intentionally minimal:
 * - `data` contains the resolved showcase object
 * - `loading`/`error` represent fetch state
 *
 * Pages in SSG mode hydrate the store from `useAsyncData()` payload to avoid
 * client-side calls to `/api/*` on static hosting (e.g. GitHub Pages).
 */
export const useShowcaseStore = defineStore('showcase', {
  state: (): ShowcaseState => ({
    data: null,
    loading: false,
    error: null
  }),

  getters: {
    /** Returns showcase slides (empty array when not loaded). */
    slides: (state) => state.data?.slides || [],
    /** Returns showcase collections (empty array when not loaded). */
    collections: (state) => state.data?.collections || [],
    /** Returns a user-facing showcase title (empty string when not loaded). */
    showcaseName: (state) => state.data?.name || ''
  },

  actions: {
    /**
     * Loads the main page payload from the internal server API.
     *
     * Behavior:
     * - If both showcase data and dictionary cache are already available, returns cached data.
     * - Otherwise fetches `/api/main`, updates dictionary cache, and stores showcase data.
     *
     * Note:
     * - In static hosting, this action should not be called from the client runtime.
     *   Pages should hydrate the store from `useAsyncData()` payload instead.
     */
    async fetchMainPage(): Promise<MainPageResponse | null> {
      const dictionaryStore = useDictionaryStore()

      if (this.data && Object.keys(dictionaryStore.entities).length) {
        return {
          showcase: this.data,
          dictionaries: dictionaryStore.entities
        }
      }

      this.loading = true
      this.error = null

      try {
        const response = await $fetch<MainPageResponse>('/api/main')

        dictionaryStore.setAllEntities(response.dictionaries)
        this.data = response.showcase
        
        return response

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
