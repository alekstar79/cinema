import { isOID, parseOID } from '~/utils/oid.parser'

const SUPPORTED_TYPES = ['person', 'genre', 'label', 'country', 'studio']

/** Maximum number of concurrent upstream requests during resolving. */
const CONCURRENCY_LIMIT = 5

/**
 * Resolves OID references (e.g. `genre:123`) into full entity objects.
 *
 * The resolver:
 * - collects OIDs from an arbitrary object graph (arrays + nested objects)
 * - fetches missing supported entities via provided `fetcher`
 * - stores fetched entities in `dictionaryStore`
 * - replaces OID strings with resolved objects from the dictionary
 */
export class EntityResolver {
  constructor(
    private readonly dictionaryStore: any,
    private readonly fetcher: (type: string, id: string) => Promise<any>
  ) {}

  /**
   * Resolves OID references inside the given data structure.
   * Returns the same shape as input, with OID strings replaced where possible.
   */
  async resolve<T extends object>(data: T): Promise<T> {
    const oids = this.collectOIDs(data)
    if (oids.size === 0) return data

    const grouped: Record<string, string[]> = {}
    for (const oid of oids) {
      const parsed = parseOID(oid)

      if (!parsed || !SUPPORTED_TYPES.includes(parsed.type) || this.dictionaryStore.getEntity(oid)) {
        continue
      }

      const list = grouped[parsed.type] || (grouped[parsed.type] = [])
      list.push(parsed.id)
    }

    // Resolve `person` sequentially to reduce upstream load/limits risk.
    if (grouped.person) {
      for (const id of grouped.person) {
        try {
          const personData = await this.fetcher('person', id)
          if (personData) this.dictionaryStore.setEntity(`person:${id}`, personData)
        } catch (e) {
          console.warn(`Failed to fetch person:${id}`, e)
        }
      }

      delete grouped.person
    }

    // Resolve other types with a concurrency limit.
    const promises: Promise<any>[] = []
    for (const [type, ids] of Object.entries(grouped)) {
      for (const id of ids) {
        promises.push(
          this.fetcher(type, id).then(data => {
            if (data) {
              this.dictionaryStore.setEntity(`${type}:${id}`, data)
            }
          }).catch(e => {
            console.warn(`Failed to fetch ${type}:${id}`, e)
          })
        )
      }
    }

    // Execute promises in chunks to enforce concurrency cap.
    for (let i = 0; i < promises.length; i += CONCURRENCY_LIMIT) {
      const chunk = promises.slice(i, i + CONCURRENCY_LIMIT)
      await Promise.allSettled(chunk)
    }

    return this.replaceOIDs(data, this.dictionaryStore.getEntity.bind(this.dictionaryStore))
  }

  private collectOIDs(obj: any, oids: Set<string> = new Set()): Set<string> {
    if (!obj) return oids
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (typeof item === 'string' && isOID(item)) {
          oids.add(item)
        } else if (item && typeof item === 'object') {
          this.collectOIDs(item, oids)
        }
      })
    } else if (typeof obj === 'object') {
      for (const [, value] of Object.entries(obj)) {
        if (typeof value === 'string' && isOID(value)) {
          oids.add(value)
        } else if (value && typeof value === 'object') {
          this.collectOIDs(value, oids)
        }
      }
    }

    return oids
  }

  private replaceOIDs<T>(obj: T, getEntity: (oid: string) => any): T {
    if (!obj || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) {
      return obj.map(item => {
        if (typeof item === 'string' && isOID(item)) {
          return getEntity(item) || item
        }
        if (item && typeof item === 'object') {
          return this.replaceOIDs(item, getEntity)
        }
        return item
      }) as any
    }

    const result: any = { ...obj }
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && isOID(value)) {
        const resolved = getEntity(value)
        result[key] = resolved || value
      } else if (value && typeof value === 'object') {
        result[key] = this.replaceOIDs(value, getEntity)
      }
    }

    return result
  }
}
