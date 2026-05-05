import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented, ToolbarChip } from '~/components/tool-toolbar'
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from '~/components/ui/text-field'
import { setToolPageMeta } from '~/lib/seo'
import { decodeHTMLEntities, encodeHTMLEntities } from '~/lib/utils/encoding/html-entities'
import { urlText } from '~/lib/utils/url-state'

const COMMON_ENTITIES = [
  { char: '&', entity: '&amp;' },
  { char: '<', entity: '&lt;' },
  { char: '>', entity: '&gt;' },
  { char: '"', entity: '&quot;' },
  { char: "'", entity: '&#39;' },
]

type Direction = 'encode' | 'decode'

export default function HTMLEntitiesTool() {
  setToolPageMeta('encoding', 'html-entities')
  const [params, setParams] = useSearchParams<{ dir?: string; t?: string }>()

  const [input, setInputSignal] = createSignal(params.t ?? '')
  const [direction, setDirectionSignal] = createSignal<Direction>(params.dir === 'decode' ? 'decode' : 'encode')
  const [extended, setExtended] = createSignal(false)

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }

  function setDirection(d: Direction) {
    setDirectionSignal(d)
    setParams({ dir: d }, { replace: true })
  }

  const result = createMemo<{ value: string; error: string | null }>(() => {
    const s = input()
    if (!s) return { value: '', error: null }
    try {
      const value = direction() === 'encode' ? encodeHTMLEntities(s, extended()) : decodeHTMLEntities(s)
      return { value, error: null }
    } catch (e) {
      return {
        value: '',
        error: e instanceof Error ? e.message : 'Invalid input',
      }
    }
  })

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="HTML entities"
        description="Encode and decode HTML entities, including &amp;, &lt;, &gt;, and numeric entities."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Toolbar — chromeless strip above the input */}
        <ToolToolbar>
          <ToolbarSegmented
            label="Direction"
            value={direction()}
            onChange={setDirection}
            options={[
              { value: 'encode', label: 'Encode' },
              { value: 'decode', label: 'Decode' },
            ]}
          />
          <div class="ml-auto" />
          <Show when={direction() === 'encode'}>
            <ToolbarChip checked={extended()} onChange={setExtended}>
              non-ASCII as numeric
            </ToolbarChip>
          </Show>
        </ToolToolbar>

        {/* Input → Output */}
        <div class="grid gap-6 md:grid-cols-2">
          {/* Input card */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>
            <TextField
              value={input()}
              onChange={setInput}
              validationState={result().error ? 'invalid' : 'valid'}
              class="flex flex-col gap-2"
            >
              <TextFieldTextArea
                ref={inputRef}
                rows={8}
                class="min-h-[12rem] font-mono text-sm resize-y"
                placeholder={direction() === 'encode' ? 'Type raw HTML or text…' : 'Type or paste HTML entities…'}
              />
              <TextFieldErrorMessage>{result().error}</TextFieldErrorMessage>
            </TextField>
          </section>

          {/* Output card */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
            </div>
            <Show
              when={result().value}
              fallback={
                <div class="flex min-h-[12rem] items-center justify-center rounded-md border border-dashed border-border bg-background/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  Result will appear here
                </div>
              }
            >
              <div class="anim-fade-in relative">
                <pre class="min-h-[12rem] overflow-auto rounded-md border border-violet/30 bg-violet/[0.03] p-4 pr-14 font-mono text-sm text-foreground whitespace-pre-wrap break-words">
                  {result().value}
                </pre>
                <CopyButton value={() => result().value} class="absolute right-2 top-2" />
              </div>
            </Show>
          </section>
        </div>

        {/* Common entities reference */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Common entities</h2>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <For each={COMMON_ENTITIES}>
              {(item) => (
                <div class="flex flex-col items-center gap-0.5 rounded-md border border-border bg-background px-3 py-1.5 font-mono">
                  <span class="text-xs font-semibold text-foreground">{item.char}</span>
                  <span class="text-xs font-semibold text-violet">{item.entity}</span>
                </div>
              )}
            </For>
          </div>
        </section>
      </div>
    </main>
  )
}
