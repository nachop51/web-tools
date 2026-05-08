import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
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
                  <Table>
                    <TableBody>
                      <For each={ROWS}>
                        {(row) => {
                          const value = createMemo(() => p()[row.key])
                          return (
                            <Show when={value()}>
                              <TableRow>
                                <TableCell class="w-32 px-4 py-2.5 font-sans text-xs uppercase tracking-wider text-muted-foreground font-semibold tabular-nums-none hover:bg-transparent hover:text-muted-foreground">
                                  {row.label}
                                </TableCell>
                                <TableCell class="px-4 py-2.5 break-all">{value()}</TableCell>
                                <TableCell class="px-2 py-2.5 text-right w-16 hover:bg-transparent">
                                  <CopyButton value={() => value() ?? ''} />
                                </TableCell>
                              </TableRow>
                            </Show>
                          )
                        }}
                      </For>
                    </TableBody>
                  </Table>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead class="px-4 py-2">Key</TableHead>
                          <TableHead class="px-4 py-2">Value</TableHead>
                          <TableHead class="px-4 py-2 w-16" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <For each={queryEntries()}>
                          {([k, v]) => (
                            <TableRow>
                              <TableCell class="px-4 py-2.5 text-violet">{k}</TableCell>
                              <TableCell class="px-4 py-2.5 break-all">{v}</TableCell>
                              <TableCell class="px-2 py-2.5 text-right hover:bg-transparent">
                                <CopyButton value={() => v} />
                              </TableCell>
                            </TableRow>
                          )}
                        </For>
                      </TableBody>
                    </Table>
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
