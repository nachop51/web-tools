import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, onMount, Show } from 'solid-js'
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
import { TextField, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field'
import { ceilTo, floorTo, roundTo, toSigFigs, truncateTo } from '~/lib/utils/numbers/precision'
import { setToolPageMeta } from '~/lib/seo'

type PrecisionMode = 'round' | 'floor' | 'ceil' | 'trunc' | 'sigfigs'

const modeOptions: { value: PrecisionMode; label: string }[] = [
  { value: 'round', label: 'Round' },
  { value: 'floor', label: 'Floor' },
  { value: 'ceil', label: 'Ceil' },
  { value: 'trunc', label: 'Truncate' },
  { value: 'sigfigs', label: 'Sig Figs' },
]

export default function DecimalPrecision() {
  setToolPageMeta('numbers', 'decimal-precision')
  const [params, setParams] = useSearchParams<{
    mode?: string
    places?: string
    n?: string
  }>()

  const [input, setInputSignal] = createSignal(params.n ?? '')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ n: v || undefined }, { replace: true })
  }

  const mode = createMemo<PrecisionMode>(() => {
    const p = params.mode
    if (p && modeOptions.some((m) => m.value === p)) return p as PrecisionMode
    return 'round'
  })

  const places = createMemo(() => {
    const p = parseInt(params.places ?? '2', 10)
    return isNaN(p) ? 2 : Math.min(20, Math.max(0, p))
  })

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  const result = createMemo(() => {
    const n = parseFloat(input())
    if (input() === '' || isNaN(n)) return ''
    const p = places()
    switch (mode()) {
      case 'round':
        return String(roundTo(n, p))
      case 'floor':
        return String(floorTo(n, p))
      case 'ceil':
        return String(ceilTo(n, p))
      case 'trunc':
        return String(truncateTo(n, p))
      case 'sigfigs':
        return String(toSigFigs(n, Math.max(1, p)))
    }
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Decimal precision"
        description="Round, floor, ceil, truncate, or apply significant figures to a number."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Mode"
            value={mode()}
            onChange={(v) => setParams({ mode: v }, { replace: true })}
            options={modeOptions}
          />
        </ToolToolbar>

        {/* Inputs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <TextField value={input()} onChange={setInput} class="flex flex-col gap-1.5">
              <TextFieldLabel>Number</TextFieldLabel>
              <TextFieldInput ref={inputRef} type="text" inputmode="decimal" placeholder="e.g. 3.14159" class="h-12 font-mono text-base" />
            </TextField>

            <NumberField
              value={String(places())}
              onChange={(v) => setParams({ places: v }, { replace: true })}
              minValue={0}
              maxValue={20}
              format={false}
              class="flex flex-col gap-1.5 sm:w-44"
            >
              <NumberFieldLabel>{mode() === 'sigfigs' ? 'Sig figures' : 'Decimal places'}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="h-12 font-mono text-base" />
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

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-20 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter a number to see the result
              </div>
            }
          >
            <div
              class="anim-fade-up flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3"
              data-output={result()}
            >
              <span class="flex-1 font-mono text-2xl font-semibold tabular-nums tracking-tight break-all">
                {result()}
              </span>
              <CopyButton value={() => result() ?? ''} />
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
