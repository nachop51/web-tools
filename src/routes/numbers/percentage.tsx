import { useSearchParams } from '@solidjs/router'
import { createEffect, createMemo, createSignal, For, Show, onMount } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarChip, ToolbarSegmented } from '~/components/tool-toolbar'
import {
  percentAdjust,
  percentChange,
  solvePercentage,
  type SolveTarget,
} from '~/lib/utils/math/percentage'
import { setToolPageMeta } from '~/lib/seo'
import { cn } from '~/lib/utils'

type SolvePhrasing = {
  target: SolveTarget
  // Sentence rendered as `[seg, slot, seg, slot, seg]`.
  // Pivot menu label for the toolbar.
  pivotLabel: string
}

const SOLVE_PHRASINGS: SolvePhrasing[] = [
  { target: 'c', pivotLabel: 'What is X% of Y?' },
  { target: 'a', pivotLabel: 'X is what % of Y?' },
  { target: 'b', pivotLabel: 'X is Y% of what?' },
]

type Mode = 'solve' | 'change' | 'adjust'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'solve', label: 'Solve %' },
  { value: 'change', label: '% change' },
  { value: 'adjust', label: 'Adjust by %' },
]

const QUICK_PCTS = [5, 10, 15, 20, 25, 50]

// Per-target sentence shape: which slots are inputs, what the leading word is.
//   target=c: "What is [a]% of [b]?"        inputs: a, b — result: c
//   target=a: "[c] is what % of [b]?"       inputs: c, b — result: a
//   target=b: "[c] is [a]% of what?"        inputs: c, a — result: b

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  return parseFloat(n.toPrecision(10)).toString()
}

function parseNum(s: string): number | undefined {
  if (!s) return undefined
  const n = parseFloat(s)
  return isNaN(n) ? undefined : n
}

export default function PercentageCalculator() {
  setToolPageMeta('numbers', 'percentage')

  const [params, setParams] = useSearchParams<{
    mode?: string
    target?: string
    a?: string
    b?: string
    c?: string
    from?: string
    to?: string
    pp?: string
    v?: string
    pct?: string
  }>()

  const [a, setASignal] = createSignal(params.a ?? '25')
  const [b, setBSignal] = createSignal(params.b ?? '200')
  const [c, setCSignal] = createSignal(params.c ?? '')
  const [fromVal, setFromSignal] = createSignal(params.from ?? '80')
  const [toVal, setToSignal] = createSignal(params.to ?? '100')
  const [ppMode, setPpModeSignal] = createSignal(params.pp === '1')
  const [v, setVSignal] = createSignal(params.v ?? '100')
  const [pct, setPctSignal] = createSignal(params.pct ?? '10')

  const mode = createMemo<Mode>(() => {
    const p = params.mode
    if (p === 'change' || p === 'adjust') return p
    return 'solve'
  })

  const solveTarget = createMemo<SolveTarget>(() => {
    const t = params.target
    if (t === 'a' || t === 'b') return t
    return 'c'
  })

  function setA(s: string) { setASignal(s); setParams({ a: s || undefined }, { replace: true }) }
  function setB(s: string) { setBSignal(s); setParams({ b: s || undefined }, { replace: true }) }
  function setC(s: string) { setCSignal(s); setParams({ c: s || undefined }, { replace: true }) }
  function setFrom(s: string) { setFromSignal(s); setParams({ from: s || undefined }, { replace: true }) }
  function setTo(s: string) { setToSignal(s); setParams({ to: s || undefined }, { replace: true }) }
  function setPpMode(b: boolean) { setPpModeSignal(b); setParams({ pp: b ? '1' : undefined }, { replace: true }) }
  function setV(s: string) { setVSignal(s); setParams({ v: s || undefined }, { replace: true }) }
  function setPct(s: string) { setPctSignal(s); setParams({ pct: s || undefined }, { replace: true }) }

  function setMode(m: Mode) { setParams({ mode: m }, { replace: true }) }
  function setSolveTarget(t: SolveTarget) { setParams({ target: t }, { replace: true }) }

  // Legacy URL redirect
  let didMigrate = false
  function migrate() {
    if (didMigrate) return
    didMigrate = true
    const m = params.mode
    if (m === 'of' || m === 'what' || m === 'reverse') {
      const targetMap = { of: 'c', what: 'a', reverse: 'b' } as const
      const t = targetMap[m]
      if (m === 'reverse') {
        setParams({ mode: 'solve', target: t }, { replace: true })
      } else {
        setParams({ mode: 'solve', target: t, a: params.a, b: params.b }, { replace: true })
        if (params.a) setASignal(params.a)
        if (params.b) setBSignal(params.b)
      }
    } else if (m === 'increase') {
      setParams({ mode: 'adjust', v: params.a, pct: params.b, a: undefined, b: undefined }, { replace: true })
      if (params.a) setVSignal(params.a)
      if (params.b) setPctSignal(params.b)
    } else if (m === 'decrease') {
      const negPct = params.b ? String(-parseFloat(params.b)) : undefined
      setParams({ mode: 'adjust', v: params.a, pct: negPct, a: undefined, b: undefined }, { replace: true })
      if (params.a) setVSignal(params.a)
      if (negPct) setPctSignal(negPct)
    } else if (m === 'error') {
      setParams({ mode: 'change', from: params.b, to: params.a, a: undefined, b: undefined }, { replace: true })
      if (params.a) setToSignal(params.a)
      if (params.b) setFromSignal(params.b)
    }
  }
  migrate()

  // ----- Solve mode -----
  const solved = createMemo(() => {
    if (mode() !== 'solve') return null
    return solvePercentage({
      a: parseNum(a()),
      b: parseNum(b()),
      c: parseNum(c()),
      target: solveTarget(),
    })
  })

  // Sync the computed target value back to its URL param.
  createEffect(() => {
    const r = solved()
    if (!r) return
    const t = r.target
    const formatted = fmt(r[t])
    if (t === 'a' && a() !== formatted) { setASignal(formatted); setParams({ a: formatted }, { replace: true }) }
    if (t === 'b' && b() !== formatted) { setBSignal(formatted); setParams({ b: formatted }, { replace: true }) }
    if (t === 'c' && c() !== formatted) { setCSignal(formatted); setParams({ c: formatted }, { replace: true }) }
  })

  function solveSteps(): string[] {
    const r = solved()
    if (!r) return []
    const t = r.target
    if (t === 'c') return [
      '(% ÷ 100) × whole = part',
      `(${fmt(r.a)} ÷ 100) × ${fmt(r.b)} = ${fmt(r.a / 100)} × ${fmt(r.b)} = ${fmt(r.c)}`,
    ]
    if (t === 'a') return [
      '(part ÷ whole) × 100 = %',
      `(${fmt(r.c)} ÷ ${fmt(r.b)}) × 100 = ${fmt(r.c / r.b)} × 100 = ${fmt(r.a)}`,
    ]
    return [
      '(part ÷ %) × 100 = whole',
      `(${fmt(r.c)} ÷ ${fmt(r.a)}) × 100 = ${fmt(r.c / r.a)} × 100 = ${fmt(r.b)}`,
    ]
  }

  function solveError(): string | null {
    if (mode() !== 'solve') return null
    if (solved()) return null
    const t = solveTarget()
    const aN = parseNum(a()), bN = parseNum(b()), cN = parseNum(c())
    if (t === 'a') {
      if (bN === undefined || cN === undefined) return null
      if (bN === 0) return 'Whole cannot be zero when solving for percentage.'
    }
    if (t === 'b') {
      if (aN === undefined || cN === undefined) return null
      if (aN === 0) return 'Percentage cannot be zero when solving for whole.'
    }
    return null
  }

  // ----- Change mode -----
  const change = createMemo(() => {
    if (mode() !== 'change') return null
    const f = parseNum(fromVal()), t = parseNum(toVal())
    if (f === undefined || t === undefined) return null
    return percentChange(f, t)
  })

  function changeSteps(): string[] {
    const r = change()
    if (!r) return []
    return [
      '((to − from) ÷ |from|) × 100',
      `((${fmt(r.to)} − ${fmt(r.from)}) ÷ |${fmt(r.from)}|) × 100 = ${fmt(r.delta)} ÷ ${fmt(Math.abs(r.from))} × 100 = ${fmt(r.pctChange)}%`,
    ]
  }

  // ----- Adjust mode -----
  const adjust = createMemo(() => {
    if (mode() !== 'adjust') return null
    const vN = parseNum(v()), pN = parseNum(pct())
    if (vN === undefined || pN === undefined) return null
    return percentAdjust(vN, pN)
  })

  function adjustSteps(): string[] {
    const r = adjust()
    if (!r) return []
    return [
      'value × (1 + pct ÷ 100)',
      `${fmt(r.value)} × (1 + ${fmt(r.signedPct)} ÷ 100) = ${fmt(r.value)} × ${fmt(1 + r.signedPct / 100)} = ${fmt(r.result)}`,
    ]
  }

  // ----- Focus -----
  let firstInputRef: HTMLInputElement | undefined
  onMount(() => {
    firstInputRef?.focus()
  })

  // ----- Render helpers -----
  function deltaTone(d: number): string {
    if (d > 0) return 'text-emerald-600 dark:text-emerald-400'
    if (d < 0) return 'text-destructive'
    return 'text-muted-foreground'
  }

  function deltaSign(d: number): string {
    if (d > 0) return '+'
    return ''
  }

  // ===== Sentence-as-equation: inline editable inputs =====
  // Each non-target slot is a borderless underlined <input>, sized to its
  // content, that reads like prose. The target slot is the hero result below.
  type SlotKey = 'a' | 'b' | 'c'

  function slotValue(k: SlotKey): string {
    if (k === 'a') return a()
    if (k === 'b') return b()
    return c()
  }

  function setSlotValue(k: SlotKey, s: string) {
    if (k === 'a') return setA(s)
    if (k === 'b') return setB(s)
    return setC(s)
  }

  function slotResult(k: SlotKey): string {
    const r = solved()
    if (!r) return '—'
    return fmt(r[k])
  }

  function slotPlaceholder(k: SlotKey): string {
    if (k === 'a') return '25'
    if (k === 'b') return '200'
    return '50'
  }

  // Width for an inline input — sized to the displayed text length so the
  // sentence breathes naturally (no fixed wide rectangles).
  function inlineWidthCh(k: SlotKey): number {
    const v = slotValue(k) || slotPlaceholder(k)
    return Math.max(2, Math.min(10, v.length + 0.5))
  }

  const [pctFocused, setPctFocused] = createSignal(false)

  // Width sized to content for inline-text inputs.
  function widthCh(text: string, placeholder: string): number {
    const v = text || placeholder
    return Math.max(2, Math.min(10, v.length + 0.5))
  }

  // Generic inline-text input — dotted underline, content-sized, no chrome.
  function InlineInput(props: {
    value: string
    placeholder: string
    onInput: (s: string) => void
    isFirst?: boolean
    onFocus?: () => void
    onBlur?: () => void
    'aria-label'?: string
  }) {
    return (
      <input
        ref={(el) => { if (props.isFirst) firstInputRef = el }}
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck={false}
        value={props.value}
        placeholder={props.placeholder}
        aria-label={props['aria-label']}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        onFocus={() => props.onFocus?.()}
        onBlur={() => props.onBlur?.()}
        style={{ width: `${widthCh(props.value, props.placeholder)}ch` }}
        class={cn(
          'inline-block bg-transparent text-center font-mono font-semibold tabular-nums',
          'text-foreground placeholder:text-muted-foreground/50',
          'border-0 border-b-2 border-dotted border-border outline-none',
          'transition-[border-color,color] duration-150',
          'hover:border-violet/60 focus:border-violet focus:text-violet',
          'caret-violet'
        )}
      />
    )
  }

  function InlineSlot(props: { k: SlotKey; isFirst?: boolean; onFocus?: () => void; onBlur?: () => void }) {
    return (
      <InlineInput
        value={slotValue(props.k)}
        placeholder={slotPlaceholder(props.k)}
        onInput={(s) => setSlotValue(props.k, s)}
        isFirst={props.isFirst}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
      />
    )
  }

  // Inline "Show steps ›" disclosure — same pattern across all 3 modes.
  function InlineSteps(props: { steps: string[] }) {
    return (
      <Show when={props.steps.length > 0}>
        <details class="group mt-6">
          <summary class="inline-flex cursor-pointer select-none items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <span class="inline-block transition-transform duration-200 group-open:rotate-90">›</span>
            Show steps
          </summary>
          <div class="mt-2 flex flex-col gap-1 pl-4">
            <For each={props.steps}>
              {(step) => <p class="font-mono text-xs text-muted-foreground">{step}</p>}
            </For>
          </div>
        </details>
      </Show>
    )
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Percentage calculator"
        description="Solve any percentage question, compute % change between values, or adjust a number by a percentage."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented<Mode>
            label="Mode"
            value={mode()}
            onChange={setMode}
            options={modeOptions}
          />
          <Show when={mode() === 'change'}>
            <div class="ml-auto" />
            <ToolbarChip checked={ppMode()} onChange={setPpMode}>
              inputs are percentages
            </ToolbarChip>
          </Show>
        </ToolToolbar>

        {/* SOLVE — hero result, equation as quiet caption */}
        <Show when={mode() === 'solve'}>
          <section class="relative overflow-hidden border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
            {/* Question phrasing pivot — sits at the top so users can swap which
                variable they're solving for using natural language. */}
            <div class="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:px-6">
              <span class="mr-2">Solve</span>
              <For each={SOLVE_PHRASINGS}>
                {(phrasing) => {
                  const isActive = () => solveTarget() === phrasing.target
                  return (
                    <button
                      type="button"
                      aria-pressed={isActive()}
                      onClick={() => setSolveTarget(phrasing.target)}
                      class={cn(
                        'cursor-pointer px-2 py-1 font-mono text-[11px] tracking-normal normal-case',
                        'transition-[color,background-color,border-color] duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        isActive()
                          ? 'bg-violet/10 text-violet'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {phrasing.pivotLabel}
                    </button>
                  )
                }}
              </For>
            </div>

            <div class="px-6 py-8 sm:px-10 sm:py-10">
              {/* The question — natural-language sentence with inline inputs.
                  Inputs are styled like text (dotted underline, no chrome). */}
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-2 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                <Show when={solveTarget() === 'c'}>
                  <span>What is</span>
                  <span
                    class="relative inline-flex items-baseline"
                    onFocusIn={() => setPctFocused(true)}
                    onFocusOut={() => setPctFocused(false)}
                  >
                    <InlineSlot k="a" isFirst />
                    <span class="ml-0.5 text-violet">%</span>
                    {/* Quick-% popover — anchored under the % input itself */}
                    <Show when={pctFocused()}>
                      <span class="anim-fade-in absolute left-1/2 top-full z-10 mt-2 flex -translate-x-1/2 flex-nowrap items-center gap-1 border border-border bg-popover px-2 py-1.5 shadow-md">
                        <For each={QUICK_PCTS}>
                          {(pctVal) => {
                            const isActive = () => a() === String(pctVal)
                            return (
                              <button
                                type="button"
                                tabIndex={-1}
                                aria-pressed={isActive()}
                                // mousedown so it fires before the input's blur
                                onMouseDown={(e) => { e.preventDefault(); setA(String(pctVal)) }}
                                class={cn(
                                  'cursor-pointer px-2 py-0.5 font-mono text-[11px] tabular-nums',
                                  'transition-[color,background-color] duration-150',
                                  isActive()
                                    ? 'bg-violet text-violet-foreground'
                                    : 'text-muted-foreground hover:bg-violet/10 hover:text-violet'
                                )}
                              >
                                {pctVal}%
                              </button>
                            )
                          }}
                        </For>
                      </span>
                    </Show>
                  </span>
                  <span>of</span>
                  <InlineSlot k="b" />
                  <span>?</span>
                </Show>

                <Show when={solveTarget() === 'a'}>
                  <InlineSlot k="c" isFirst />
                  <span>is what</span>
                  <span class="text-violet">%</span>
                  <span>of</span>
                  <InlineSlot k="b" />
                  <span>?</span>
                </Show>

                <Show when={solveTarget() === 'b'}>
                  <InlineSlot k="c" isFirst />
                  <span>is</span>
                  <span
                    class="relative inline-flex items-baseline"
                    onFocusIn={() => setPctFocused(true)}
                    onFocusOut={() => setPctFocused(false)}
                  >
                    <InlineSlot k="a" />
                    <span class="ml-0.5 text-violet">%</span>
                    <Show when={pctFocused()}>
                      <span class="anim-fade-in absolute left-1/2 top-full z-10 mt-2 flex -translate-x-1/2 flex-nowrap items-center gap-1 border border-border bg-popover px-2 py-1.5 shadow-md">
                        <For each={QUICK_PCTS}>
                          {(pctVal) => {
                            const isActive = () => a() === String(pctVal)
                            return (
                              <button
                                type="button"
                                tabIndex={-1}
                                aria-pressed={isActive()}
                                onMouseDown={(e) => { e.preventDefault(); setA(String(pctVal)) }}
                                class={cn(
                                  'cursor-pointer px-2 py-0.5 font-mono text-[11px] tabular-nums',
                                  'transition-[color,background-color] duration-150',
                                  isActive()
                                    ? 'bg-violet text-violet-foreground'
                                    : 'text-muted-foreground hover:bg-violet/10 hover:text-violet'
                                )}
                              >
                                {pctVal}%
                              </button>
                            )
                          }}
                        </For>
                      </span>
                    </Show>
                  </span>
                  <span>of what?</span>
                </Show>
              </div>

              {/* Hero result — the answer is the largest, loudest thing on the card */}
              <div class="mt-8 flex flex-col gap-2">
                <Show
                  when={solved()}
                  fallback={
                    <Show
                      when={solveError()}
                      fallback={
                        <div class="flex items-baseline gap-3">
                          <span class="font-mono text-5xl font-bold leading-none tabular-nums text-muted-foreground/30 sm:text-6xl">
                            —
                          </span>
                          <span class="text-xs text-muted-foreground">
                            Fill the two values above
                          </span>
                        </div>
                      }
                    >
                      <p class="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        {solveError()}
                      </p>
                    </Show>
                  }
                >
                  {(r) => (
                    <div class="anim-fade-up flex flex-wrap items-baseline gap-x-4 gap-y-2">
                      <span class="font-mono text-5xl font-bold leading-none tabular-nums text-muted-foreground/40 sm:text-6xl">
                        =
                      </span>
                      <span class="break-all font-mono text-6xl font-bold leading-none tabular-nums text-violet sm:text-7xl">
                        {slotResult(r().target)}
                      </span>
                      <Show when={r().target === 'a'}>
                        <span class="font-mono text-4xl font-bold leading-none tabular-nums text-violet sm:text-5xl">
                          %
                        </span>
                      </Show>
                      <CopyButton
                        value={() => r().target === 'a' ? `${slotResult('a')}%` : slotResult(r().target)}
                      />
                    </div>
                  )}
                </Show>
              </div>

              {/* Subtle part/whole indicator (no caption — the result above
                  already communicates the number) */}
              <Show when={solved() && solved()!.b !== 0}>
                {(() => {
                  const r = solved()!
                  const ratio = r.c / r.b
                  const partPct = Math.max(0, Math.min(100, ratio * 100))
                  const overflow = ratio > 1
                  const negative = ratio < 0
                  return (
                    <div class="mt-8 flex h-1 overflow-hidden bg-muted/60">
                      <div
                        class={cn(
                          'transition-[width] duration-500 ease-out',
                          negative ? 'bg-destructive' : overflow ? 'bg-warning-foreground' : 'bg-violet'
                        )}
                        style={{ width: `${partPct}%` }}
                      />
                    </div>
                  )
                })()}
              </Show>

              {/* Steps — quiet text disclosure, no bordered box */}
              <Show when={solved()}>
                <InlineSteps steps={solveSteps()} />
              </Show>
            </div>
          </section>
        </Show>

        {/* CHANGE — hero result, sentence-as-equation */}
        <Show when={mode() === 'change'}>
          <section class="relative overflow-hidden border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div class="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:px-6">
              <span>Percent change</span>
            </div>

            <div class="px-6 py-8 sm:px-10 sm:py-10">
              {/* The question — natural sentence with inline inputs */}
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-2 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                <span>From</span>
                <InlineInput
                  value={fromVal()}
                  placeholder="80"
                  onInput={setFrom}
                  isFirst
                  aria-label="From"
                />
                <span>to</span>
                <InlineInput
                  value={toVal()}
                  placeholder="100"
                  onInput={setTo}
                  aria-label="To"
                />
                <span>is</span>
              </div>

              {/* Hero result — tone-colored by sign */}
              <div class="mt-8 flex flex-col gap-2">
                <Show
                  when={change()}
                  fallback={
                    <Show
                      when={parseNum(fromVal()) === 0 && parseNum(toVal()) !== undefined}
                      fallback={
                        <div class="flex items-baseline gap-3">
                          <span class="font-mono text-5xl font-bold leading-none tabular-nums text-muted-foreground/30 sm:text-6xl">
                            —
                          </span>
                          <span class="text-xs text-muted-foreground">
                            Fill both values
                          </span>
                        </div>
                      }
                    >
                      <p class="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        Change is undefined when starting from 0.
                      </p>
                    </Show>
                  }
                >
                  {(r) => (
                    <div class="anim-fade-up flex flex-col gap-2">
                      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                        <span class="font-mono text-5xl font-bold leading-none tabular-nums text-muted-foreground/40 sm:text-6xl">
                          =
                        </span>
                        <span
                          class={cn(
                            'break-all font-mono text-6xl font-bold leading-none tabular-nums sm:text-7xl',
                            deltaTone(r().pctChange)
                          )}
                        >
                          {deltaSign(r().pctChange)}{fmt(r().pctChange)}
                        </span>
                        <span
                          class={cn(
                            'font-mono text-4xl font-bold leading-none tabular-nums sm:text-5xl',
                            deltaTone(r().pctChange)
                          )}
                        >
                          %
                        </span>
                        <CopyButton value={() => `${deltaSign(r().pctChange)}${fmt(r().pctChange)}%`} />
                      </div>
                      {/* Quiet supporting caption — absolute delta, and pp when toggled */}
                      <p class="font-mono text-xs text-muted-foreground">
                        <span>Δ </span>
                        <span class={cn('tabular-nums', deltaTone(r().delta))}>
                          {deltaSign(r().delta)}{fmt(r().delta)}
                        </span>
                        <Show when={ppMode()}>
                          <span class="mx-2 text-muted-foreground/50">·</span>
                          <span class={cn('tabular-nums', deltaTone(r().ppDelta))}>
                            {deltaSign(r().ppDelta)}{fmt(r().ppDelta)} pp
                          </span>
                        </Show>
                      </p>
                    </div>
                  )}
                </Show>
              </div>

              {/* Thin delta-direction indicator — magnitude-bound, tone by sign */}
              <Show when={change()}>
                {(() => {
                  const r = change()!
                  const pct = r.pctChange
                  const mag = Math.min(100, Math.abs(pct))
                  const positive = pct > 0
                  const zero = pct === 0
                  return (
                    <div class="mt-8 flex h-1 overflow-hidden bg-muted/60">
                      <Show when={!positive && !zero}>
                        <div class="ml-auto" style={{ width: '50%' }}>
                          <div
                            class="ml-auto h-full bg-destructive transition-[width] duration-500 ease-out"
                            style={{ width: `${mag}%` }}
                          />
                        </div>
                        <div style={{ width: '50%' }} />
                      </Show>
                      <Show when={positive}>
                        <div style={{ width: '50%' }} />
                        <div style={{ width: '50%' }}>
                          <div
                            class="h-full bg-emerald-500 transition-[width] duration-500 ease-out dark:bg-emerald-400"
                            style={{ width: `${mag}%` }}
                          />
                        </div>
                      </Show>
                    </div>
                  )
                })()}
              </Show>

              <Show when={change()}>
                <InlineSteps steps={changeSteps()} />
              </Show>
            </div>
          </section>
        </Show>

        {/* ADJUST — hero result, sentence-as-equation */}
        <Show when={mode() === 'adjust'}>
          <section class="relative overflow-hidden border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div class="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:px-6">
              <span>Adjust by %</span>
            </div>

            <div class="px-6 py-8 sm:px-10 sm:py-10">
              {/* The question — natural sentence with inline inputs */}
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-2 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                <InlineInput
                  value={v()}
                  placeholder="100"
                  onInput={setV}
                  isFirst
                  aria-label="Value"
                />
                <span>adjusted by</span>
                <span class="inline-flex items-baseline">
                  <InlineInput
                    value={pct()}
                    placeholder="10"
                    onInput={setPct}
                    aria-label="Percent (signed)"
                  />
                  <span class="ml-0.5 text-violet">%</span>
                </span>
                <span>is</span>
              </div>

              {/* Hero result — violet, just like solve */}
              <div class="mt-8 flex flex-col gap-2">
                <Show
                  when={adjust()}
                  fallback={
                    <div class="flex items-baseline gap-3">
                      <span class="font-mono text-5xl font-bold leading-none tabular-nums text-muted-foreground/30 sm:text-6xl">
                        —
                      </span>
                      <span class="text-xs text-muted-foreground">
                        Fill the value and percentage
                      </span>
                    </div>
                  }
                >
                  {(r) => (
                    <div class="anim-fade-up flex flex-col gap-2">
                      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                        <span class="font-mono text-5xl font-bold leading-none tabular-nums text-muted-foreground/40 sm:text-6xl">
                          =
                        </span>
                        <span class="break-all font-mono text-6xl font-bold leading-none tabular-nums text-violet sm:text-7xl">
                          {fmt(r().result)}
                        </span>
                        <CopyButton value={() => fmt(r().result)} />
                      </div>
                      {/* Quiet supporting caption — signed delta and pct */}
                      <p class="font-mono text-xs text-muted-foreground">
                        <span class={cn('tabular-nums', deltaTone(r().delta))}>
                          {deltaSign(r().delta)}{fmt(r().delta)}
                        </span>
                        <span class="mx-2 text-muted-foreground/50">·</span>
                        <span class={cn('tabular-nums', deltaTone(r().signedPct))}>
                          {deltaSign(r().signedPct)}{fmt(r().signedPct)}%
                        </span>
                      </p>
                    </div>
                  )}
                </Show>
              </div>

              {/* Thin before/after indicator — original baseline + adjusted segment */}
              <Show when={adjust()}>
                {(() => {
                  const r = adjust()!
                  // Normalize to before=100% baseline, scale after to that.
                  const base = Math.abs(r.value)
                  const after = base === 0 ? 0 : Math.min(200, (r.result / r.value) * 100)
                  const positive = r.delta > 0
                  const zero = r.delta === 0
                  return (
                    <div class="mt-8 flex flex-col gap-1.5">
                      <div class="relative h-1 overflow-hidden bg-muted/60">
                        {/* original-100 reference line */}
                        <div class="absolute inset-y-0 left-0 w-1/2 bg-muted-foreground/20" />
                        {/* adjusted segment */}
                        <div
                          class={cn(
                            'absolute inset-y-0 left-0 transition-[width] duration-500 ease-out',
                            zero ? 'bg-muted-foreground/40' : positive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-destructive'
                          )}
                          style={{ width: `${Math.min(100, after / 2)}%` }}
                        />
                        {/* original tick */}
                        <div class="absolute inset-y-0 left-1/2 w-px bg-muted-foreground/40" />
                      </div>
                      <div class="flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground/70">
                        <span>{fmt(r.value)}</span>
                        <span>{fmt(r.result)}</span>
                      </div>
                    </div>
                  )
                })()}
              </Show>

              <p class="mt-4 text-[11px] text-muted-foreground/70">
                positive = increase, negative = decrease
              </p>

              <Show when={adjust()}>
                <InlineSteps steps={adjustSteps()} />
              </Show>
            </div>
          </section>
        </Show>
      </div>
    </main>
  )
}
