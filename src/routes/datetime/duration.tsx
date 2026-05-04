import { createMemo, createSignal, For, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import { formatDuration, parseDuration, type DurationParts } from '~/lib/utils/datetime/duration'
import { setToolPageMeta } from '~/lib/seo'

export default function DurationTool() {
  setToolPageMeta('datetime', 'duration')
  const [params, setParams] = useSearchParams<{ d?: string }>()
  const [input, setInputSignal] = createSignal(params.d ?? '')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ d: v || undefined }, { replace: true })
  }

  const result = createMemo<DurationParts | null>(() => {
    const raw = input().trim()
    if (!raw) return null
    try {
      return parseDuration(raw)
    } catch {
      return null
    }
  })

  const error = createMemo<string | null>(() => {
    const raw = input().trim()
    if (!raw) return null
    try {
      parseDuration(raw)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Invalid duration'
    }
  })

  const humanString = createMemo(() => {
    const r = result()
    if (!r) return ''
    return formatDuration(r)
  })

  const totalMinutes = createMemo(() => {
    const r = result()
    if (!r) return ''
    return (r.totalSeconds / 60).toFixed(4).replace(/\.?0+$/, '')
  })

  const totalHours = createMemo(() => {
    const r = result()
    if (!r) return ''
    return (r.totalSeconds / 3600).toFixed(6).replace(/\.?0+$/, '')
  })

  type Row = { label: string; value: string }

  const breakdownRows = createMemo<Row[]>(() => {
    const r = result()
    if (!r) return []
    return [
      { label: 'Years', value: String(r.years) },
      { label: 'Days', value: String(r.days) },
      { label: 'Hours', value: String(r.hours) },
      { label: 'Minutes', value: String(r.minutes) },
      { label: 'Seconds', value: String(r.seconds) },
    ]
  })

  type TotalRow = { label: string; value: () => string }

  const totalsRows = createMemo<TotalRow[]>(() => [
    {
      label: 'Total seconds',
      value: () => String(result()?.totalSeconds ?? ''),
    },
    { label: 'Total minutes', value: () => totalMinutes() },
    { label: 'Total hours', value: () => totalHours() },
  ])

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Duration calculator"
        description='Parse durations like "1d 2h 30m", "1:30:00", or raw seconds into a full breakdown.'
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <TextField
            value={input()}
            onChange={setInput}
            validationState={error() ? 'invalid' : 'valid'}
            class="flex flex-col gap-2"
          >
            <TextFieldInput
              autofocus
              type="text"
              class="h-12 font-mono text-base"
              placeholder='e.g. "1d 2h 30m", "1:30:00", or "3600"'
            />
            <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
          </TextField>

          <p class="mt-2 text-xs text-muted-foreground">
            Supports: y/yr/year, d/day, h/hr/hour, m/min/minute, s/sec/second, HH:MM:SS, or plain seconds
          </p>
        </section>

        {/* Result */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
            </div>
            <Show when={result() !== null && !error()}>
              <CopyButton value={() => humanString()}>Copy</CopyButton>
            </Show>
          </div>

          <Show
            when={result() !== null && !error()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Result will appear here
              </div>
            }
          >
            <div class="anim-fade-up flex flex-col gap-4">
              {/* Human summary */}
              <div class="rounded-md border border-violet/30 bg-violet/5 px-4 py-3">
                <p class="font-mono text-sm leading-relaxed">{humanString()}</p>
              </div>

              <div class="grid gap-4 lg:grid-cols-2">
                {/* Breakdown */}
                <div class="flex flex-col gap-2">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Breakdown</h3>
                  <div class="overflow-hidden rounded-md border border-violet/30 bg-violet/5">
                    <div class="divide-y divide-violet/15">
                      <For each={breakdownRows()}>
                        {(row) => (
                          <div class="flex items-center gap-4 px-4 py-2.5">
                            <span class="min-w-[5rem] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {row.label}
                            </span>
                            <span class="flex-1 font-mono text-sm">{row.value}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div class="flex flex-col gap-2">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Totals</h3>
                  <div class="overflow-hidden rounded-md border border-violet/30 bg-violet/5">
                    <div class="divide-y divide-violet/15">
                      <For each={totalsRows()}>
                        {(row) => (
                          <div class="flex items-center gap-3 px-4 py-2.5">
                            <span class="min-w-[7rem] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {row.label}
                            </span>
                            <span class="flex-1 break-all font-mono text-sm">{row.value()}</span>
                            <CopyButton value={row.value} />
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
