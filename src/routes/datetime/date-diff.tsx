import { createMemo, createSignal, For, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field'
import { dateDiff, ageFrom, type DateDiffResult } from '~/lib/utils/datetime/date-diff'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'diff' | 'age'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'diff', label: 'Date difference' },
  { value: 'age', label: 'Age' },
]

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function DateDiffTool() {
  setToolPageMeta('datetime', 'date-diff')
  const [params, setParams] = useSearchParams<{
    from?: string
    to?: string
    mode?: string
  }>()

  const [mode, setMode] = createSignal<Mode>(params.mode === 'age' ? 'age' : 'diff')
  const [from, setFrom] = createSignal(params.from ?? '')
  const [to, setTo] = createSignal(params.to ?? '')

  function handleFrom(v: string) {
    setFrom(v)
    setParams({ from: v })
  }

  function handleTo(v: string) {
    setTo(v)
    setParams({ to: v })
  }

  function handleMode(m: Mode) {
    setMode(m)
    setParams({ mode: m })
  }

  function useToday() {
    handleTo(todayStr())
  }

  const result = createMemo<DateDiffResult | null>(() => {
    const f = from()
    const t = to()
    if (!f || !t) return null
    const dFrom = new Date(f)
    const dTo = new Date(t)
    if (isNaN(dFrom.getTime()) || isNaN(dTo.getTime())) return null
    try {
      return mode() === 'age' ? ageFrom(dFrom, dTo) : dateDiff(dFrom, dTo)
    } catch {
      return null
    }
  })

  type BreakdownRow = { label: string; value: number }

  const breakdownRows = createMemo<BreakdownRow[]>(() => {
    const r = result()
    if (!r) return []
    return [
      { label: 'Years', value: r.years },
      { label: 'Months', value: r.months },
      { label: 'Days', value: r.days },
      { label: 'Hours', value: r.hours },
      { label: 'Minutes', value: r.minutes },
      { label: 'Seconds', value: r.seconds },
    ]
  })

  type TotalRow = { label: string; value: () => string }

  const totalsRows = createMemo<TotalRow[]>(() => [
    { label: 'Total days', value: () => String(result()?.totalDays ?? '') },
    { label: 'Total hours', value: () => String(result()?.totalHours ?? '') },
    { label: 'Total minutes', value: () => String(result()?.totalMinutes ?? '') },
    { label: 'Total seconds', value: () => String(result()?.totalSeconds ?? '') },
  ])

  const summaryText = createMemo(() => {
    const r = result()
    if (!r) return ''
    const parts: string[] = []
    if (r.years) parts.push(`${r.years} year${r.years !== 1 ? 's' : ''}`)
    if (r.months) parts.push(`${r.months} month${r.months !== 1 ? 's' : ''}`)
    if (r.days) parts.push(`${r.days} day${r.days !== 1 ? 's' : ''}`)
    if (parts.length === 0) parts.push('0 days')
    return parts.join(', ')
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Date difference"
        description="Calculate the exact difference between two dates, or compute someone's age."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Mode" value={mode()} onChange={handleMode} options={modeOptions} />
        </ToolToolbar>

        {/* Dates input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Dates</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <TextField value={from()} onChange={handleFrom} class="flex flex-col gap-1.5">
              <TextFieldLabel>{mode() === 'age' ? 'Birthdate' : 'From'}</TextFieldLabel>
              <TextFieldInput autofocus type="date" class="h-12 font-mono text-base" />
            </TextField>

            <div class="flex flex-col gap-1.5">
              <TextField value={to()} onChange={handleTo} class="flex flex-col gap-1.5">
                <TextFieldLabel>To</TextFieldLabel>
                <TextFieldInput type="date" class="h-12 font-mono text-base" />
              </TextField>
              <button
                type="button"
                onClick={useToday}
                class="self-start text-xs font-medium text-muted-foreground transition-colors hover:text-violet cursor-pointer"
              >
                Use today
              </button>
            </div>
          </div>
        </section>

        {/* Result */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
            </div>
            <Show when={result()}>
              <CopyButton value={() => summaryText()}>Copy summary</CopyButton>
            </Show>
          </div>

          <Show
            when={result() !== null}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Result will appear here
              </div>
            }
          >
            <div class="anim-fade-up flex flex-col gap-4">
              {/* Summary banner */}
              <div class="rounded-md border border-violet/30 bg-violet/5 px-4 py-3">
                <p class="font-mono text-sm leading-relaxed">{summaryText()}</p>
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
                            <span class="min-w-[6.5rem] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
