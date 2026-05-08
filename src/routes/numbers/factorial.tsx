import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show, onMount } from 'solid-js'
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
import { factorial, factorialSteps, permutation, combination } from '~/lib/utils/math/factorial'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'factorial' | 'permutation' | 'combination'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'factorial', label: 'n!' },
  { value: 'permutation', label: 'nPr' },
  { value: 'combination', label: 'nCr' },
]

export default function FactorialCalculator() {
  setToolPageMeta('numbers', 'factorial')
  const [params, setParams] = useSearchParams<{ mode?: string; n?: string; r?: string }>()
  const mode = createMemo<Mode>(() => {
    const p = params.mode
    if (p === 'permutation' || p === 'combination') return p
    return 'factorial'
  })

  const [n, setNSignal] = createSignal(params.n ?? '5')
  const [r, setRSignal] = createSignal(params.r ?? '2')

  function setN(v: string) { setNSignal(v); setParams({ n: v || undefined }, { replace: true }) }
  function setR(v: string) { setRSignal(v); setParams({ r: v || undefined }, { replace: true }) }

  const result = createMemo(() => {
    const nv = parseInt(n())
    if (isNaN(nv) || nv < 0) return null
    try {
      if (mode() === 'factorial') return { value: factorial(nv), steps: factorialSteps(nv) }
      const rv = parseInt(r())
      if (isNaN(rv) || rv < 0) return null
      const value = mode() === 'permutation' ? permutation(nv, rv) : combination(nv, rv)
      return { value, steps: [] }
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
        category="numbers"
        name="Factorial & combinations"
        description="Calculate n!, permutations (nPr), and combinations (nCr)."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Mode"
            value={mode() || undefined}
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
          <div class="grid gap-4 sm:grid-cols-2">
            <NumberField
              value={n() || undefined}
              onChange={setN}
              minValue={0}
              maxValue={170}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>n (non-negative integer, max 170)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="5" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <Show when={mode() !== 'factorial'}>
              <NumberField value={r() || undefined} onChange={setR} minValue={0} format={false} class="flex flex-col gap-1.5">
                <NumberFieldLabel>r (items chosen)</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="2" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </Show>
          </div>
          <Show when={mode() === 'permutation'}>
            <p class="mt-4 rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
              nPr = n! ÷ (n−r)!
            </p>
          </Show>
          <Show when={mode() === 'combination'}>
            <p class="mt-4 rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
              nCr = n! ÷ (r! × (n−r)!)
            </p>
          </Show>
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
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter a value to calculate
              </div>
            }
          >
            {(r) => (
              <div class="anim-fade-up flex flex-col gap-3">
                <div class="flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
                  <span class="flex-1 font-mono text-2xl font-semibold tabular-nums break-all">
                    {r().value.toLocaleString()}
                  </span>
                  <CopyButton value={() => String(r().value)} />
                </div>
                <Show when={r().steps.length > 0}>
                  <div class="rounded-md border border-border bg-muted/30 p-4">
                    <p class="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Steps</p>
                    <For each={r().steps}>
                      {(step) => <p class="font-mono text-xs text-muted-foreground">{step}</p>}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  )
}
