import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldInput, TextFieldTextArea } from '~/components/ui/text-field'
import { cn } from '~/lib/utils'
import { testRegex } from '~/lib/utils/code/regex'
import { setToolPageMeta } from '~/lib/seo'

const FLAG_DEFS = [
  { key: 'g', label: 'g', title: 'Global' },
  { key: 'i', label: 'i', title: 'Case insensitive' },
  { key: 'm', label: 'm', title: 'Multiline' },
  { key: 's', label: 's', title: 'Dot all' },
] as const

type FlagKey = 'g' | 'i' | 'm' | 's'

export default function RegexTester() {
  setToolPageMeta('code', 'regex')
  const [params, setParams] = useSearchParams<{ p?: string; flags?: string }>()

  const [pattern, setPattern] = createSignal(params.p ?? '')
  const [flags, setFlags] = createSignal<Set<FlagKey>>(
    new Set((params.flags ?? 'g').split('').filter((f): f is FlagKey => ['g', 'i', 'm', 's'].includes(f)) as FlagKey[])
  )
  const [input, setInput] = createSignal('')

  function toggleFlag(f: FlagKey) {
    setFlags((prev) => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      setParams({ flags: [...next].join('') }, { replace: true })
      return next
    })
  }

  function handlePatternChange(val: string) {
    setPattern(val)
    setParams({ p: val }, { replace: true })
  }

  const flagStr = createMemo(() => [...flags()].join(''))

  const result = createMemo(() => testRegex(pattern(), flagStr(), input()))

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="Regex tester"
        description="Test regular expressions with live match highlighting and group capture."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pattern</h2>
          </div>

          <div class="flex flex-wrap items-end gap-3">
            <div class="flex-1 min-w-[16rem]">
              <TextField value={pattern()} onChange={handlePatternChange}>
                <TextFieldInput
                  autofocus
                  placeholder="e.g. \d+"
                  class={cn('h-12 font-mono text-base', result().error && 'border-destructive')}
                />
              </TextField>
            </div>

            <div class="flex gap-2">
              <For each={FLAG_DEFS}>
                {(f) => (
                  <button
                    type="button"
                    title={f.title}
                    onClick={() => toggleFlag(f.key)}
                    class={cn(
                      'rounded-md border px-3 py-1.5 text-sm font-mono font-semibold transition-colors duration-150 cursor-pointer',
                      flags().has(f.key)
                        ? 'border-violet bg-violet text-white'
                        : 'border-border bg-background text-foreground hover:border-violet/60 hover:bg-violet/5'
                    )}
                  >
                    {f.label}
                  </button>
                )}
              </For>
            </div>
          </div>

          <Show when={result().error}>
            {(err) => (
              <div class="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <span class="font-semibold">Regex error:</span> {err()}
              </div>
            )}
          </Show>
        </section>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Test input</h2>
          </div>
          <TextField value={input()} onChange={setInput}>
            <TextFieldTextArea
              class="min-h-[10rem] font-mono text-sm resize-y"
              placeholder="Enter text to test against…"
            />
          </TextField>
        </section>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Matches</h2>
            <Show when={result().matches.length > 0}>
              <span class="ml-auto bg-violet/15 px-2.5 py-0.5 text-xs font-semibold text-violet">
                {result().matches.length}
              </span>
            </Show>
          </div>

          <Show
            when={result().matches.length > 0}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                <Show when={pattern() && !result().error} fallback="Enter a pattern to start matching">
                  No matches found
                </Show>
              </div>
            }
          >
            <div class="space-y-2">
              <For each={result().matches}>
                {(match, i) => (
                  <div class="anim-fade-up rounded-md border border-violet/30 bg-violet/5 px-3 py-2 text-sm font-mono">
                    <div class="flex flex-wrap items-center gap-3">
                      <span class="text-xs text-muted-foreground">#{i() + 1}</span>
                      <span class="text-xs text-muted-foreground">index {match.index}</span>
                      <span class="rounded bg-violet/15 px-1.5 py-0.5 text-violet">{match.fullMatch}</span>
                    </div>
                    <Show when={match.groups.length > 0}>
                      <div class="mt-2 flex flex-wrap gap-1.5">
                        <For each={match.groups}>
                          {(g, gi) => (
                            <span class="text-xs">
                              <span class="text-muted-foreground">group {gi() + 1}:</span>{' '}
                              <span class="rounded bg-muted px-1">
                                <Show when={g !== ''} fallback={<em class="opacity-50">empty</em>}>
                                  {g}
                                </Show>
                              </span>
                            </span>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
