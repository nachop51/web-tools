import { createMemo, createSignal, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { simpleInterest } from '~/lib/utils/finance/simple-interest'
import { setToolPageMeta } from '~/lib/seo'

function fmt(n: number): string {
  if (!isFinite(n)) return '—'
  return n.toFixed(2)
}

function fmtPct(n: number): string {
  if (!isFinite(n)) return '—'
  return n.toFixed(4)
}

export default function SimpleInterestCalculator() {
  setToolPageMeta('finance', 'simple-interest')
  const [params, setParams] = useSearchParams<{ p?: string; r?: string; t?: string }>()
  const [principal, setPrincipalSignal] = createSignal(params.p ?? '')
  const [rate, setRateSignal] = createSignal(params.r ?? '')
  const [years, setYearsSignal] = createSignal(params.t ?? '')

  function setPrincipal(v: string) { setPrincipalSignal(v); setParams({ p: v || undefined }, { replace: true }) }
  function setRate(v: string) { setRateSignal(v); setParams({ r: v || undefined }, { replace: true }) }
  function setYears(v: string) { setYearsSignal(v); setParams({ t: v || undefined }, { replace: true }) }

  const result = createMemo(() => {
    const p = parseFloat(principal())
    const r = parseFloat(rate())
    const y = parseFloat(years())
    if (!isFinite(p) || p <= 0 || !isFinite(r) || r < 0 || !isFinite(y) || y <= 0) {
      return null
    }
    return simpleInterest(p, r, y)
  })

  const interestStr = createMemo(() => (result() ? fmt(result()!.interest) : ''))
  const totalStr = createMemo(() => (result() ? fmt(result()!.totalAmount) : ''))
  const rateStr = createMemo(() => (result() ? fmtPct(result()!.effectiveRate) : ''))

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Simple interest"
        description="Calculate interest earned using I = P × r × t."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Inputs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>
            <span class="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground font-mono">
              I = P × r × t
            </span>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <NumberField value={principal()} onChange={setPrincipal} minValue={0} step={0.01} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Principal ($)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput autofocus placeholder="e.g. 1000.00" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField value={rate()} onChange={setRate} minValue={0} step={0.01} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Annual rate (%)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="e.g. 5" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField value={years()} onChange={setYears} minValue={0} step={0.5} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Time (years)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="e.g. 3" class="h-12 font-mono text-base" />
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
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Results</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter principal, rate, and time to see results
              </div>
            }
          >
            <div class="overflow-hidden rounded-md border border-border">
              <ResultRow label="Interest earned" value={interestStr()} prefix="$" />
              <ResultRow label="Total amount" value={totalStr()} prefix="$" />
              <ResultRow label="Effective total rate" value={rateStr()} suffix="%" />
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
