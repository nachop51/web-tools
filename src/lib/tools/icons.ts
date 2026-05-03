/**
 * Maps tool slugs and category IDs to Phosphor icon names.
 * Import the actual icon components in UI files; this module is
 * intentionally framework-agnostic (no solid-js imports).
 */
export const categoryIconName: Record<string, string> = {
  numbers: 'PhHash',
  units: 'PhRuler',
  strings: 'PhTextAa',
  encoding: 'PhBracketsCurly',
}

export const toolIconName: Record<string, string> = {
  // Numbers
  'base-converter': 'PhArrowsLeftRight',
  roman: 'PhScroll',
  'to-words': 'PhTextT',
  // Units
  length: 'PhRuler',
  mass: 'PhScales',
  temperature: 'PhThermometer',
  // Strings
  count: 'PhListNumbers',
  case: 'PhTextAa',
  slugify: 'PhLink',
  trim: 'PhScissors',
  // Encoding
  base64: 'PhBinary',
  url: 'PhGlobe',
  'html-entities': 'PhBracketsCurly',
}
