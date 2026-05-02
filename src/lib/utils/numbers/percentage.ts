export function percentOf(pct: number, of: number): number {
  return (pct / 100) * of;
}

export function whatPercent(part: number, whole: number): number {
  return (part / whole) * 100;
}

export function percentChange(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

export function percentError(measured: number, actual: number): number {
  return (Math.abs(measured - actual) / Math.abs(actual)) * 100;
}
