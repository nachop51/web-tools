import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
} from '~/components/ui/number-field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import { describeCron, nextRuns, parseCron } from '~/lib/utils/datetime/cron'
import { setToolPageMeta } from '~/lib/seo'

const FIELDS = [
  { name: 'Min', range: '0-59', hint: 'Minute (0-59)' },
  { name: 'Hour', range: '0-23', hint: 'Hour (0-23)' },
  { name: 'Day', range: '1-31', hint: 'Day of month (1-31)' },
  { name: 'Month', range: '1-12', hint: 'Month (1-12)' },
  { name: 'Weekday', range: '0-6', hint: 'Day of week (0=Sun, 6=Sat)' },
] as const

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 min', expr: '*/5 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily midnight', expr: '0 0 * * *' },
  { label: 'Daily noon', expr: '0 12 * * *' },
  { label: 'Weekdays 9am', expr: '0 9 * * 1-5' },
  { label: 'Mondays', expr: '0 0 * * 1' },
  { label: '1st of month', expr: '0 0 1 * *' },
] as const

export default function CronPreview() {
  setToolPageMeta('datetime', 'cron')
  const [params, setParams] = useSearchParams<{ expr?: string; n?: string }>()

  const [expr, setExpr] = createSignal(params.expr ?? '0 * * * *')
  const initialCount = Math.min(100, Math.max(1, parseInt(params.n ?? '10', 10) || 10))
  const [count, setCountSignal] = createSignal(initialCount)
  function setCount(n: number) {
    const clamped = Math.min(100, Math.max(1, n))
    setCountSignal(clamped)
    setParams({ n: clamped === 10 ? undefined : String(clamped) }, { replace: true })
  }

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
    return nextRuns(fields, new Date(), count())
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

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['week', 7 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
    ['second', 1000],
  ]
  function relative(date: Date): string {
    const diff = date.getTime() - Date.now()
    for (const [unit, ms] of units) {
      if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit)
    }
    return rtf.format(0, 'second')
  }

  function updateExpr(next: string) {
    setExpr(next)
    setParams({ expr: next || undefined }, { replace: true })
  }

  function setField(i: number, v: string) {
    const parts = expr().trim().split(/\s+/)
    while (parts.length < 5) parts.push('*')
    parts[i] = v.trim() || '*'
    updateExpr(parts.slice(0, 5).join(' '))
  }

  const fieldValues = createMemo(() => {
    const parts = expr().trim().split(/\s+/)
    return [0, 1, 2, 3, 4].map((i) => parts[i] ?? '*')
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
        {/* Expression + builder */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Expression</h2>
          </div>

          {/* Presets */}
          <div class="mb-4 flex flex-wrap items-center gap-1.5">
            <span class="mr-1 text-[11px] uppercase tracking-wider text-muted-foreground/70">Try</span>
            <For each={PRESETS}>
              {(p) => (
                <button
                  type="button"
                  onClick={() => updateExpr(p.expr)}
                  title={p.expr}
                  class="cursor-pointer border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-violet/60 hover:bg-violet/5 hover:text-violet"
                  classList={{ 'border-violet text-violet': expr().trim() === p.expr }}
                >
                  {p.label}
                </button>
              )}
            </For>
          </div>

          <TextField
            value={expr()}
            onChange={updateExpr}
            validationState={parsed().error ? 'invalid' : 'valid'}
            class="flex flex-col gap-2"
          >
            <TextFieldInput ref={inputRef} type="text" class="h-12 font-mono text-base" placeholder="e.g. 0 * * * *" />
            <TextFieldErrorMessage>{parsed().error}</TextFieldErrorMessage>
          </TextField>

          {/* Field builder / hints */}
          <div class="mt-4 grid grid-cols-5 gap-2">
            <For each={FIELDS}>
              {(f, i) => (
                <div class="flex flex-col items-center gap-1.5">
                  <span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {f.name}
                  </span>
                  <TextField
                    value={fieldValues()[i()]}
                    onChange={(v) => setField(i(), v)}
                    class="w-full gap-0"
                  >
                    <TextFieldInput class="h-9 text-center font-mono text-sm" title={f.hint} />
                  </TextField>
                  <span class="text-[10px] text-muted-foreground">{f.range}</span>
                </div>
              )}
            </For>
          </div>

          <Show when={description()}>
            <p class="mt-4 text-sm text-muted-foreground">
              <span class="font-medium text-foreground">Meaning: </span>
              {description()}
            </p>
          </Show>

          <p class="mt-2 text-xs text-muted-foreground">
            Use <code class="font-mono">*</code> for any, <code class="font-mono">*/n</code> every n,{' '}
            <code class="font-mono">a-b</code> ranges, <code class="font-mono">a,b,c</code> lists.
          </p>
        </section>

        {/* Next runs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Next {count()} runs</h2>
            </div>
            <NumberField
              value={String(count())}
              onChange={(v) => {
                const n = parseInt(v, 10)
                if (!isNaN(n)) setCount(n)
              }}
              minValue={1}
              maxValue={100}
              format={false}
              class="flex-row items-center gap-2"
            >
              <span class="text-xs text-muted-foreground">Count</span>
              <NumberFieldGroup>
                <NumberFieldInput class="h-8 w-20 text-center font-mono text-sm" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>

          <Show
            when={parsed().fields !== null && runs().length > 0}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Result will appear here
              </div>
            }
          >
            <div class="anim-fade-up overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-10">#</TableHead>
                    <TableHead>Local time</TableHead>
                    <TableHead>UTC</TableHead>
                    <TableHead>In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <For each={runs()}>
                    {(date, i) => (
                      <TableRow>
                        <TableCell class="text-xs text-muted-foreground">{i() + 1}</TableCell>
                        <TableCell>{localFormatter.format(date)}</TableCell>
                        <TableCell class="text-muted-foreground">{utcFormatter.format(date)}</TableCell>
                        <TableCell class="text-muted-foreground">{relative(date)}</TableCell>
                      </TableRow>
                    )}
                  </For>
                </TableBody>
              </Table>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
