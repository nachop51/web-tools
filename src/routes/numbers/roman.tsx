import { For, createMemo, createSignal, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import { fromRoman, isLikelyRoman, toRoman } from '~/lib/utils/numbers/roman'

const ROMAN_REF = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
] as const
import { setToolPageMeta } from '~/lib/seo'

export default function Roman() {
  setToolPageMeta('numbers', 'roman')
  const [input, setInput] = createSignal('')

  const result = createMemo((): { output: string; error: string } => {
    const trimmed = input().trim()
    if (!trimmed) return { output: '', error: '' }

    if (isLikelyRoman(trimmed)) {
      const n = fromRoman(trimmed)
      if (isNaN(n)) {
        return { output: '', error: 'Invalid Roman numeral' }
      }
      return { output: String(n), error: '' }
    }

    const n = Number(trimmed)
    if (!Number.isInteger(n)) {
      return {
        output: '',
        error: 'Input must be a whole number between 1 and 3999',
      }
    }
    const roman = toRoman(n)
    if (!roman) {
      return { output: '', error: 'Number must be between 1 and 3999' }
    }
    return { output: roman, error: '' }
  })

  const output = createMemo(() => result().output)
  const error = createMemo(() => result().error)
  const direction = createMemo(() => (isLikelyRoman(input().trim()) ? 'Roman → Arabic' : 'Arabic → Roman'))

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Roman numerals"
        description="Convert between Arabic numbers and Roman numerals. Enter a number (1–3999) or a Roman numeral and the direction is detected automatically."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
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
                  type="text"
                  autofocus
                  placeholder="Enter a number or Roman numeral"
                  class="h-12 font-mono text-lg tracking-wide"
                />
                <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
              </TextField>
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
                  <span class="flex-1 font-mono text-lg font-semibold tracking-wide break-all">{output()}</span>
                  <CopyButton value={() => output()} />
                </div>
              </Show>
            </div>
          </div>
        </section>

        {/* Reference table */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reference</h2>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <For each={ROMAN_REF}>
              {([value, symbol]) => (
                <div class="flex flex-col items-center gap-0.5 rounded-md border border-border bg-background px-3 py-1.5 font-mono">
                  <span class="text-xs font-semibold text-violet">{symbol}</span>
                  <span class="text-xs font-semibold text-foreground tabular-nums">{value}</span>
                </div>
              )}
            </For>
          </div>
        </section>
      </div>
    </main>
  )
}
