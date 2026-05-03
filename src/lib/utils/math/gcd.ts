export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return (Math.abs(a) / gcd(a, b)) * Math.abs(b)
}

export function gcdMultiple(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((acc, n) => gcd(acc, n))
}

export function lcmMultiple(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((acc, n) => lcm(acc, n))
}
