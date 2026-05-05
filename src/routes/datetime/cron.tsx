import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import { describeCron, nextRuns, parseCron } from '~/lib/utils/datetime/cron'
import { setToolPageMeta } from '~/lib/seo'

export default function CronPreview() {
  setToolPageMeta('datetime', 'cron')
  const [params, setParams] = useSearchParams<{ expr?: string }>()

  const [expr, setExpr] = createSignal(params.expr ?? '0 * * * *')

  const parsed = createMemo(() => {
    try {
      return { fields: parseCron(expr()), error: null }
    } catch (e) {
      return {
        fields: null,
        error: e instanceof Error ? e.message : 'Invalid cron expression',
      }
    }
  })

  const description = createMemo(() => {
    const { fields } = parsed()
    if (!fields) return ''
    return describeCron(fields)
  })

  const runs = createMemo(() => {
    const { fields } = parsed()
    if (!fields) return []
    return nextRuns(fields, new Date(), 10)
  })

  const localFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const utcFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Cron preview"
        description="Parse a cron expression and preview the next run times in local and UTC."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Expression input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Expression</h2>
          </div>

          <TextField
            value={expr()}
            onChange={(v) => {
              setExpr(v)
              setParams({ expr: v || undefined }, { replace: true })
            }}
            validationState={parsed().error ? 'invalid' : 'valid'}
            class="flex flex-col gap-2"
          >
            <TextFieldInput ref={inputRef} type="text" class="h-12 font-mono text-base" placeholder="e.g. 0 * * * *" />
            <TextFieldErrorMessage>{parsed().error}</TextFieldErrorMessage>
          </TextField>

          <Show when={description()}>
            <p class="mt-3 text-sm text-muted-foreground">
              <span class="font-medium text-foreground">Meaning: </span>
              {description()}
            </p>
          </Show>

          <p class="mt-2 text-xs text-muted-foreground">
            5-field standard cron: minute hour day-of-month month day-of-week
          </p>
        </section>

        {/* Next runs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Next 10 runs</h2>
          </div>

          <Show
            when={parsed().fields !== null && runs().length > 0}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Result will appear here
              </div>
            }
          >
            <div class="anim-fade-up overflow-hidden rounded-md border border-violet/30 bg-violet/5">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-violet/20 bg-violet/5">
                      <th class="w-10 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        #
                      </th>
                      <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Local time
                      </th>
                      <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        UTC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={runs()}>
                      {(date, i) => (
                        <tr class="border-b border-violet/10 transition-colors last:border-0 hover:bg-violet/10">
                          <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{i() + 1}</td>
                          <td class="px-4 py-2.5 font-mono text-sm">{localFormatter.format(date)}</td>
                          <td class="px-4 py-2.5 font-mono text-sm text-muted-foreground">
                            {utcFormatter.format(date)}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
