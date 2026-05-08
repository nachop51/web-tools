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

// Bezout: returns (g, x, y) with a*x + b*y = g, sign-preserving for inputs.
export function extendedGcd(a: number, b: number): { g: number; x: number; y: number } {
  const sa = a < 0 ? -1 : 1
  const sb = b < 0 ? -1 : 1
  let aa = Math.abs(Math.trunc(a))
  let bb = Math.abs(Math.trunc(b))
  let x0 = 1,
    y0 = 0,
    x1 = 0,
    y1 = 1
  while (bb !== 0) {
    const q = Math.floor(aa / bb)
    const r = aa - q * bb
    aa = bb
    bb = r
    const nx = x0 - q * x1
    const ny = y0 - q * y1
    x0 = x1
    y0 = y1
    x1 = nx
    y1 = ny
  }
  return { g: aa, x: sa * x0, y: sb * y0 }
}

export function divisorsOf(n: number): number[] {
  n = Math.abs(Math.trunc(n))
  if (n === 0) return []
  if (n === 1) return [1]
  const small: number[] = []
  const large: number[] = []
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      small.push(i)
      if (i !== n / i) large.push(n / i)
    }
  }
  return small.concat(large.reverse())
}

export function pairwiseGcd(nums: number[]): number[][] {
  const n = nums.length
  const m: number[][] = []
  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j < n; j++) {
      row.push(i === j ? Math.abs(Math.trunc(nums[i])) : gcd(nums[i], nums[j]))
    }
    m.push(row)
  }
  return m
}

export function isPairwiseCoprime(nums: number[]): boolean {
  const n = nums.length
  if (n < 2) return false
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (gcd(nums[i], nums[j]) !== 1) return false
    }
  }
  return true
}

// Running reduction: returns one steps[] per consecutive pair (acc, nums[i+1]).
export function reductionChain(nums: number[]): { acc: number; next: number; result: number; steps: GcdStep[] }[] {
  if (nums.length < 2) return []
  const out: { acc: number; next: number; result: number; steps: GcdStep[] }[] = []
  let acc = Math.abs(Math.trunc(nums[0]))
  for (let i = 1; i < nums.length; i++) {
    const next = Math.abs(Math.trunc(nums[i]))
    const steps = gcdSteps(acc, next)
    const result = gcd(acc, next)
    out.push({ acc, next, result, steps })
    acc = result
  }
  return out
}

// ────────── BigInt variants ──────────

function absBig(x: bigint): bigint {
  return x < 0n ? -x : x
}

export function gcdBig(a: bigint, b: bigint): bigint {
  a = absBig(a)
  b = absBig(b)
  while (b !== 0n) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

export function lcmBig(a: bigint, b: bigint): bigint {
  const g = gcdBig(a, b)
  if (g === 0n) return 0n
  return absBig(a * b) / g
}

export function gcdManyBig(nums: bigint[]): bigint {
  if (nums.length === 0) return 0n
  return nums.reduce((acc, n) => gcdBig(acc, n))
}

export function lcmManyBig(nums: bigint[]): bigint {
  if (nums.length === 0) return 0n
  return nums.reduce((acc, n) => lcmBig(acc, n))
}

export type GcdStepBig = { a: bigint; b: bigint; remainder: bigint }

export function gcdStepsBig(a: bigint, b: bigint): GcdStepBig[] {
  a = absBig(a)
  b = absBig(b)
  const steps: GcdStepBig[] = []
  while (b !== 0n) {
    const r = a % b
    steps.push({ a, b, remainder: r })
    a = b
    b = r
  }
  return steps
}

export function extendedGcdBig(a: bigint, b: bigint): { g: bigint; x: bigint; y: bigint } {
  const sa = a < 0n ? -1n : 1n
  const sb = b < 0n ? -1n : 1n
  let aa = absBig(a)
  let bb = absBig(b)
  let x0 = 1n,
    y0 = 0n,
    x1 = 0n,
    y1 = 1n
  while (bb !== 0n) {
    const q = aa / bb
    const r = aa - q * bb
    aa = bb
    bb = r
    const nx = x0 - q * x1
    const ny = y0 - q * y1
    x0 = x1
    y0 = y1
    x1 = nx
    y1 = ny
  }
  return { g: aa, x: sa * x0, y: sb * y0 }
}

export function reductionChainBig(
  nums: bigint[]
): { acc: bigint; next: bigint; result: bigint; steps: GcdStepBig[] }[] {
  if (nums.length < 2) return []
  const out: { acc: bigint; next: bigint; result: bigint; steps: GcdStepBig[] }[] = []
  let acc = absBig(nums[0])
  for (let i = 1; i < nums.length; i++) {
    const next = absBig(nums[i])
    const steps = gcdStepsBig(acc, next)
    const result = gcdBig(acc, next)
    out.push({ acc, next, result, steps })
    acc = result
  }
  return out
}
