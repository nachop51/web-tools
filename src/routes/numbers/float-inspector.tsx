import { useSearchParams } from '@solidjs/router'
import { createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { TbOutlineWaveSawTool, TbOutlineChevronLeft, TbOutlineChevronRight } from 'solid-icons/tb'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented, ToolbarChip } from '~/components/tool-toolbar'
import { setToolPageMeta } from '~/lib/seo'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import { Label } from '~/components/ui/label'
import {
  encodeFloat,
  decodeBits,
  nextUp,
  nextDown,
  ulpDistance,
  ulpGap,
  exactDecimal,
  parseHexInput,
  getSpecialValues,
  parseDecimalInput,
  formatStoredFloat,
  machineEpsilon,
  getLayout,
  type FloatFormat,
  type FloatBits,
} from '~/lib/utils/numbers/float-inspector'
import { cn } from '~/lib/utils'

const FORMAT_OPTIONS: { value: FloatFormat; label: string }[] = [
  { value: 'float16', label: 'float16' },
  { value: 'bfloat16', label: 'bfloat16' },
  { value: 'float32', label: 'float32' },
  { value: 'float64', label: 'float64' },
]

const FORMATS = new Set<FloatFormat>(['float16', 'bfloat16', 'float32', 'float64'])

function parseFormat(s: string | undefined): FloatFormat {
  return s && FORMATS.has(s as FloatFormat) ? (s as FloatFormat) : 'float64'
}

type InputMode = 'decimal' | 'hex' | 'bits'

export default function FloatInspector() {
  setToolPageMeta('numbers', 'float-inspector')

  const [params, setParams] = useSearchParams<{
    n?: string
    f?: string
    case?: string
    cmp?: string
    b?: string
  }>()

  const [format, setFormat] = createSignal<FloatFormat>(parseFormat(params.f))
  const [decimalText, setDecimalText] = createSignal(params.n ?? '0.1')
  const [hexText, setHexText] = createSignal('')
  const [inputMode, setInputMode] = createSignal<InputMode>('decimal')
  const [directBits, setDirectBits] = createSignal<string | null>(null)
  const [decimalError, setDecimalError] = createSignal<string | null>(null)
  const [hexError, setHexError] = createSignal<string | null>(null)
  const [uppercase, setUppercase] = createSignal(params.case === 'upper')
  const [compareMode, setCompareMode] = createSignal(params.cmp === '1')
  const [compareText, setCompareText] = createSignal(params.b ?? '0.2')

  // Convert directBits when format changes (decode with previous format → re-encode).
  let prevFormat: FloatFormat = format()
  createEffect(() => {
    const f = format()
    if (f !== prevFormat) {
      const db = directBits()
      if (db !== null && inputMode() === 'bits') {
        const v = decodeBits(db, prevFormat)
        if (v !== null) {
          setDecimalText(formatStoredFloat(v, f))
        }
        setDirectBits(null)
        setInputMode('decimal')
      }
      prevFormat = f
    }
  })

  // ─── primary float bits ─────────────────────────────────────────────────

  const fb = createMemo<FloatBits | null>(() => {
    const f = format()
    if (inputMode() === 'bits') {
      const db = directBits()
      if (db && db.length === getLayout(f).total) {
        const v = decodeBits(db, f)
        if (v === null) return null
        return encodeFloat(v, f)
      }
    }
    if (inputMode() === 'hex') {
      const r = parseHexInput(hexText(), f)
      if (!r.ok) {
        setHexError(r.error)
        return null
      }
      setHexError(null)
      const v = decodeBits(r.bits, f)
      if (v === null) return null
      return encodeFloat(v, f)
    }
    // decimal
    const v = parseDecimalInput(decimalText())
    if (v === null) {
      if (decimalText().trim()) setDecimalError('Not a valid decimal number')
      return null
    }
    setDecimalError(null)
    return encodeFloat(v, f)
  })

  function decimalDisplay(): string {
    if (inputMode() === 'decimal') return decimalText()
    const f = fb()
    return f ? formatStoredFloat(f.stored, format()) : ''
  }

  function hexDisplay(): string {
    if (inputMode() === 'hex') return hexText()
    const f = fb()
    if (!f) return ''
    return uppercase() ? f.hex.toUpperCase() : f.hex
  }

  function onDecimalChange(t: string) {
    setDecimalText(t)
    setInputMode('decimal')
    setDirectBits(null)
    setHexError(null)
  }

  function onHexChange(t: string) {
    setHexText(t)
    setInputMode('hex')
    setDirectBits(null)
    setDecimalError(null)
  }

  function flipBit(idx: number) {
    const f = fb()
    if (!f) return
    const flipped = f.bits
      .split('')
      .map((b, i) => (i === idx ? (b === '0' ? '1' : '0') : b))
      .join('')
    applyBits(flipped)
  }

  function applyBits(bits: string) {
    setDirectBits(bits)
    setInputMode('bits')
    // Sync the visible inputs so display stays consistent if user re-focuses.
    const v = decodeBits(bits, format())
    if (v !== null) setDecimalText(formatStoredFloat(v, format()))
    setHexText('')
    setDecimalError(null)
    setHexError(null)
  }

  function stepUlp(dir: 1 | -1) {
    const f = fb()
    if (!f) return
    const next = dir === 1 ? nextUp(f.bits, format()) : nextDown(f.bits, format())
    applyBits(next)
  }

  // ─── compare-mode bits ──────────────────────────────────────────────────

  const cmpFb = createMemo<FloatBits | null>(() => {
    if (!compareMode()) return null
    const v = parseDecimalInput(compareText())
    if (v === null) return null
    return encodeFloat(v, format())
  })

  const cmpDistance = createMemo<bigint | null>(() => {
    const a = fb()
    const b = cmpFb()
    if (!a || !b) return null
    return ulpDistance(a.bits, b.bits, format())
  })

  // ─── URL persistence ────────────────────────────────────────────────────

  createEffect(() => {
    setParams(
      {
        n: decimalText().trim() || undefined,
        f: format() === 'float64' ? undefined : format(),
        case: uppercase() ? 'upper' : undefined,
        cmp: compareMode() ? '1' : undefined,
        b: compareMode() ? compareText() || undefined : undefined,
      },
      { replace: true }
    )
  })

  let inputRef: HTMLInputElement | undefined
  onMount(() => inputRef?.focus())

  // ─── render ─────────────────────────────────────────────────────────────

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Float inspector"
        description="See exactly how a decimal number is stored as a float16, bfloat16, float32, or float64 IEEE-754 value (sign, exponent, and mantissa), visualized as colored bits you can click, step, and compare."
      />

      <div class="anim-fade-up flex flex-col gap-8" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented<FloatFormat>
            label="Format"
            value={format()}
            onChange={setFormat}
            options={FORMAT_OPTIONS}
          />
          <div class="ml-auto flex flex-wrap items-center gap-2">
            <ToolbarChip checked={compareMode()} onChange={setCompareMode}>
              Compare two
            </ToolbarChip>
            <ToolbarChip checked={uppercase()} onChange={setUppercase}>
              Uppercase hex
            </ToolbarChip>
          </div>
        </ToolToolbar>

        <section class="relative border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="border-b border-border px-6 py-3 sm:px-8 flex items-center gap-3">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Float bits</h2>
            <span class="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <TbOutlineWaveSawTool size={12} /> click any bit to flip
            </span>
          </div>
          <div class="flex flex-col gap-5 p-6 sm:p-8">
            <div class="grid gap-4 sm:grid-cols-[1fr_minmax(180px,auto)]">
              {/* Decimal input + ULP stepper */}
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                  <Label class="text-xs uppercase tracking-wider text-muted-foreground">Decimal</Label>
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Previous representable float"
                      title="Previous representable (←)"
                      onClick={() => stepUlp(-1)}
                      disabled={!fb()}
                      class="inline-flex size-7 items-center justify-center border border-border bg-background text-muted-foreground hover:border-violet/60 hover:text-violet hover:bg-violet/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <TbOutlineChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next representable float"
                      title="Next representable (→)"
                      onClick={() => stepUlp(1)}
                      disabled={!fb()}
                      class="inline-flex size-7 items-center justify-center border border-border bg-background text-muted-foreground hover:border-violet/60 hover:text-violet hover:bg-violet/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <TbOutlineChevronRight size={14} />
                    </button>
                    <CopyButton
                      value={() => decimalDisplay()}
                      disabled={!decimalDisplay()}
                      class="h-7 px-1.5 py-0 ml-1"
                    />
                  </div>
                </div>
                <TextField
                  value={decimalDisplay()}
                  onChange={onDecimalChange}
                  validationState={decimalError() ? 'invalid' : 'valid'}
                >
                  <TextFieldInput
                    ref={(el) => (inputRef = el)}
                    class="font-mono"
                    placeholder="3.14159 or -0.1 or Infinity"
                    spellcheck={false}
                    autocomplete="off"
                  />
                  <Show when={decimalError()}>
                    <TextFieldErrorMessage>{decimalError()}</TextFieldErrorMessage>
                  </Show>
                </TextField>
              </div>

              {/* Hex input */}
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                  <Label class="text-xs uppercase tracking-wider text-muted-foreground">Hex</Label>
                  <CopyButton
                    value={() => '0x' + hexDisplay()}
                    disabled={!hexDisplay()}
                    class="h-7 px-1.5 py-0"
                  />
                </div>
                <TextField
                  value={hexDisplay()}
                  onChange={onHexChange}
                  validationState={hexError() ? 'invalid' : 'valid'}
                >
                  <TextFieldInput
                    class="font-mono"
                    placeholder={`${getLayout(format()).total / 4} hex digits`}
                    spellcheck={false}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                  />
                  <Show when={hexError()}>
                    <TextFieldErrorMessage>{hexError()}</TextFieldErrorMessage>
                  </Show>
                </TextField>
              </div>
            </div>

            {/* Special-values palette */}
            <SpecialValuesRow format={format()} onSelect={(b) => applyBits(b)} />

            {/* Bit grid */}
            <Show when={fb()}>
              {(f) => (
                <div class="anim-fade-in flex flex-col gap-4">
                  <BitGrid bits={f().bits} format={format()} onFlip={flipBit} />

                  {/* Stats */}
                  <div class="grid gap-3 sm:grid-cols-3">
                    <Stat label="Sign" mono copyable value={`${f().sign}  (${f().sign === '0' ? '+' : '−'})`} />
                    <Stat
                      label="Exponent"
                      mono
                      copyable
                      value={`${f().exponent}${
                        f().classification === 'normal'
                          ? '  (' +
                            (parseInt(f().exponent, 2) - getLayout(format()).bias).toString() +
                            ')'
                          : ''
                      }`}
                    />
                    <Stat label="Mantissa" mono truncate copyable value={f().mantissa} />
                  </div>

                  <div class="grid gap-3 sm:grid-cols-3">
                    <Stat label="Hex" mono copyable value={`0x${uppercase() ? f().hex.toUpperCase() : f().hex}`} />
                    <Stat
                      label="Stored value"
                      mono
                      copyable
                      value={formatStoredFloat(f().stored, format())}
                    />
                    <Stat label="Class" copyable value={f().classification} />
                  </div>

                  <div class="grid gap-3 sm:grid-cols-3">
                    <Stat
                      label="ULP gap to next"
                      mono
                      truncate
                      copyable
                      value={ulpGap(f().bits, format()) ?? '-'}
                    />
                    <Stat
                      label="Machine ε"
                      mono
                      copyable
                      value={`2⁻${getLayout(format()).mant}  (${machineEpsilon(format()).toString()})`}
                    />
                    <Stat
                      label="Bias"
                      mono
                      copyable
                      value={getLayout(format()).bias.toString()}
                    />
                  </div>

                  <div class="grid gap-3">
                    <Stat
                      label="Exact decimal value"
                      mono
                      copyable
                      monoSmall
                      wrap
                      value={exactDecimal(f().bits, format())}
                    />
                  </div>
                </div>
              )}
            </Show>
          </div>
        </section>

        {/* Compare card */}
        <Show when={compareMode()}>
          <section class="anim-fade-in relative border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div class="border-b border-border px-6 py-3 sm:px-8 flex items-center gap-3">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Compare with</h2>
              <span class="ml-auto text-[11px] text-muted-foreground">
                differing bits highlighted · ULP distance below
              </span>
            </div>
            <div class="flex flex-col gap-5 p-6 sm:p-8">
              <div class="flex flex-col gap-2">
                <Label class="text-xs uppercase tracking-wider text-muted-foreground">Decimal B</Label>
                <TextField value={compareText()} onChange={setCompareText}>
                  <TextFieldInput
                    class="font-mono"
                    placeholder="0.2"
                    spellcheck={false}
                    autocomplete="off"
                  />
                </TextField>
              </div>

              <Show when={cmpFb() && fb()}>
                {(_) => (
                  <div class="flex flex-col gap-4">
                    <BitGrid
                      bits={cmpFb()!.bits}
                      format={format()}
                      diffAgainst={fb()!.bits}
                      readonly
                    />

                    <div class="grid gap-3 sm:grid-cols-3">
                      <Stat
                        label="Hex B"
                        mono
                        copyable
                        value={`0x${uppercase() ? cmpFb()!.hex.toUpperCase() : cmpFb()!.hex}`}
                      />
                      <Stat
                        label="Stored B"
                        mono
                        copyable
                        value={formatStoredFloat(cmpFb()!.stored, format())}
                      />
                      <Stat
                        label="ULP distance (B − A)"
                        mono
                        copyable
                        value={
                          cmpDistance() === null
                            ? 'N/A (NaN)'
                            : (cmpDistance()! >= 0n ? '+' : '') + cmpDistance()!.toString()
                        }
                      />
                    </div>

                    <Stat
                      label="Differing bits"
                      mono
                      copyable
                      value={countDiffBits(fb()!.bits, cmpFb()!.bits).toString()}
                    />
                  </div>
                )}
              </Show>
            </div>
          </section>
        </Show>
      </div>
    </main>
  )
}

// ─── Bit grid (reusable) ────────────────────────────────────────────────────

type BitGridProps = {
  bits: string
  format: FloatFormat
  onFlip?: (idx: number) => void
  diffAgainst?: string
  readonly?: boolean
}

function BitGrid(props: BitGridProps) {
  const layout = () => getLayout(props.format)
  const expEnd = () => 1 + layout().exp
  const role = (i: number) => (i === 0 ? 'sign' : i < expEnd() ? 'exp' : 'mant')
  return (
    <div class="overflow-x-auto">
      <div class="inline-flex flex-wrap gap-1 font-mono text-[13px] leading-none">
        <For each={props.bits.split('')}>
          {(bit, i) => {
            const r = () => role(i())
            const isDiff = () => props.diffAgainst && props.diffAgainst.charAt(i()) !== bit
            return (
              <button
                type="button"
                disabled={props.readonly}
                onClick={() => !props.readonly && props.onFlip?.(i())}
                class={cn(
                  'flex h-7 w-5 items-center justify-center border transition-colors',
                  !props.readonly && 'cursor-pointer',
                  r() === 'sign' &&
                    'border-violet-400/80 bg-violet-200/50 text-violet-500 hover:bg-violet-200/80 dark:bg-violet-500/10 dark:border-violet-500/40 dark:hover:bg-violet-500/30',
                  r() === 'exp' &&
                    'border-info-foreground/40 bg-sky-200/40 hover:bg-sky-200/80 text-info-foreground dark:text-sky-400 dark:bg-sky-500/10 dark:hover:dark:bg-sky-400/40',
                  r() === 'mant' &&
                    'border-emerald-300 bg-emerald-200/40 text-emerald-600 hover:bg-emerald-200/80 dark:bg-emerald-500/20 dark:border-emerald-400/40  dark:hover:bg-emerald-500/30',
                  bit === '0' && 'opacity-55',
                  bit === '1' &&
                    r() === 'sign' &&
                    'bg-violet-300/35 dark:bg-violet-600/20 dark:border-violet-400/60',
                  bit === '1' && r() === 'exp' && 'dark:bg-sky-600/20 dark:border-sky-400/60',
                  bit === '1' &&
                    r() === 'mant' &&
                    'bg-emerald-300/35 dark:text-emerald-500 dark:bg-emerald-500/20',
                  isDiff() && 'ring-2 ring-amber-400 ring-offset-1 ring-offset-background opacity-100'
                )}
                title={`bit ${i()} (${r()})`}
              >
                {bit}
              </button>
            )
          }}
        </For>
      </div>
      <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <LegendDot class="bg-violet" label="sign (1)" />
        <LegendDot class="bg-info-foreground dark:bg-sky-400" label={`exponent (${layout().exp})`} />
        <LegendDot class="bg-success-foreground dark:bg-emerald-400" label={`mantissa (${layout().mant})`} />
        <Show when={props.diffAgainst}>
          <span class="inline-flex items-center gap-1.5">
            <span aria-hidden class="inline-block size-2 ring-2 ring-amber-400" />
            differs
          </span>
        </Show>
      </div>
    </div>
  )
}

// ─── Special values palette ─────────────────────────────────────────────────

type SpecialValuesRowProps = {
  format: FloatFormat
  onSelect: (bits: string) => void
}

function SpecialValuesRow(props: SpecialValuesRowProps) {
  const values = createMemo(() => getSpecialValues(props.format))
  return (
    <div class="flex flex-wrap items-center gap-1.5">
      <span class="text-[11px] uppercase tracking-wider text-muted-foreground/70 mr-1">Try</span>
      <For each={values()}>
        {(v) => (
          <button
            type="button"
            onClick={() => props.onSelect(v.bits)}
            title={v.note ?? v.label}
            class="border border-border bg-background px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:border-violet/60 hover:text-violet hover:bg-violet/5 transition-colors cursor-pointer"
          >
            {v.label}
          </button>
        )}
      </For>
    </div>
  )
}

// ─── helpers ────────────────────────────────────────────────────────────────

function countDiffBits(a: string, b: string): number {
  let n = 0
  for (let i = 0; i < a.length && i < b.length; i++) if (a.charAt(i) !== b.charAt(i)) n++
  return n
}

// ─── Stat / LegendDot ───────────────────────────────────────────────────────

type StatProps = {
  label: string
  value: string
  mono?: boolean
  truncate?: boolean
  wrap?: boolean
  copyable?: boolean
  monoSmall?: boolean
}

function Stat(props: StatProps) {
  return (
    <div class="flex flex-col gap-1 border border-border bg-background px-3 py-2 relative">
      <span class="text-[10px] uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <span
        class={cn(
          'text-sm break-all',
          props.mono && 'font-mono',
          props.monoSmall && 'text-[11px] leading-snug',
          props.truncate && 'truncate',
          props.wrap && 'whitespace-pre-wrap break-words'
        )}
        title={props.truncate ? props.value : undefined}
      >
        {props.value}
      </span>
      <Show when={props.copyable}>
        <CopyButton value={() => props.value} class="absolute right-1.5 top-1.5 h-6 px-1.5 py-0" />
      </Show>
    </div>
  )
}

type LegendDotProps = { class: string; label: string }
function LegendDot(props: LegendDotProps) {
  return (
    <span class="inline-flex items-center gap-1.5">
      <span aria-hidden class={cn('inline-block size-2', props.class)} />
      {props.label}
    </span>
  )
}
