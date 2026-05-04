import { useSearchParams } from '@solidjs/router'
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { Button } from '~/components/ui/button'
import { Checkbox, CheckboxLabel } from '~/components/ui/checkbox'
import { Slider, SliderFill, SliderThumb, SliderTrack } from '~/components/ui/slider'
import { cn } from '~/lib/utils'
import {
  calcEntropy,
  generateKey,
  generatePassphrase,
  generatePassword,
  keyEntropy,
  passphraseEntropy,
  strengthLabel,
  type KeyFormat,
} from '~/lib/utils/code/password'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'password' | 'passphrase' | 'key'

const STRENGTH_COLORS: Record<string, string> = {
  Weak: 'text-destructive',
  Fair: 'text-yellow-500',
  Strong: 'text-green-500',
  'Very strong': 'text-violet',
}

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'password', label: 'Password', hint: 'Charset-based random string' },
  { id: 'passphrase', label: 'Passphrase', hint: 'Memorable word combos' },
  { id: 'key', label: 'Random key', hint: 'Raw crypto bytes' },
]

const MODE_OPTIONS: { value: Mode; label: string }[] = MODES.map((m) => ({
  value: m.id,
  label: m.label,
}))

const SEPARATORS: { id: string; label: string; value: string }[] = [
  { id: 'space', label: 'Space', value: ' ' },
  { id: 'hyphen', label: 'Hyphen', value: '-' },
  { id: 'dot', label: 'Dot', value: '.' },
  { id: 'none', label: 'None', value: '' },
]

const KEY_SIZES: number[] = [16, 24, 32, 48, 64, 128]
const KEY_FORMATS: { id: KeyFormat; label: string }[] = [
  { id: 'hex', label: 'Hex' },
  { id: 'base64', label: 'Base64' },
  { id: 'urlsafe', label: 'URL-safe Base64' },
]

const WORD_COUNTS: number[] = [3, 4, 5, 6, 7, 8]

function isMode(v: string | undefined): v is Mode {
  return v === 'password' || v === 'passphrase' || v === 'key'
}

function isKeyFormat(v: string | undefined): v is KeyFormat {
  return v === 'hex' || v === 'base64' || v === 'urlsafe'
}

export default function SecretGenerator() {
  setToolPageMeta('code', 'password')

  const [params, setParams] = useSearchParams<{
    mode?: string
    // password
    len?: string
    upper?: string
    lower?: string
    digits?: string
    symbols?: string
    // passphrase
    words?: string
    sep?: string
    cap?: string
    num?: string
    // key
    bytes?: string
    fmt?: string
  }>()

  const mode = createMemo<Mode>(() => (isMode(params.mode) ? params.mode : 'password'))

  // Password state
  const [length, setLength] = createSignal(Number(params.len) || 16)
  const [upper, setUpper] = createSignal(params.upper !== '0')
  const [lower, setLower] = createSignal(params.lower !== '0')
  const [digits, setDigits] = createSignal(params.digits !== '0')
  const [symbols, setSymbols] = createSignal(params.symbols === '1')

  // Passphrase state
  const [wordCount, setWordCount] = createSignal(Number(params.words) || 4)
  const [separatorId, setSeparatorId] = createSignal(params.sep ?? 'hyphen')
  const [capitalize, setCapitalize] = createSignal(params.cap === '1')
  const [appendNumber, setAppendNumber] = createSignal(params.num === '1')

  // Key state
  const initialBytes = Number(params.bytes)
  const [keyBytes, setKeyBytes] = createSignal(KEY_SIZES.includes(initialBytes) ? initialBytes : 32)
  const [keyFormat, setKeyFormat] = createSignal<KeyFormat>(isKeyFormat(params.fmt) ? params.fmt : 'hex')

  const [autoRefresh, setAutoRefresh] = createSignal(true)
  const [output, setOutput] = createSignal('')

  const separatorValue = createMemo(() => SEPARATORS.find((s) => s.id === separatorId())?.value ?? '-')

  const charsetSize = createMemo(() => {
    let n = 0
    if (upper()) n += 26
    if (lower()) n += 26
    if (digits()) n += 10
    if (symbols()) n += 28
    return n
  })

  const entropy = createMemo(() => {
    if (mode() === 'password') return calcEntropy(charsetSize(), length())
    if (mode() === 'passphrase') return passphraseEntropy(wordCount())
    return keyEntropy(keyBytes())
  })

  const strength = createMemo(() => strengthLabel(entropy()))

  const canGenerate = createMemo(() => {
    if (mode() === 'password') return charsetSize() > 0
    if (mode() === 'passphrase') return wordCount() > 0
    return keyBytes() > 0
  })

  function generate() {
    if (mode() === 'password') {
      setOutput(
        generatePassword({
          length: length(),
          upper: upper(),
          lower: lower(),
          digits: digits(),
          symbols: symbols(),
        })
      )
      return
    }
    if (mode() === 'passphrase') {
      setOutput(
        generatePassphrase({
          wordCount: wordCount(),
          separator: separatorValue(),
          capitalize: capitalize(),
          appendNumber: appendNumber(),
        })
      )
      return
    }
    setOutput(generateKey(keyBytes(), keyFormat()))
  }

  // Auto-regenerate when any reactive config changes (and toggle is on)
  createEffect(() => {
    if (!autoRefresh()) return
    // touch dependencies for the active mode
    mode()
    if (mode() === 'password') {
      length()
      upper()
      lower()
      digits()
      symbols()
    } else if (mode() === 'passphrase') {
      wordCount()
      separatorValue()
      capitalize()
      appendNumber()
    } else {
      keyBytes()
      keyFormat()
    }
    if (canGenerate()) generate()
  })

  // Wipe output on mode change so stale value isn't shown
  createEffect((prev: Mode | undefined) => {
    const m = mode()
    if (prev !== undefined && prev !== m && !autoRefresh()) {
      setOutput('')
    }
    return m
  })

  const checkboxDefs = [
    { label: 'Uppercase A–Z', get: upper, set: setUpper, key: 'upper' },
    { label: 'Lowercase a–z', get: lower, set: setLower, key: 'lower' },
    { label: 'Digits 0–9', get: digits, set: setDigits, key: 'digits' },
    { label: 'Symbols !@#$', get: symbols, set: setSymbols, key: 'symbols' },
  ]

  const outputLabel = createMemo(() => {
    if (mode() === 'password') return 'Password'
    if (mode() === 'passphrase') return 'Passphrase'
    return 'Random key'
  })

  const emptyHint = createMemo(() => {
    if (!canGenerate()) {
      if (mode() === 'password') return 'Select at least one character set'
      if (mode() === 'passphrase') return 'Choose a word count above zero'
      return 'Choose a byte size above zero'
    }
    return 'Click Generate to create a secret'
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="Secret generator"
        description="Generate secure passwords, passphrases, or random cryptographic keys — all client-side, with live entropy."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Mode"
            value={mode()}
            onChange={(v) => setParams({ mode: v }, { replace: true })}
            options={MODE_OPTIONS}
          />
        </ToolToolbar>

        {/* Configuration */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Configuration</h2>
          </div>

          {/* Password options */}
          <Show when={mode() === 'password'}>
            <div class="space-y-6">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Length</span>
                  <span class="font-mono text-sm font-semibold text-violet">{length()}</span>
                </div>
                <Slider
                  value={[length()]}
                  onChange={(v) => {
                    setLength(v[0])
                    setParams({ len: String(v[0]) }, { replace: true })
                  }}
                  minValue={8}
                  maxValue={128}
                >
                  <SliderTrack>
                    <SliderFill />
                    <SliderThumb />
                  </SliderTrack>
                </Slider>
                <div class="flex justify-between text-xs text-muted-foreground">
                  <span>8</span>
                  <span>128</span>
                </div>
              </div>

              <div class="space-y-3">
                <p class="text-sm font-medium">Character sets</p>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <For each={checkboxDefs}>
                    {(def) => (
                      <Checkbox
                        checked={def.get()}
                        onChange={(v) => {
                          def.set(v)
                          setParams({ [def.key]: v ? '1' : '0' }, { replace: true })
                        }}
                      >
                        <CheckboxLabel>{def.label}</CheckboxLabel>
                      </Checkbox>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </Show>

          {/* Passphrase options */}
          <Show when={mode() === 'passphrase'}>
            <div class="space-y-6">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Words</span>
                  <span class="font-mono text-sm font-semibold text-violet">{wordCount()}</span>
                </div>
                <div role="radiogroup" aria-label="Word count" class="grid grid-cols-6 gap-2">
                  <For each={WORD_COUNTS}>
                    {(n) => {
                      const isSelected = () => wordCount() === n
                      return (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected()}
                          onClick={() => {
                            setWordCount(n)
                            setParams({ words: String(n) }, { replace: true })
                          }}
                          class={cn(
                            'rounded-md border py-2 text-sm font-medium cursor-pointer',
                            'transition-[border-color,background-color,color] duration-150 ease-out',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            isSelected()
                              ? 'border-violet bg-violet text-white'
                              : 'border-border bg-background text-foreground hover:border-violet/60 hover:bg-violet/5'
                          )}
                        >
                          {n}
                        </button>
                      )
                    }}
                  </For>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm font-medium">Separator</p>
                <div role="radiogroup" aria-label="Separator" class="flex flex-wrap gap-2">
                  <For each={SEPARATORS}>
                    {(sep) => {
                      const isSelected = () => separatorId() === sep.id
                      return (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected()}
                          onClick={() => {
                            setSeparatorId(sep.id)
                            setParams({ sep: sep.id }, { replace: true })
                          }}
                          class={cn(
                            'border px-4 py-1.5 text-sm font-medium cursor-pointer',
                            'transition-[border-color,background-color,color] duration-150 ease-out',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            isSelected()
                              ? 'border-violet bg-violet text-white'
                              : 'border-border bg-background text-foreground hover:border-violet/60 hover:bg-violet/5'
                          )}
                        >
                          {sep.label}
                        </button>
                      )
                    }}
                  </For>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Checkbox
                  checked={capitalize()}
                  onChange={(v) => {
                    setCapitalize(v)
                    setParams({ cap: v ? '1' : '0' }, { replace: true })
                  }}
                >
                  <CheckboxLabel>Capitalize words</CheckboxLabel>
                </Checkbox>
                <Checkbox
                  checked={appendNumber()}
                  onChange={(v) => {
                    setAppendNumber(v)
                    setParams({ num: v ? '1' : '0' }, { replace: true })
                  }}
                >
                  <CheckboxLabel>Append 2-digit number</CheckboxLabel>
                </Checkbox>
              </div>
            </div>
          </Show>

          {/* Random key options */}
          <Show when={mode() === 'key'}>
            <div class="space-y-6">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Size</span>
                  <span class="font-mono text-sm font-semibold text-violet">{keyBytes()} bytes</span>
                </div>
                <div role="radiogroup" aria-label="Key size in bytes" class="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  <For each={KEY_SIZES}>
                    {(n) => {
                      const isSelected = () => keyBytes() === n
                      return (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected()}
                          onClick={() => {
                            setKeyBytes(n)
                            setParams({ bytes: String(n) }, { replace: true })
                          }}
                          class={cn(
                            'rounded-md border py-2 text-sm font-medium cursor-pointer',
                            'transition-[border-color,background-color,color] duration-150 ease-out',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            isSelected()
                              ? 'border-violet bg-violet text-white'
                              : 'border-border bg-background text-foreground hover:border-violet/60 hover:bg-violet/5'
                          )}
                        >
                          {n}
                        </button>
                      )
                    }}
                  </For>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm font-medium">Format</p>
                <div role="radiogroup" aria-label="Output format" class="flex flex-wrap gap-2">
                  <For each={KEY_FORMATS}>
                    {(f) => {
                      const isSelected = () => keyFormat() === f.id
                      return (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected()}
                          onClick={() => {
                            setKeyFormat(f.id)
                            setParams({ fmt: f.id }, { replace: true })
                          }}
                          class={cn(
                            'rounded-md border px-3 py-1.5 text-sm font-medium cursor-pointer',
                            'transition-[border-color,background-color,color] duration-150 ease-out',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            isSelected()
                              ? 'border-violet bg-violet text-white'
                              : 'border-border bg-background text-foreground hover:border-violet/60 hover:bg-violet/5'
                          )}
                        >
                          {f.label}
                        </button>
                      )
                    }}
                  </For>
                </div>
              </div>
            </div>
          </Show>

          {/* Action row */}
          <div class="mt-6 flex flex-wrap gap-2">
            <Button class="flex-1 min-w-[10rem]" onClick={generate} disabled={!canGenerate()}>
              Generate
            </Button>
            <button
              type="button"
              onClick={() => setAutoRefresh((v) => !v)}
              aria-pressed={autoRefresh()}
              class={cn(
                'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                autoRefresh()
                  ? 'border-violet bg-violet text-white'
                  : 'border-border bg-background text-foreground hover:border-violet/60 hover:bg-violet/5'
              )}
            >
              Auto-refresh
            </button>
          </div>
        </section>

        {/* Output */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{outputLabel()}</h2>
          </div>

          <div class="relative">
            <Show
              when={output()}
              fallback={
                <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  {emptyHint()}
                </div>
              }
            >
              <div class="anim-fade-up flex min-h-[8.25rem] items-center rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-base leading-relaxed break-all">
                {output()}
              </div>
              <CopyButton value={() => output()} class="absolute right-2 top-2" />
            </Show>
          </div>

          <Show when={output() && entropy() > 0 && isFinite(entropy())}>
            <div class="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span class="text-muted-foreground">Entropy</span>
              <span class="font-mono font-semibold">{entropy().toFixed(1)} bits</span>
              <span
                class={cn('bg-muted/40 px-2.5 py-0.5 text-xs font-semibold', STRENGTH_COLORS[strength()])}
              >
                {strength()}
              </span>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
