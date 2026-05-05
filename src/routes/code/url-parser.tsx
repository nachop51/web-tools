import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldInput } from '~/components/ui/text-field'
import { parseUrl, type ParsedUrl } from '~/lib/utils/code/url-parser'
import { setToolPageMeta } from '~/lib/seo'

type RowDef = { label: string; key: keyof Omit<ParsedUrl, 'params'> }

const ROWS: RowDef[] = [
  { label: 'Protocol', key: 'protocol' },
  { label: 'Username', key: 'username' },
  { label: 'Password', key: 'password' },
  { label: 'Host', key: 'hostname' },
  { label: 'Port', key: 'port' },
  { label: 'Path', key: 'pathname' },
  { label: 'Search', key: 'search' },
  { label: 'Hash', key: 'hash' },
]

function encodeToBase64(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
}

function decodeFromBase64(s: string): string {
  try {
    return decodeURIComponent(escape(atob(s)))
  } catch {
    return ''
  }
}

export default function UrlParserTool() {
  setToolPageMeta('code', 'url-parser')
  const [params, setParams] = useSearchParams<{ url?: string }>()

  const initialUrl = params.url ? decodeFromBase64(params.url) : ''
  const [input, setInput] = createSignal(initialUrl)

  function handleInput(val: string) {
    setInput(val)
    setParams({ url: val ? encodeToBase64(val) : undefined }, { replace: true })
  }

  const parsed = createMemo<ParsedUrl | null>(() => {
    const val = input().trim()
    if (!val) return null
    try {
      return parseUrl(val)
    } catch {
      return null
    }
  })

  const error = createMemo(() => {
    const val = input().trim()
    if (!val) return null
    try {
      parseUrl(val)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Invalid URL'
    }
  })

  const queryEntries = createMemo(() => {
    const p = parsed()
    if (!p) return []
    return Object.entries(p.params)
  })

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="URL parser"
        description="Break down any URL into its components: protocol, host, path, params, and more."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">URL</h2>
          </div>
          <TextField value={input()} onChange={handleInput}>
            <TextFieldInput
              ref={inputRef}
              placeholder="https://user:pass@example.com:8080/path?key=val#hash"
              class="h-12 font-mono text-base"
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

        <Show
          when={parsed()}
          fallback={
            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Components</h2>
              </div>
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter a URL above to see its components
              </div>
            </section>
          }
        >
          {(p) => (
            <>
              <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
                <div class="mb-4 flex items-center gap-2">
                  <span aria-hidden class="size-2 rounded-full bg-violet" />
                  <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Components</h2>
                </div>
                <div class="overflow-hidden rounded-md border border-border">
                  <table class="w-full text-sm">
                    <tbody>
                      <For each={ROWS}>
                        {(row) => {
                          const value = createMemo(() => p()[row.key])
                          return (
                            <Show when={value()}>
                              <tr class="border-b border-border/50 last:border-0 transition-colors hover:bg-violet/5">
                                <td class="w-32 px-4 py-2.5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                  {row.label}
                                </td>
                                <td class="px-4 py-2.5 font-mono break-all">{value()}</td>
                                <td class="px-2 py-2.5 text-right w-16">
                                  <CopyButton value={() => value() ?? ''} />
                                </td>
                              </tr>
                            </Show>
                          )
                        }}
                      </For>
                    </tbody>
                  </table>
                </div>
              </section>

              <Show when={queryEntries().length > 0}>
                <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
                  <div class="mb-4 flex items-center gap-2">
                    <span aria-hidden class="size-2 rounded-full bg-violet" />
                    <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Query parameters
                    </h2>
                  </div>
                  <div class="overflow-hidden rounded-md border border-border">
                    <table class="w-full text-sm">
                      <thead class="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th class="px-4 py-2 text-left font-semibold">Key</th>
                          <th class="px-4 py-2 text-left font-semibold">Value</th>
                          <th class="px-4 py-2 w-16" />
                        </tr>
                      </thead>
                      <tbody>
                        <For each={queryEntries()}>
                          {([k, v]) => (
                            <tr class="border-t border-border/50 transition-colors hover:bg-violet/5">
                              <td class="px-4 py-2.5 font-mono text-violet">{k}</td>
                              <td class="px-4 py-2.5 font-mono break-all">{v}</td>
                              <td class="px-2 py-2.5 text-right">
                                <CopyButton value={() => v} />
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </section>
              </Show>
            </>
          )}
        </Show>
      </div>
    </main>
  )
}
