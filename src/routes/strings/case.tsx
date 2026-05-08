import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { caseDefs, caseConverters, type CaseKey } from '~/lib/utils/strings/case'
import { setToolPageMeta } from '~/lib/seo'
import { cn } from '~/lib/utils'
import { urlText } from '~/lib/utils/url-state'

export default function CaseConverter() {
  setToolPageMeta('strings', 'case')
  const [params, setParams] = useSearchParams<{ mode?: string; t?: string }>()

  const [input, setInputSignal] = createSignal(params.t ?? '')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }

  const mode = createMemo<CaseKey>(() => {
    const p = params.mode
    if (p && p in caseConverters) return p as CaseKey
    return 'upper'
  })

  const output = createMemo(() => caseConverters[mode()](input()))

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Case converter"
        description="Convert text between upper, lower, title, camel, snake, kebab, and other cases."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section aria-label="Case" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          <For each={caseDefs}>
            {(def) => {
              const preview = createMemo(() => caseConverters[def.key](input() || def.example))
              const isSelected = () => mode() === def.key
              return (
                <button
                  type="button"
                  aria-pressed={isSelected()}
                  onClick={() => setParams({ mode: def.key }, { replace: true })}
                  class={cn(
                    'group relative flex min-h-[5.5rem] flex-col items-start gap-1.5 overflow-hidden rounded-md border p-3 text-left transition-all duration-150',
                    isSelected()
                      ? 'border-violet bg-violet/10 shadow-sm ring-1 ring-violet/40'
                      : 'border-border bg-card hover:-translate-y-0.5 hover:border-violet/40 hover:bg-violet/5 hover:shadow-sm',
                  )}
                >
                  <span
                    class={cn(
                      'text-[10px] font-semibold uppercase tracking-wider transition-colors',
                      isSelected() ? 'text-violet' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    {def.label}
                  </span>
                  <span class="line-clamp-2 font-mono text-xs leading-relaxed break-all text-foreground/90">
                    {preview()}
                  </span>
                </button>
              )
            }}
          </For>
        </section>

        <div class="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>

            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea
                ref={inputRef}
                placeholder="Paste text here…"
                class="min-h-[10rem] resize-y font-mono text-sm"
              />
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
                <div class="anim-fade-up min-h-[8.25rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
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
