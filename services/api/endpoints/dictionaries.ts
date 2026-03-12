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

export type DictionariesApi = {
  getEntity(type: string, id: string): Promise<any>
}

export const createDictionariesApi = (baseURL: string): DictionariesApi => ({
  async getEntity(type: string, id: string) {
    const endpoint = endpointMap[type]
    if (!endpoint) {
      console.warn(`Unsupported entity type: ${type}`)
      return null
    }
    let lastError
    for (let i = 0; i < 3; i++) {
      try {
        return await $fetch(`${baseURL}/${endpoint}/${id}/`)
      } catch (e) {
        lastError = e
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
      }
    }
    throw lastError
  },
})
