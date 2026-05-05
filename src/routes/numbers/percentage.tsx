import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, Show, Switch, Match, onMount } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { percentOf, whatPercent, percentChange, percentError } from '~/lib/utils/numbers/percentage'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'of' | 'what' | 'change' | 'error'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'of', label: 'X% of Y' },
  { value: 'what', label: 'What %' },
  { value: 'change', label: '% Change' },
  { value: 'error', label: '% Error' },
]

function fmtResult(n: number): string {
  if (!isFinite(n)) return ''
  return parseFloat(n.toPrecision(8)).toString()
}

export default function PercentageCalculator() {
  setToolPageMeta('numbers', 'percentage')
  const [params, setParams] = useSearchParams<{ mode?: string; a?: string; b?: string }>()

  const initialMode = (['of', 'what', 'change', 'error'].includes(params.mode ?? '') ? params.mode : 'of') as Mode

  const [mode, setMode] = createSignal<Mode>(initialMode)
  const [a, setASignal] = createSignal(params.a ?? '')
  const [b, setBSignal] = createSignal(params.b ?? '')

  function setA(v: string) {
    setASignal(v)
    setParams({ a: v || undefined }, { replace: true })
  }

  function setB(v: string) {
    setBSignal(v)
    setParams({ b: v || undefined }, { replace: true })
  }

  const numA = createMemo(() => parseFloat(a()))
  const numB = createMemo(() => parseFloat(b()))

  const result = createMemo((): string => {
    const na = numA()
    const nb = numB()
    const m = mode()
    if (isNaN(na) || isNaN(nb)) return ''
    if (m === 'of') return fmtResult(percentOf(na, nb))
    if (m === 'what') return fmtResult(whatPercent(na, nb))
    if (m === 'change') return fmtResult(percentChange(na, nb))
    return fmtResult(percentError(na, nb))
  })

  const displayResult = createMemo(() => {
    const r = result()
    if (!r) return ''
    return mode() === 'of' ? r : `${r}%`
  })

  let inputRef: HTMLInputElement | undefined

  const labels = createMemo<{ a: string; b: string; aPlaceholder: string; bPlaceholder: string }>(() => {
    switch (mode()) {
      case 'of':
        return { a: 'Percentage (%)', b: 'Of what number?', aPlaceholder: 'e.g. 25', bPlaceholder: 'e.g. 200' }
      case 'what':
        return { a: 'Part', b: 'Whole', aPlaceholder: 'e.g. 50', bPlaceholder: 'e.g. 200' }
      case 'change':
        return { a: 'From', b: 'To', aPlaceholder: 'e.g. 100', bPlaceholder: 'e.g. 150' }
      case 'error':
        return { a: 'Measured value', b: 'Actual value', aPlaceholder: 'e.g. 9.8', bPlaceholder: 'e.g. 10' }
    }
  })

  function handleModeChange(m: Mode) {
    setMode(m)
    setASignal('')
    setBSignal('')
    setParams({ mode: m, a: undefined, b: undefined }, { replace: true })
  }

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Percentage calculator"
        description="Solve X% of Y, what % is X of Y, percentage change, and percent error."
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
            <NumberField value={a() || undefined} onChange={setA} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>{labels().a}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder={labels().aPlaceholder} class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField value={b() || undefined} onChange={setB} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>{labels().b}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder={labels().bPlaceholder} class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* Result */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
            </div>
            <span class="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <Switch>
                <Match when={mode() === 'of'}>X% of Y</Match>
                <Match when={mode() === 'what'}>X is what % of Y</Match>
                <Match when={mode() === 'change'}>Percentage change</Match>
                <Match when={mode() === 'error'}>Percentage error</Match>
              </Switch>
            </span>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[5rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter both values to see the result
              </div>
            }
          >
            <div
              class="anim-fade-up flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3"
              data-output={displayResult()}
            >
              <span class="flex-1 font-mono text-2xl font-semibold tabular-nums tracking-tight break-all">
                {displayResult()}
              </span>
              <CopyButton value={() => displayResult()} />
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
