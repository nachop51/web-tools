import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from '~/components/ui/text-field'
import { decodeBase32, encodeBase32 } from '~/lib/utils/encoding/base32'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

type Mode = 'encode' | 'decode'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' },
]

export default function Base32Tool() {
  setToolPageMeta('encoding', 'base32')
  const [params, setParams] = useSearchParams<{ dir?: string; t?: string }>()
  const [input, setInputSignal] = createSignal(params.t ?? '')
  const [mode, setModeSignal] = createSignal<Mode>(params.dir === 'decode' ? 'decode' : 'encode')
  const [error, setError] = createSignal<string | null>(null)

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }
  function setMode(v: Mode) {
    setModeSignal(v)
    setParams({ dir: v }, { replace: true })
  }

  const output = createMemo(() => {
    if (!input()) return ''
    try {
      return mode() === 'encode' ? encodeBase32(input()) : decodeBase32(input())
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
      mode() === 'encode' ? encodeBase32(input()) : decodeBase32(input())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input')
    }
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="Base32"
        description="Encode and decode Base32 text (RFC 4648), with full Unicode/UTF-8 support."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Direction" value={mode()} onChange={setMode} options={modeOptions} />
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
                placeholder="Enter text to encode or base32 to decode…"
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
      </div>
    </main>
  )
}
