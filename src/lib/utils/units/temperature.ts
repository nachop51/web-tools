export type TempUnit = 'c' | 'f' | 'k'

export const tempUnitDefs: Record<TempUnit, { label: string }> = {
  c: { label: 'Celsius (°C)' },
  f: { label: 'Fahrenheit (°F)' },
  k: { label: 'Kelvin (K)' },
}

export function convertTemp(value: number, from: TempUnit, to: TempUnit): number {
  if (!isFinite(value)) return NaN
  if (from === to) return value
  // Convert to Celsius first
  let c: number
  if (from === 'c') c = value
  else if (from === 'f') c = ((value - 32) * 5) / 9
  else c = value - 273.15 // k
  // Then from Celsius to target
  if (to === 'c') return c
  if (to === 'f') return (c * 9) / 5 + 32
  return c + 273.15 // k
}

export const tempUnits: TempUnit[] = ['c', 'f', 'k']
