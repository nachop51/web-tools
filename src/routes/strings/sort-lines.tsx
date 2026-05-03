import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarChip, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { sortLines, type SortOptions } from '~/lib/utils/strings/sort'
import { setToolPageMeta } from '~/lib/seo'

type Order = 'asc' | 'desc'
type SortMode = 'alpha' | 'numeric' | 'length'

const orderOptions: { value: Order; label: string }[] = [
  { value: 'asc', label: 'A → Z' },
  { value: 'desc', label: 'Z → A' },
]

const sortModeOptions: { value: SortMode; label: string }[] = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'length', label: 'Length' },
]

export default function SortLinesPage() {
  setToolPageMeta('strings', 'sort-lines')
  const [params, setParams] = useSearchParams<{ order?: string; mode?: string }>()

  const [input, setInput] = createSignal('')
  const [dedupe, setDedupe] = createSignal(false)
  const [caseSensitive, setCaseSensitive] = createSignal(false)

  const order = createMemo<Order>(() => {
    const p = params.order
    return p === 'desc' ? 'desc' : 'asc'
  })

  const mode = createMemo<SortMode>(() => {
    const p = params.mode
    if (p && sortModeOptions.some((m) => m.value === p)) return p as SortMode
    return 'alpha'
  })

  const opts = createMemo<SortOptions>(() => ({
    order: order(),
    mode: mode(),
    dedupe: dedupe(),
    caseSensitive: caseSensitive(),
  }))

  const output = createMemo(() => sortLines(input(), opts()))

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Sort lines"
        description="Sort lines alphabetically, numerically, or by length, with optional deduplication."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Sort by"
            value={mode()}
            onChange={(v) => setParams({ mode: v })}
            options={sortModeOptions}
          />
          <ToolbarSegmented
            label="Order"
            value={order()}
            onChange={(v) => setParams({ order: v })}
            options={orderOptions}
          />
          <div class="ml-auto" />
          <ToolbarChip checked={dedupe()} onChange={setDedupe}>
            Remove duplicates
          </ToolbarChip>
          <ToolbarChip checked={caseSensitive()} onChange={setCaseSensitive}>
            Case sensitive
          </ToolbarChip>
        </ToolToolbar>

        <div class="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>

            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea
                autofocus
                placeholder="Paste lines here…"
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
                    Sorted result will appear here
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
