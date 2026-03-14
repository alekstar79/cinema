import { EntityResolver } from '~/services/resolver/entityResolver.service'
import type { EventHandler, H3Event } from 'h3'

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
    return $fetch(`${apiBase}/${endpoint}/${id}/`)
      .catch(() => null)
  }
}

/**
 * GET `/api/content/:type/:id`
 *
 * Server-side endpoint that fetches a content item from the upstream API and
 * resolves OID references (genres, labels, persons, etc.) into full objects.
 *
 * The resolver uses a per-request in-memory dictionary to avoid cross-request
 * data leaks while still enabling deep OID replacement.
 */
const handler: EventHandler = defineEventHandler(async (event: H3Event) => {
  const { type, id } = event.context.params || {}

  if (!type || !id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing type or id' })
  }

  const apiTypePath = `content/${type}`

  try {
    const rawData = await $fetch<any>(`${apiBaseUrl}/${apiTypePath}/${id}/`)

    const tempDictionary = {
      entities: {} as Record<string, any>,
      getEntity(oid: string) { return this.entities[oid] },
      setEntity(oid: string, data: any) { this.entities[oid] = data }
    }

    const resolverFetcher = createResolverFetcher(apiBaseUrl)
    const resolver = new EntityResolver(tempDictionary, resolverFetcher)

    return await resolver.resolve(rawData)

  } catch (err: any) {
    console.error(`[Server API Content] Failed to fetch ${type}:${id}:`, err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: `Failed to fetch content for ${type}:${id}`,
    })
  }
})

export default handler
