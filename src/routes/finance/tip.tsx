import { createMemo, createSignal, For, Show } from 'solid-js'
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
import { cn } from '~/lib/utils'
import { calculateTip } from '~/lib/utils/finance/tip'
import { setToolPageMeta } from '~/lib/seo'

const quickTips = [10, 15, 18, 20, 25]

function fmt(n: number): string {
  if (!isFinite(n)) return '—'
  return n.toFixed(2)
}

export default function TipCalculator() {
  setToolPageMeta('finance', 'tip')
  const [bill, setBill] = createSignal('')
  const [tipPct, setTipPct] = createSignal('18')
  const [people, setPeople] = createSignal('1')

  const result = createMemo(() => {
    const b = parseFloat(bill())
    const t = parseFloat(tipPct())
    const p = parseInt(people(), 10)
    if (!isFinite(b) || b <= 0 || !isFinite(t) || t < 0) return null
    return calculateTip(b, t, p >= 1 ? p : 1)
  })

  const tipAmountStr = createMemo(() => {
    const r = result()
    return r ? fmt(r.tipAmount) : ''
  })
  const totalStr = createMemo(() => {
    const r = result()
    return r ? fmt(r.totalAmount) : ''
  })
  const perPersonStr = createMemo(() => {
    const r = result()
    return r ? fmt(r.perPerson) : ''
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Tip calculator"
        description="Calculate tip amount, total, and per-person split for any bill."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Bill details */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Bill details</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <NumberField onChange={setBill} minValue={0} step={0.01} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Bill amount ($)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput autofocus placeholder="e.g. 85.00" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField
              value={people()}
              onChange={setPeople}
              minValue={1}
              step={1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>Number of people</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="1" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>

          <div class="mt-6 flex flex-col gap-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tip percentage</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <For each={quickTips}>
                {(pct) => {
                  const isActive = () => tipPct() === String(pct)
                  return (
                    <button
                      type="button"
                      aria-pressed={isActive()}
                      onClick={() => setTipPct(String(pct))}
                      class={cn(
                        'rounded-full border px-3 py-1.5 text-sm font-medium cursor-pointer',
                        'transition-[border-color,background-color,color] duration-150 ease-out',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        isActive()
                          ? 'border-violet bg-violet text-white'
                          : 'border-border bg-background text-foreground hover:border-violet/60 hover:text-violet'
                      )}
                    >
                      {pct}%
                    </button>
                  )
                }}
              </For>
            </div>
            <NumberField
              value={tipPct()}
              onChange={setTipPct}
              minValue={0}
              maxValue={100}
              step={1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldGroup>
                <NumberFieldInput placeholder="Custom %" class="h-12 font-mono text-base" />
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
                Enter a bill amount to see the tip breakdown
              </div>
            }
          >
            <div class="overflow-hidden rounded-md border border-border">
              <ResultRow label="Tip amount" value={tipAmountStr()} prefix="$" />
              <ResultRow label="Total amount" value={totalStr()} prefix="$" />
              <ResultRow label="Per person" value={perPersonStr()} prefix="$" />
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
