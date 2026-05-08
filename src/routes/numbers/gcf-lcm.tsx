import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Index, onMount, Show } from 'solid-js'
import { TbOutlineX, TbOutlinePlus, TbOutlineChevronDown } from 'solid-icons/tb'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import {
  divisorsOf,
  extendedGcd,
  extendedGcdBig,
  gcdMany,
  gcdManyBig,
  isPairwiseCoprime,
  lcmMany,
  lcmManyBig,
  pairwiseGcd,
  reductionChain,
  reductionChainBig,
} from '~/lib/utils/numbers/gcf-lcm'
import { primeFactorsGrouped } from '~/lib/utils/math/primes'
import { setToolPageMeta } from '~/lib/seo'
import { cn } from '~/lib/utils'

function parseNums(s: string): string[] {
  return s
    .split(',')
    .map((n) => n.trim())
    .filter((n) => /^-?\d+$/.test(n) && n !== '0' && n !== '-0')
}

function needsBig(s: string): boolean {
  const t = s.replace(/^-/, '').trim()
  return /^\d+$/.test(t) && t.length >= 16
}

function parseNum(s: string): number | null {
  const t = s.trim()
  if (!/^-?\d+$/.test(t)) return null
  const v = parseInt(t, 10)
  if (isNaN(v) || v === 0) return null
  return v
}

function parseBig(s: string): bigint | null {
  const t = s.trim()
  if (!/^-?\d+$/.test(t)) return null
  try {
    const v = BigInt(t)
    return v === 0n ? null : v
  } catch {
    return null
  }
}

const PAIRWISE_CAP = 8
const DIVISOR_CAP = 64

export default function GcfLcm() {
  setToolPageMeta('numbers', 'gcf-lcm')
  const [params, setParams] = useSearchParams<{ nums?: string }>()

  const initialNums = params.nums ? parseNums(params.nums) : ['']
  const [nums, setNums] = createSignal<string[]>(initialNums.length > 0 ? initialNums : [''])
  const [showSteps, setShowSteps] = createSignal(false)

  const bigMode = createMemo(() => nums().some(needsBig))

  const parsed = createMemo(() => {
    if (bigMode()) return [] as number[]
    const out: number[] = []
    for (const s of nums()) {
      const v = parseNum(s)
      if (v !== null) out.push(v)
    }
    return out
  })

  const parsedBig = createMemo(() => {
    const out: bigint[] = []
    for (const s of nums()) {
      const v = parseBig(s)
      if (v !== null) out.push(v)
    }
    return out
  })

  const validCount = createMemo(() => (bigMode() ? parsedBig().length : parsed().length))

  const gcf = createMemo<number | bigint | null>(() => {
    if (bigMode()) {
      const ns = parsedBig()
      return ns.length < 1 ? null : gcdManyBig(ns)
    }
    const ns = parsed()
    return ns.length < 1 ? null : gcdMany(ns)
  })

  const lcmVal = createMemo<number | bigint | null>(() => {
    if (bigMode()) {
      const ns = parsedBig()
      return ns.length < 1 ? null : lcmManyBig(ns)
    }
    const ns = parsed()
    return ns.length < 1 ? null : lcmMany(ns)
  })

  const isCoprime = createMemo(() => {
    const g = gcf()
    return g === 1 || g === 1n
  })

  const pairwiseCoprime = createMemo(() => {
    if (bigMode() || parsed().length < 3) return false
    return isPairwiseCoprime(parsed())
  })

  // Two-input only: Bezout, fraction view, identity strip
  const bezout = createMemo(() => {
    if (bigMode()) {
      const ns = parsedBig()
      if (ns.length !== 2) return null
      return extendedGcdBig(ns[0], ns[1])
    }
    const ns = parsed()
    if (ns.length !== 2) return null
    return extendedGcd(ns[0], ns[1])
  })

  const fractionView = createMemo(() => {
    if (bigMode()) {
      const ns = parsedBig()
      if (ns.length !== 2) return null
      const g = gcf() as bigint | null
      if (!g || g === 0n) return null
      return { a: ns[0], b: ns[1], ar: ns[0] / g, br: ns[1] / g }
    }
    const ns = parsed()
    if (ns.length !== 2) return null
    const g = gcf() as number | null
    if (!g) return null
    return { a: ns[0], b: ns[1], ar: ns[0] / g, br: ns[1] / g }
  })

  // n=2 identity: GCF × LCM = |a × b|
  const identity = createMemo(() => {
    if (validCount() !== 2 || gcf() === null || lcmVal() === null) return null
    if (bigMode()) {
      const ns = parsedBig()
      const p = ns[0] * ns[1]
      return {
        a: ns[0],
        b: ns[1],
        product: p < 0n ? -p : p,
      }
    }
    const ns = parsed()
    return {
      a: ns[0],
      b: ns[1],
      product: Math.abs(ns[0] * ns[1]),
    }
  })

  // Prime factor grid (number mode only)
  const factorGrid = createMemo(() => {
    if (bigMode()) return null
    const ns = parsed()
    if (ns.length < 1) return null
    const groups = ns.map((n) => primeFactorsGrouped(Math.abs(n)))
    const primeSet = new Set<number>()
    for (const g of groups) for (const { prime } of g) primeSet.add(prime)
    const primes = Array.from(primeSet).sort((a, b) => a - b)
    if (primes.length === 0) return null
    const exponents: number[][] = primes.map((p) =>
      groups.map((g) => g.find((e) => e.prime === p)?.exponent ?? 0)
    )
    let maxE = 0
    for (const row of exponents) for (const e of row) if (e > maxE) maxE = e
    return { primes, exponents, inputs: ns, maxExp: maxE, groups }
  })

  const commonDivisors = createMemo(() => {
    if (bigMode()) return null
    const g = gcf()
    if (typeof g !== 'number' || g <= 0) return null
    return divisorsOf(g)
  })

  const pairwiseMatrix = createMemo(() => {
    if (bigMode()) return null
    const ns = parsed()
    if (ns.length < 3) return null
    const slice = ns.slice(0, PAIRWISE_CAP)
    return { matrix: pairwiseGcd(slice), labels: slice, total: ns.length }
  })

  const reduction = createMemo(() => {
    if (bigMode()) {
      const ns = parsedBig()
      return ns.length < 2 ? [] : reductionChainBig(ns)
    }
    const ns = parsed()
    return ns.length < 2 ? [] : reductionChain(ns)
  })

  function updateNum(i: number, val: string) {
    const updated = nums().map((n, idx) => (idx === i ? val : n))
    setNums(updated)
    syncUrl(updated)
  }

  function syncUrl(list: string[]) {
    const valid = list
      .map((s) => s.trim())
      .filter((s) => /^-?\d+$/.test(s) && s !== '0' && s !== '-0')
    setParams({ nums: valid.length > 0 ? valid.join(',') : undefined }, { replace: true })
  }

  function addNum() {
    const updated = [...nums(), '']
    setNums(updated)
    // focus the new chip after render
    queueMicrotask(() => {
      const inputs = chipsRef?.querySelectorAll<HTMLInputElement>('input[data-num-chip]')
      inputs?.[inputs.length - 1]?.focus()
    })
  }

  function removeNum(i: number) {
    if (nums().length <= 1) return
    const updated = nums().filter((_, idx) => idx !== i)
    setNums(updated)
    syncUrl(updated)
  }

  // Heatmap intensity for prime-factor cell
  function expCellClass(e: number, maxE: number): string {
    if (e === 0) return 'text-muted-foreground/30'
    if (maxE <= 1) return 'text-foreground'
    const pct = e / maxE
    if (pct >= 0.85) return 'bg-violet/20 text-violet font-bold'
    if (pct >= 0.6) return 'bg-violet/12 text-violet font-semibold'
    if (pct >= 0.35) return 'bg-violet/[0.06] text-foreground font-semibold'
    return 'text-foreground'
  }

  let firstInputRef: HTMLInputElement | undefined
  let chipsRef: HTMLDivElement | undefined
  onMount(() => {
    firstInputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="GCF / LCM"
        description="Greatest Common Factor and Least Common Multiple of integers, with prime factorization, Bezout coefficients, and divisibility insight."
      />

      <Show when={bigMode()}>
        <div
          class="anim-fade-in mb-4 flex flex-wrap items-center gap-3 border-l-2 border-violet bg-violet/5 px-4 py-2 text-xs"
          role="status"
        >
          <span class="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-violet">
            <span class="size-1.5 rounded-full bg-violet" />
            BigInt mode
          </span>
          <span class="text-muted-foreground">
            inputs ≥ 16 digits — prime-factor grid and divisor list are hidden in this mode
          </span>
        </div>
      </Show>

      <div class="anim-fade-up flex flex-col gap-8" style={{ 'animation-delay': '60ms' }}>
        {/* ─────────── Inputs: chip strip ─────────── */}
        <section aria-labelledby="inputs-label">
          <div class="mb-2 flex items-baseline justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2
                id="inputs-label"
                class="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Numbers
              </h2>
            </div>
            <span class="font-mono text-[11px] tabular-nums text-muted-foreground">
              {validCount()} valid · {nums().length} {nums().length === 1 ? 'slot' : 'slots'}
            </span>
          </div>

          <div
            ref={chipsRef}
            class="flex flex-wrap items-stretch gap-2 border border-border bg-card px-3 py-3"
          >
            <Index each={nums()}>
              {(val, i) => {
                const isInvalid = () => {
                  const t = val().trim()
                  if (t === '') return false
                  return !/^-?\d+$/.test(t) || t === '0' || t === '-0'
                }
                return (
                  <div
                    class={cn(
                      'group relative inline-flex h-10 items-stretch border bg-background transition-colors focus-within:border-violet focus-within:ring-1 focus-within:ring-violet/40',
                      isInvalid() ? 'border-destructive/60' : 'border-input',
                      val().trim() && !isInvalid() && 'border-violet/30'
                    )}
                  >
                    <span class="flex items-center pl-2.5 pr-1 font-mono text-[10px] tabular-nums text-muted-foreground/60">
                      {i + 1}
                    </span>
                    <input
                      ref={(el) => {
                        if (i === 0) firstInputRef = el
                      }}
                      data-num-chip
                      type="text"
                      inputmode="numeric"
                      pattern="-?\d*"
                      value={val()}
                      onInput={(e) => updateNum(i, e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addNum()
                        } else if (
                          e.key === 'Backspace' &&
                          val() === '' &&
                          nums().length > 1
                        ) {
                          e.preventDefault()
                          removeNum(i)
                          queueMicrotask(() => {
                            const inputs =
                              chipsRef?.querySelectorAll<HTMLInputElement>('input[data-num-chip]')
                            const target = i > 0 ? i - 1 : 0
                            inputs?.[target]?.focus()
                          })
                        }
                      }}
                      placeholder="—"
                      aria-label={`Number ${i + 1}`}
                      class={cn(
                        'w-32 bg-transparent px-1 py-0 font-mono text-base tabular-nums outline-none placeholder:text-muted-foreground/40',
                        isInvalid() && 'text-destructive'
                      )}
                    />
                    <Show when={nums().length > 1}>
                      <button
                        type="button"
                        onClick={() => removeNum(i)}
                        aria-label={`Remove number ${i + 1}`}
                        class="inline-flex w-7 cursor-pointer items-center justify-center text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <TbOutlineX size={13} />
                      </button>
                    </Show>
                  </div>
                )
              }}
            </Index>

            <button
              type="button"
              onClick={addNum}
              aria-label="Add number"
              class="inline-flex h-10 w-10 cursor-pointer items-center justify-center border border-dashed border-input bg-background text-muted-foreground transition-colors hover:border-violet hover:bg-violet/5 hover:text-violet"
              title="Add (or press Enter)"
            >
              <TbOutlinePlus size={16} />
            </button>
          </div>

          <p class="mt-1.5 px-1 font-mono text-[10px] text-muted-foreground/70">
            Enter to add · Backspace on empty to remove · zero is excluded
          </p>
        </section>

        {/* ─────────── Hero result strip ─────────── */}
        <Show when={validCount() > 0}>
          <section
            aria-label="Result"
            class="relative grid border border-border bg-card overflow-hidden lg:grid-cols-2"
          >
            {/* GCF panel — violet emphasis */}
            <div class="relative flex flex-col gap-2 border-b border-border bg-violet/[0.04] px-6 py-6 lg:border-b-0 lg:border-r sm:px-8 sm:py-7">
              <div class="flex items-center gap-2">
                <span
                  aria-hidden
                  class="inline-block h-3 w-1 bg-violet"
                />
                <span class="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet">
                  Greatest common factor
                </span>
              </div>
              <div class="flex items-baseline gap-3">
                <span class="break-all font-mono text-4xl font-bold leading-none tabular-nums text-violet sm:text-5xl">
                  {String(gcf() ?? '—')}
                </span>
                <CopyButton value={() => String(gcf() ?? '')} />
              </div>
              <Show when={isCoprime() || pairwiseCoprime()}>
                <div class="mt-1 flex flex-wrap gap-1.5">
                  <Show when={isCoprime()}>
                    <span class="inline-flex items-center gap-1.5 border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <span class="size-1.5 rounded-full bg-emerald-500" />
                      <Show when={validCount() >= 3} fallback="coprime">
                        setwise coprime
                      </Show>
                    </span>
                  </Show>
                  <Show when={pairwiseCoprime()}>
                    <span class="inline-flex items-center gap-1.5 border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      pairwise coprime
                    </span>
                  </Show>
                </div>
              </Show>
            </div>

            {/* LCM panel */}
            <div class="flex flex-col gap-2 px-6 py-6 sm:px-8 sm:py-7">
              <div class="flex items-center gap-2">
                <span aria-hidden class="inline-block h-3 w-1 bg-foreground/30" />
                <span class="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Least common multiple
                </span>
              </div>
              <div class="flex items-baseline gap-3">
                <span class="break-all font-mono text-4xl font-bold leading-none tabular-nums text-foreground sm:text-5xl">
                  {String(lcmVal() ?? '—')}
                </span>
                <CopyButton value={() => String(lcmVal() ?? '')} />
              </div>
              <span class="mt-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                {validCount()} {validCount() === 1 ? 'input' : 'inputs'}
              </span>
            </div>

            {/* Identity strip — n=2 only, runs across the bottom */}
            <Show when={identity()}>
              {(id) => (
                <div class="col-span-full border-t border-border bg-muted/30 px-6 py-2.5 font-mono text-[12px] sm:px-8">
                  <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 tabular-nums">
                    <span class="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                      identity
                    </span>
                    <span class="text-violet">{String(gcf())}</span>
                    <span class="text-muted-foreground">×</span>
                    <span class="text-foreground">{String(lcmVal())}</span>
                    <span class="text-muted-foreground">=</span>
                    <span class="font-bold text-foreground">{String(id().product)}</span>
                    <span class="text-muted-foreground">=</span>
                    <span class="text-muted-foreground">
                      |{String(id().a)} × {String(id().b)}|
                    </span>
                  </div>
                </div>
              )}
            </Show>
          </section>
        </Show>

        {/* ─────────── n=2 supplements: fraction + Bezout in one row ─────────── */}
        <Show when={validCount() === 2 && (fractionView() || bezout())}>
          <section class="anim-fade-in grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
            {/* Fraction reduction */}
            <Show
              when={(() => {
                const fv = fractionView()
                return fv && fv.b !== 0 && fv.b !== 0n
              })()}
            >
              {(() => {
                const fv = fractionView()!
                return (
                  <div class="flex min-w-0 flex-col gap-2 border border-border bg-card px-5 py-4">
                    <div class="flex items-center gap-2">
                      <span aria-hidden class="size-2 rounded-full bg-violet" />
                      <span class="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Fraction reduction
                      </span>
                    </div>
                    <div
                      class={cn(
                        'flex items-baseline justify-center gap-3 py-1 font-mono tabular-nums',
                        bigMode() ? 'flex-col items-stretch text-sm' : 'text-2xl'
                      )}
                    >
                      <span class="break-all text-muted-foreground">
                        {String(fv.a)}
                        <span class="mx-1 text-muted-foreground/40">/</span>
                        {String(fv.b)}
                      </span>
                      <span
                        class={cn(
                          'text-muted-foreground/60',
                          bigMode() ? 'self-center text-xs' : 'text-base'
                        )}
                      >
                        →
                      </span>
                      <span class="break-all font-bold text-violet">
                        {String(fv.ar)}
                        <span class="mx-1 text-violet/40">/</span>
                        {String(fv.br)}
                      </span>
                    </div>
                  </div>
                )
              })()}
            </Show>

            {/* Bezout */}
            <Show when={bezout()}>
              {(bz) => {
                const ns = () => (bigMode() ? parsedBig() : parsed())
                return (
                  <div class="flex min-w-0 flex-col gap-2 border border-border bg-card px-5 py-4">
                    <div class="flex flex-wrap items-center gap-2">
                      <span aria-hidden class="size-2 rounded-full bg-violet" />
                      <span class="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Bezout
                      </span>
                      <span class="font-mono text-[10px] text-muted-foreground/60">
                        a·x + b·y = gcd
                      </span>
                    </div>
                    <div class="-mx-2 overflow-x-auto px-2 py-1 text-center">
                      <p
                        class={cn(
                          'whitespace-nowrap font-mono tabular-nums',
                          bigMode() ? 'text-[11px]' : 'text-base'
                        )}
                      >
                        <span class="text-muted-foreground">{String(ns()[0])}</span>
                        <span class="mx-1 text-muted-foreground/50">·</span>
                        <span class="font-bold text-violet">({String(bz().x)})</span>
                        <span class="mx-1.5 text-muted-foreground/50">+</span>
                        <span class="text-muted-foreground">{String(ns()[1])}</span>
                        <span class="mx-1 text-muted-foreground/50">·</span>
                        <span class="font-bold text-violet">({String(bz().y)})</span>
                        <span class="mx-1.5 text-muted-foreground/50">=</span>
                        <span class="font-bold text-foreground">{String(bz().g)}</span>
                      </p>
                    </div>
                    <div class="grid grid-cols-2 gap-1.5">
                      <div class="flex items-center gap-2 border border-border bg-background px-2.5 py-1">
                        <span class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          x
                        </span>
                        <span class="flex-1 break-all font-mono text-xs tabular-nums">
                          {String(bz().x)}
                        </span>
                        <CopyButton value={() => String(bz().x)} />
                      </div>
                      <div class="flex items-center gap-2 border border-border bg-background px-2.5 py-1">
                        <span class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          y
                        </span>
                        <span class="flex-1 break-all font-mono text-xs tabular-nums">
                          {String(bz().y)}
                        </span>
                        <CopyButton value={() => String(bz().y)} />
                      </div>
                    </div>
                  </div>
                )
              }}
            </Show>
          </section>
        </Show>

        {/* ─────────── Evidence wall: prime grid + divisors ─────────── */}
        <Show when={factorGrid()}>
          {(grid) => (
            <section class="grid gap-4 lg:grid-cols-12">
              {/* Prime factor grid — 8 cols on lg */}
              <div class="lg:col-span-8 flex flex-col border border-border bg-card">
                <header class="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
                  <span aria-hidden class="size-2 rounded-full bg-violet" />
                  <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Prime-factor matrix
                  </h2>
                  <span class="font-mono text-[10px] text-muted-foreground/60">
                    GCF = min · LCM = max · darker = larger exponent
                  </span>
                </header>

                {/* per-input factor signatures */}
                <div class="flex flex-col gap-1.5 border-b border-border px-5 py-3">
                  <For each={grid().inputs}>
                    {(n, i) => {
                      const groups = grid().groups[i()]
                      return (
                        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[12px] tabular-nums">
                          <span class="min-w-[3.5rem] font-semibold text-foreground">
                            {n}
                          </span>
                          <span class="text-muted-foreground/50">=</span>
                          <Show
                            when={groups.length > 0}
                            fallback={<span class="text-muted-foreground">1 (unit)</span>}
                          >
                            <For each={groups}>
                              {(f, idx) => (
                                <>
                                  <Show when={idx() > 0}>
                                    <span class="text-muted-foreground/40">×</span>
                                  </Show>
                                  <span class="text-foreground">
                                    {f.prime}
                                    <Show when={f.exponent > 1}>
                                      <sup class="ml-px text-violet">{f.exponent}</sup>
                                    </Show>
                                  </span>
                                </>
                              )}
                            </For>
                          </Show>
                        </div>
                      )
                    }}
                  </For>
                </div>

                <div class="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead class="w-14 text-muted-foreground/70">prime</TableHead>
                        <For each={grid().inputs}>
                          {(n) => (
                            <TableHead class="text-center font-mono tabular-nums normal-case text-foreground">
                              {n}
                            </TableHead>
                          )}
                        </For>
                        <TableHead class="border-l border-border bg-violet/5 text-center text-violet">
                          GCF
                        </TableHead>
                        <TableHead class="bg-muted/40 text-center text-foreground/80">
                          LCM
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <For each={grid().primes}>
                        {(p, pi) => {
                          const row = () => grid().exponents[pi()]
                          const minE = () => Math.min(...row())
                          const maxE = () => Math.max(...row())
                          return (
                            <TableRow>
                              <TableCell class="font-bold text-foreground">{p}</TableCell>
                              <For each={row()}>
                                {(e) => (
                                  <TableCell
                                    class={cn(
                                      'text-center transition-colors',
                                      expCellClass(e, grid().maxExp)
                                    )}
                                  >
                                    {e}
                                  </TableCell>
                                )}
                              </For>
                              <TableCell
                                class={cn(
                                  'border-l border-border bg-violet/5 text-center font-bold',
                                  minE() === 0 ? 'text-muted-foreground/30' : 'text-violet'
                                )}
                              >
                                {minE()}
                              </TableCell>
                              <TableCell
                                class={cn(
                                  'bg-muted/40 text-center font-bold',
                                  maxE() === 0 && 'text-muted-foreground/30'
                                )}
                              >
                                {maxE()}
                              </TableCell>
                            </TableRow>
                          )
                        }}
                      </For>
                    </TableBody>
                  </Table>
                </div>

                {/* Closed-form line */}
                <div class="flex flex-col gap-1 border-t border-border bg-muted/20 px-5 py-3 font-mono text-[12px] tabular-nums">
                  <div class="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                    <span class="text-violet">GCF</span>
                    <span class="text-muted-foreground/60">=</span>
                    <ClosedForm
                      primes={grid().primes}
                      exponents={grid().exponents}
                      mode="min"
                      tone="violet"
                    />
                  </div>
                  <div class="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                    <span class="text-foreground/80">LCM</span>
                    <span class="text-muted-foreground/60">=</span>
                    <ClosedForm
                      primes={grid().primes}
                      exponents={grid().exponents}
                      mode="max"
                      tone="foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Common divisors — 4 cols on lg */}
              <Show when={commonDivisors()}>
                {(divs) => {
                  const shown = () => divs().slice(0, DIVISOR_CAP)
                  const overflow = () => Math.max(0, divs().length - DIVISOR_CAP)
                  return (
                    <div class="lg:col-span-4 flex flex-col border border-border bg-card">
                      <header class="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
                        <span aria-hidden class="size-2 rounded-full bg-violet" />
                        <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Common divisors of GCF
                        </h2>
                        <span class="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground/60">
                          {divs().length} total
                        </span>
                      </header>
                      <div class="flex flex-1 flex-wrap content-start gap-1 px-5 py-4">
                        <For each={shown()}>
                          {(d, idx) => (
                            <span
                              class={cn(
                                'inline-flex min-w-[2.5rem] items-center justify-center border bg-background px-2 py-0.5 font-mono text-[13px] tabular-nums transition-colors',
                                idx() === 0
                                  ? 'border-muted-foreground/40 text-muted-foreground'
                                  : idx() === shown().length - 1 && overflow() === 0
                                    ? 'border-violet/60 bg-violet/10 text-violet font-bold'
                                    : 'border-border text-foreground hover:border-violet/40 hover:text-violet'
                              )}
                              title={
                                idx() === 0
                                  ? '1 divides everything'
                                  : idx() === shown().length - 1 && overflow() === 0
                                    ? 'GCF (largest)'
                                    : undefined
                              }
                            >
                              {d}
                            </span>
                          )}
                        </For>
                        <Show when={overflow() > 0}>
                          <span class="inline-flex items-center border border-dashed border-border bg-muted/30 px-2 py-0.5 font-mono text-[13px] text-muted-foreground">
                            +{overflow()} more
                          </span>
                        </Show>
                      </div>
                    </div>
                  )
                }}
              </Show>
            </section>
          )}
        </Show>

        {/* ─────────── Pairwise GCD matrix ─────────── */}
        <Show when={pairwiseMatrix()}>
          {(pm) => (
            <section class="border border-border bg-card">
              <header class="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Pairwise GCD matrix
                </h2>
                <span class="font-mono text-[10px] text-muted-foreground/60">
                  emerald = coprime pair
                </span>
                <Show when={pm().total > PAIRWISE_CAP}>
                  <span class="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground/60">
                    first {PAIRWISE_CAP} of {pm().total}
                  </span>
                </Show>
              </header>
              <div class="overflow-x-auto p-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-14" />
                      <For each={pm().labels}>
                        {(n) => (
                          <TableHead class="text-center font-mono tabular-nums normal-case text-foreground">
                            {n}
                          </TableHead>
                        )}
                      </For>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <For each={pm().matrix}>
                      {(row, i) => (
                        <TableRow>
                          <TableHead class="font-mono normal-case tabular-nums text-foreground">
                            {pm().labels[i()]}
                          </TableHead>
                          <For each={row}>
                            {(cell, j) => (
                              <TableCell
                                title={`gcd(${pm().labels[i()]}, ${pm().labels[j()]}) = ${cell}`}
                                class={cn(
                                  'text-center',
                                  i() === j() && 'bg-muted/30 text-muted-foreground/40',
                                  i() !== j() &&
                                    cell === 1 &&
                                    'bg-emerald-500/15 text-emerald-700 font-bold dark:text-emerald-400',
                                  i() !== j() && cell !== 1 && 'text-foreground'
                                )}
                              >
                                {cell}
                              </TableCell>
                            )}
                          </For>
                        </TableRow>
                      )}
                    </For>
                  </TableBody>
                </Table>
              </div>
            </section>
          )}
        </Show>

        {/* ─────────── Euclidean derivation ─────────── */}
        <Show when={validCount() >= 2}>
          <section class="border border-border bg-card">
            <button
              type="button"
              onClick={() => setShowSteps((s) => !s)}
              aria-expanded={showSteps()}
              class="flex w-full cursor-pointer items-center gap-2 border-b border-border px-5 py-3 text-left transition-colors hover:bg-muted/30"
            >
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Euclidean derivation
              </h2>
              <span class="font-mono text-[10px] text-muted-foreground/60">
                <Show
                  when={validCount() === 2}
                  fallback={`reductive · ${validCount() - 1} pair${validCount() - 1 === 1 ? '' : 's'}`}
                >
                  gcd({String((bigMode() ? parsedBig() : parsed())[0])},{' '}
                  {String((bigMode() ? parsedBig() : parsed())[1])})
                </Show>
              </span>
              <span class="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {showSteps() ? 'Hide' : 'Show'}
                <TbOutlineChevronDown
                  size={12}
                  class={cn('transition-transform', showSteps() && 'rotate-180')}
                />
              </span>
            </button>

            <Show when={showSteps()}>
              <div class="anim-fade-in flex flex-col gap-5 px-5 py-5">
                <For each={reduction()}>
                  {(red, i) => (
                    <div class="flex">
                      {/* derivation rule */}
                      <div class="mr-4 w-px shrink-0 bg-violet/30" />
                      <div class="flex flex-1 flex-col gap-1.5">
                        <Show when={reduction().length > 1}>
                          <div class="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            <span class="mr-2 font-bold text-violet">
                              Step {String(i() + 1).padStart(2, '0')}
                            </span>
                            <span>
                              gcd(
                              <span class="text-foreground">{String(red.acc)}</span>,{' '}
                              <span class="text-foreground">{String(red.next)}</span>) ={' '}
                              <span class="font-semibold text-violet">{String(red.result)}</span>
                            </span>
                          </div>
                        </Show>
                        <Show
                          when={red.steps.length > 0}
                          fallback={
                            <div class="font-mono text-sm italic text-muted-foreground">
                              one divides the other → gcd ={' '}
                              <span class="not-italic text-foreground">{String(red.result)}</span>
                            </div>
                          }
                        >
                          <For each={red.steps}>
                            {(step, si) => {
                              const isLast = () => si() === red.steps.length - 1
                              const q = () =>
                                typeof step.a === 'bigint'
                                  ? String((step.a as bigint) / (step.b as bigint))
                                  : Math.floor((step.a as number) / (step.b as number)).toString()
                              return (
                                <div
                                  class={cn(
                                    'grid grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto_auto] items-baseline gap-x-1.5 font-mono text-sm tabular-nums leading-7',
                                    isLast() && 'font-semibold'
                                  )}
                                >
                                  <span
                                    class={cn(
                                      'text-right',
                                      isLast() ? 'text-foreground' : 'text-foreground/90'
                                    )}
                                  >
                                    {String(step.a)}
                                  </span>
                                  <span class="text-muted-foreground/60">=</span>
                                  <span class="text-muted-foreground">{q()}</span>
                                  <span class="text-muted-foreground/60">×</span>
                                  <span
                                    class={cn(
                                      isLast() ? 'font-bold text-violet' : 'text-foreground/90'
                                    )}
                                  >
                                    {String(step.b)}
                                  </span>
                                  <span class="text-muted-foreground/60">+</span>
                                  <span class="text-foreground/90">{String(step.remainder)}</span>
                                  <Show when={isLast()}>
                                    <span class="ml-2 font-mono text-[10px] uppercase tracking-wider text-violet/70">
                                      ← gcd
                                    </span>
                                  </Show>
                                </div>
                              )
                            }}
                          </For>
                        </Show>
                      </div>
                    </div>
                  )}
                </For>
                <div class="border-t border-border/60 pt-3">
                  <p class="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Final GCD ={' '}
                    <span class="font-bold text-violet">{String(gcf())}</span>
                  </p>
                </div>
              </div>
            </Show>
          </section>
        </Show>

        <Show when={validCount() === 0}>
          <p class="px-1 font-mono text-xs text-muted-foreground/70">
            Type a non-zero integer in the slot above to begin.
          </p>
        </Show>
      </div>
    </main>
  )
}

// ─── Closed-form expression: 2³ × 3² etc. ──────────────────────────────────

type ClosedFormProps = {
  primes: number[]
  exponents: number[][]
  mode: 'min' | 'max'
  tone: 'violet' | 'foreground'
}

function ClosedForm(props: ClosedFormProps) {
  const terms = createMemo(() => {
    const out: { p: number; e: number }[] = []
    for (let i = 0; i < props.primes.length; i++) {
      const row = props.exponents[i]
      const e = props.mode === 'min' ? Math.min(...row) : Math.max(...row)
      if (e > 0) out.push({ p: props.primes[i], e })
    }
    return out
  })
  return (
    <span class="inline-flex flex-wrap items-baseline gap-x-1">
      <Show when={terms().length > 0} fallback={<span class="text-foreground">1</span>}>
        <For each={terms()}>
          {(t, i) => (
            <>
              <Show when={i() > 0}>
                <span class="text-muted-foreground/40">×</span>
              </Show>
              <span
                class={cn(
                  props.tone === 'violet' ? 'text-violet' : 'text-foreground'
                )}
              >
                {t.p}
                <Show when={t.e > 1}>
                  <sup class="ml-px text-violet">{t.e}</sup>
                </Show>
              </span>
            </>
          )}
        </For>
      </Show>
    </span>
  )
}
