import { createMemo, createSignal, For, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldInput } from '~/components/ui/text-field'
import { buildAsciiTable } from '~/lib/utils/code/ascii'
import { setToolPageMeta } from '~/lib/seo'

const TABLE = buildAsciiTable()

export default function AsciiTableTool() {
  setToolPageMeta('code', 'ascii-table')
  const [params, setParams] = useSearchParams<{ q?: string }>()
  const [search, setSearchSignal] = createSignal(params.q ?? '')
  const [copied, setCopied] = createSignal<string | null>(null)

  function setSearch(v: string) {
    setSearchSignal(v)
    setParams({ q: v || undefined }, { replace: true })
  }

  const filtered = createMemo(() => {
    const q = search().toLowerCase().trim()
    if (!q) return TABLE
    return TABLE.filter(
      (e) =>
        e.char.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        String(e.dec).includes(q) ||
        e.hex.toLowerCase().includes(q)
    )
  })

  function copyCell(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(value)
      setTimeout(() => setCopied(null), 1000)
    })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="ASCII table"
        description="Full 0–255 extended ASCII reference. Click any cell to copy its value."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Search</h2>
          </div>
          <TextField value={search()} onChange={setSearch}>
            <TextFieldInput autofocus placeholder="char, description, dec, hex…" class="h-12 font-mono text-base" />
          </TextField>
        </section>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reference</h2>
            <span class="ml-auto text-xs text-muted-foreground">
              {filtered().length} entr{filtered().length === 1 ? 'y' : 'ies'}
            </span>
          </div>

          <div class="overflow-x-auto rounded-md border border-border">
            <table class="w-full text-sm">
              <thead class="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th class="px-3 py-2 text-left font-semibold">Dec</th>
                  <th class="px-3 py-2 text-left font-semibold">Hex</th>
                  <th class="px-3 py-2 text-left font-semibold">Oct</th>
                  <th class="px-3 py-2 text-left font-semibold">Bin</th>
                  <th class="px-3 py-2 text-left font-semibold">Char</th>
                  <th class="px-3 py-2 text-left font-semibold">HTML</th>
                  <th class="px-3 py-2 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <For each={filtered()}>
                  {(entry) => {
                    const cells = [
                      String(entry.dec),
                      entry.hex,
                      entry.oct,
                      entry.bin,
                      entry.char,
                      entry.htmlEntity,
                      entry.description,
                    ]
                    return (
                      <tr class="border-t border-border/50 transition-colors duration-300 hover:bg-violet/5 hover:duration-25">
                        <For each={cells}>
                          {(cell) => (
                            <td
                              class="cursor-pointer px-3 py-1.5 font-mono transition-colors duration-300 hover:bg-violet/10 hover:text-violet hover:duration-25"
                              title={copied() === cell ? 'Copied!' : 'Click to copy'}
                              onClick={() => copyCell(cell)}
                            >
                              <Show when={copied() === cell} fallback={cell}>
                                <span class="font-semibold text-violet">✓</span>
                              </Show>
                            </td>
                          )}
                        </For>
                      </tr>
                    )
                  }}
                </For>
              </tbody>
            </table>
            <Show when={filtered().length === 0}>
              <p class="px-4 py-8 text-center text-sm text-muted-foreground">No entries match your search.</p>
            </Show>
          </div>
        </section>
      </div>
    </main>
  )
}
