import { createMemo, createSignal, For, Show, onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar } from '~/components/tool-toolbar'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { setToolPageMeta } from '~/lib/seo'
import { convertSalary, salaryPeriods, type SalaryBreakdown } from '~/lib/utils/finance/salary'

type PeriodId = keyof SalaryBreakdown
type PeriodOption = (typeof salaryPeriods)[number]

function fmtCurrency(n: number): string {
  if (!isFinite(n)) return '—'
  return n.toFixed(2)
}

export default function SalaryConverter() {
  setToolPageMeta('finance', 'salary')
  const [params, setParams] = useSearchParams<{
    amount?: string
    period?: string
    hours?: string
  }>()
  const validPeriods: PeriodId[] = salaryPeriods.map((p) => p.id)
  const initialPeriod: PeriodId = validPeriods.includes(params.period as PeriodId)
    ? (params.period as PeriodId)
    : 'annual'

  const [amount, setAmountSignal] = createSignal(params.amount ?? '')
  const [periodId, setPeriodIdSignal] = createSignal<PeriodId>(initialPeriod)
  const [hoursPerWeek, setHoursPerWeekSignal] = createSignal(params.hours ?? '40')

  function setAmount(v: string) { setAmountSignal(v); setParams({ amount: v || undefined }, { replace: true }) }
  function setPeriodId(v: PeriodId) { setPeriodIdSignal(v); setParams({ period: v }, { replace: true }) }
  function setHoursPerWeek(v: string) { setHoursPerWeekSignal(v); setParams({ hours: v || undefined }, { replace: true }) }

  const selectedPeriod = createMemo(() => salaryPeriods.find((p) => p.id === periodId()) ?? salaryPeriods[0])

  const result = createMemo(() => {
    const a = parseFloat(amount())
    const h = parseFloat(hoursPerWeek())
    if (!isFinite(a) || a < 0 || !isFinite(h) || h <= 0) return null
    return convertSalary(a, periodId(), h)
  })

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Salary converter"
        description="Convert between annual, monthly, bi-weekly, weekly, daily, and hourly pay rates."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pay period</span>
          <Select<PeriodOption>
            options={salaryPeriods}
            optionValue="id"
            optionTextValue="label"
            value={selectedPeriod() || undefined}
            onChange={(opt) => opt && setPeriodId(opt.id)}
            itemComponent={(itemProps) => (
              <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
            )}
          >
            <SelectTrigger aria-label="Pay period" class="h-8 w-44 text-sm">
              <SelectValue<PeriodOption>>{(state) => state.selectedOption()?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </ToolToolbar>

        {/* Inputs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <NumberField value={amount() || undefined} onChange={setAmount} minValue={0} step={0.01} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Amount ($)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="e.g. 75000" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField
              value={hoursPerWeek() || undefined}
              onChange={setHoursPerWeek}
              minValue={1}
              maxValue={168}
              step={1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>Hours per week</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="40" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* Results */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Breakdown</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter an amount to see the salary breakdown
              </div>
            }
          >
            <div class="overflow-hidden rounded-md border border-border">
              <For each={salaryPeriods}>
                {(p) => {
                  const value = createMemo(() => fmtCurrency(result()![p.id]))
                  return <ResultRow label={p.label} value={value() || undefined} prefix="$" />
                }}
              </For>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}

type ResultRowProps = {
  label: string
  value: string
  prefix?: string
  suffix?: string
}

function ResultRow(props: ResultRowProps) {
  const full = () => `${props.prefix ?? ''}${props.value}${props.suffix ?? ''}`
  return (
    <div class="flex items-center gap-3 border-t border-border/50 px-4 py-3 text-sm first:border-t-0">
      <span class="w-40 shrink-0 text-muted-foreground">{props.label}</span>
      <span class="flex-1 text-right font-mono tabular-nums text-base font-semibold">{full()}</span>
      <CopyButton value={full} />
    </div>
  )
}
