import { createMemo, createSignal, For, Show, onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { modulo } from '~/lib/utils/math/modulo'
import { setToolPageMeta } from '~/lib/seo'

export default function ModuloCalculator() {
  setToolPageMeta('numbers', 'modulo')
  const [params, setParams] = useSearchParams<{ a?: string; m?: string }>()
  const [a, setASignal] = createSignal(params.a ?? '17')
  const [m, setMSignal] = createSignal(params.m ?? '5')

  function setA(v: string) { setASignal(v); setParams({ a: v || undefined }, { replace: true }) }
  function setM(v: string) { setMSignal(v); setParams({ m: v || undefined }, { replace: true }) }

  const result = createMemo(() => {
    const na = parseFloat(a()),
      nm = parseFloat(m())
    if (isNaN(na) || isNaN(nm) || nm === 0) return null
    try {
      return modulo(na, nm)
    } catch {
      return null
    }
  })

  const rows = createMemo(() => {
    const r = result()
    if (!r) return []
    return [
      { label: 'Quotient', value: String(r.quotient) },
      { label: 'Remainder (JS / C)', value: String(r.remainder) },
      { label: 'Remainder (Python)', value: String(r.remainderPython) },
      { label: 'Remainder (math, ≥0)', value: String(r.remainderMath) },
    ]
  })

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Modulo calculator"
        description="Compute a mod m with quotient and remainder. Shows JavaScript, Python, and mathematical conventions."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Inputs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <NumberField value={a() || undefined} onChange={setA} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>Dividend (a)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="17" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={m() || undefined}
              onChange={setM}
              format={false}
              validationState={m() === '0' ? 'invalid' : 'valid'}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>Modulus (m)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="5" class="h-12 font-mono text-base" />
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
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                {m() === '0' ? 'Modulus cannot be zero' : 'Enter values to calculate'}
              </div>
            }
          >
            {(r) => (
              <div class="anim-fade-up flex flex-col gap-3">
                <div class="flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
                  <span class="flex-1 font-mono text-sm break-words">{r().proof}</span>
                  <CopyButton value={() => r().proof} />
                </div>
                <div class="overflow-hidden rounded-md border border-border text-sm">
                  <For each={rows()}>
                    {(row) => (
                      <div class="flex items-center gap-3 border-t border-border/50 px-4 py-3 first:border-t-0">
                        <span class="w-48 shrink-0 text-muted-foreground">{row.label}</span>
                        <span class="flex-1 text-right font-mono tabular-nums text-base font-semibold">
                          {row.value}
                        </span>
                        <CopyButton value={() => row.value} />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  )
}
