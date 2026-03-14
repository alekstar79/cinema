import { $fetch } from 'ofetch'

const endpointMap: Record<string, string> = {
  genre: 'metadata/genres',
  label: 'metadata/labels',
  country: 'metadata/countries',
  person: 'persons/persons',
  studio: 'metadata/studios',
  job: 'metadata/jobs',
  kind: 'metadata/kind',
  reward: 'metadata/rewards',
}

/**
 * In-memory cache for dictionary list endpoints.
 * Used to avoid refetching full lists for non-person entities.
 */
const listCache: Record<string, any[]> = {}

/**
 * Creates a small dictionaries API client.
 *
 * Note: for most entity types the upstream provides list endpoints, so we fetch
 * the full list once and then resolve items by `oid`.
 */
export const createDictionariesApi = (baseURL: string) => ({
  async getEntity(type: string, id: string) {
    const endpoint = endpointMap[type]
    if (!endpoint) {
      console.warn(`Unsupported entity type: ${type}`)
      return null
    }

    // For `person` a direct entity request works reliably.
    if (type === 'person') {
      try {
        return await $fetch(`${baseURL}/${endpoint}/${id}/`)
      } catch {
        return null
      }
    }

    // For all other types, fetch the list once and resolve by `oid`.
    if (!listCache[type]) {
      try {
        listCache[type] = await $fetch(`${baseURL}/${endpoint}/`)
      } catch {
        return null
      }
    }

    const found = listCache[type].find(item => item.oid === `${type}:${id}`)
    return found || null
  },
})
