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
import { cn } from '~/lib/utils'
import { setToolPageMeta } from '~/lib/seo'
import { compoundInterest, compoundingOptions, type CompoundingId } from '~/lib/utils/finance/compound-interest'

type CompoundingOption = (typeof compoundingOptions)[number]

function fmt(n: number): string {
  if (!isFinite(n)) return '-'
  return n.toFixed(2)
}

const INITIAL_SHOW = 10

export default function CompoundInterestCalculator() {
  setToolPageMeta('finance', 'compound-interest')
  const [params, setParams] = useSearchParams<{
    p?: string
    r?: string
    t?: string
    freq?: string
  }>()
  const validFreq: CompoundingId[] = compoundingOptions.map((o) => o.id)
  const initialFreq: CompoundingId = validFreq.includes(params.freq as CompoundingId)
    ? (params.freq as CompoundingId)
    : 'monthly'

  const [principal, setPrincipalSignal] = createSignal(params.p ?? '')
  const [rate, setRateSignal] = createSignal(params.r ?? '')
  const [years, setYearsSignal] = createSignal(params.t ?? '')
  const [compoundingId, setCompoundingIdSignal] = createSignal<CompoundingId>(initialFreq)
  const [showAll, setShowAll] = createSignal(false)
  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  function setPrincipal(v: string) { setPrincipalSignal(v); setParams({ p: v || undefined }, { replace: true }) }
  function setRate(v: string) { setRateSignal(v); setParams({ r: v || undefined }, { replace: true }) }
  function setYears(v: string) { setYearsSignal(v); setParams({ t: v || undefined }, { replace: true }) }
  function setCompoundingId(v: CompoundingId) { setCompoundingIdSignal(v); setParams({ freq: v }, { replace: true }) }

  const selectedCompounding = createMemo(
    () => compoundingOptions.find((o) => o.id === compoundingId()) ?? compoundingOptions[0]
  )

  const result = createMemo(() => {
    const p = parseFloat(principal())
    const r = parseFloat(rate())
    const y = parseInt(years(), 10)
    if (!isFinite(p) || p <= 0 || !isFinite(r) || r < 0 || !isFinite(y) || y <= 0) {
      return null
    }
    return compoundInterest(p, r, y, compoundingId())
  })

  const finalBalanceStr = createMemo(() => (result() ? fmt(result()!.finalBalance) : ''))
  const totalInterestStr = createMemo(() => (result() ? fmt(result()!.totalInterest) : ''))
  const gainPctStr = createMemo(() => {
    const r = result()
    if (!r) return ''
    const p = parseFloat(principal())
    if (!isFinite(p) || p <= 0) return ''
    return ((r.totalInterest / p) * 100).toFixed(2)
  })

  const visibleSchedule = createMemo(() => {
    const r = result()
    if (!r) return []
    return showAll() ? r.schedule : r.schedule.slice(0, INITIAL_SHOW)
  })

  const hasMore = createMemo(() => {
    const r = result()
    return r ? r.schedule.length > INITIAL_SHOW : false
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Compound interest"
        description="Calculate compound interest with yearly breakdown and multiple compounding frequencies."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compounding</span>
          <Select<CompoundingOption>
            options={[...compoundingOptions]}
            optionValue="id"
            optionTextValue="label"
            value={selectedCompounding() || undefined}
            onChange={(opt) => opt && setCompoundingId(opt.id)}
            itemComponent={(itemProps) => (
              <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
            )}
          >
            <SelectTrigger aria-label="Compounding" class="h-8 w-44 text-sm">
              <SelectValue<CompoundingOption>>{(state) => state.selectedOption()?.label}</SelectValue>
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

          <div class="grid gap-4 sm:grid-cols-3">
            <NumberField value={principal() || undefined} onChange={setPrincipal} minValue={0} step={0.01} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Principal ($)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="e.g. 5000.00" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField value={rate() || undefined} onChange={setRate} minValue={0} step={0.01} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Annual rate (%)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="e.g. 7" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField value={years() || undefined} onChange={setYears} minValue={1} step={1} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Years</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="e.g. 10" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* Summary */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Summary</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter principal, rate, and years to see results
              </div>
            }
          >
            <div class="overflow-hidden rounded-md border border-border">
              <ResultRow label="Final balance" value={finalBalanceStr() || undefined} prefix="$" />
              <ResultRow label="Total interest" value={totalInterestStr() || undefined} prefix="$" />
              <ResultRow label="Total gain" value={gainPctStr() || undefined} suffix="%" />
            </div>
          </Show>
        </section>

        {/* Year-by-year breakdown */}
        <Show when={result() && result()!.schedule.length > 0}>
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Year-by-year breakdown
              </h2>
            </div>

            <div class="anim-fade-up overflow-hidden rounded-md border border-violet/30 bg-violet/5">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-violet/20 bg-violet/10">
                    <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Year
                    </th>
                    <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Balance
                    </th>
                    <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Interest earned
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-violet/15">
                  <For each={visibleSchedule()}>
                    {(row) => (
                      <tr class="transition-colors duration-150 hover:bg-violet/10">
                        <td class="px-4 py-2.5 font-mono">{row.year}</td>
                        <td class="px-4 py-2.5 text-right font-mono">${fmt(row.balance)}</td>
                        <td class="px-4 py-2.5 text-right font-mono text-violet">+${fmt(row.interestEarned)}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>

            <Show when={hasMore() && !showAll()}>
              <button
                type="button"
                onClick={() => setShowAll(true)}
                class={cn(
                  'mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground cursor-pointer',
                  'transition-[border-color,background-color,color] duration-150 ease-out',
                  'hover:border-violet/60 hover:text-violet hover:bg-violet/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                Show all {result()!.schedule.length} years
              </button>
            </Show>
          </section>
        </Show>
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
