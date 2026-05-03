export type UnitDef = { label: string; factor: number }
// factor = how many of the base unit this unit equals
// e.g. for length with base=meters: km factor=1000, cm factor=0.01

export function convert(value: number, fromFactor: number, toFactor: number): number {
  if (!isFinite(value)) return NaN
  return (value * fromFactor) / toFactor
}
