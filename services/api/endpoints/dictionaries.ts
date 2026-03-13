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

// Кеш для списков справочников
const listCache: Record<string, any[]> = {}

export const createDictionariesApi = (baseURL: string) => ({
  async getEntity(type: string, id: string) {
    const endpoint = endpointMap[type]
    if (!endpoint) {
      console.warn(`Unsupported entity type: ${type}`)
      return null
    }

    // Для person прямой запрос работает
    if (type === 'person') {
      try {
        return await $fetch(`${baseURL}/${endpoint}/${id}/`)
      } catch {
        return null
      }
    }

    // Для всех остальных типов сразу загружаем список (один раз) и ищем по oid
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
