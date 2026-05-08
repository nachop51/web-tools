import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarChip } from '~/components/tool-toolbar'
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
} from '~/components/ui/number-field'
import { Slider, SliderFill, SliderThumb, SliderTrack } from '~/components/ui/slider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { TextField, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field'
import { setToolPageMeta } from '~/lib/seo'
import { cn } from '~/lib/utils'
import {
  absoluteError,
  applyPrecision,
  digitDiff,
  direction,
  formatScientificNote,
  relativeError,
  type Direction,
  type PrecisionMode,
} from '~/lib/utils/numbers/precision'

const MODE_OPTIONS: { value: PrecisionMode; label: string; hint: string }[] = [
  { value: 'round', label: 'Round', hint: 'half away from zero' },
  { value: 'floor', label: 'Floor', hint: 'always toward −∞' },
  { value: 'ceil', label: 'Ceil', hint: 'always toward +∞' },
  { value: 'trunc', label: 'Truncate', hint: 'toward zero' },
  { value: 'sigfigs', label: 'Sig Figs', hint: 'significant figures' },
]

const PRESETS: { label: string; value: string }[] = [
  { label: 'π', value: '3.14159265358979' },
  { label: 'e', value: '2.71828182845905' },
  { label: '√2', value: '1.41421356237310' },
  { label: '1/3', value: '0.33333333333333' },
  { label: '$19.99', value: '19.99' },
  { label: 'Avogadro', value: '6.02214076e23' },
]

const VALID_MODES = new Set<PrecisionMode>(['round', 'floor', 'ceil', 'trunc', 'sigfigs'])

const DEPTH_MIN = 0
const DEPTH_MAX = 15
const DEFAULT_DEPTH = 2
const DEFAULT_INPUT = '3.14159'

export default function DecimalPrecision() {
  setToolPageMeta('numbers', 'decimal-precision')

  const [params, setParams] = useSearchParams<{
    n?: string
    mode?: string
    d?: string
    places?: string
    ladder?: string
    errs?: string
  }>()

  const [input, setInputSignal] = createSignal(params.n ?? DEFAULT_INPUT)

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ n: v && v !== DEFAULT_INPUT ? v : undefined }, { replace: true })
  }

  const mode = createMemo<PrecisionMode>(() => {
    const m = params.mode
    return m && VALID_MODES.has(m as PrecisionMode) ? (m as PrecisionMode) : 'round'
  })

  function setMode(m: PrecisionMode) {
    setParams({ mode: m === 'round' ? undefined : m }, { replace: true })
  }

  const depth = createMemo(() => {
    const raw = params.d ?? params.places ?? String(DEFAULT_DEPTH)
    const p = parseInt(raw, 10)
    return isNaN(p) ? DEFAULT_DEPTH : Math.min(DEPTH_MAX, Math.max(DEPTH_MIN, p))
  })

  function setDepth(d: number) {
    const clamped = Math.min(DEPTH_MAX, Math.max(DEPTH_MIN, Math.round(d)))
    setParams(
      {
        d: clamped === DEFAULT_DEPTH ? undefined : String(clamped),
        places: undefined,
      },
      { replace: true }
    )
  }

  const showLadder = createMemo(() => params.ladder !== '0')
  const showErrors = createMemo(() => params.errs !== '0')
  function setShowLadder(v: boolean) {
    setParams({ ladder: v ? undefined : '0' }, { replace: true })
  }
  function setShowErrors(v: boolean) {
    setParams({ errs: v ? undefined : '0' }, { replace: true })
  }

  let inputRef: HTMLInputElement | undefined
  onMount(() => inputRef?.focus())

  const parsed = createMemo<number | null>(() => {
    const t = input().trim()
    if (!t) return null
    const n = parseFloat(t)
    return isNaN(n) || !isFinite(n) ? null : n
  })

  const sciNote = createMemo(() => formatScientificNote(input()))

  function resultFor(m: PrecisionMode): string {
    const n = parsed()
    if (n === null) return ''
    return formatNumber(applyPrecision(n, depth(), m))
  }

  const focusedResult = createMemo(() => resultFor(mode()))

  const diff = createMemo(() => {
    if (parsed() === null) return null
    return digitDiff(input(), depth(), mode())
  })

  const errors = createMemo(() => {
    const n = parsed()
    if (n === null) return null
    const r = applyPrecision(n, depth(), mode())
    return {
      abs: absoluteError(n, r),
      rel: relativeError(n, r),
      dir: direction(n, r),
    }
  })

  const focusedHint = createMemo(() => MODE_OPTIONS.find((m) => m.value === mode())?.hint ?? '')
  const focusedLabel = createMemo(() => MODE_OPTIONS.find((m) => m.value === mode())?.label ?? '')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Decimal precision"
        description="Round, floor, ceil, truncate, or trim to significant figures — and see exactly which digits you keep, what the rounding error costs you, and how every mode compares at every depth."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarChip checked={showErrors()} onChange={setShowErrors}>
            Show error stats
          </ToolbarChip>
          <ToolbarChip checked={showLadder()} onChange={setShowLadder}>
            Show ladder
          </ToolbarChip>
        </ToolToolbar>

        {/* Input card */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <div class="flex flex-col gap-5">
            <TextField value={input()} onChange={setInput} class="flex flex-col gap-1.5">
              <TextFieldLabel class="text-xs uppercase tracking-wider text-muted-foreground">Number</TextFieldLabel>
              <TextFieldInput
                ref={inputRef}
                type="text"
                inputmode="decimal"
                placeholder="e.g. 3.14159 or 1.23e-4"
                class="h-12 font-mono text-lg"
                spellcheck={false}
                autocomplete="off"
              />
            </TextField>

            <Show when={sciNote()}>
              {(n) => (
                <p class="-mt-3 text-xs text-muted-foreground">
                  Parsed as <span class="font-mono">{n()}</span>
                </p>
              )}
            </Show>

            <div class="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs uppercase tracking-wider text-muted-foreground">
                    {mode() === 'sigfigs' ? 'Sig figures' : 'Decimal places'}
                  </span>
                  <span class="font-mono text-sm tabular-nums text-foreground">{depth()}</span>
                </div>
                <Slider
                  minValue={DEPTH_MIN}
                  maxValue={DEPTH_MAX}
                  step={1}
                  value={[depth()]}
                  onChange={(v) => setDepth(v[0])}
                  class="py-2"
                >
                  <SliderTrack>
                    <SliderFill />
                    <SliderThumb />
                  </SliderTrack>
                </Slider>
                <div class="flex justify-between text-[10px] text-muted-foreground/70 font-mono">
                  <span>{DEPTH_MIN}</span>
                  <span>{DEPTH_MAX}</span>
                </div>
              </div>

              <NumberField
                value={String(depth())}
                onChange={(v) => {
                  const n = parseInt(v, 10)
                  if (!isNaN(n)) setDepth(n)
                }}
                minValue={DEPTH_MIN}
                maxValue={DEPTH_MAX}
                format={false}
                class="flex flex-col gap-1.5 sm:w-32"
              >
                <NumberFieldGroup>
                  <NumberFieldInput class="h-10 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="flex flex-wrap items-center gap-1.5">
              <span class="mr-1 text-[11px] uppercase tracking-wider text-muted-foreground/70">Try</span>
              <For each={PRESETS}>
                {(p) => (
                  <button
                    type="button"
                    onClick={() => setInput(p.value)}
                    title={p.value}
                    class="cursor-pointer border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-violet/60 hover:bg-violet/5 hover:text-violet"
                  >
                    {p.label}
                  </button>
                )}
              </For>
            </div>
          </div>
        </section>

        {/* Mode comparison strip */}
        <section class="anim-fade-up" style={{ 'animation-delay': '100ms' }}>
          <div class="mb-2 flex items-baseline justify-between px-1">
            <span class="text-[11px] uppercase tracking-wider text-muted-foreground/80">
              Modes — click to focus
            </span>
            <Show when={parsed() === null}>
              <span class="text-[11px] text-muted-foreground/60">enter a number above</span>
            </Show>
          </div>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <For each={MODE_OPTIONS}>
              {(opt) => {
                const active = () => mode() === opt.value
                const value = createMemo(() => resultFor(opt.value))
                return (
                  <button
                    type="button"
                    onClick={() => setMode(opt.value)}
                    title={opt.hint}
                    class={cn(
                      'flex cursor-pointer flex-col gap-1 border bg-card px-3 py-2.5 text-left transition-colors',
                      active()
                        ? 'border-violet bg-violet/5 shadow-sm'
                        : 'border-border hover:border-violet/60 hover:bg-violet/5'
                    )}
                  >
                    <span
                      class={cn(
                        'text-[10px] font-semibold uppercase tracking-wider',
                        active() ? 'text-violet' : 'text-muted-foreground'
                      )}
                    >
                      {opt.label}
                    </span>
                    <span class="min-h-5 break-all font-mono text-sm tabular-nums">
                      {value() || '—'}
                    </span>
                  </button>
                )
              }}
            </For>
          </div>
        </section>

        {/* Focused result */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Result · <span class="text-violet">{focusedLabel()}</span>
            </h2>
            <span class="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
              {focusedHint()}
            </span>
          </div>

          <Show
            when={focusedResult()}
            fallback={
              <div class="flex min-h-20 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter a number to see the result
              </div>
            }
          >
            <div class="flex flex-col gap-5">
              <div class="anim-fade-up flex items-center gap-3 overflow-hidden rounded-md border border-border bg-background/60 px-4 py-3">
                <span class="flex-1 break-all font-mono text-3xl font-semibold tracking-tight tabular-nums">
                  {focusedResult()}
                </span>
                <CopyButton value={() => focusedResult()} />
              </div>

              <Show when={diff()?.dropped}>
                <div class="rounded-md border border-border bg-background/40 p-4">
                  <div class="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Digit diff · what survives the cut
                  </div>
                  <div class="break-all font-mono text-xl leading-tight tabular-nums">
                    <span class="text-foreground">{diff()!.kept}</span>
                    <Show when={errors() && errors()!.dir !== 'exact'}>
                      <span
                        class={cn(
                          'mx-0.5 text-base',
                          errors()!.dir === 'up' ? 'text-emerald-500' : 'text-amber-500'
                        )}
                        title={errors()!.dir === 'up' ? 'rounded up' : 'rounded down'}
                      >
                        {errors()!.dir === 'up' ? '↑' : '↓'}
                      </span>
                    </Show>
                    <span class="text-muted-foreground/40 line-through">{diff()!.dropped}</span>
                  </div>
                </div>
              </Show>

              <Show when={showErrors() && errors()}>
                {(e) => (
                  <div class="grid gap-3 sm:grid-cols-3">
                    <Stat label="|absolute error|" mono value={formatErr(e().abs)} />
                    <Stat
                      label="relative error"
                      mono
                      value={
                        isNaN(e().rel) ? 'N/A' : formatPercent(e().rel * 100)
                      }
                    />
                    <Stat label="direction" value={describeDirection(e().dir)} />
                  </div>
                )}
              </Show>
            </div>
          </Show>
        </section>

        {/* Precision ladder */}
        <Show when={showLadder() && parsed() !== null}>
          <section class="anim-fade-up relative rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div class="flex items-center gap-3 border-b border-border px-6 py-3 sm:px-8">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Precision ladder
              </h2>
              <span class="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
                click a row to set depth
              </span>
            </div>
            <Ladder n={parsed()!} currentDepth={depth()} onPick={setDepth} />
          </section>
        </Show>
      </div>
    </main>
  )
}

function Ladder(props: { n: number; currentDepth: number; onPick: (d: number) => void }) {
  const rows = createMemo(() => {
    const out: {
      d: number
      floor: string
      round: string
      ceil: string
      trunc: string
      sig: string
      absErr: string
    }[] = []
    for (let d = DEPTH_MIN; d <= DEPTH_MAX; d++) {
      const r = applyPrecision(props.n, d, 'round')
      out.push({
        d,
        floor: formatNumber(applyPrecision(props.n, d, 'floor')),
        round: formatNumber(r),
        ceil: formatNumber(applyPrecision(props.n, d, 'ceil')),
        trunc: formatNumber(applyPrecision(props.n, d, 'trunc')),
        sig: formatNumber(applyPrecision(props.n, Math.max(1, d), 'sigfigs')),
        absErr: formatErr(absoluteError(props.n, r)),
      })
    }
    return out
  })

  return (
    <Table class="border-collapse text-xs">
      <TableHeader>
        <TableRow>
          <TableHead>Depth</TableHead>
          <TableHead class="text-right">Floor</TableHead>
          <TableHead class="text-right">Round</TableHead>
          <TableHead class="text-right">Ceil</TableHead>
          <TableHead class="text-right">Truncate</TableHead>
          <TableHead class="text-right">Sig figs</TableHead>
          <TableHead class="text-right">|err vs round|</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <For each={rows()}>
          {(row) => {
            const active = () => row.d === props.currentDepth
            return (
              <TableRow
                data-state={active() ? 'selected' : undefined}
                onClick={() => props.onPick(row.d)}
                class={cn(
                  'cursor-pointer',
                  !active() && 'text-muted-foreground hover:text-foreground'
                )}
              >
                <TableCell class={cn('text-left', active() && 'font-semibold text-violet')}>
                  {row.d}
                </TableCell>
                <TableCell class="text-right">{row.floor}</TableCell>
                <TableCell class="text-right">{row.round}</TableCell>
                <TableCell class="text-right">{row.ceil}</TableCell>
                <TableCell class="text-right">{row.trunc}</TableCell>
                <TableCell class="text-right">{row.sig}</TableCell>
                <TableCell class="text-right">{row.absErr}</TableCell>
              </TableRow>
            )
          }}
        </For>
      </TableBody>
    </Table>
  )
}

function Stat(props: { label: string; value: string; mono?: boolean }) {
  return (
    <div class="flex flex-col gap-1 border border-border bg-background px-3 py-2">
      <span class="text-[10px] uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <span class={cn('break-all text-sm', props.mono && 'font-mono tabular-nums')}>
        {props.value}
      </span>
    </div>
  )
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return String(n)
  return n.toString()
}

function formatErr(n: number): string {
  if (!isFinite(n)) return 'N/A'
  if (n === 0) return '0'
  return parseFloat(n.toPrecision(4)).toString()
}

function formatPercent(p: number): string {
  if (p === 0) return '0 %'
  if (Math.abs(p) >= 0.01) return p.toPrecision(3) + ' %'
  return p.toExponential(2) + ' %'
}

function describeDirection(d: Direction): string {
  if (d === 'up') return 'rounded up'
  if (d === 'down') return 'rounded down'
  return 'exact'
}
