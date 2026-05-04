import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, Show } from 'solid-js'
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
import { toScientific, fromScientific } from '~/lib/utils/math/scientific-notation'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'toSci' | 'fromSci'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'toSci', label: 'Standard → Scientific' },
  { value: 'fromSci', label: 'Scientific → Standard' },
]

export default function ScientificNotation() {
  setToolPageMeta('math', 'scientific-notation')
  const [params, setParams] = useSearchParams<{
    mode?: string
    n?: string
    coeff?: string
    exp?: string
  }>()
  const mode = createMemo<Mode>(() => (params.mode === 'fromSci' ? 'fromSci' : 'toSci'))

  const [standard, setStandardSignal] = createSignal(params.n ?? '299792458')
  const [coeff, setCoeffSignal] = createSignal(params.coeff ?? '2.99792458')
  const [exp, setExpSignal] = createSignal(params.exp ?? '8')

  function setStandard(v: string) { setStandardSignal(v); setParams({ n: v || undefined }, { replace: true }) }
  function setCoeff(v: string) { setCoeffSignal(v); setParams({ coeff: v || undefined }, { replace: true }) }
  function setExp(v: string) { setExpSignal(v); setParams({ exp: v || undefined }, { replace: true }) }

  const sciResult = createMemo(() => {
    const v = parseFloat(standard())
    if (isNaN(v)) return null
    return toScientific(v)
  })

  const stdResult = createMemo(() => {
    const c = parseFloat(coeff()),
      e = parseFloat(exp())
    if (isNaN(c) || isNaN(e)) return null
    return fromScientific(c, e)
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Scientific notation"
        description="Convert numbers between standard decimal and scientific notation."
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

        <Show when={mode() === 'toSci'}>
          <div class="grid gap-6 md:grid-cols-2">
            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Standard number</h2>
              </div>
              <NumberField value={standard()} onChange={setStandard} format={false} class="flex flex-col gap-2">
                <NumberFieldLabel>Value</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput autofocus placeholder="299792458" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </section>

            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Scientific notation
                </h2>
              </div>
              <Show
                when={sciResult()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Enter a number
                  </div>
                }
              >
                {(r) => (
                  <div class="anim-fade-up divide-y divide-border rounded-md border border-border text-sm">
                    <div class="flex items-center justify-between gap-4 px-4 py-3">
                      <span class="text-muted-foreground">Coefficient</span>
                      <span class="font-mono">{r().coefficient}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 px-4 py-3">
                      <span class="text-muted-foreground">Exponent</span>
                      <span class="font-mono">{r().exponent}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 px-4 py-3">
                      <span class="text-muted-foreground">Scientific</span>
                      <div class="flex items-center gap-2">
                        <span class="font-mono">{r().formatted}</span>
                        <CopyButton value={() => r().formatted} />
                      </div>
                    </div>
                    <div class="flex items-center justify-between gap-4 px-4 py-3">
                      <span class="text-muted-foreground">Engineering</span>
                      <div class="flex items-center gap-2">
                        <span class="font-mono">{r().engineering}</span>
                        <CopyButton value={() => r().engineering} />
                      </div>
                    </div>
                  </div>
                )}
              </Show>
            </section>
          </div>
        </Show>

        <Show when={mode() === 'fromSci'}>
          <div class="grid gap-6 md:grid-cols-2">
            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Scientific notation
                </h2>
              </div>
              <div class="flex flex-wrap items-end gap-3">
                <NumberField value={coeff()} onChange={setCoeff} format={false} class="flex flex-col gap-2">
                  <NumberFieldLabel>Coefficient</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput autofocus placeholder="2.998" class="h-12 w-32 font-mono text-base" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <span class="pb-3 font-mono text-base text-muted-foreground">× 10^</span>
                <NumberField value={exp()} onChange={setExp} format={false} class="flex flex-col gap-2">
                  <NumberFieldLabel>Exponent</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="8" class="h-12 w-20 font-mono text-base" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>
            </section>

            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Standard number</h2>
              </div>
              <Show
                when={stdResult() !== null}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Enter values
                  </div>
                }
              >
                <div class="anim-fade-up flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
                  <span class="flex-1 font-mono text-xl font-semibold tabular-nums break-all">{stdResult()}</span>
                  <CopyButton value={() => String(stdResult())} />
                </div>
              </Show>
            </section>
          </div>
        </Show>
      </div>
    </main>
  )
}
