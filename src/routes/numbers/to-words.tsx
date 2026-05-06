import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldWarningMessage,
} from '~/components/ui/text-field'
import {
  CURRENCIES,
  CURRENCY_CODES,
  numberToWordSegments,
  numberToWordsForMode,
  type Currency,
  type Mode,
  type WordToken,
} from '~/lib/utils/numbers/words'
import { setToolPageMeta } from '~/lib/seo'
import { cn } from '~/lib/utils'

const COLORS = [
  { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/15' },
  { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15' },
  { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15' },
  { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/15' },
  { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/15' },
  { text: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-500/15' },
  { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/15' },
]

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'cardinal', label: 'Cardinal' },
  { value: 'ordinal', label: 'Ordinal' },
  { value: 'currency', label: 'Currency' },
]

const PLACEHOLDERS: Record<Mode, string> = {
  cardinal: 'Enter a number, e.g. 42, -1000, 3.14159, or 0.5',
  ordinal: 'Enter a position, e.g. 1, 21, 100, 1000000',
  currency: 'Enter an amount, e.g. 1234.56 or 0.99',
}

type CurrencyOption = { value: string; label: string }
const CURRENCY_OPTIONS: CurrencyOption[] = CURRENCY_CODES.map((code) => ({
  value: code,
  label: CURRENCIES[code].label,
}))

export default function ToWords() {
  setToolPageMeta('numbers', 'to-words')
  const [params, setParams] = useSearchParams<{ n?: string; mode?: string; cur?: string }>()
  const [input, setInputSignal] = createSignal(params.n ?? '')
  const [mode, setModeSignal] = createSignal<Mode>(
    params.mode === 'ordinal' || params.mode === 'currency' ? params.mode : 'cardinal'
  )
  const [currencyCode, setCurrencyCodeSignal] = createSignal<string>(
    params.cur && params.cur in CURRENCIES ? params.cur : 'USD'
  )
  const [hovered, setHovered] = createSignal<number | null>(null)

  const currency = createMemo<Currency>(() => CURRENCIES[currencyCode()] ?? CURRENCIES.USD)

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ n: v || undefined }, { replace: true })
  }

  function setMode(m: Mode) {
    setModeSignal(m)
    setParams({ mode: m === 'cardinal' ? undefined : m }, { replace: true })
  }

  function setCurrencyCode(code: string) {
    setCurrencyCodeSignal(code)
    setParams({ cur: code === 'USD' ? undefined : code }, { replace: true })
  }

  const segments = createMemo(() => {
    const trimmed = input().trim()
    if (!trimmed) return null
    return numberToWordSegments(trimmed, mode(), currency())
  })

  const okSegments = createMemo(() => {
    const s = segments()
    return s && s.ok ? s : null
  })

  const error = createMemo(() => {
    const s = segments()
    return s && !s.ok ? s.error : ''
  })

  const warning = createMemo(() => {
    const s = segments()
    return s && s.ok ? s.warning ?? '' : ''
  })

  const wordsString = createMemo(() => {
    const s = okSegments()
    if (!s) return ''
    return numberToWordsForMode(input().trim(), mode(), currency())
  })

  const selectedCurrencyOption = createMemo(() =>
    CURRENCY_OPTIONS.find((o) => o.value === currencyCode()) ?? CURRENCY_OPTIONS[0]
  )

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  function tokenClass(group: number | null): string {
    if (group === null) return 'text-muted-foreground/50'
    const palette = COLORS[group % COLORS.length]
    const active = hovered() === group
    // px-0.5 -mx-0.5 reserves the highlight gutter without affecting layout
    return cn(
      palette.text,
      'rounded-sm px-0.5 -mx-0.5 transition-colors duration-100',
      active && palette.bg
    )
  }

  function tokenHandlers(group: number | null) {
    if (group === null) return {}
    return {
      onMouseEnter: () => setHovered(group),
      onMouseLeave: () => setHovered((cur) => (cur === group ? null : cur)),
    }
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Number to words"
        description="Convert numbers (integers or decimals, up to 66 digits each side) into English words (cardinal, ordinal, or currency), with matching colors between digits and words."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented<Mode> label="Mode" value={mode()} onChange={setMode} options={MODE_OPTIONS} />
          <Show when={mode() === 'currency'}>
            <div class="anim-fade-in flex items-center gap-2">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Currency</span>
              <Select<CurrencyOption>
                options={CURRENCY_OPTIONS}
                optionValue="value"
                optionTextValue="label"
                value={selectedCurrencyOption()}
                onChange={(opt) => opt && setCurrencyCode(opt.value)}
                itemComponent={(itemProps) => (
                  <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
                )}
              >
                <SelectTrigger aria-label="Currency" class="h-8 w-44 text-xs">
                  <SelectValue<CurrencyOption>>{(state) => state.selectedOption()?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
            </div>
          </Show>
        </ToolToolbar>

        {/* Input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <TextField
            value={input()}
            onChange={setInput}
            validationState={error() ? 'invalid' : 'valid'}
            warning={!!warning() && !error()}
            class="flex flex-col gap-2"
          >
            <div class="relative">
              <TextFieldInput
                ref={inputRef}
                type="text"
                inputMode={mode() === 'ordinal' ? 'numeric' : 'decimal'}
                placeholder={PLACEHOLDERS[mode()]}
                class="h-12 pr-24 font-mono text-base"
              />
              <CopyButton
                value={() => input()}
                disabled={!input()}
                class="absolute right-2 top-1/2 -translate-y-1/2"
              />
            </div>
            <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
            <Show when={warning() && !error()}>
              <TextFieldWarningMessage>{warning()}</TextFieldWarningMessage>
            </Show>
          </TextField>
        </section>

        {/* Output */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
          </div>

          <Show
            when={okSegments()}
            fallback={
              <div class="flex min-h-[10rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                {error() ? 'Fix the input to see the words.' : 'Words will appear here.'}
              </div>
            }
          >
            {(s) => (
              <div class="anim-fade-up relative flex flex-col gap-5 rounded-md border border-border bg-background/40 p-5">
                <CopyButton value={wordsString} class="absolute right-3 top-3" />

                {/* Colored digit display */}
                <div class="overflow-x-auto pr-20">
                  <div class="font-mono text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                    <For each={s().digitTokens}>
                      {(tok: WordToken) => (
                        <span class={tokenClass(tok.group)} {...tokenHandlers(tok.group)}>
                          {tok.text}
                        </span>
                      )}
                    </For>
                  </div>
                </div>

                <div class="h-px w-full bg-border" />

                {/* Colored words */}
                <div class="text-base leading-relaxed first-letter:uppercase sm:text-lg">
                  <For each={s().wordTokens}>
                    {(tok: WordToken) => (
                      <span class={tokenClass(tok.group)} {...tokenHandlers(tok.group)}>
                        {tok.text}
                      </span>
                    )}
                  </For>
                </div>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  )
}
