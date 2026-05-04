import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from '~/components/ui/text-field'
import { MORSE_MAP, textToMorse, morseToText } from '~/lib/utils/encoding/morse'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

const MORSE_LETTERS = Object.entries(MORSE_MAP).filter(([k]) => /^[A-Z]$/.test(k))
const MORSE_DIGITS = Object.entries(MORSE_MAP).filter(([k]) => /^[0-9]$/.test(k))
const MORSE_PUNCT = Object.entries(MORSE_MAP).filter(([k]) => !/^[A-Z0-9 ]$/.test(k))

type Mode = 'encode' | 'decode'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'encode', label: 'Text → Morse' },
  { value: 'decode', label: 'Morse → Text' },
]

export default function MorseTool() {
  setToolPageMeta('encoding', 'morse')
  const [params, setParams] = useSearchParams<{ dir?: string; t?: string }>()
  const [input, setInputSignal] = createSignal(params.t ?? '')
  const [mode, setMode] = createSignal<Mode>(params.dir === 'decode' ? 'decode' : 'encode')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }
  const [error, setError] = createSignal<string | null>(null)

  const output = createMemo(() => {
    if (!input()) return ''
    try {
      return mode() === 'encode' ? textToMorse(input()) : morseToText(input())
    } catch {
      return ''
    }
  })

  createEffect(() => {
    if (!input()) {
      setError(null)
      return
    }
    try {
      mode() === 'encode' ? textToMorse(input()) : morseToText(input())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input')
    }
  })

  function handleMode(m: Mode) {
    setMode(m)
    setParams({ dir: m }, { replace: true })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="Morse code"
        description="Encode text to Morse code or decode Morse back to text (ITU-R standard)."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Direction" value={mode()} onChange={handleMode} options={modeOptions} />
        </ToolToolbar>

        <div class="grid gap-6 md:grid-cols-2">
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
              <TextFieldTextArea
                autofocus
                class="min-h-[10rem] font-mono text-sm resize-y"
                placeholder={
                  mode() === 'encode'
                    ? 'Enter text to convert to Morse…'
                    : "Enter Morse code (letters separated by spaces, words by ' / ')…"
                }
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
            <div class="relative">
              <Show
                when={output()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Result will appear here
                  </div>
                }
              >
                <div class="anim-fade-up min-h-[8.25rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed break-words">
                  {output()}
                </div>
                <CopyButton value={() => output()} class="absolute right-2 top-2" />
              </Show>
            </div>
          </section>
        </div>

        {/* Reference table */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reference</h2>
          </div>
          <div class="flex flex-col gap-4">
            <For
              each={
                [
                  ['Letters', MORSE_LETTERS],
                  ['Digits', MORSE_DIGITS],
                  ['Punctuation', MORSE_PUNCT],
                ] as const
              }
            >
              {([label, entries]) => (
                <div>
                  <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                  <div class="flex flex-wrap gap-1.5">
                    <For each={entries}>
                      {([char, code]) => (
                        <div class="flex flex-col items-center gap-0.5 rounded-md border border-border bg-background px-2 py-1.5 font-mono">
                          <span class="text-xs font-semibold text-foreground">{char}</span>
                          <span class="text-xs font-semibold text-violet tracking-widest">{code}</span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </section>
      </div>
    </main>
  )
}
