import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { cn } from '~/lib/utils'
import { jsonToYaml, yamlToJson } from '~/lib/utils/code/yaml'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

type Dir = 'json-to-yaml' | 'yaml-to-json'

const DIRS: { key: Dir; label: string }[] = [
  { key: 'json-to-yaml', label: 'JSON → YAML' },
  { key: 'yaml-to-json', label: 'YAML → JSON' },
]

const INDENT_OPTS: { label: string; value: number }[] = [
  { label: 'Minify', value: 0 },
  { label: '2 spaces', value: 2 },
  { label: '4 spaces', value: 4 },
]

export default function YamlJsonTool() {
  setToolPageMeta('code', 'yaml-json')
  const [params, setParams] = useSearchParams<{ dir?: string; t?: string }>()

  const [input, setInputSignal] = createSignal(params.t ?? '')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }

  const dir = createMemo<Dir>(() => {
    const p = params.dir
    if (p === 'json-to-yaml' || p === 'yaml-to-json') return p
    return 'json-to-yaml'
  })

  const [indent, setIndent] = createSignal(2)

  const result = createMemo(() => {
    const s = input().trim()
    if (!s) return null
    return dir() === 'json-to-yaml' ? jsonToYaml(s) : yamlToJson(s, indent())
  })

  const output = createMemo(() => {
    const r = result()
    if (!r) return ''
    return r.ok ? r.output : ''
  })

  const error = createMemo(() => {
    const r = result()
    if (!r) return null
    return r.ok ? null : r.error
  })

  const showIndent = createMemo(() => dir() === 'yaml-to-json')

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader category="code" name="YAML ↔ JSON" description="Convert between YAML and JSON formats." />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Direction</h2>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex flex-wrap gap-2">
              <For each={DIRS}>
                {(d) => (
                  <button
                    type="button"
                    onClick={() => setParams({ dir: d.key }, { replace: true })}
                    class={cn(
                      'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer',
                      dir() === d.key
                        ? 'border-violet bg-violet text-white'
                        : 'border-border bg-background text-foreground hover:border-violet/60 hover:bg-violet/5'
                    )}
                  >
                    {d.label}
                  </button>
                )}
              </For>
            </div>

            <Show when={showIndent()}>
              <div class="flex items-center gap-2">
                <span class="text-xs uppercase tracking-wider text-muted-foreground">Indent</span>
                <div class="flex flex-wrap gap-2">
                  <For each={INDENT_OPTS}>
                    {(opt) => (
                      <button
                        type="button"
                        onClick={() => setIndent(opt.value)}
                        class={cn(
                          'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer',
                          indent() === opt.value
                            ? 'border-violet bg-violet text-white'
                            : 'border-border bg-background text-foreground hover:border-violet/60 hover:bg-violet/5'
                        )}
                      >
                        {opt.label}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </section>

        <div class="grid gap-6 lg:grid-cols-2">
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>
            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea
                ref={inputRef}
                class="min-h-[24rem] font-mono text-sm resize-y"
                placeholder={dir() === 'json-to-yaml' ? '{"key": "value"}' : 'key: value'}
              />
            </TextField>
            <Show when={error()}>
              {(err) => (
                <div class="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <span class="font-semibold">Error:</span> {err()}
                </div>
              )}
            </Show>
          </section>

          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
            </div>
            <div class="relative">
              <Show
                when={output()}
                fallback={
                  <div class="flex min-h-[24rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Result will appear here
                  </div>
                }
              >
                <div class="anim-fade-up min-h-[24rem] max-h-[40rem] overflow-auto rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed whitespace-pre break-words">
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
