import { describe, it, expect } from 'vitest'
import { formatAssetUrl } from '~/utils/asset.helper'

describe('asset.helper', () => {
  it('formatAssetUrl заменяет {w} и {h} на числа', () => {
    const template = 'https://i.test.ksfr.tech/media/cms/{w}x{h}/poster.jpg'
    expect(formatAssetUrl(template, 300, 450)).toBe('https://i.test.ksfr.tech/media/cms/300x450/poster.jpg')
    expect(formatAssetUrl(template, 100, 0)).toBe('https://i.test.ksfr.tech/media/cms/100x0/poster.jpg')
  })
})