import { createMemo, createSignal, Show, onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { applyDiscount, applyTax } from '~/lib/utils/finance/discount'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'discount' | 'tax'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'discount', label: 'Discount' },
  { value: 'tax', label: 'Sales tax' },
]

function fmt(n: number): string {
  if (!isFinite(n)) return '—'
  return n.toFixed(2)
}

export default function DiscountCalculator() {
  setToolPageMeta('finance', 'discount')
  const [params, setParams] = useSearchParams<{ mode?: string; price?: string; pct?: string }>()

  const mode = createMemo<Mode>(() => (params.mode === 'tax' ? 'tax' : 'discount'))

  const [price, setPriceSignal] = createSignal(params.price ?? '')
  const [pct, setPctSignal] = createSignal(params.pct ?? '')

  function setPrice(v: string) { setPriceSignal(v); setParams({ price: v || undefined }, { replace: true }) }
  function setPct(v: string) { setPctSignal(v); setParams({ pct: v || undefined }, { replace: true }) }

  const discountResult = createMemo(() => {
    if (mode() !== 'discount') return null
    const p = parseFloat(price())
    const d = parseFloat(pct())
    if (!isFinite(p) || p < 0 || !isFinite(d) || d < 0) return null
    return applyDiscount(p, d)
  })

  const taxResult = createMemo(() => {
    if (mode() !== 'tax') return null
    const p = parseFloat(price())
    const t = parseFloat(pct())
    if (!isFinite(p) || p < 0 || !isFinite(t) || t < 0) return null
    return applyTax(p, t)
  })

  const hasResult = createMemo(() => discountResult() !== null || taxResult() !== null)

  function handleModeChange(m: Mode) {
    setPriceSignal('')
    setPctSignal('')
    setParams({ mode: m, price: undefined, pct: undefined }, { replace: true })
  }

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Discount & sales tax"
        description="Apply a percentage discount or sales tax to a price."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Mode" value={mode() || undefined} onChange={handleModeChange} options={modeOptions} />
        </ToolToolbar>

        {/* Inputs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <NumberField value={price() || undefined} onChange={setPrice} minValue={0} step={0.01} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>{mode() === 'discount' ? 'Original price ($)' : 'Pre-tax price ($)'}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="e.g. 100.00" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField
              value={pct() || undefined}
              onChange={setPct}
              minValue={0}
              maxValue={100}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>{mode() === 'discount' ? 'Discount (%)' : 'Tax rate (%)'}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="e.g. 20" class="h-12 font-mono text-base" />
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
            when={hasResult()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter a price and percentage to see results
              </div>
            }
          >
            <Show when={mode() === 'discount' && discountResult()}>
              <div class="overflow-hidden rounded-md border border-border">
                <ResultRow label="Discount amount" value={fmt(discountResult()!.discountAmount)} prefix="$" />
                <ResultRow label="Final price" value={fmt(discountResult()!.finalPrice)} prefix="$" />
                <ResultRow label="You save" value={fmt(discountResult()!.savings)} prefix="$" />
              </div>
            </Show>
            <Show when={mode() === 'tax' && taxResult()}>
              <div class="overflow-hidden rounded-md border border-border">
                <ResultRow label="Tax amount" value={fmt(taxResult()!.taxAmount)} prefix="$" />
                <ResultRow label="Total price" value={fmt(taxResult()!.totalPrice)} prefix="$" />
              </div>
            </Show>
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
