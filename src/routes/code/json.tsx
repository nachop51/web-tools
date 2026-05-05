import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { cn } from '~/lib/utils'
import { processJson } from '~/lib/utils/code/json'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

type Mode = '2' | '4' | 'min'

const MODE_TO_INDENT: Record<Mode, 0 | 2 | 4> = { '2': 2, '4': 4, min: 0 }

export default function JsonTool() {
  setToolPageMeta('code', 'json')
  const [params, setParams] = useSearchParams<{ mode?: string; t?: string }>()

  const [input, setInputSignal] = createSignal(params.t ?? '')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }
  const mode = createMemo<Mode>(() => {
    const p = params.mode
    return p === '4' || p === 'min' ? p : '2'
  })

  function setMode(m: Mode) {
    setParams({ mode: m === '2' ? undefined : m }, { replace: true })
  }

  const indent = createMemo(() => MODE_TO_INDENT[mode()])

  const result = createMemo(() => processJson(input(), indent()))

  const output = createMemo(() => {
    const r = result()
    if (!input().trim()) return ''
    if (!r.ok) return ''
    return indent() === 0 ? r.minified : r.formatted
  })

  const stats = createMemo(() => {
    const r = result()
    const out = output()
    if (!r.ok || !out) return null
    const inputSize = input().length
    const outputSize = out.length
    const diff = inputSize === 0 ? 0 : Math.round((1 - outputSize / inputSize) * 100)
    return { inputSize, outputSize, diff }
  })

  const error = createMemo(() => {
    if (!input().trim()) return null
    const r = result()
    return r.ok ? null : r
  })

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="JSON formatter"
        description="Format, minify, and validate JSON. Errors show line and column."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex h-8 items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>
            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea
                ref={inputRef}
                class="min-h-[24rem] font-mono text-sm resize-y"
                placeholder='{"key": "value"}'
              />
            </TextField>
            <Show when={error()}>
              {(err) => (
                <div class="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <span class="font-semibold">Parse error:</span> {err().error}
                  <Show when={err().line}>
                    {' '}
                    <span class="opacity-70">
                      (line {err().line}
                      <Show when={err().column}>, col {err().column}</Show>)
                    </span>
                  </Show>
                </div>
              )}
            </Show>
          </section>

          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex h-8 items-center gap-3">
              <div class="flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
              </div>
              <div
                role="radiogroup"
                aria-label="Format"
                class="ml-auto inline-flex rounded-md border border-border bg-background p-0.5"
              >
                <For
                  each={[
                    { value: '2', label: '2 spaces' },
                    { value: '4', label: '4 spaces' },
                    { value: 'min', label: 'Minify' },
                  ] satisfies { value: Mode; label: string }[]}
                >
                  {(opt) => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={mode() === opt.value}
                      onClick={() => setMode(opt.value)}
                      class={cn(
                        'px-3 py-1 text-sm transition-colors cursor-pointer',
                        mode() === opt.value
                          ? 'bg-violet text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-violet/5'
                      )}
                    >
                      {opt.label}
                    </button>
                  )}
                </For>
              </div>
            </div>
            <div class="relative">
              <Show
                when={output()}
                fallback={
                  <div class="flex min-h-[24rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Formatted JSON will appear here
                  </div>
                }
              >
                <div class="anim-fade-up min-h-[24rem] max-h-[40rem] overflow-auto rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed whitespace-pre break-words">
                  {output()}
                </div>
                <CopyButton value={() => output()} class="absolute right-2 top-2" />
              </Show>
            </div>
            <Show when={stats()}>
              {(s) => (
                <p class="mt-3 text-xs text-muted-foreground">
                  {s().inputSize} bytes in &rarr; {s().outputSize} bytes out
                  <Show when={s().diff > 0}>
                    <span class="ml-1 text-violet">({s().diff}% smaller)</span>
                  </Show>
                  <Show when={s().diff < 0}>
                    <span class="ml-1 text-destructive">({Math.abs(s().diff)}% larger)</span>
                  </Show>
                  <Show when={s().diff === 0}>
                    <span class="ml-1">(no change)</span>
                  </Show>
                </p>
              )}
            </Show>
          </section>
        </div>
      </div>
    </main>
  )
}
