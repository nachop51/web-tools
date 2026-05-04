import { createMemo, createSignal, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import { numberToWords } from '~/lib/utils/numbers/words'
import { setToolPageMeta } from '~/lib/seo'

export default function ToWords() {
  setToolPageMeta('numbers', 'to-words')
  const [params, setParams] = useSearchParams<{ n?: string }>()
  const [input, setInputSignal] = createSignal(params.n ?? '')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ n: v || undefined }, { replace: true })
  }

  const result = createMemo((): { output: string; error: string } => {
    const trimmed = input().trim()
    if (!trimmed) return { output: '', error: '' }

    const n = Number(trimmed)
    const words = numberToWords(n)
    if (words === '') {
      return {
        output: '',
        error:
          'Enter a valid integer (e.g. 42, -7, 1000000). Fractions, NaN, and values beyond ±999,999,999,999 are not supported.',
      }
    }
    return { output: words, error: '' }
  })

  const output = createMemo(() => result().output)
  const error = createMemo(() => result().error)

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Number to words"
        description="Convert any integer up to ±999 billion into its English word representation."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
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
            class="flex flex-col gap-2"
          >
            <TextFieldInput
              type="text"
              autofocus
              inputMode="numeric"
              placeholder="Enter an integer, e.g. 42 or -1000"
              class="h-12 font-mono text-base"
            />
            <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
          </TextField>
        </section>

        {/* Output */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
          </div>

          <Show
            when={output()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Words will appear here
              </div>
            }
          >
            <div
              class="anim-fade-up flex items-start gap-3 overflow-hidden rounded-md border border-border px-4 py-3"
              data-output={output()}
            >
              <span class="flex-1 text-base leading-relaxed break-words first-letter:uppercase">{output()}</span>
              <CopyButton value={() => output()} />
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
