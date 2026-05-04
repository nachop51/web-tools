export const URL_TEXT_MAX = 4000

export function urlText(value: string): string | undefined {
  if (!value) return undefined
  if (value.length > URL_TEXT_MAX) return undefined
  return value
}
