import { createMemo, createSignal, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { Label } from '~/components/ui/label'
import { TextField, TextFieldInput } from '~/components/ui/text-field'
import { solveAWV, type AWVSolve } from '~/lib/utils/electrical/amps-watts-volts'
import { setToolPageMeta } from '~/lib/seo'

type SolveOption = {
  value: AWVSolve
  label: string
  labelA: string
  labelB: string
}

const solveOptions: SolveOption[] = [
  {
    value: 'amps',
    label: 'Amps',
    labelA: 'Watts (W)',
    labelB: 'Volts (V)',
  },
  {
    value: 'watts',
    label: 'Watts',
    labelA: 'Amps (A)',
    labelB: 'Volts (V)',
  },
  {
    value: 'volts',
    label: 'Volts',
    labelA: 'Watts (W)',
    labelB: 'Amps (A)',
  },
]

const segmentedOptions = solveOptions.map((o) => ({
  value: o.value,
  label: o.label,
}))

function fmtNum(n: number): string {
  if (!isFinite(n)) return '—'
  return parseFloat(n.toPrecision(8)).toString()
}

export default function AmpsWattsVolts() {
  setToolPageMeta('electrical', 'amps-watts-volts')
  const [searchParams, setSearchParams] = useSearchParams<{
    solve?: string
    a?: string
    b?: string
  }>()

  const solve = createMemo<AWVSolve>(() => {
    const s = searchParams.solve
    if (s === 'amps' || s === 'watts' || s === 'volts') return s
    return 'amps'
  })

  const [aRaw, setARaw] = createSignal(searchParams.a ?? '')
  const [bRaw, setBRaw] = createSignal(searchParams.b ?? '')

  const result = createMemo(() => {
    const a = parseFloat(aRaw())
    const b = parseFloat(bRaw())
    if (!isFinite(a) || !isFinite(b) || aRaw().trim() === '' || bRaw().trim() === '') {
      return null
    }
    return solveAWV(solve(), a, b)
  })

  const option = createMemo(() => solveOptions.find((o) => o.value === solve())!)

  const outputText = createMemo(() => {
    const r = result()
    if (!r) return ''
    return `${fmtNum(r.value)} ${r.unit}`
  })

  const formula = createMemo(() => result()?.formula ?? '')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="electrical"
        name="Amps / watts / volts"
        description="Convert between amps, watts, and volts. Provide any two known values to calculate the third."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Solve for"
            value={solve()}
            onChange={(v) => setSearchParams({ solve: v, a: '', b: '' }, { replace: true })}
            options={segmentedOptions}
          />
        </ToolToolbar>

        {/* Inputs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Inputs</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <Label class="text-xs text-muted-foreground">{option().labelA}</Label>
              <TextField
                value={aRaw()}
                onChange={(v) => {
                  setARaw(v)
                  setSearchParams({ a: v }, { replace: true })
                }}
              >
                <TextFieldInput
                  type="text"
                  inputMode="decimal"
                  autofocus
                  placeholder="Enter value"
                  class="h-12 font-mono text-base"
                />
              </TextField>
            </div>

            <div class="flex flex-col gap-1.5">
              <Label class="text-xs text-muted-foreground">{option().labelB}</Label>
              <TextField
                value={bRaw()}
                onChange={(v) => {
                  setBRaw(v)
                  setSearchParams({ b: v }, { replace: true })
                }}
              >
                <TextFieldInput
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter value"
                  class="h-12 font-mono text-base"
                />
              </TextField>
            </div>
          </div>
        </section>

        {/* Output */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Result will appear here
              </div>
            }
          >
            <div class="anim-fade-up flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
              <div class="flex flex-1 flex-col gap-0.5">
                <span class="font-mono text-2xl font-semibold tracking-tight text-foreground break-words">
                  {outputText()}
                </span>
                <Show when={formula()}>
                  <span class="font-mono text-xs text-muted-foreground">{formula()}</span>
                </Show>
              </div>
              <CopyButton value={() => outputText()} />
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
