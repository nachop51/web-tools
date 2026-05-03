import type { UnitDef } from './converter'

export const speedUnits: Record<string, UnitDef> = {
  'm/s': { label: 'm/s (meters/second)', factor: 1 },
  'km/h': { label: 'km/h (kilometers/hour)', factor: 0.277778 },
  mph: { label: 'mph (miles/hour)', factor: 0.44704 },
  'ft/s': { label: 'ft/s (feet/second)', factor: 0.3048 },
  kn: { label: 'kn (knots)', factor: 0.514444 },
  mach: { label: 'mach (at sea level)', factor: 343 },
}

export const speedUnitKeys = Object.keys(speedUnits) as (keyof typeof speedUnits)[]
