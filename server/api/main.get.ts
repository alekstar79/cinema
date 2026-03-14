import { EntityResolver } from '~/services/resolver/entityResolver.service'

let cachedData: any = null
const apiBaseUrl = 'https://cms.test.ksfr.tech/api/v1'

const entityEndpoints: Record<string, string> = {
  person: 'persons/persons',
  genre: 'metadata/genres',
  label: 'metadata/labels',
  country: 'metadata/countries',
  studio: 'metadata/studios',
}

const createResolverFetcher = (apiBase: string) => {
  return (type: string, id: string) => {
    const endpoint = entityEndpoints[type]
    if (!endpoint) return Promise.resolve(null)
    return $fetch(`${apiBase}/${endpoint}/${id}/`).catch(() => null)
  }
}

/**
 * GET `/api/main`
 *
 * Server-side endpoint that aggregates the main page payload:
 * - Fetches the main showcase document from the upstream API
 * - Fetches dictionary lists (genres, labels, countries, studios)
 * - Resolves OID references inside the showcase via `EntityResolver`
 * - Returns `{ showcase, dictionaries }`
 *
 * The result is cached in-memory to reduce upstream load during SSR/SSG.
 */
export default defineEventHandler(async () => {
  if (cachedData) {
    return cachedData
  }

  try {
    const [
      showcaseResponse,
      genresResponse,
      labelsResponse,
      countriesResponse,
      studiosResponse
    ] = await Promise.all([
      $fetch<any>(`${apiBaseUrl}/showcases/showcases/mainpage/web/`),
      $fetch<any>(`${apiBaseUrl}/metadata/genres/`),
      $fetch<any>(`${apiBaseUrl}/metadata/labels/`),
      $fetch<any>(`${apiBaseUrl}/metadata/countries/`),
      $fetch<any>(`${apiBaseUrl}/metadata/studios/`),
    ])

    const tempDictionary = {
      entities: {} as Record<string, any>,
      getEntity(oid: string) { return this.entities[oid] },
      setEntity(oid: string, data: any) { this.entities[oid] = data }
    }

    const processDictionary = (response: any) => {
      const list = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : []
      list.forEach((item: any) => tempDictionary.setEntity(item.oid, item))
    }

    processDictionary(genresResponse)
    processDictionary(labelsResponse)
    processDictionary(countriesResponse)
    processDictionary(studiosResponse)

    const resolverFetcher = createResolverFetcher(apiBaseUrl)
    const resolver = new EntityResolver(tempDictionary, resolverFetcher)
    const resolvedData = await resolver.resolve(showcaseResponse)

    cachedData = {
      showcase: resolvedData,
      dictionaries: tempDictionary.entities
    }
    return cachedData

  } catch (err: any) {
    console.error('[Server API] Fatal error fetching main data:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch initial data from upstream API.',
    })
  }
})
