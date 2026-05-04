import { createMemo, createSignal, For, Show } from 'solid-js'
import { TbOutlineTextWrap } from 'solid-icons/tb'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { Button } from '~/components/ui/button'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { cn } from '~/lib/utils'
import { computeDiff } from '~/lib/utils/strings/diff'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

export default function TextDiff() {
  setToolPageMeta('strings', 'diff')
  const [params, setParams] = useSearchParams<{ a?: string; b?: string }>()
  const [original, setOriginalSignal] = createSignal(params.a ?? '')
  const [modified, setModifiedSignal] = createSignal(params.b ?? '')
  const [wrapLines, setWrapLines] = createSignal(false)

  function setOriginal(v: string) {
    setOriginalSignal(v)
    setParams({ a: urlText(v) }, { replace: true })
  }
  function setModified(v: string) {
    setModifiedSignal(v)
    setParams({ b: urlText(v) }, { replace: true })
  }

  const diff = createMemo(() => {
    if (!original() && !modified()) return null
    return computeDiff(original(), modified())
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Text diff"
        description="Compare two pieces of text and highlight additions and deletions line by line."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <div class="grid gap-6 md:grid-cols-2">
          {/* Original */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Original</h2>
            </div>

            <TextField value={original()} onChange={setOriginal}>
              <TextFieldTextArea
                autofocus
                placeholder="Paste original text here…"
                class="min-h-[10rem] resize-y font-mono text-sm"
              />
            </TextField>
          </section>

          {/* Modified */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Modified</h2>
            </div>

            <TextField value={modified()} onChange={setModified}>
              <TextFieldTextArea
                placeholder="Paste modified text here…"
                class="min-h-[10rem] resize-y font-mono text-sm"
              />
            </TextField>
          </section>
        </div>

        {/* Diff */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Diff</h2>
            </div>
            <div class="flex items-center gap-3">
              <Show when={diff()}>
                {(d) => (
                  <div class="flex gap-3 text-xs">
                    <span class="rounded-md border border-violet/30 bg-violet/5 px-2 py-0.5 font-medium text-foreground">
                      +{d().stats.added} added
                    </span>
                    <span class="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-0.5 font-medium text-destructive">
                      −{d().stats.removed} removed
                    </span>
                    <span class="rounded-md border border-border bg-background px-2 py-0.5 font-medium text-muted-foreground">
                      {d().stats.unchanged} unchanged
                    </span>
                  </div>
                )}
              </Show>
              <Button
                variant={wrapLines() ? 'default' : 'outline'}
                size="xs"
                aria-pressed={wrapLines()}
                onClick={() => setWrapLines(!wrapLines())}
              >
                <TbOutlineTextWrap />
                Wrap
              </Button>
            </div>
          </div>

          <Show
            when={diff()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Diff will appear here
              </div>
            }
          >
            {(d) => (
              <div
                class={cn(
                  'anim-fade-up rounded-md border border-violet/30 bg-violet/5 py-2',
                  !wrapLines() && 'overflow-x-auto'
                )}
              >
                <For each={d().lines}>
                  {(line) => (
                    <div
                      class={cn(
                        'flex gap-2 px-4 py-0.5 font-mono text-sm',
                        line.type === 'added' && 'bg-violet/10 text-foreground',
                        line.type === 'removed' && 'bg-destructive/10 text-destructive',
                        line.type === 'unchanged' && 'text-muted-foreground'
                      )}
                    >
                      <span class="w-4 shrink-0 select-none">
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
                      </span>
                      <span class={cn(wrapLines() ? 'whitespace-pre-wrap break-all' : 'whitespace-pre')}>
                        {line.value || ' '}
                      </span>
                    </div>
                  )}
                </For>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  )
}
