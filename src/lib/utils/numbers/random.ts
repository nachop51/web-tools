export type DieSides = 4 | 6 | 8 | 10 | 12 | 20 | 100

export type Stats = {
  count: number
  sum: number
  min: number
  max: number
  mean: number
  median: number
  stdDev: number
}

export type GenerateBatchOpts = {
  mode: 'int' | 'float' | 'gaussian'
  min: number
  max: number
  count: number
  decimals: number
  unique: boolean
  mean: number
  std: number
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number, decimals: number): number {
  const val = Math.random() * (max - min) + min
  return Number(val.toFixed(decimals))
}

export function randomBatch(
  min: number,
  max: number,
  count: number,
  mode: 'int' | 'float',
  decimals: number
): number[] {
  return Array.from({ length: count }, () => (mode === 'int' ? randomInt(min, max) : randomFloat(min, max, decimals)))
}

export function randomGaussian(mean: number, std: number, decimals: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  const val = mean + z * std
  return Number(val.toFixed(decimals))
}

export function rollDice(sides: DieSides, ndice: number): number[] {
  return Array.from({ length: ndice }, () => randomInt(1, sides))
}

export function computeStats(nums: number[]): Stats {
  const count = nums.length
  let sum = 0
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < count; i++) {
    const v = nums[i]
    sum += v
    if (v < min) min = v
    if (v > max) max = v
  }
  const mean = sum / count

  const sorted = nums.slice().sort((a, b) => a - b)
  const median = count % 2 === 0 ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2 : sorted[Math.floor(count / 2)]

  let varSum = 0
  for (let i = 0; i < count; i++) {
    const d = nums[i] - mean
    varSum += d * d
  }
  const stdDev = Math.sqrt(varSum / count)

  return { count, sum, min, max, mean, median, stdDev }
}

function uniqueInts(min: number, max: number, count: number): number[] {
  const rangeSize = max - min + 1
  const n = Math.min(count, rangeSize)

  if (rangeSize <= 10_000) {
    const arr = Array.from({ length: rangeSize }, (_, i) => min + i)
    for (let i = 0; i < n; i++) {
      const j = i + Math.floor(Math.random() * (rangeSize - i))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.slice(0, n)
  }

  const seen = new Set<number>()
  while (seen.size < n) seen.add(randomInt(min, max))
  return [...seen]
}

export function generateBatch(opts: GenerateBatchOpts): number[] {
  const { mode, min, max, count, decimals, unique, mean, std } = opts

  let raw: number[]

  if (mode === 'int') {
    if (unique) {
      raw = uniqueInts(min, max, count)
    } else {
      raw = Array.from({ length: count }, () => randomInt(min, max))
    }
  } else if (mode === 'float') {
    raw = Array.from({ length: count }, () => randomFloat(min, max, decimals))
  } else if (mode === 'gaussian') {
    raw = Array.from({ length: count }, () => randomGaussian(mean, std, decimals))
  } else {
    raw = []
  }

  return raw
}
