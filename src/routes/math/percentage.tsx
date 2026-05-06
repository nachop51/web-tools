import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, Show, onMount } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
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
import { calculatePercentage, percentageModes, type PercentageMode } from '~/lib/utils/math/percentage'
import { setToolPageMeta } from '~/lib/seo'

type ModeConfig = (typeof percentageModes)[number]

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

export default function PercentageCalculator() {
  setToolPageMeta('math', 'percentage')
  const [params, setParams] = useSearchParams<{ mode?: string; a?: string; b?: string }>()
  const [a, setASignal] = createSignal(params.a ?? '')
  const [b, setBSignal] = createSignal(params.b ?? '')

  function setA(v: string) { setASignal(v); setParams({ a: v || undefined }, { replace: true }) }
  function setB(v: string) { setBSignal(v); setParams({ b: v || undefined }, { replace: true }) }

  const mode = createMemo<PercentageMode>(() => {
    const p = params.mode
    if (p && percentageModes.find((m) => m.id === p)) return p as PercentageMode
    return 'of'
  })

  const config = createMemo(() => percentageModes.find((m) => m.id === mode())!)

  const result = createMemo(() => {
    const na = parseFloat(a())
    const nb = parseFloat(b())
    if (isNaN(na) || isNaN(nb)) return null
    try {
      return calculatePercentage(mode(), na, nb)
    } catch {
      return null
    }
  })

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="math"
        name="Percentage calculator"
        description="Calculate percentages: find % of a number, % change, increase, decrease, error, and reverse."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mode</span>
          <Select<ModeConfig>
            options={percentageModes}
            optionValue="id"
            optionTextValue="label"
            value={config() || undefined}
            onChange={(opt) => {
              if (!opt) return
              setASignal('')
              setBSignal('')
              setParams({ mode: opt.id, a: undefined, b: undefined }, { replace: true })
            }}
            itemComponent={(itemProps) => (
              <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
            )}
          >
            <SelectTrigger aria-label="Mode" class="h-8 w-44 text-sm">
              <SelectValue<ModeConfig>>{(state) => state.selectedOption()?.label}</SelectValue>
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
            <NumberField value={a() || undefined} onChange={setA} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>{config().inputA}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="0" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField value={b() || undefined} onChange={setB} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>{config().inputB}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="0" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
          <p class="mt-4 rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
            Formula: {config().formula}
          </p>
        </section>

        {/* Result */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
          </div>

          <Show
            when={result() !== null}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter values to see the result
              </div>
            }
          >
            <div class="anim-fade-up flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
              <span class="flex-1 font-mono text-3xl font-semibold tabular-nums tracking-tight break-all">
                {fmt(result()!)}
              </span>
              <CopyButton value={() => fmt(result()!)} />
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
