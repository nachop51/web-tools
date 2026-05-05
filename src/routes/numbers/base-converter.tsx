import { useSearchParams } from '@solidjs/router'
import { batch, createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import { TbOutlineArrowsExchange, TbOutlineWaveSawTool } from 'solid-icons/tb'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented, ToolbarChip } from '~/components/tool-toolbar'
import { setToolPageMeta } from '~/lib/seo'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import { Label } from '~/components/ui/label'
import {
  bitsToFloat,
  type BitWidth,
  convertToBase,
  fitsInWidth,
  floatToBits,
  formatStoredFloat,
  formatInBase,
  groupDigits,
  parseInBase,
  stripBaseSpecificPrefix,
  toSignedAtWidth,
  toUnsignedAtWidth,
  widthRange,
} from '~/lib/utils/numbers/converter'
import { cn } from '~/lib/utils'

type Std = 2 | 8 | 10 | 16
const STANDARD: { base: Std; label: string; short: string; prefix: string; group: number }[] = [
  { base: 2, label: 'Binary', short: 'BIN', prefix: '0b', group: 4 },
  { base: 8, label: 'Octal', short: 'OCT', prefix: '0o', group: 3 },
  { base: 10, label: 'Decimal', short: 'DEC', prefix: '', group: 3 },
  { base: 16, label: 'Hex', short: 'HEX', prefix: '0x', group: 4 },
]

type WidthChoice = 'auto' | '8' | '16' | '32' | '64'

function parseBitWidth(s: string | undefined): WidthChoice {
  if (s === '8' || s === '16' || s === '32' || s === '64' || s === 'auto') return s
  return 'auto'
}

function widthToBitWidth(w: WidthChoice): BitWidth {
  return w === 'auto' ? 'auto' : (Number(w) as 8 | 16 | 32 | 64)
}

export default function BaseConverter() {
  setToolPageMeta('numbers', 'base-converter')

  const [params, setParams] = useSearchParams<{
    n?: string
    w?: string
    case?: string
    g?: string
  }>()

  // ─── Live multi-base converter ────────────────────────────────────────────

  const initialValue = (() => {
    if (!params.n) return null
    try {
      return BigInt(params.n)
    } catch {
      return null
    }
  })()

  const [value, setValue] = createSignal<bigint | null>(initialValue)
  const [width, setWidth] = createSignal<WidthChoice>(parseBitWidth(params.w))
  const [uppercase, setUppercase] = createSignal(params.case === 'upper')
  const [grouped, setGrouped] = createSignal(params.g !== '0')
  const [focusedBase, setFocusedBase] = createSignal<Std | null>(null)
  const [drafts, setDrafts] = createStore<Record<Std, string>>({ 2: '', 8: '', 10: '', 16: '' })
  const [errors, setErrors] = createStore<Record<Std, string | null>>({
    2: null,
    8: null,
    10: null,
    16: null,
  })

  const bitWidth = createMemo(() => widthToBitWidth(width()))

  const overflow = createMemo(() => {
    const v = value()
    const w = bitWidth()
    if (v === null || w === 'auto') return false
    return !fitsInWidth(v, w)
  })

  function formatFor(base: Std): string {
    const v = value()
    if (v === null) return ''
    const raw = convertToBase(v, base, { bitWidth: bitWidth(), uppercase: uppercase() })
    if (!grouped()) return raw
    const groupSize = STANDARD.find((s) => s.base === base)!.group
    return groupDigits(raw, groupSize)
  }

  function displayFor(base: Std): string {
    if (focusedBase() === base) return drafts[base]
    return formatFor(base)
  }

  function onInput(base: Std, text: string) {
    setDrafts(base, text)
    setErrors(base, null)
    if (text.trim() === '') {
      setValue(null)
      // Clear other errors too — empty input means "no value"
      for (const b of [2, 8, 10, 16] as Std[]) setErrors(b, null)
      return
    }
    const stripped = stripBaseSpecificPrefix(text, base)
    const r = parseInBase(stripped, base)
    if (r.ok) {
      setValue(r.value)
      // A successful parse in any field clears errors in all fields.
      for (const b of [2, 8, 10, 16] as Std[]) setErrors(b, null)
    } else {
      setErrors(base, r.error)
    }
  }

  function onFocus(base: Std) {
    setDrafts(base, formatFor(base))
    setFocusedBase(base)
  }

  function onBlur(base: Std) {
    setFocusedBase(null)
    // Clear stale error when leaving an empty/invalid field
    setErrors(base, null)
  }

  function clearAll() {
    batch(() => {
      setValue(null)
      setFocusedBase(null)
      for (const b of [2, 8, 10, 16] as Std[]) {
        setDrafts(b, '')
        setErrors(b, null)
      }
    })
  }

  // URL persistence
  createEffect(() => {
    const v = value()
    setParams(
      {
        n: v === null ? undefined : v.toString(),
        w: width() === 'auto' ? undefined : width(),
        case: uppercase() ? 'upper' : undefined,
        g: grouped() ? undefined : '0',
      },
      { replace: true }
    )
  })

  // Width-range info chip
  const widthInfo = createMemo(() => {
    const w = bitWidth()
    if (w === 'auto') return null
    const r = widthRange(w)
    return {
      signedMin: r.signedMin.toString(),
      signedMax: r.signedMax.toString(),
      unsignedMax: r.unsignedMax.toString(),
    }
  })

  const overflowInfo = createMemo(() => {
    const v = value()
    const w = bitWidth()
    if (v === null || w === 'auto' || !overflow()) return null
    const masked = toUnsignedAtWidth(v, w)
    const signed = toSignedAtWidth(masked, w)
    return { masked: masked.toString(), signed: signed.toString() }
  })

  let firstInputRef: HTMLInputElement | undefined
  onMount(() => firstInputRef?.focus())

  // ─── Custom base section ──────────────────────────────────────────────────

  const [customFromBase, setCustomFromBase] = createSignal(10)
  const [customToBase, setCustomToBase] = createSignal(36)
  const [customInput, setCustomInput] = createSignal('')
  const customResult = createMemo<{ value: string; error: string | null }>(() => {
    const text = customInput()
    if (!text.trim()) return { value: '', error: null }
    if (customFromBase() < 2 || customFromBase() > 36) return { value: '', error: 'Source base must be 2–36' }
    if (customToBase() < 2 || customToBase() > 36) return { value: '', error: 'Target base must be 2–36' }
    const r = parseInBase(text, customFromBase())
    if (!r.ok) return { value: '', error: r.error }
    return { value: formatInBase(r.value, customToBase(), { uppercase: uppercase() }), error: null }
  })

  function swapCustomBases() {
    const f = customFromBase()
    const t = customToBase()
    const out = customResult()
    batch(() => {
      setCustomFromBase(t)
      setCustomToBase(f)
      if (out.value) setCustomInput(out.value)
    })
  }

  // ─── IEEE-754 inspector ──────────────────────────────────────────────────

  const [precision, setPrecision] = createSignal<32 | 64>(32)
  const [floatInput, setFloatInput] = createSignal('1')
  const [floatError, setFloatError] = createSignal<string | null>(null)

  const floatBits = createMemo(() => {
    const text = floatInput().trim()
    if (!text) {
      setFloatError(null)
      return null
    }
    let parsed: number
    if (text === 'inf' || text === '+inf' || text === 'Infinity') parsed = Infinity
    else if (text === '-inf' || text === '-Infinity') parsed = -Infinity
    else if (text === 'nan' || text === 'NaN') parsed = NaN
    else parsed = Number(text)
    if (!Number.isFinite(parsed) && !Number.isNaN(parsed) && parsed !== Infinity && parsed !== -Infinity) {
      setFloatError('Not a valid decimal number')
      return null
    }
    if (Number.isNaN(parsed) && text.toLowerCase() !== 'nan') {
      setFloatError('Not a valid decimal number')
      return null
    }
    setFloatError(null)
    return floatToBits(parsed, precision())
  })

  function flipBit(idx: number) {
    const fb = floatBits()
    if (!fb) return
    const flipped = fb.bits
      .split('')
      .map((b, i) => (i === idx ? (b === '0' ? '1' : '0') : b))
      .join('')
    const newValue = bitsToFloat(flipped, precision())
    if (newValue === null) return
    setFloatInput(formatStoredFloat(newValue, precision()))
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Base converter"
        description="Live conversion between binary, octal, decimal, and hexadecimal — with two's complement at fixed bit widths, custom bases up to 36, and an IEEE-754 inspector."
      />

      <div class="anim-fade-up flex flex-col gap-8" style={{ 'animation-delay': '60ms' }}>
        {/* Toolbar */}
        <ToolToolbar>
          <ToolbarSegmented<WidthChoice>
            label="Width"
            value={width()}
            onChange={setWidth}
            options={[
              { value: 'auto', label: 'Auto' },
              { value: '8', label: '8' },
              { value: '16', label: '16' },
              { value: '32', label: '32' },
              { value: '64', label: '64' },
            ]}
          />
          <div class="ml-auto flex flex-wrap items-center gap-2">
            <ToolbarChip checked={uppercase()} onChange={setUppercase}>
              Uppercase hex
            </ToolbarChip>
            <ToolbarChip checked={grouped()} onChange={setGrouped}>
              Group digits
            </ToolbarChip>
            <button
              type="button"
              onClick={clearAll}
              class="anim-fade-in inline-flex items-center gap-1.5 border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-violet/60 hover:text-foreground hover:bg-violet/5 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </ToolToolbar>

        {/* Live converter */}
        <section class="relative border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="border-b border-border px-6 py-3 sm:px-8 flex items-center gap-3">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live converter</h2>
            <Show when={widthInfo()}>
              {(info) => (
                <span class="ml-auto font-mono text-[11px] text-muted-foreground">
                  signed: {info().signedMin} … {info().signedMax} · unsigned: 0 … {info().unsignedMax}
                </span>
              )}
            </Show>
          </div>

          <div class="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <div class="grid grid-cols-1 divide-y divide-border">
              <BaseField
                base={2}
                value={displayFor(2)}
                error={errors[2]}
                hasError={errors[2] !== null}
                ref={(el) => (firstInputRef = el)}
                onInput={(t) => onInput(2, t)}
                onFocus={() => onFocus(2)}
                onBlur={() => onBlur(2)}
              />
              <BaseField
                base={8}
                value={displayFor(8)}
                error={errors[8]}
                hasError={errors[8] !== null}
                onInput={(t) => onInput(8, t)}
                onFocus={() => onFocus(8)}
                onBlur={() => onBlur(8)}
              />
            </div>
            <div class="grid grid-cols-1 divide-y divide-border">
              <BaseField
                base={10}
                value={displayFor(10)}
                error={errors[10]}
                hasError={errors[10] !== null}
                onInput={(t) => onInput(10, t)}
                onFocus={() => onFocus(10)}
                onBlur={() => onBlur(10)}
              />
              <BaseField
                base={16}
                value={displayFor(16)}
                error={errors[16]}
                hasError={errors[16] !== null}
                onInput={(t) => onInput(16, t)}
                onFocus={() => onFocus(16)}
                onBlur={() => onBlur(16)}
              />
            </div>
          </div>

          <Show when={overflowInfo()}>
            {(info) => (
              <div class="anim-fade-in border-t border-warning-foreground/30 bg-warning/40 px-6 py-2 text-xs text-warning-foreground sm:px-8">
                <span class="font-semibold">Overflow:</span> value doesn't fit in {bitWidth()}-bit. Bit pattern shows
                wrapped form (unsigned <span class="font-mono">{info().masked}</span> / signed{' '}
                <span class="font-mono">{info().signed}</span>).
              </div>
            )}
          </Show>
        </section>

        {/* Custom base */}
        <section class="relative border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="border-b border-border px-6 py-3 sm:px-8 flex items-center gap-3">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Custom base</h2>
            <span class="ml-auto text-[11px] text-muted-foreground">Any base 2–36 ↔ any base 2–36</span>
          </div>
          <div class="grid gap-4 p-6 sm:p-8 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <Label class="text-xs uppercase tracking-wider text-muted-foreground">From base</Label>
                <BaseStepper value={customFromBase()} onChange={setCustomFromBase} />
              </div>
              <TextField
                value={customInput()}
                onChange={setCustomInput}
                validationState={customResult().error ? 'invalid' : 'valid'}
              >
                <TextFieldInput
                  class="font-mono"
                  placeholder={`Number in base ${customFromBase()}`}
                  spellcheck={false}
                  autocomplete="off"
                />
                <Show when={customResult().error}>
                  <TextFieldErrorMessage>{customResult().error}</TextFieldErrorMessage>
                </Show>
              </TextField>
            </div>

            <div class="flex items-center justify-center pb-1">
              <button
                type="button"
                onClick={swapCustomBases}
                aria-label="Swap bases"
                class={cn(
                  'group inline-flex size-9 items-center justify-center border border-border bg-background text-muted-foreground cursor-pointer',
                  'transition-[transform,border-color,color,background-color] duration-200 ease-out',
                  'hover:rotate-180 hover:border-violet hover:text-violet hover:bg-violet/5'
                )}
              >
                <TbOutlineArrowsExchange size={16} class="lg:rotate-0 rotate-90" />
              </button>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <Label class="text-xs uppercase tracking-wider text-muted-foreground">To base</Label>
                <BaseStepper value={customToBase()} onChange={setCustomToBase} />
              </div>
              <div class="relative">
                <div
                  class={cn(
                    'flex h-10 items-center rounded-md border bg-background px-3 font-mono text-sm pr-12',
                    customResult().value ? 'border-input text-foreground' : 'border-dashed border-border text-muted-foreground'
                  )}
                >
                  <span class="truncate">
                    {customResult().value || `Result in base ${customToBase()}`}
                  </span>
                </div>
                <CopyButton
                  value={() => customResult().value}
                  disabled={!customResult().value}
                  class="absolute right-1.5 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* IEEE-754 inspector */}
        <section class="relative border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="border-b border-border px-6 py-3 sm:px-8 flex items-center gap-3">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">IEEE-754 inspector</h2>
            <span class="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <TbOutlineWaveSawTool size={12} /> click any bit to flip
            </span>
          </div>
          <div class="flex flex-col gap-5 p-6 sm:p-8">
            <div class="flex flex-wrap items-end gap-4">
              <div class="flex flex-1 flex-col gap-2 min-w-[14rem]">
                <Label class="text-xs uppercase tracking-wider text-muted-foreground">Decimal</Label>
                <TextField
                  value={floatInput()}
                  onChange={setFloatInput}
                  validationState={floatError() ? 'invalid' : 'valid'}
                >
                  <TextFieldInput
                    class="font-mono"
                    placeholder="3.14159 or -0.1 or Infinity"
                    spellcheck={false}
                    autocomplete="off"
                  />
                  <Show when={floatError()}>
                    <TextFieldErrorMessage>{floatError()}</TextFieldErrorMessage>
                  </Show>
                </TextField>
              </div>

              <ToolbarSegmented<'32' | '64'>
                label="Precision"
                value={String(precision()) as '32' | '64'}
                onChange={(v) => setPrecision(Number(v) as 32 | 64)}
                options={[
                  { value: '32', label: '32-bit' },
                  { value: '64', label: '64-bit' },
                ]}
              />
            </div>

            <Show when={floatBits()}>
              {(fb) => (
                <div class="anim-fade-in flex flex-col gap-4">
                  {/* Colored bit visualization */}
                  <div class="overflow-x-auto">
                    <div class="inline-flex flex-wrap gap-1 font-mono text-[13px] leading-none">
                      <For each={fb().bits.split('')}>
                        {(bit, i) => {
                          const expEnd = precision() === 32 ? 9 : 12
                          const role = () => (i() === 0 ? 'sign' : i() < expEnd ? 'exp' : 'mant')
                          return (
                            <button
                              type="button"
                              onClick={() => flipBit(i())}
                              class={cn(
                                'flex h-7 w-5 items-center justify-center border cursor-pointer transition-colors',
                                role() === 'sign' &&
                                  'border-violet/40 bg-violet/10 text-violet hover:bg-violet/20',
                                role() === 'exp' &&
                                  'border-info-foreground/40 bg-info/40 text-info-foreground hover:bg-info/70 dark:text-sky-200',
                                role() === 'mant' &&
                                  'border-success-foreground/30 bg-success/30 text-success-foreground hover:bg-success/60 dark:text-emerald-200',
                                bit === '0' && 'opacity-55'
                              )}
                              title={`bit ${i()} (${role()})`}
                            >
                              {bit}
                            </button>
                          )
                        }}
                      </For>
                    </div>
                    <div class="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                      <LegendDot class="bg-violet" label="sign (1)" />
                      <LegendDot
                        class="bg-info-foreground dark:bg-sky-400"
                        label={`exponent (${precision() === 32 ? 8 : 11})`}
                      />
                      <LegendDot
                        class="bg-success-foreground dark:bg-emerald-400"
                        label={`mantissa (${precision() === 32 ? 23 : 52})`}
                      />
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div class="grid gap-3 sm:grid-cols-3">
                    <Stat label="Sign" mono value={`${fb().sign}  (${fb().sign === '0' ? '+' : '-'})`} />
                    <Stat
                      label="Exponent"
                      mono
                      value={`${fb().exponent}${
                        fb().classification === 'normal'
                          ? '  (' + (parseInt(fb().exponent, 2) - (precision() === 32 ? 127 : 1023)).toString() + ')'
                          : ''
                      }`}
                    />
                    <Stat
                      label="Mantissa"
                      mono
                      truncate
                      value={fb().mantissa}
                    />
                  </div>

                  <div class="grid gap-3 sm:grid-cols-3">
                    <Stat label="Hex" mono copyable value={`0x${uppercase() ? fb().hex.toUpperCase() : fb().hex}`} />
                    <Stat label="Stored value" mono value={formatStoredFloat(fb().stored, precision())} />
                    <Stat label="Class" value={fb().classification} />
                  </div>
                </div>
              )}
            </Show>
          </div>
        </section>
      </div>
    </main>
  )
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

type BaseFieldProps = {
  base: Std
  value: string
  error: string | null
  hasError: boolean
  ref?: (el: HTMLInputElement) => void
  onInput: (text: string) => void
  onFocus: () => void
  onBlur: () => void
}

function BaseField(props: BaseFieldProps) {
  const meta = () => STANDARD.find((s) => s.base === props.base)!
  return (
    <div
      class={cn(
        'flex flex-col gap-1.5 px-6 py-5 sm:px-8 transition-colors',
        props.hasError && 'bg-error/30'
      )}
    >
      <div class="flex items-center justify-between gap-2">
        <Label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span class="font-mono text-violet">{meta().short}</span>
          <span class="font-normal normal-case tracking-normal text-[11px] text-muted-foreground/70">
            base {props.base}
          </span>
        </Label>
        <CopyButton value={() => props.value} disabled={!props.value} class="h-6 px-1.5 py-0" />
      </div>
      <TextField
        value={props.value}
        onChange={props.onInput}
        validationState={props.hasError ? 'invalid' : 'valid'}
      >
        <TextFieldInput
          ref={(el) => props.ref?.(el)}
          class="h-11 font-mono text-base tracking-wide"
          placeholder={meta().prefix ? `0` : '0'}
          spellcheck={false}
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          onFocus={props.onFocus}
          onBlur={props.onBlur}
        />
        <Show when={props.error}>
          <TextFieldErrorMessage>{props.error}</TextFieldErrorMessage>
        </Show>
      </TextField>
    </div>
  )
}

type BaseStepperProps = {
  value: number
  onChange: (v: number) => void
}

function BaseStepper(props: BaseStepperProps) {
  function clamp(v: number) {
    if (Number.isNaN(v)) return 10
    return Math.max(2, Math.min(36, Math.floor(v)))
  }
  return (
    <div class="inline-flex items-center gap-0.5 border border-border bg-background">
      <button
        type="button"
        aria-label="Decrement base"
        onClick={() => props.onChange(clamp(props.value - 1))}
        class="size-7 cursor-pointer text-muted-foreground hover:text-violet transition-colors"
      >
        −
      </button>
      <input
        type="number"
        min="2"
        max="36"
        value={props.value}
        onInput={(e) => {
          const v = parseInt(e.currentTarget.value, 10)
          props.onChange(clamp(v))
        }}
        class="h-7 w-10 bg-transparent text-center font-mono text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Increment base"
        onClick={() => props.onChange(clamp(props.value + 1))}
        class="size-7 cursor-pointer text-muted-foreground hover:text-violet transition-colors"
      >
        +
      </button>
    </div>
  )
}

type StatProps = {
  label: string
  value: string
  mono?: boolean
  truncate?: boolean
  copyable?: boolean
}

function Stat(props: StatProps) {
  return (
    <div class="flex flex-col gap-1 border border-border bg-background px-3 py-2 relative">
      <span class="text-[10px] uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <span
        class={cn(
          'text-sm break-all',
          props.mono && 'font-mono',
          props.truncate && 'truncate'
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

