import { useSearchParams } from '@solidjs/router'
import { batch, createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import {
  TbOutlineArrowsExchange,
  TbOutlineChevronLeft,
  TbOutlineChevronRight,
  TbOutlineWaveSawTool,
} from 'solid-icons/tb'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented, ToolbarChip } from '~/components/tool-toolbar'
import { setToolPageMeta } from '~/lib/seo'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import { Label } from '~/components/ui/label'
import {
  type BitWidth,
  convertToBase,
  fitsInWidth,
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
    if (!grouped() || base !== 2) return raw
    return groupDigits(raw, 4)
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
      // Clear other errors too; empty input means "no value"
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

  // ─── Integer bits inspector ──────────────────────────────────────────────

  const [intWidth, setIntWidth] = createSignal<8 | 16 | 32 | 64>(32)

  const intBits = createMemo(() => {
    const v = value() ?? 0n
    const w = intWidth()
    const unsigned = toUnsignedAtWidth(v, w)
    const signed = toSignedAtWidth(unsigned, w)
    const bits = unsigned.toString(2).padStart(w, '0')
    const hex = unsigned.toString(16).padStart(w / 4, '0')
    const oct = unsigned.toString(8)
    const setCount = bits.split('').filter((b) => b === '1').length
    const bytes: { bits: { char: string; idx: number }[] }[] = []
    for (let i = 0; i < bits.length; i += 8) {
      const byte: { char: string; idx: number }[] = []
      for (let j = 0; j < 8 && i + j < bits.length; j++) {
        byte.push({ char: bits.charAt(i + j), idx: i + j })
      }
      bytes.push({ bits: byte })
    }
    return { bits, signed, unsigned, hex, oct, setCount, totalBits: w, bytes }
  })

  function flipIntBit(idx: number) {
    const ib = intBits()
    const w = intWidth()
    const flipped = ib.bits
      .split('')
      .map((b, i) => (i === idx ? (b === '0' ? '1' : '0') : b))
      .join('')
    const unsigned = BigInt('0b' + flipped)
    const signed = toSignedAtWidth(unsigned, w)
    setValue(signed)
  }

  function stepIntValue(dir: 1 | -1) {
    setValue((value() ?? 0n) + BigInt(dir))
  }

  const intPresets = createMemo(() => {
    const w = intWidth()
    const wBig = BigInt(w)
    const intMax = (1n << (wBig - 1n)) - 1n
    const intMin = -(1n << (wBig - 1n))
    const uintMax = (1n << wBig) - 1n
    let p55 = 0n
    let pAA = 0n
    for (let i = 0; i < w / 8; i++) {
      p55 = (p55 << 8n) | 0x55n
      pAA = (pAA << 8n) | 0xaan
    }
    const items: { label: string; value: bigint; note?: string }[] = [
      { label: '0', value: 0n, note: 'zero: all bits clear' },
      { label: '1', value: 1n, note: 'one: only LSB set' },
      { label: '−1', value: -1n, note: 'minus one: all bits set in two’s complement' },
      { label: `INT${w}_MAX`, value: intMax, note: `largest signed ${w}-bit (2^${w - 1} − 1)` },
      { label: `INT${w}_MIN`, value: intMin, note: `smallest signed ${w}-bit (−2^${w - 1}): only sign bit set` },
      { label: `UINT${w}_MAX`, value: uintMax, note: `largest unsigned ${w}-bit (2^${w} − 1)` },
      { label: '0x55…', value: p55, note: 'alternating 01, common test pattern' },
      { label: '0xAA…', value: pAA, note: 'alternating 10, common test pattern' },
    ]
    if (w === 8) {
      items.push({ label: "'A'", value: 65n, note: 'ASCII letter A' })
      items.push({ label: "'a'", value: 97n, note: 'ASCII letter a' })
      items.push({ label: '0x80', value: 0x80n, note: 'high bit only' })
    } else if (w === 16) {
      items.push({ label: '0xBEEF', value: 0xbeefn, note: 'magic word' })
      items.push({ label: '0xCAFE', value: 0xcafen, note: 'magic word' })
    } else if (w === 32) {
      items.push({ label: '0xDEADBEEF', value: 0xdeadbeefn, note: 'classic debug magic' })
      items.push({ label: '0xCAFEBABE', value: 0xcafebaben, note: 'Java .class file header' })
      items.push({ label: '0xFEEDFACE', value: 0xfeedfacen, note: 'Mach-O file header' })
    } else if (w === 64) {
      items.push({ label: '0xDEADBEEFCAFEBABE', value: 0xdeadbeefcafebaben, note: 'magic combo' })
      items.push({ label: '0x123456789ABCDEF0', value: 0x123456789abcdef0n, note: 'sequential nibbles' })
    }
    return items
  })

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Base converter"
        description="Live conversion between binary, octal, decimal, and hexadecimal, with two's complement at fixed bit widths, custom bases up to 36, and an integer bit inspector."
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
                base={10}
                value={displayFor(10)}
                error={errors[10]}
                hasError={errors[10] !== null}
                ref={(el) => (firstInputRef = el)}
                onInput={(t) => onInput(10, t)}
                onFocus={() => onFocus(10)}
                onBlur={() => onBlur(10)}
              />
              <BaseField
                base={2}
                value={displayFor(2)}
                error={errors[2]}
                hasError={errors[2] !== null}
                onInput={(t) => onInput(2, t)}
                onFocus={() => onFocus(2)}
                onBlur={() => onBlur(2)}
              />
            </div>
            <div class="grid grid-cols-1 divide-y divide-border">
              <BaseField
                base={16}
                value={displayFor(16)}
                error={errors[16]}
                hasError={errors[16] !== null}
                onInput={(t) => onInput(16, t)}
                onFocus={() => onFocus(16)}
                onBlur={() => onBlur(16)}
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

        {/* Integer bits inspector */}
        <section class="relative border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="border-b border-border px-6 py-3 sm:px-8 flex items-center gap-3">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Integer inspector</h2>
            <span class="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <TbOutlineWaveSawTool size={12} /> click any bit to flip
            </span>
          </div>
          <div class="flex flex-col gap-5 p-6 sm:p-8">
            <div class="flex flex-wrap items-end gap-4">
              <div class="flex flex-col items-start gap-2 [&>div]:h-10 [&>div]:items-center">
                <ToolbarSegmented<'8' | '16' | '32' | '64'>
                  label="Width"
                  value={String(intWidth()) as '8' | '16' | '32' | '64'}
                  onChange={(v) => setIntWidth(Number(v) as 8 | 16 | 32 | 64)}
                  options={[
                    { value: '8', label: '8-bit' },
                    { value: '16', label: '16-bit' },
                    { value: '32', label: '32-bit' },
                    { value: '64', label: '64-bit' },
                  ]}
                />
              </div>
              <div class="ml-auto inline-flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous integer (value − 1)"
                  title="Previous integer (value − 1)"
                  onClick={() => stepIntValue(-1)}
                  class="inline-flex size-8 items-center justify-center border border-border bg-background text-muted-foreground hover:border-violet/60 hover:text-violet hover:bg-violet/5 transition-colors cursor-pointer"
                >
                  <TbOutlineChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Next integer (value + 1)"
                  title="Next integer (value + 1)"
                  onClick={() => stepIntValue(1)}
                  class="inline-flex size-8 items-center justify-center border border-border bg-background text-muted-foreground hover:border-violet/60 hover:text-violet hover:bg-violet/5 transition-colors cursor-pointer"
                >
                  <TbOutlineChevronRight size={14} />
                </button>
                <CopyButton
                  value={() => (value() ?? 0n).toString()}
                  class="h-8"
                />
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] uppercase tracking-wider text-muted-foreground/70 mr-1">Try</span>
              <For each={intPresets()}>
                {(p) => (
                  <button
                    type="button"
                    onClick={() => setValue(p.value)}
                    title={p.note ?? p.label}
                    class="border border-border bg-background px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:border-violet/60 hover:text-violet hover:bg-violet/5 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                )}
              </For>
            </div>

            <div class="anim-fade-in flex flex-col gap-4">
              {/* Colored bit visualization */}
              <div class="overflow-x-auto">
                <div class="inline-flex flex-wrap gap-2 font-mono text-[13px] leading-none">
                  <For each={intBits().bytes}>
                    {(byte) => (
                      <div class="flex gap-1">
                        <For each={byte.bits}>
                          {(b) => {
                            const role = () => {
                              if (b.idx === 0) return 'sign'
                              return b.idx < intBits().totalBits / 2 ? 'high' : 'low'
                            }
                            const bitNum = () => intBits().totalBits - 1 - b.idx
                            return (
                              <button
                                type="button"
                                onClick={() => flipIntBit(b.idx)}
                                class={cn(
                                  'flex h-7 w-5 items-center justify-center border cursor-pointer transition-colors',
                                  role() === 'sign' &&
                                    'border-violet-400/80 bg-violet-200/50 text-violet-500 hover:bg-violet-200/80 dark:bg-violet-500/10 dark:border-violet-500/40 dark:hover:bg-violet-500/30',
                                  role() === 'high' &&
                                    'border-info-foreground/40 bg-sky-200/40 hover:bg-sky-200/80 text-info-foreground dark:text-sky-400 dark:bg-sky-500/10 dark:hover:dark:bg-sky-400/40',
                                  role() === 'low' &&
                                    'border-emerald-300 bg-emerald-200/40 text-emerald-600 hover:bg-emerald-200/80 dark:bg-emerald-500/20 dark:border-emerald-400/40  dark:hover:bg-emerald-500/30',
                                  b.char === '0' && 'opacity-55',
                                  b.char === '1' &&
                                    role() === 'sign' &&
                                    'bg-violet-300/35 dark:bg-violet-600/20 dark:border-violet-400/60',
                                  b.char === '1' && role() === 'high' && 'dark:bg-sky-600/20 dark:border-sky-400/60',
                                  b.char === '1' &&
                                    role() === 'low' &&
                                    'bg-emerald-300/35 dark:text-emerald-500 dark:bg-emerald-500/20'
                                )}
                                title={`bit ${bitNum()} (2^${bitNum()})`}
                              >
                                {b.char}
                              </button>
                            )
                          }}
                        </For>
                      </div>
                    )}
                  </For>
                </div>
                <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <LegendDot class="bg-violet" label="sign (1)" />
                  <LegendDot class="bg-info-foreground dark:bg-sky-400" label="high bits" />
                  <LegendDot class="bg-success-foreground dark:bg-emerald-400" label="low bits" />
                </div>
              </div>

              {/* Breakdown */}
              <div class="grid gap-3 sm:grid-cols-3">
                <Stat
                  label="Sign bit"
                  mono
                  copyable
                  value={`${intBits().bits[0]}  (${intBits().bits[0] === '0' ? '+' : '−'})`}
                />
                <Stat label="Unsigned" mono copyable value={intBits().unsigned.toString()} />
                <Stat label="Signed (two's complement)" mono copyable value={intBits().signed.toString()} />
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <Stat
                  label="Hex"
                  mono
                  copyable
                  value={`0x${uppercase() ? intBits().hex.toUpperCase() : intBits().hex}`}
                />
                <Stat label="Octal" mono copyable value={`0o${intBits().oct}`} />
                <Stat label="Bits set" copyable value={`${intBits().setCount} / ${intBits().totalBits}`} />
              </div>
            </div>
          </div>
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
                    customResult().value
                      ? 'border-input text-foreground'
                      : 'border-dashed border-border text-muted-foreground'
                  )}
                >
                  <span class="truncate">{customResult().value || `Result in base ${customToBase()}`}</span>
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
    <div class={cn('flex flex-col gap-1.5 px-6 py-5 sm:px-8 transition-colors', props.hasError && 'bg-error/30')}>
      <div class="flex items-center justify-between gap-2">
        <Label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span class="font-mono text-violet">{meta().short}</span>
          <span class="font-normal normal-case tracking-normal text-[11px] text-muted-foreground/70">
            base {props.base}
          </span>
        </Label>
        <CopyButton value={() => props.value} disabled={!props.value} class="h-6 px-1.5 py-0" />
      </div>
      <TextField value={props.value} onChange={props.onInput} validationState={props.hasError ? 'invalid' : 'valid'}>
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
        class={cn('text-sm break-all', props.mono && 'font-mono', props.truncate && 'truncate')}
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
