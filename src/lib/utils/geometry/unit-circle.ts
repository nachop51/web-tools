export interface UnitCirclePoint {
  deg: number
  rad: number
  radLabel: string
  cosExact: string
  sinExact: string
  tanExact: string
  cos: number
  sin: number
  tan: number
  quadrant: 1 | 2 | 3 | 4 | 0
}

const SPECIAL: Array<Omit<UnitCirclePoint, 'cos' | 'sin' | 'tan' | 'quadrant'>> = [
  { deg: 0, rad: 0, radLabel: '0', cosExact: '1', sinExact: '0', tanExact: '0' },
  { deg: 30, rad: Math.PI / 6, radLabel: 'π/6', cosExact: '√3/2', sinExact: '1/2', tanExact: '√3/3' },
  { deg: 45, rad: Math.PI / 4, radLabel: 'π/4', cosExact: '√2/2', sinExact: '√2/2', tanExact: '1' },
  { deg: 60, rad: Math.PI / 3, radLabel: 'π/3', cosExact: '1/2', sinExact: '√3/2', tanExact: '√3' },
  { deg: 90, rad: Math.PI / 2, radLabel: 'π/2', cosExact: '0', sinExact: '1', tanExact: 'undefined' },
  { deg: 120, rad: (2 * Math.PI) / 3, radLabel: '2π/3', cosExact: '-1/2', sinExact: '√3/2', tanExact: '-√3' },
  { deg: 135, rad: (3 * Math.PI) / 4, radLabel: '3π/4', cosExact: '-√2/2', sinExact: '√2/2', tanExact: '-1' },
  { deg: 150, rad: (5 * Math.PI) / 6, radLabel: '5π/6', cosExact: '-√3/2', sinExact: '1/2', tanExact: '-√3/3' },
  { deg: 180, rad: Math.PI, radLabel: 'π', cosExact: '-1', sinExact: '0', tanExact: '0' },
  { deg: 210, rad: (7 * Math.PI) / 6, radLabel: '7π/6', cosExact: '-√3/2', sinExact: '-1/2', tanExact: '√3/3' },
  { deg: 225, rad: (5 * Math.PI) / 4, radLabel: '5π/4', cosExact: '-√2/2', sinExact: '-√2/2', tanExact: '1' },
  { deg: 240, rad: (4 * Math.PI) / 3, radLabel: '4π/3', cosExact: '-1/2', sinExact: '-√3/2', tanExact: '√3' },
  { deg: 270, rad: (3 * Math.PI) / 2, radLabel: '3π/2', cosExact: '0', sinExact: '-1', tanExact: 'undefined' },
  { deg: 300, rad: (5 * Math.PI) / 3, radLabel: '5π/3', cosExact: '1/2', sinExact: '-√3/2', tanExact: '-√3' },
  { deg: 315, rad: (7 * Math.PI) / 4, radLabel: '7π/4', cosExact: '√2/2', sinExact: '-√2/2', tanExact: '-1' },
  { deg: 330, rad: (11 * Math.PI) / 6, radLabel: '11π/6', cosExact: '√3/2', sinExact: '-1/2', tanExact: '-√3/3' },
]

function quadrantOf(deg: number): 0 | 1 | 2 | 3 | 4 {
  if (deg === 0 || deg === 90 || deg === 180 || deg === 270) return 0
  if (deg < 90) return 1
  if (deg < 180) return 2
  if (deg < 270) return 3
  return 4
}

export const unitCirclePoints: UnitCirclePoint[] = SPECIAL.map((p) => {
  const cos = Math.cos(p.rad)
  const sin = Math.sin(p.rad)
  const tan = p.tanExact === 'undefined' ? Infinity : Math.tan(p.rad)
  return {
    ...p,
    cos: Math.abs(cos) < 1e-12 ? 0 : cos,
    sin: Math.abs(sin) < 1e-12 ? 0 : sin,
    tan,
    quadrant: quadrantOf(p.deg),
  }
})

export function findPoint(deg: number): UnitCirclePoint | undefined {
  return unitCirclePoints.find((p) => p.deg === deg)
}
