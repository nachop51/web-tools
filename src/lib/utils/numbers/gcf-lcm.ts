export function gcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a))
  b = Math.abs(Math.trunc(b))
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

export function lcm(a: number, b: number): number {
  const g = gcd(a, b)
  if (g === 0) return 0
  return Math.abs(Math.trunc(a) * Math.trunc(b)) / g
}

export function gcdMany(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((acc, n) => gcd(acc, n))
}

export function lcmMany(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((acc, n) => lcm(acc, n))
}

export type GcdStep = { a: number; b: number; remainder: number }

export function gcdSteps(a: number, b: number): GcdStep[] {
  a = Math.abs(Math.trunc(a))
  b = Math.abs(Math.trunc(b))
  const steps: GcdStep[] = []
  while (b !== 0) {
    const r = a % b
    steps.push({ a, b, remainder: r })
    a = b
    b = r
  }
  return steps
}
