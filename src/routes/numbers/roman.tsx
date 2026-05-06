import { For, createMemo, createSignal, onMount, Show, type JSX } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarChip, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import { fromRoman, isLikelyRoman, OVERLINE, ROMAN_MAX, type RomanMode, toRoman } from '~/lib/utils/numbers/roman'
import { setToolPageMeta } from '~/lib/seo'

const ROMAN_REF = [
  [1, 'I'],
  [4, 'IV'],
  [5, 'V'],
  [9, 'IX'],
  [10, 'X'],
  [40, 'XL'],
  [50, 'L'],
  [90, 'XC'],
  [100, 'C'],
  [400, 'CD'],
  [500, 'D'],
  [900, 'CM'],
  [1000, 'M'],
] as const

const PRESETS_STANDARD = ['4', '42', '1999', 'MMXXVI', '3999']
const PRESETS_EXTENDED = ['2485025', '3999999', '_M_M_C_D_L_X_X_X_VXXV']

function Vinculum(props: { value: string }): JSX.Element {
  const segments = () => {
    const s = props.value
    const out: { text: string; over: boolean }[] = []
    let i = 0
    while (i < s.length) {
      const ch = s[i]
      const over = s[i + 1] === OVERLINE
      const last = out[out.length - 1]
      if (last && last.over === over) last.text += ch
      else out.push({ text: ch, over })
      i += over ? 2 : 1
    }
    return out
  }
  return (
    <For each={segments()}>
      {(seg) => <span class={seg.over ? 'overline decoration-from-font' : undefined}>{seg.text}</span>}
    </For>
  )
}

const VINCULUM_INSERT: { syntax: string; rendered: string; value: number }[] = [
  { syntax: '_I', rendered: 'I' + OVERLINE, value: 1000 },
  { syntax: '_V', rendered: 'V' + OVERLINE, value: 5000 },
  { syntax: '_X', rendered: 'X' + OVERLINE, value: 10_000 },
  { syntax: '_L', rendered: 'L' + OVERLINE, value: 50_000 },
  { syntax: '_C', rendered: 'C' + OVERLINE, value: 100_000 },
  { syntax: '_D', rendered: 'D' + OVERLINE, value: 500_000 },
  { syntax: '_M', rendered: 'M' + OVERLINE, value: 1_000_000 },
]

export default function Roman() {
  setToolPageMeta('numbers', 'roman')
  const [params, setParams] = useSearchParams<{ v?: string; m?: string }>()
  const [input, setInputSignal] = createSignal(params.v ?? '')
  const [mode, setModeSignal] = createSignal<RomanMode>(params.m === 'extended' ? 'extended' : 'standard')
  const [smartInsert, setSmartInsert] = createSignal(true)

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ v: v || undefined }, { replace: true })
  }

  function setMode(m: RomanMode) {
    setModeSignal(m)
    setParams({ m: m === 'extended' ? 'extended' : undefined }, { replace: true })
  }

  let inputRef: HTMLInputElement | undefined

  function insertAtCursor(text: string) {
    const el = inputRef
    const cur = input()
    if (!el) {
      setInput(cur + text)
      return
    }
    const start = el.selectionStart ?? cur.length
    const end = el.selectionEnd ?? cur.length
    const next = cur.slice(0, start) + text + cur.slice(end)
    setInput(next)
    queueMicrotask(() => {
      el.focus()
      const pos = start + text.length
      el.setSelectionRange(pos, pos)
    })
  }

  const result = createMemo((): { output: string; error: string } => {
    const trimmed = input().trim()
    if (!trimmed) return { output: '', error: '' }

    const hasVinculum = trimmed.includes('_') || trimmed.includes(OVERLINE)
    if (hasVinculum && mode() === 'standard') {
      return { output: '', error: 'Vinculum syntax requires extended mode' }
    }

    if (isLikelyRoman(trimmed)) {
      const n = fromRoman(trimmed)
      if (isNaN(n) || n > ROMAN_MAX[mode()]) {
        return { output: '', error: 'Invalid Roman numeral' }
      }
      return { output: String(n), error: '' }
    }

    const n = Number(trimmed)
    if (!Number.isInteger(n)) {
      return {
        output: '',
        error: `Input must be a whole number between 1 and ${ROMAN_MAX[mode()].toLocaleString()}`,
      }
    }
    const roman = toRoman(n, mode())
    if (!roman) {
      return { output: '', error: `Number must be between 1 and ${ROMAN_MAX[mode()].toLocaleString()}` }
    }
    return { output: roman, error: '' }
  })

  const isInsertDisabled = createMemo(() => {
    if (!smartInsert()) return () => false
    const cur = input()
    const m = mode()
    return (symbol: string) => {
      const candidate = cur + symbol
      const n = fromRoman(candidate)
      if (isNaN(n)) return true
      if (n > ROMAN_MAX[m]) return true
      return false
    }
  })

  const output = createMemo(() => result().output)
  const error = createMemo(() => result().error)
  const direction = createMemo(() => (isLikelyRoman(input().trim()) ? 'Roman → Arabic' : 'Arabic → Roman'))

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Roman numerals"
        description="Convert between Arabic numbers and Roman numerals. Direction is detected automatically. Extended mode adds vinculum (overline ×1000) for numbers up to 3,999,999."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented<RomanMode>
            label="Mode"
            value={mode()}
            onChange={setMode}
            options={[
              { value: 'standard', label: 'Standard (1–3,999)' },
              { value: 'extended', label: 'Extended (vinculum)' },
            ]}
          />
          <div class="ml-auto" />
          <ToolbarChip checked={smartInsert()} onChange={setSmartInsert}>
            Smart insert
          </ToolbarChip>
        </ToolToolbar>

        {/* Input + Output combined card */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Input side */}
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span aria-hidden class="size-2 rounded-full bg-violet" />
                  <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
                </div>
                <Show when={input().trim()}>
                  <span class="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {direction()}
                  </span>
                </Show>
              </div>

              <TextField
                value={input()}
                onChange={setInput}
                validationState={error() ? 'invalid' : 'valid'}
                class="flex flex-col gap-2"
              >
                <TextFieldInput
                  ref={inputRef}
                  type="text"
                  placeholder={mode() === 'extended' ? 'e.g. 50000  or  _L  (1–3,999,999)' : 'e.g. 2024  or  MMXXIV'}
                  class="h-12 font-mono text-lg tracking-wide"
                />
                <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
              </TextField>

              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Try</span>
                <For each={mode() === 'extended' ? [...PRESETS_STANDARD, ...PRESETS_EXTENDED] : PRESETS_STANDARD}>
                  {(preset) => (
                    <button
                      type="button"
                      onClick={() => {
                        setInput(preset)
                        inputRef?.focus()
                      }}
                      class="inline-flex h-7 cursor-pointer items-center rounded-md border border-border bg-background px-2 font-mono text-xs tabular-nums transition-colors hover:border-violet/60 hover:bg-violet/5 hover:text-violet active:scale-[0.97]"
                    >
                      {preset}
                    </button>
                  )}
                </For>
              </div>

              <Show when={mode() === 'extended'}>
                <p class="text-xs text-muted-foreground">
                  Tip: prefix a letter with <code class="font-mono text-foreground">_</code> to multiply by 1,000;{' '}
                  <code class="font-mono text-foreground">_V</code> ={' '}
                  <span class="font-mono text-foreground">
                    <Vinculum value={'V' + OVERLINE} />
                  </span>{' '}
                  = 5,000. Click any reference symbol below to insert it.
                </p>
              </Show>
            </div>

            {/* Output side */}
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
              </div>

              <Show
                when={output()}
                fallback={
                  <div class="flex min-h-[3rem] flex-1 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Result will appear here
                  </div>
                }
              >
                <div
                  class="anim-fade-up flex flex-1 items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3"
                  data-output={output()}
                >
                  <span class="flex-1 font-mono text-lg font-semibold tracking-wide break-all">
                    <Vinculum value={output()} />
                  </span>
                  <CopyButton value={() => output()} />
                </div>
              </Show>
            </div>
          </div>
        </section>

        {/* Reference table */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reference</h2>
            <span aria-hidden class="text-xs text-muted-foreground">
              ·
            </span>
            <p class="text-xs text-muted-foreground">Click any symbol to insert it into the input.</p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <For each={ROMAN_REF}>
              {([value, symbol]) => (
                <button
                  type="button"
                  onClick={() => insertAtCursor(symbol)}
                  disabled={isInsertDisabled()(symbol)}
                  title={`Insert ${symbol} (${value})`}
                  class="flex cursor-pointer flex-col items-center gap-0.5 rounded-md border border-border bg-background px-3 py-1.5 font-mono transition-colors hover:border-violet/60 hover:bg-violet/5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-background disabled:active:scale-100"
                >
                  <span class="text-xs font-semibold text-violet">{symbol}</span>
                  <span class="text-xs font-semibold text-foreground tabular-nums">{value}</span>
                </button>
              )}
            </For>
          </div>

          <Show when={mode() === 'extended'}>
            <div class="mt-5 flex flex-col gap-2">
              <span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vinculum (overline = ×1,000), inserts <code class="font-mono">_X</code> syntax
              </span>
              <div class="flex flex-wrap gap-1.5">
                <For each={VINCULUM_INSERT}>
                  {(item) => (
                    <button
                      type="button"
                      onClick={() => insertAtCursor(item.syntax)}
                      disabled={isInsertDisabled()(item.syntax)}
                      title={`Insert ${item.syntax} (${item.rendered} = ${item.value.toLocaleString()})`}
                      class="flex cursor-pointer flex-col items-center gap-0.5 rounded-md border border-border bg-background px-3 py-1.5 font-mono transition-colors hover:border-violet/60 hover:bg-violet/5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-background disabled:active:scale-100"
                    >
                      <span class="text-xs font-semibold text-violet">
                        <Vinculum value={item.rendered} />
                      </span>
                      <span class="text-xs font-semibold text-foreground tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    </button>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
