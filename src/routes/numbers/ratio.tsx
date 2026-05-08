import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Index, onMount, Show } from 'solid-js'
import { TbOutlineX } from 'solid-icons/tb'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented, ToolbarChip } from '~/components/tool-toolbar'
import { Button } from '~/components/ui/button'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import {
  aspectFromDimensions,
  decimalDigits,
  dimensionsFromAspect,
  scaleRatio,
  simplifyMultiRatioFromStrings,
  simplifyRatioFromStrings,
  solveProportion,
  splitByRatio,
  type Cells,
} from '~/lib/utils/math/ratio'
import { setToolPageMeta } from '~/lib/seo'
import { cn } from '~/lib/utils'

type Mode = 'proportion' | 'split' | 'aspect'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'proportion', label: 'Proportion' },
  { value: 'split', label: 'Split' },
  { value: 'aspect', label: 'Aspect' },
]

const ASPECT_PRESETS: { label: string; w: number; h: number }[] = [
  { label: '16:9', w: 16, h: 9 },
  { label: '4:3', w: 4, h: 3 },
  { label: '21:9', w: 21, h: 9 },
  { label: '1:1', w: 1, h: 1 },
  { label: '32:9', w: 32, h: 9 },
  { label: '3:2', w: 3, h: 2 },
]

// Cycle for stacked bar segments. Beyond 5 parts, opacity drops.
const BAR_COLORS = ['bg-violet', 'bg-info', 'bg-success', 'bg-warning', 'bg-destructive']

function fmt(n: number, prec = 10): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(prec)).toString()
}

function parseNum(s: string): number | null {
  const t = s.trim()
  if (!t) return null
  const v = parseFloat(t)
  return isFinite(v) ? v : null
}

function colorAt(i: number): string {
  const base = BAR_COLORS[i % BAR_COLORS.length]
  const dim = i >= BAR_COLORS.length ? '/70' : ''
  return base + dim
}

type ProportionBarProps = {
  parts: number[]
  labels?: string[]
}

function ProportionBar(props: ProportionBarProps) {
  const total = createMemo(() => props.parts.reduce((s, p) => s + Math.abs(p), 0))
  return (
    <Show when={total() > 0}>
      <div class="anim-fade-up space-y-2">
        <div class="flex h-8 w-full overflow-hidden rounded-md border border-border">
          <Index each={props.parts}>
            {(p, i) => (
              <div
                class={cn('h-full transition-[flex-grow] duration-300', colorAt(i))}
                style={{ 'flex-grow': Math.abs(p()) / total() }}
                title={props.labels?.[i] ?? String(p())}
              />
            )}
          </Index>
        </div>
        <Show when={props.labels && props.labels.length > 0}>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Index each={props.labels!}>
              {(label, i) => (
                <span class="inline-flex items-center gap-1.5">
                  <span aria-hidden class={cn('size-2 rounded-sm', colorAt(i))} />
                  {label()}
                </span>
              )}
            </Index>
          </div>
        </Show>
      </div>
    </Show>
  )
}

type AspectBoxProps = {
  w: number
  h: number
  label: string
}

function AspectBox(props: AspectBoxProps) {
  const MAX = 240
  const dims = createMemo(() => {
    if (props.w <= 0 || props.h <= 0) return { w: 0, h: 0 }
    const scale = props.w >= props.h ? MAX / props.w : MAX / props.h
    return { w: props.w * scale, h: props.h * scale }
  })
  return (
    <Show when={dims().w > 0}>
      <div class="anim-fade-up flex flex-col items-center gap-3">
        <div
          class="relative flex items-center justify-center border-2 border-violet bg-violet/5 transition-all duration-300"
          style={{ width: `${dims().w}px`, height: `${dims().h}px` }}
        >
          <span class="font-mono text-xs font-medium text-violet">{props.label}</span>
        </div>
        <div class="font-mono text-xs text-muted-foreground tabular-nums">
          {fmt(props.w)} × {fmt(props.h)}
        </div>
      </div>
    </Show>
  )
}

export default function RatioSolver() {
  setToolPageMeta('numbers', 'ratio')
  const [params, setParams] = useSearchParams<{
    mode?: string
    a?: string
    b?: string
    c?: string
    d?: string
    scale?: string
    roundInt?: string
    total?: string
    parts?: string
    w?: string
    h?: string
  }>()

  const mode = createMemo<Mode>(() => {
    const m = params.mode
    return m === 'split' || m === 'aspect' ? m : 'proportion'
  })
  function setMode(m: Mode) {
    setParams({ mode: m === 'proportion' ? undefined : m }, { replace: true })
  }

  // ============== Proportion mode state ==============
  const [a, setASig] = createSignal(params.a ?? '2')
  const [b, setBSig] = createSignal(params.b ?? '3')
  const [c, setCSig] = createSignal(params.c ?? '4')
  const [d, setDSig] = createSignal(params.d ?? '')
  const [showScale, setShowScale] = createSignal(params.scale !== undefined || params.roundInt === '1')
  const [scale, setScaleSig] = createSignal(params.scale ?? '2')
  const [roundInt, setRoundInt] = createSignal(params.roundInt === '1')

  function bindParam<T extends string>(setter: (v: T) => void, key: keyof typeof params) {
    return (v: T) => {
      setter(v)
      setParams({ [key]: v || undefined } as Record<string, string | undefined>, { replace: true })
    }
  }
  const setA = bindParam(setASig, 'a')
  const setB = bindParam(setBSig, 'b')
  const setC = bindParam(setCSig, 'c')
  const setD = bindParam(setDSig, 'd')
  const setScale = bindParam(setScaleSig, 'scale')

  function toggleScale(v: boolean) {
    setShowScale(v)
    if (!v) setParams({ scale: undefined, roundInt: undefined }, { replace: true })
  }
  function toggleRoundInt(v: boolean) {
    setRoundInt(v)
    setParams({ roundInt: v ? '1' : undefined }, { replace: true })
  }

  const cells = createMemo<Cells>(() => [parseNum(a()), parseNum(b()), parseNum(c()), parseNum(d())])
  const proportion = createMemo(() => solveProportion(cells()))

  // Pull the current displayable A:B for the bar/scale section.
  // - solved: use the resolved cells
  // - simplified: top or bottom row
  // - validated: A:B
  // Otherwise null.
  const displayPair = createMemo<{ a: number; b: number; aStr: string; bStr: string } | null>(() => {
    const r = proportion()
    if (r.kind === 'solved') {
      return {
        a: r.cells[0],
        b: r.cells[1],
        aStr: cells()[0] === null ? fmt(r.cells[0]) : a(),
        bStr: cells()[1] === null ? fmt(r.cells[1]) : b(),
      }
    }
    if (r.kind === 'simplified') {
      return r.row === 'top'
        ? { a: r.a, b: r.b, aStr: a(), bStr: b() }
        : { a: r.a, b: r.b, aStr: c(), bStr: d() }
    }
    if (r.kind === 'validated') {
      return { a: r.a, b: r.b, aStr: a(), bStr: b() }
    }
    return null
  })

  const simplifiedPair = createMemo(() => {
    const p = displayPair()
    if (!p) return null
    return simplifyRatioFromStrings(p.aStr, p.bStr)
  })

  const scaledPair = createMemo<{ a: number; b: number } | null>(() => {
    if (!showScale()) return null
    const p = displayPair()
    const f = parseNum(scale())
    if (!p || f === null) return null
    const [sa, sb] = scaleRatio([p.a, p.b], f, roundInt())
    return { a: sa, b: sb }
  })

  // ============== Split mode state ==============
  function parsePartsParam(s: string | undefined): string[] {
    if (!s) return ['2', '3', '5']
    const arr = s.split(',').map((x) => x.trim())
    return arr.length >= 2 ? arr.slice(0, 8) : ['2', '3', '5']
  }
  const [total, setTotalSig] = createSignal(params.total ?? '1500')
  const [parts, setParts] = createSignal<string[]>(parsePartsParam(params.parts))

  const setTotal = bindParam(setTotalSig, 'total')

  function syncPartsUrl(list: string[]) {
    const cleaned = list.map((p) => p.trim()).filter((p) => parseNum(p) !== null && parseFloat(p) >= 0)
    setParams({ parts: cleaned.length >= 2 ? cleaned.join(',') : undefined }, { replace: true })
  }
  function updatePart(i: number, v: string) {
    const next = parts().map((p, idx) => (idx === i ? v : p))
    setParts(next)
    syncPartsUrl(next)
  }
  function addPart() {
    if (parts().length >= 8) return
    const next = [...parts(), '1']
    setParts(next)
    syncPartsUrl(next)
  }
  function removePart(i: number) {
    if (parts().length <= 2) return
    const next = parts().filter((_, idx) => idx !== i)
    setParts(next)
    syncPartsUrl(next)
  }

  const splitResult = createMemo(() => {
    const t = parseNum(total())
    const numParts = parts().map(parseNum)
    if (t === null || numParts.some((n) => n === null || n < 0)) return null
    const result = splitByRatio(t, numParts as number[])
    if (!result) return null
    const simplified = simplifyMultiRatioFromStrings(parts())
    return { values: result, simplified, parts: numParts as number[] }
  })

  // ============== Aspect mode state ==============
  const [w, setWSig] = createSignal(params.w ?? '1920')
  const [h, setHSig] = createSignal(params.h ?? '1080')
  const setW = bindParam(setWSig, 'w')
  const setH = bindParam(setHSig, 'h')

  function applyPreset(preset: { w: number; h: number }) {
    // Try to preserve scale: if user has a W set, keep it and scale H to match.
    const curW = parseNum(w())
    const curH = parseNum(h())
    if (curW && curW > 0) {
      const r = dimensionsFromAspect([preset.w, preset.h], curW, 'w')
      if (r) {
        setH(String(r.value))
        return
      }
    }
    if (curH && curH > 0) {
      const r = dimensionsFromAspect([preset.w, preset.h], curH, 'h')
      if (r) {
        setW(String(r.value))
        return
      }
    }
    setW(String(preset.w))
    setH(String(preset.h))
  }

  const aspectResult = createMemo(() => {
    const nw = parseNum(w())
    const nh = parseNum(h())
    if (nw === null || nh === null) return null
    const dec = Math.max(decimalDigits(w()), decimalDigits(h()))
    return aspectFromDimensions(nw, nh, dec)
  })

  const matchedPreset = createMemo(() => {
    const r = aspectResult()
    if (!r) return null
    return ASPECT_PRESETS.find((p) => p.w === r.a && p.h === r.b) ?? null
  })

  let proportionFirstRef: HTMLInputElement | undefined
  let splitFirstRef: HTMLInputElement | undefined
  let aspectFirstRef: HTMLInputElement | undefined
  onMount(() => {
    if (mode() === 'proportion') proportionFirstRef?.focus()
    else if (mode() === 'split') splitFirstRef?.focus()
    else aspectFirstRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Ratio solver"
        description="Simplify ratios, solve proportions, split totals into parts, and compute aspect ratios."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Mode" value={mode()} onChange={setMode} options={modeOptions} />
          <Show when={mode() === 'proportion'}>
            <ToolbarChip checked={showScale()} onChange={toggleScale}>
              Scale results
            </ToolbarChip>
            <Show when={showScale()}>
              <ToolbarChip checked={roundInt()} onChange={toggleRoundInt}>
                Round to integers
              </ToolbarChip>
            </Show>
          </Show>
          <Show when={mode() === 'aspect'}>
            <div class="ml-auto flex flex-wrap items-center gap-1.5">
              <For each={ASPECT_PRESETS}>
                {(preset) => (
                  <button
                    type="button"
                    onClick={() => applyPreset(preset)}
                    class={cn(
                      'inline-flex cursor-pointer items-center border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors',
                      matchedPreset()?.label === preset.label
                        ? 'border-violet bg-violet/10 text-violet'
                        : 'border-input bg-background text-foreground/80 hover:border-violet/60 hover:bg-violet/5 hover:text-violet'
                    )}
                  >
                    {preset.label}
                  </button>
                )}
              </For>
            </div>
          </Show>
        </ToolToolbar>

        {/* ============== PROPORTION MODE ============== */}
        <Show when={mode() === 'proportion'}>
          <div class="grid gap-6 md:grid-cols-2">
            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Proportion</h2>
                <span class="ml-auto text-xs text-muted-foreground">A : B = C : D</span>
              </div>
              <p class="mb-4 text-xs text-muted-foreground">
                Type any 2–4 cells. Leave one empty to solve for it; fill all four to verify.
              </p>

              <div class="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <ProportionCell
                  label="A"
                  value={a}
                  setValue={setA}
                  placeholder="2"
                  ref={(el) => (proportionFirstRef = el)}
                  highlighted={proportion().kind === 'solved' && (proportion() as { index: number }).index === 0}
                />
                <span class="pb-3 text-2xl font-bold text-muted-foreground">:</span>
                <ProportionCell
                  label="B"
                  value={b}
                  setValue={setB}
                  placeholder="3"
                  highlighted={proportion().kind === 'solved' && (proportion() as { index: number }).index === 1}
                />
                <div class="col-span-3 my-1 flex items-center gap-3">
                  <span class="h-px flex-1 bg-border" />
                  <span class="font-mono text-xs uppercase tracking-wider text-muted-foreground">equals</span>
                  <span class="h-px flex-1 bg-border" />
                </div>
                <ProportionCell
                  label="C"
                  value={c}
                  setValue={setC}
                  placeholder="4"
                  highlighted={proportion().kind === 'solved' && (proportion() as { index: number }).index === 2}
                />
                <span class="pb-3 text-2xl font-bold text-muted-foreground">:</span>
                <ProportionCell
                  label="D"
                  value={d}
                  setValue={setD}
                  placeholder="?"
                  highlighted={proportion().kind === 'solved' && (proportion() as { index: number }).index === 3}
                />
              </div>

              <Show when={showScale()}>
                <div class="anim-fade-up mt-6 border-t border-border pt-5">
                  <div class="mb-3 flex items-center gap-2">
                    <span aria-hidden class="size-1.5 rounded-full bg-info" />
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scale by</h3>
                  </div>
                  <NumberField value={scale() || undefined} onChange={setScale} format={false} class="flex flex-col gap-2">
                    <NumberFieldGroup>
                      <NumberFieldInput class="h-11 font-mono text-base" placeholder="2" />
                      <NumberFieldIncrementTrigger />
                      <NumberFieldDecrementTrigger />
                    </NumberFieldGroup>
                  </NumberField>
                </div>
              </Show>
            </section>

            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
                <Show when={proportion().kind === 'validated'}>
                  {(_) => {
                    const p = proportion() as { kind: 'validated'; valid: boolean }
                    return (
                      <span
                        class={cn(
                          'ml-auto inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                          p.valid
                            ? 'border-success bg-success/5 text-success'
                            : 'border-destructive bg-destructive/5 text-destructive'
                        )}
                      >
                        {p.valid ? '✓ Valid' : '✗ Mismatch'}
                      </span>
                    )
                  }}
                </Show>
              </div>

              <Show
                when={proportion().kind !== 'incomplete' && displayPair()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    {(proportion() as { kind: string; hint?: string }).hint ?? 'Enter values'}
                  </div>
                }
              >
                {(p) => (
                  <div class="anim-fade-up space-y-4">
                    <div class="flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
                      <span class="flex-1 font-mono text-2xl font-semibold tabular-nums break-all">
                        {fmt(p().a)} : {fmt(p().b)}
                      </span>
                      <CopyButton value={() => `${fmt(p().a)}:${fmt(p().b)}`} />
                    </div>

                    <ProportionBar parts={[Math.abs(p().a), Math.abs(p().b)]} labels={[`A: ${fmt(p().a)}`, `B: ${fmt(p().b)}`]} />

                    <Show when={(() => {
                      const s = simplifiedPair()
                      if (!s) return null
                      if (s.a === p().a && s.b === p().b) return null
                      return s
                    })()}>
                      {(s) => (
                        <div class="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-4 py-2.5 text-sm">
                          <span class="text-muted-foreground">Simplified</span>
                          <span class="font-mono tabular-nums">
                            {fmt(s().a)} : {fmt(s().b)}
                          </span>
                        </div>
                      )}
                    </Show>

                    <Show when={proportion().kind === 'solved'}>
                      {(_) => {
                        const r = proportion() as { kind: 'solved'; index: number; value: number; cells: [number, number, number, number] }
                        const labels = ['A', 'B', 'C', 'D']
                        return (
                          <div class="rounded-md border border-info/40 bg-info/5 px-4 py-3 text-sm">
                            <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-info">
                              Solved {labels[r.index]}
                            </div>
                            <div class="font-mono tabular-nums break-all">
                              {fmt(r.cells[0])} : {fmt(r.cells[1])} = {fmt(r.cells[2])} : {fmt(r.cells[3])}
                            </div>
                          </div>
                        )
                      }}
                    </Show>

                    <Show when={scaledPair()}>
                      {(s) => (
                        <div class="anim-fade-up rounded-md border border-info/40 bg-info/5 px-4 py-3">
                          <div class="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-info">
                            <span aria-hidden class="size-1.5 rounded-full bg-info" />
                            Scaled × {scale()}
                            <Show when={roundInt()}>
                              <span class="ml-1 text-[10px] font-normal normal-case text-muted-foreground">(rounded)</span>
                            </Show>
                          </div>
                          <div class="flex items-center gap-3">
                            <span class="flex-1 font-mono text-lg font-semibold tabular-nums break-all">
                              {fmt(s().a)} : {fmt(s().b)}
                            </span>
                            <CopyButton value={() => `${fmt(s().a)}:${fmt(s().b)}`} />
                          </div>
                        </div>
                      )}
                    </Show>
                  </div>
                )}
              </Show>
            </section>
          </div>
        </Show>

        {/* ============== SPLIT MODE ============== */}
        <Show when={mode() === 'split'}>
          <div class="grid gap-6 md:grid-cols-2">
            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Split</h2>
                <span class="ml-auto text-xs text-muted-foreground">{parts().length} parts</span>
              </div>
              <p class="mb-4 text-xs text-muted-foreground">
                Divide a total into parts according to a ratio (e.g. split a bill, scale a recipe).
              </p>

              <NumberField value={total() || undefined} onChange={setTotal} format={false} class="mb-5 flex flex-col gap-2">
                <NumberFieldLabel>Total</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput
                    ref={(el) => (splitFirstRef = el)}
                    class="h-12 font-mono text-base"
                    placeholder="1500"
                  />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>

              <div class="mb-2 flex items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parts</span>
                <span class="text-xs text-muted-foreground">(min 2, max 8)</span>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <Index each={parts()}>
                  {(val, i) => (
                    <div class="relative">
                      <NumberField
                        value={val()}
                        onChange={(v) => updatePart(i, v)}
                        format={false}
                        class="flex flex-col gap-2"
                      >
                        <NumberFieldGroup>
                          <NumberFieldInput
                            placeholder={`Part ${i + 1}`}
                            class="h-11 pr-16 font-mono text-base"
                          />
                          <NumberFieldIncrementTrigger />
                          <NumberFieldDecrementTrigger />
                        </NumberFieldGroup>
                      </NumberField>
                      <Show when={parts().length > 2}>
                        <button
                          type="button"
                          onClick={() => removePart(i)}
                          aria-label={`Remove part ${i + 1}`}
                          class="absolute right-7 top-1/2 inline-flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <TbOutlineX size={14} />
                        </button>
                      </Show>
                    </div>
                  )}
                </Index>
              </div>

              <Show when={parts().length < 8}>
                <Button variant="outline" size="sm" class="mt-4" onClick={addPart}>
                  + Add part
                </Button>
              </Show>
            </section>

            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
              </div>

              <Show
                when={splitResult()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Enter total and at least 2 non-zero parts
                  </div>
                }
              >
                {(r) => (
                  <div class="anim-fade-up space-y-4">
                    <ProportionBar
                      parts={r().values}
                      labels={r().values.map((v, i) => `${fmt(v)} (${parts()[i]})`)}
                    />
                    <div class="divide-y divide-border rounded-md border border-border">
                      <Index each={r().values}>
                        {(val, i) => (
                          <div class="flex items-center gap-3 px-4 py-2.5">
                            <span aria-hidden class={cn('size-2.5 shrink-0 rounded-sm', colorAt(i))} />
                            <span class="text-sm text-muted-foreground">
                              Part {i + 1} <span class="font-mono">({parts()[i]})</span>
                            </span>
                            <span class="ml-auto font-mono text-base font-semibold tabular-nums">{fmt(val())}</span>
                            <CopyButton value={() => fmt(val())} />
                          </div>
                        )}
                      </Index>
                    </div>
                    <Show when={r().simplified}>
                      {(s) => (
                        <div class="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-4 py-2.5 text-sm">
                          <span class="text-muted-foreground">Simplified ratio</span>
                          <span class="font-mono tabular-nums">{s().map((n) => fmt(n)).join(' : ')}</span>
                        </div>
                      )}
                    </Show>
                  </div>
                )}
              </Show>
            </section>
          </div>
        </Show>

        {/* ============== ASPECT MODE ============== */}
        <Show when={mode() === 'aspect'}>
          <div class="grid gap-6 md:grid-cols-2">
            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Dimensions</h2>
              </div>
              <p class="mb-4 text-xs text-muted-foreground">
                Enter width & height — get the simplified aspect ratio. Click a preset to scale to it.
              </p>

              <div class="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <NumberField value={w() || undefined} onChange={setW} format={false} class="flex flex-col gap-2">
                  <NumberFieldLabel>Width</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput
                      ref={(el) => (aspectFirstRef = el)}
                      class="h-12 font-mono text-base"
                      placeholder="1920"
                    />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <span class="pb-3 text-2xl font-bold text-muted-foreground">×</span>
                <NumberField value={h() || undefined} onChange={setH} format={false} class="flex flex-col gap-2">
                  <NumberFieldLabel>Height</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput class="h-12 font-mono text-base" placeholder="1080" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>

              <Show when={aspectResult()}>
                {(r) => (
                  <div class="anim-fade-up mt-6">
                    <AspectBox w={parseNum(w()) ?? 0} h={parseNum(h()) ?? 0} label={`${r().a}:${r().b}`} />
                  </div>
                )}
              </Show>
            </section>

            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
                <Show when={matchedPreset()}>
                  {(m) => (
                    <span class="ml-auto inline-flex items-center gap-1 border border-violet bg-violet/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet">
                      Preset {m().label}
                    </span>
                  )}
                </Show>
              </div>

              <Show
                when={aspectResult()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Enter positive width and height
                  </div>
                }
              >
                {(r) => (
                  <div class="anim-fade-up space-y-4">
                    <div class="flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
                      <span class="flex-1 font-mono text-2xl font-semibold tabular-nums break-all">
                        {r().a} : {r().b}
                      </span>
                      <CopyButton value={() => `${r().a}:${r().b}`} />
                    </div>
                    <div class="divide-y divide-border rounded-md border border-border text-sm">
                      <div class="flex justify-between px-4 py-2.5">
                        <span class="text-muted-foreground">Decimal ratio</span>
                        <span class="font-mono tabular-nums">{r().decimal.toFixed(4)}</span>
                      </div>
                      <div class="flex justify-between px-4 py-2.5">
                        <span class="text-muted-foreground">Width × Height</span>
                        <span class="font-mono tabular-nums">
                          {fmt(parseNum(w()) ?? 0)} × {fmt(parseNum(h()) ?? 0)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Solve other dimension</div>
                      <div class="grid gap-2 sm:grid-cols-2">
                        <For each={[100, 200, 480, 720, 1080, 1440, 2160] as const}>
                          {(target) => {
                            const calc = createMemo(() => dimensionsFromAspect([r().a, r().b], target, 'h'))
                            return (
                              <Show when={calc()}>
                                {(c) => (
                                  <div class="flex items-center justify-between rounded border border-border/60 bg-muted/20 px-3 py-1.5 text-xs">
                                    <span class="font-mono tabular-nums text-muted-foreground">
                                      {c().rounded ? '≈' : ''} {c().value} × {target}
                                    </span>
                                  </div>
                                )}
                              </Show>
                            )
                          }}
                        </For>
                      </div>
                    </div>
                  </div>
                )}
              </Show>
            </section>
          </div>
        </Show>
      </div>
    </main>
  )
}

type ProportionCellProps = {
  label: string
  value: () => string
  setValue: (v: string) => void
  placeholder: string
  ref?: (el: HTMLInputElement) => void
  highlighted?: boolean
}

function ProportionCell(props: ProportionCellProps) {
  return (
    <NumberField
      value={props.value() || undefined}
      onChange={props.setValue}
      format={false}
      class="flex flex-col gap-2"
    >
      <NumberFieldLabel class="text-xs">{props.label}</NumberFieldLabel>
      <NumberFieldGroup
        class={cn(
          'transition-colors',
          props.highlighted && 'ring-2 ring-info/40 [&>input]:bg-info/5 [&>input]:font-semibold [&>input]:text-info'
        )}
      >
        <NumberFieldInput ref={props.ref} class="h-12 font-mono text-base" placeholder={props.placeholder} />
        <NumberFieldIncrementTrigger />
        <NumberFieldDecrementTrigger />
      </NumberFieldGroup>
    </NumberField>
  )
}
