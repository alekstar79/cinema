// import { isOID, parseOID } from '~/utils/oid.parser'
//
// const SUPPORTED_TYPES = ['person', 'genre', 'label', 'country', 'studio']
//
// export class EntityResolver {
//   constructor(
//     private readonly dictionaryStore: any,
//     private readonly fetcher: (type: string, id: string) => Promise<any>
//   ) {}
//
//   async resolve<T extends object>(data: T): Promise<T> {
//     const oids = this.collectOIDs(data)
//     if (oids.size === 0) return data
//
//     const grouped: Record<string, string[]> = {}
//     for (const oid of oids) {
//       const parsed = parseOID(oid)
//
//       if (!parsed) continue
//       if (!SUPPORTED_TYPES.includes(parsed.type)) continue
//       if (this.dictionaryStore.getEntity(oid)) continue
//
//       const list = grouped[parsed.type] || (grouped[parsed.type] = [])
//       list.push(parsed.id)
//     }
//
//     const promises = Object.entries(grouped)
//       .flatMap(([type, ids]) =>
//         ids.map(async (id) => {
//           try {
//             const data = await this.fetcher(type, id)
//             if (data) this.dictionaryStore.setEntity(`${type}:${id}`, data)
//           } catch (e) {
//             console.warn(`Failed to fetch ${type}:${id}`, e)
//           }
//         })
//     )
//
//     await Promise.allSettled(promises)
//     return this.replaceOIDs(data, this.dictionaryStore.getEntity.bind(this.dictionaryStore))
//   }
//
//   private collectOIDs(obj: any, oids: Set<string> = new Set()): Set<string> {
//     if (!obj || typeof obj !== 'object') return oids
//     if (Array.isArray(obj)) {
//       obj.forEach(item => this.collectOIDs(item, oids))
//     } else {
//       for (const [, value] of Object.entries(obj)) {
//         if (isOID(value)) {
//           oids.add(value as string)
//         } else if (typeof value === 'object' && value !== null) {
//           this.collectOIDs(value, oids)
//         }
//       }
//     }
//
//     return oids
//   }
//
//   private replaceOIDs<T>(obj: T, getEntity: (oid: string) => any): T {
//     if (!obj || typeof obj !== 'object') return obj
//     if (Array.isArray(obj)) {
//       return obj.map(item => this.replaceOIDs(item, getEntity)) as any
//     }
//
//     const result: any = { ...obj }
//     for (const [key, value] of Object.entries(obj)) {
//       if (isOID(value)) {
//         const resolved = getEntity(value as string)
//         result[key] = resolved || value
//       } else if (typeof value === 'object' && value !== null) {
//         result[key] = this.replaceOIDs(value, getEntity)
//       }
//     }
//
//     return result
//   }
// }

import { isOID, parseOID } from '~/utils/oid.parser'

const SUPPORTED_TYPES = ['person', 'genre', 'label', 'country', 'studio']

export class EntityResolver {
  constructor(
    private readonly dictionaryStore: any,
    private readonly fetcher: (type: string, id: string) => Promise<any>
  ) {}

  async resolve<T extends object>(data: T): Promise<T> {
    const oids = this.collectOIDs(data)
    if (oids.size === 0) return data

    const grouped: Record<string, string[]> = {}
    for (const oid of oids) {
      const parsed = parseOID(oid)
      if (!parsed) continue
      if (!SUPPORTED_TYPES.includes(parsed.type)) continue
      if (this.dictionaryStore.getEntity(oid)) continue

      const list = grouped[parsed.type] || (grouped[parsed.type] = [])
      list.push(parsed.id)
    }

    const promises = Object.entries(grouped).flatMap(([type, ids]) =>
      ids.map(async (id) => {
        try {
          const data = await this.fetcher(type, id)
          if (data) this.dictionaryStore.setEntity(`${type}:${id}`, data)
        } catch (e) {
          console.warn(`Failed to fetch ${type}:${id}`, e)
        }
      })
    )

    await Promise.allSettled(promises)
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
      for (const [key, value] of Object.entries(obj)) {
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
