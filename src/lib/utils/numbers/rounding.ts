export type RoundingMode = 'half-up' | 'half-down' | 'half-even' | 'ceil' | 'floor' | 'truncate'

export const roundingModes: Array<{ id: RoundingMode; label: string; description: string }> = [
  { id: 'half-up', label: 'Half up', description: 'Standard rounding (0.5 rounds up)' },
  { id: 'half-down', label: 'Half down', description: '0.5 rounds down' },
  { id: 'half-even', label: "Half even (Banker's)", description: '0.5 rounds to nearest even' },
  { id: 'ceil', label: 'Ceiling', description: 'Always round up' },
  { id: 'floor', label: 'Floor', description: 'Always round down' },
  { id: 'truncate', label: 'Truncate', description: 'Drop extra digits' },
]

export function roundDecimal(value: number, decimals: number, mode: RoundingMode): number {
  const factor = Math.pow(10, decimals)
  switch (mode) {
    case 'half-up':
      return Math.round(value * factor) / factor
    case 'half-down':
      return Math.ceil(value * factor - 0.5) / factor
    case 'half-even': {
      const scaled = value * factor
      const floor = Math.floor(scaled)
      const frac = scaled - floor
      if (Math.abs(frac - 0.5) < 1e-10) {
        return (floor % 2 === 0 ? floor : floor + 1) / factor
      }
      return Math.round(scaled) / factor
    }
    case 'ceil':
      return Math.ceil(value * factor) / factor
    case 'floor':
      return Math.floor(value * factor) / factor
    case 'truncate':
      return Math.trunc(value * factor) / factor
  }
}

export function roundSigFigs(value: number, sigFigs: number): number {
  if (value === 0) return 0
  const d = Math.ceil(Math.log10(Math.abs(value)))
  const power = sigFigs - d
  const factor = Math.pow(10, power)
  return Math.round(value * factor) / factor
}
