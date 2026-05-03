export function roundTo(n: number, places: number): number {
  return Number(n.toFixed(places))
}

export function floorTo(n: number, places: number): number {
  const factor = 10 ** places
  return Math.floor(n * factor) / factor
}

export function ceilTo(n: number, places: number): number {
  const factor = 10 ** places
  return Math.ceil(n * factor) / factor
}

export function truncateTo(n: number, places: number): number {
  const factor = 10 ** places
  return Math.trunc(n * factor) / factor
}

export function toSigFigs(n: number, sig: number): number {
  return parseFloat(n.toPrecision(sig))
}
