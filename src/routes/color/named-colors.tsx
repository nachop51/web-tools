import { createMemo, createSignal, For, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldInput } from '~/components/ui/text-field'
import { CSS_NAMED_COLORS } from '~/lib/utils/color/named'
import { setToolPageMeta } from '~/lib/seo'

export default function NamedColors() {
  setToolPageMeta('color', 'named-colors')
  const [params, setParams] = useSearchParams<{ q?: string }>()
  const [search, setSearchSignal] = createSignal(params.q ?? '')
  const [copied, setCopied] = createSignal<string | null>(null)

  function setSearch(v: string) {
    setSearchSignal(v)
    setParams({ q: v || undefined }, { replace: true })
  }

  const filtered = createMemo(() => {
    const q = search().trim().toLowerCase()
    if (q === '') return CSS_NAMED_COLORS
    return CSS_NAMED_COLORS.filter((c) => c.name.includes(q) || c.hex.toLowerCase().includes(q))
  })

  async function copyHex(hex: string) {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      setTimeout(() => setCopied((current) => (current === hex ? null : current)), 1200)
    } catch {
      // ignore
    }
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Named colors"
        description="Browse and search all 148 CSS named colors with hex and RGB values."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Search */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Search</h2>
            </div>
            <span class="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {filtered().length} / {CSS_NAMED_COLORS.length}
            </span>
          </div>

          <TextField value={search()} onChange={setSearch}>
            <TextFieldInput
              autofocus
              type="text"
              placeholder="rebecca, #ff..., tomato"
              class="h-12 font-mono text-base"
            />
          </TextField>
        </section>

        {/* Grid */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Colors</h2>
          </div>

          <Show
            when={filtered().length > 0}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                No colors match your search.
              </div>
            }
          >
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <For each={filtered()}>
                {(color) => {
                  const isCopied = () => copied() === color.hex
                  return (
                    <button
                      type="button"
                      onClick={() => copyHex(color.hex)}
                      class="group overflow-hidden rounded-md border border-border bg-background text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-violet/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
                    >
                      <div
                        class="h-14 transition-transform duration-200 group-hover:scale-[1.02]"
                        style={{ 'background-color': color.hex }}
                      />
                      <div class="space-y-0.5 p-2.5">
                        <p class="truncate font-mono text-xs font-semibold">{color.name}</p>
                        <p
                          class="font-mono text-[11px] transition-colors"
                          classList={{
                            'text-violet': isCopied(),
                            'text-muted-foreground': !isCopied(),
                          }}
                        >
                          {isCopied() ? 'Copied!' : color.hex}
                        </p>
                      </div>
                    </button>
                  )
                }}
              </For>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
