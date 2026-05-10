export type SphereInput = 'radius' | 'diameter' | 'circumference' | 'surfaceArea' | 'volume'

export interface SphereProperties {
  radius: number
  diameter: number
  circumference: number
  surfaceArea: number
  volume: number
}

export function sphereFrom(input: SphereInput, value: number): SphereProperties {
  let r: number
  switch (input) {
    case 'radius':
      r = value
      break
    case 'diameter':
      r = value / 2
      break
    case 'circumference':
      r = value / (2 * Math.PI)
      break
    case 'surfaceArea':
      r = Math.sqrt(value / (4 * Math.PI))
      break
    case 'volume':
      r = Math.cbrt((3 * value) / (4 * Math.PI))
      break
  }
  return {
    radius: r,
    diameter: 2 * r,
    circumference: 2 * Math.PI * r,
    surfaceArea: 4 * Math.PI * r * r,
    volume: (4 / 3) * Math.PI * r * r * r,
  }
}

export const sphereInputs: Array<{ id: SphereInput; label: string; symbol: string }> = [
  { id: 'radius', label: 'Radius', symbol: 'r' },
  { id: 'diameter', label: 'Diameter', symbol: 'd' },
  { id: 'circumference', label: 'Circumference', symbol: 'C' },
  { id: 'surfaceArea', label: 'Surface area', symbol: 'A' },
  { id: 'volume', label: 'Volume', symbol: 'V' },
]
