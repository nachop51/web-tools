import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, Show, onMount } from 'solid-js'
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
import { simplifyRatio, solveRatio, ratioToPercent } from '~/lib/utils/math/ratio'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'simplify' | 'solve'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'simplify', label: 'Simplify ratio' },
  { value: 'solve', label: 'Solve proportion' },
]

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

export default function RatioSolver() {
  setToolPageMeta('math', 'ratio')
  const [params, setParams] = useSearchParams<{ mode?: string; a?: string; b?: string; c?: string }>()
  const mode = createMemo<Mode>(() => (params.mode === 'solve' ? 'solve' : 'simplify'))

  const [a, setASignal] = createSignal(params.a ?? '6')
  const [b, setBSignal] = createSignal(params.b ?? '4')
  const [c, setCSignal] = createSignal(params.c ?? '9')

  function setA(v: string) { setASignal(v); setParams({ a: v || undefined }, { replace: true }) }
  function setB(v: string) { setBSignal(v); setParams({ b: v || undefined }, { replace: true }) }
  function setC(v: string) { setCSignal(v); setParams({ c: v || undefined }, { replace: true }) }

  const simplified = createMemo(() => {
    const na = parseFloat(a()),
      nb = parseFloat(b())
    if (isNaN(na) || isNaN(nb) || na <= 0 || nb <= 0) return null
    return simplifyRatio(na, nb)
  })

  const percents = createMemo(() => {
    const na = parseFloat(a()),
      nb = parseFloat(b())
    if (isNaN(na) || isNaN(nb) || na <= 0 || nb <= 0) return null
    return ratioToPercent(na, nb)
  })

  const solved = createMemo(() => {
    const na = parseFloat(a()),
      nb = parseFloat(b()),
      nc = parseFloat(c())
    if (isNaN(na) || isNaN(nb) || isNaN(nc) || na === 0) return null
    return solveRatio(na, nb, nc)
  })

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Ratio solver"
        description="Simplify ratios to lowest terms or solve for a missing value in a proportion."
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

        <div class="grid gap-6 md:grid-cols-2">
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>

            <Show when={mode() === 'simplify'}>
              <div class="flex items-end gap-3">
                <NumberField value={a() || undefined} onChange={setA} format={false} class="flex flex-col gap-2">
                  <NumberFieldLabel>A</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput ref={inputRef} class="h-12 w-24 font-mono text-base" placeholder="6" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <span class="pb-3 text-xl font-bold text-muted-foreground">:</span>
                <NumberField value={b() || undefined} onChange={setB} format={false} class="flex flex-col gap-2">
                  <NumberFieldLabel>B</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput class="h-12 w-24 font-mono text-base" placeholder="4" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>
            </Show>

            <Show when={mode() === 'solve'}>
              <div class="space-y-3">
                <p class="text-sm text-muted-foreground">A : B = C : ?</p>
                <div class="flex flex-wrap items-end gap-3">
                  <NumberField value={a() || undefined} onChange={setA} format={false} class="flex flex-col gap-2">
                    <NumberFieldLabel>A</NumberFieldLabel>
                    <NumberFieldGroup>
                      <NumberFieldInput ref={inputRef} class="h-12 w-20 font-mono text-base" placeholder="2" />
                      <NumberFieldIncrementTrigger />
                      <NumberFieldDecrementTrigger />
                    </NumberFieldGroup>
                  </NumberField>
                  <span class="pb-3 text-lg font-bold text-muted-foreground">:</span>
                  <NumberField value={b() || undefined} onChange={setB} format={false} class="flex flex-col gap-2">
                    <NumberFieldLabel>B</NumberFieldLabel>
                    <NumberFieldGroup>
                      <NumberFieldInput class="h-12 w-20 font-mono text-base" placeholder="3" />
                      <NumberFieldIncrementTrigger />
                      <NumberFieldDecrementTrigger />
                    </NumberFieldGroup>
                  </NumberField>
                  <span class="pb-3 text-lg font-bold text-muted-foreground">=</span>
                  <NumberField value={c() || undefined} onChange={setC} format={false} class="flex flex-col gap-2">
                    <NumberFieldLabel>C</NumberFieldLabel>
                    <NumberFieldGroup>
                      <NumberFieldInput class="h-12 w-20 font-mono text-base" placeholder="4" />
                      <NumberFieldIncrementTrigger />
                      <NumberFieldDecrementTrigger />
                    </NumberFieldGroup>
                  </NumberField>
                  <span class="pb-3 text-lg font-bold text-muted-foreground">: ?</span>
                </div>
              </div>
            </Show>
          </section>

          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
            </div>

            <Show when={mode() === 'simplify'}>
              <Show
                when={simplified()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Enter positive values
                  </div>
                }
              >
                {(s) => (
                  <div class="anim-fade-up space-y-4">
                    <div class="flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
                      <span class="flex-1 font-mono text-2xl font-semibold tabular-nums break-all">
                        {fmt(s().a)} : {fmt(s().b)}
                      </span>
                      <CopyButton value={() => `${fmt(s().a)}:${fmt(s().b)}`} />
                    </div>
                    <Show when={percents()}>
                      {(p) => (
                        <div class="divide-y divide-border rounded-md border border-border text-sm">
                          <div class="flex justify-between px-4 py-2.5">
                            <span class="text-muted-foreground">A as % of total</span>
                            <span class="font-mono">{p().aPercent.toFixed(2)}%</span>
                          </div>
                          <div class="flex justify-between px-4 py-2.5">
                            <span class="text-muted-foreground">B as % of total</span>
                            <span class="font-mono">{p().bPercent.toFixed(2)}%</span>
                          </div>
                        </div>
                      )}
                    </Show>
                  </div>
                )}
              </Show>
            </Show>

            <Show when={mode() === 'solve'}>
              <Show
                when={solved() !== null}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Enter values to solve
                  </div>
                }
              >
                <div class="anim-fade-up space-y-3">
                  <div class="flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
                    <span class="flex-1 font-mono text-2xl font-semibold tabular-nums break-all">{fmt(solved()!)}</span>
                    <CopyButton value={() => fmt(solved()!)} />
                  </div>
                  <p class="text-sm text-muted-foreground">
                    {a()} : {b()} = {c()} : {fmt(solved()!)}
                  </p>
                </div>
              </Show>
            </Show>
          </section>
        </div>
      </div>
    </main>
  )
}
