/**
 * Replaces `{w}` and `{h}` placeholders in an asset URL template.
 *
 * The upstream CMS returns URLs like `https://.../{w}x{h}/poster.jpg`.
 * This helper makes it safe to build a concrete URL for a requested size.
 */
export function formatAssetUrl(template: string, width: number, height: number = 0): string {
  return template.replace(/\{w\}/g, String(width)).replace(/\{h\}/g, String(height))
}
