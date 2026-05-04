import { useSearchParams } from '@solidjs/router'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from '~/components/ui/text-field'
import { decodeURL, encodeURL, type URLMode } from '~/lib/utils/encoding/url'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

type Mode = 'encode' | 'decode'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' },
]

const scopeOptions: { value: URLMode; label: string }[] = [
  { value: 'component', label: 'encodeURIComponent' },
  { value: 'full', label: 'encodeURI' },
]

const scopeDescriptions: Record<URLMode, string> = {
  component: 'Encodes all special chars including &, =, #. Use for query param values.',
  full: 'Preserves URI structure (://, /, ?, #). Use for complete URLs.',
}

export default function URLTool() {
  setToolPageMeta('encoding', 'url')
  const [params, setParams] = useSearchParams<{
    mode?: string
    scope?: string
    t?: string
  }>()

  const [input, setInputSignal] = createSignal(params.t ?? '')
  const [error, setError] = createSignal<string | null>(null)

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }

  const [mode, setModeSignal] = createSignal<Mode>(params.mode === 'decode' ? 'decode' : 'encode')
  const [scope, setScopeSignal] = createSignal<URLMode>(params.scope === 'full' ? 'full' : 'component')

  function setMode(m: Mode) {
    setModeSignal(m)
    setParams({ mode: m }, { replace: true })
  }

  function setScope(s: URLMode) {
    setScopeSignal(s)
    setParams({ scope: s }, { replace: true })
  }

  const output = createMemo(() => {
    if (!input()) return ''
    try {
      return mode() === 'encode' ? encodeURL(input(), scope()) : decodeURL(input(), scope())
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
      mode() === 'encode' ? encodeURL(input(), scope()) : decodeURL(input(), scope())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input')
    }
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="URL encode"
        description="URL-encode and decode strings with encodeURIComponent or encodeURI."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Direction" value={mode()} onChange={setMode} options={modeOptions} />
          <div class="ml-auto" />
          <ToolbarSegmented label="Scope" value={scope()} onChange={setScope} options={scopeOptions} />
        </ToolToolbar>
        <p class="-mt-3 px-1 text-xs text-muted-foreground">{scopeDescriptions[scope()]}</p>

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
                placeholder="Enter text to encode or encoded string to decode…"
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
