import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { DateField } from '~/components/date-field'
import { Label } from '~/components/ui/label'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { addToDate, type DateUnit } from '~/lib/utils/datetime/date-add'
import { setToolPageMeta } from '~/lib/seo'

const unitOptions: { value: DateUnit; label: string }[] = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
]

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export default function DateAdd() {
  setToolPageMeta('datetime', 'date-add')
  const [params, setParams] = useSearchParams<{ date?: string; amount?: string; unit?: string }>()
  const validUnits: DateUnit[] = ['days', 'weeks', 'months', 'years']
  const initialUnit: DateUnit = validUnits.includes(params.unit as DateUnit) ? (params.unit as DateUnit) : 'days'

  const [date, setDateSignal] = createSignal(params.date ?? today())
  const [amount, setAmountSignal] = createSignal(params.amount ?? '7')
  const [unit, setUnitSignal] = createSignal<DateUnit>(initialUnit)

  function setDate(v: string) { setDateSignal(v); setParams({ date: v || undefined }, { replace: true }) }
  function setAmount(v: string) { setAmountSignal(v); setParams({ amount: v || undefined }, { replace: true }) }
  function setUnit(v: DateUnit) { setUnitSignal(v); setParams({ unit: v }, { replace: true }) }

  const result = createMemo(() => {
    const d = date()
    const a = parseInt(amount())
    if (!d || isNaN(a)) return null
    try {
      return addToDate(d, a, unit())
    } catch {
      return null
    }
  })

  type Row = { label: string; value: string; copy?: boolean }

  const rows = createMemo<Row[]>(() => {
    const r = result()
    if (!r) return []
    return [
      { label: 'Date', value: r.resultIso, copy: true },
      { label: 'Weekday', value: r.weekday },
      { label: 'Full date', value: r.formatted },
    ]
  })

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Add / subtract from date"
        description="Add or subtract days, weeks, months, or years from any date."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Unit" value={unit()} onChange={setUnit} options={unitOptions} />
        </ToolToolbar>

        {/* Input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <Label>Base date</Label>
              <DateField
                value={date()}
                onChange={setDate}
                inputRef={(el) => (inputRef = el)}
                inputClass="h-12 font-mono text-base"
              />
            </div>

            <NumberField value={amount()} onChange={setAmount} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Amount (negative to subtract)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="7" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* Result */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
          </div>

          <div class="relative">
            <Show
              when={result()}
              fallback={
                <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Result will appear here
                </div>
              }
            >
              <div class="anim-fade-up min-h-[8.25rem] overflow-hidden rounded-md border border-violet/30 bg-violet/5">
                <div class="divide-y divide-violet/15">
                  <For each={rows()}>
                    {(row) => (
                      <div class="flex items-center gap-4 px-4 py-3">
                        <span class="min-w-[6rem] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {row.label}
                        </span>
                        <span class="flex-1 break-words font-mono text-sm">{row.value}</span>
                        <Show when={row.copy}>
                          <CopyButton value={() => row.value} />
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </section>
      </div>
    </main>
  )
}
