export function formatAssetUrl(template: string, width: number, height: number = 0): string {
  return template.replace(/\{w\}/g, String(width)).replace(/\{h\}/g, String(height))
}
