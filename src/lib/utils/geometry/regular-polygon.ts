export type PolygonInput = 'side' | 'apothem' | 'circumradius'

export interface PolygonProperties {
  sides: number
  side: number
  apothem: number
  circumradius: number
  perimeter: number
  area: number
  interiorAngle: number
  centralAngle: number
  interiorAngleSum: number
  name: string
}

export const POLYGON_NAMES: Record<number, string> = {
  3: 'Triangle',
  4: 'Square',
  5: 'Pentagon',
  6: 'Hexagon',
  7: 'Heptagon',
  8: 'Octagon',
  9: 'Nonagon',
  10: 'Decagon',
  11: 'Hendecagon',
  12: 'Dodecagon',
}

export function polygonName(n: number): string {
  return POLYGON_NAMES[n] ?? `${n}-gon`
}

export function regularPolygon(n: number, input: PolygonInput, value: number): PolygonProperties {
  if (n < 3 || !Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error('A polygon needs at least 3 sides.')
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Value must be a positive number.')
  }

  const halfTheta = Math.PI / n
  let side: number
  let apothem: number
  let circumradius: number

  switch (input) {
    case 'side':
      side = value
      apothem = side / (2 * Math.tan(halfTheta))
      circumradius = side / (2 * Math.sin(halfTheta))
      break
    case 'apothem':
      apothem = value
      side = 2 * apothem * Math.tan(halfTheta)
      circumradius = apothem / Math.cos(halfTheta)
      break
    case 'circumradius':
      circumradius = value
      side = 2 * circumradius * Math.sin(halfTheta)
      apothem = circumradius * Math.cos(halfTheta)
      break
  }

  const perimeter = n * side
  const area = 0.5 * perimeter * apothem
  const interiorAngle = ((n - 2) * 180) / n
  const centralAngle = 360 / n
  const interiorAngleSum = (n - 2) * 180

  return {
    sides: n,
    side,
    apothem,
    circumradius,
    perimeter,
    area,
    interiorAngle,
    centralAngle,
    interiorAngleSum,
    name: polygonName(n),
  }
}
