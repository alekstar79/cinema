import { describe, it, expect } from 'vitest'
import { parseOID, isOID } from '~/utils/oid.parser'

describe('oid.parser', () => {
  it('parseOID корректно разбирает строку', () => {
    expect(parseOID('genre:123')).toEqual({ type: 'genre', id: '123' })
    expect(parseOID('movie:abc-123_xyz')).toEqual({ type: 'movie', id: 'abc-123_xyz' })
  })

  it('parseOID возвращает null для некорректных строк', () => {
    expect(parseOID('')).toBeNull()
    expect(parseOID('genre')).toBeNull()
    expect(parseOID('genre:')).toBeNull()
    expect(parseOID(':123')).toBeNull()
    expect(parseOID('123')).toBeNull()
  })

  it('isOID корректно определяет OID', () => {
    expect(isOID('genre:123')).toBe(true)
    expect(isOID('movie:abc')).toBe(true)
    expect(isOID('')).toBe(false)
    expect(isOID('genre')).toBe(false)
    expect(isOID('123')).toBe(false)
    expect(isOID(null)).toBe(false)
    expect(isOID(undefined)).toBe(false)
    expect(isOID(42)).toBe(false)
  })
})