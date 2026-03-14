export interface ParsedOID {
  type: string;
  id: string;
}

const OID_REGEX = /^[a-zA-Z]+:[a-zA-Z0-9_-]+$/

/**
 * Parses an OID string (e.g. `genre:123`) into `{ type, id }`.
 * Returns `null` for invalid inputs.
 */
export function parseOID(oid: any): ParsedOID | null {
  if (!oid || typeof oid !== 'string') return null
  if (!OID_REGEX.test(oid)) return null

  const separatorIndex = oid.indexOf(':')
  const type = oid.substring(0, separatorIndex)
  const id = oid.substring(separatorIndex + 1)

  return { type, id }
}

/**
 * Type guard that checks whether a value looks like a valid OID string.
 */
export function isOID(value: any): value is string {
  return typeof value === 'string' && OID_REGEX.test(value)
}
