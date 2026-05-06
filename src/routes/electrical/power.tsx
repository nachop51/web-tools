import { createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { Label } from '~/components/ui/label'
import { TextField, TextFieldInput } from '~/components/ui/text-field'
import { calcPower, type PowerMode } from '~/lib/utils/electrical/power'
import { setToolPageMeta } from '~/lib/seo'

type ModeOption = {
  value: PowerMode
  label: string
  labelA: string
  labelB: string
  formula: string
}

const modeOptions: ModeOption[] = [
  {
    value: 'iv',
    label: 'P = IV',
    labelA: 'Current (A)',
    labelB: 'Voltage (V)',
    formula: 'P = I × V',
  },
  {
    value: 'vr',
    label: 'P = V²/R',
    labelA: 'Voltage (V)',
    labelB: 'Resistance (Ω)',
    formula: 'P = V² ÷ R',
  },
  {
    value: 'ir',
    label: 'P = I²R',
    labelA: 'Current (A)',
    labelB: 'Resistance (Ω)',
    formula: 'P = I² × R',
  },
]

const segmentedOptions = modeOptions.map((o) => ({
  value: o.value,
  label: o.label,
}))

type ResultRow = {
  key: 'watts' | 'kilowatts' | 'horsepower'
  label: string
  unit: string
  formula: string
  fmt: (n: number) => string
}

function fmtNum(n: number): string {
  if (!isFinite(n)) return '-'
  return parseFloat(n.toPrecision(8)).toString()
}

function fmtHP(n: number): string {
  if (!isFinite(n)) return '-'
  return parseFloat(n.toFixed(6)).toString()
}

export default function PowerCalculator() {
  setToolPageMeta('electrical', 'power')
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string
    a?: string
    b?: string
  }>()

  const mode = createMemo<PowerMode>(() => {
    const m = searchParams.mode
    if (m === 'iv' || m === 'vr' || m === 'ir') return m
    return 'iv'
  })

  const [aRaw, setARaw] = createSignal(searchParams.a ?? '')
  const [bRaw, setBRaw] = createSignal(searchParams.b ?? '')

  const result = createMemo(() => {
    const a = parseFloat(aRaw())
    const b = parseFloat(bRaw())
    if (!isFinite(a) || !isFinite(b) || aRaw().trim() === '' || bRaw().trim() === '') {
      return null
    }
    return calcPower(mode(), a, b)
  })

  const option = createMemo(() => modeOptions.find((o) => o.value === mode())!)

  const resultRows = createMemo<ResultRow[]>(() => [
    { key: 'watts', label: 'Watts', unit: 'W', formula: option().formula, fmt: fmtNum },
    { key: 'kilowatts', label: 'Kilowatts', unit: 'kW', formula: 'kW = W ÷ 1000', fmt: fmtNum },
    { key: 'horsepower', label: 'Horsepower', unit: 'hp', formula: 'hp = W ÷ 745.7', fmt: fmtHP },
  ])

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="electrical"
        name="Power calculator"
        description="Calculate electrical power in watts, kilowatts, and horsepower using three common formulas."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Formula"
            value={mode()}
            onChange={(v) => setSearchParams({ mode: v, a: '', b: '' }, { replace: true })}
            options={segmentedOptions}
          />
        </ToolToolbar>

        {/* Inputs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Inputs</h2>
            </div>
            <span class="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {option().formula}
            </span>
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
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
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
                Result will appear here
              </div>
            }
          >
            {(r) => (
              <div class="anim-fade-up overflow-hidden rounded-md border border-border">
                <For each={resultRows()}>
                  {(row) => {
                    const valueStr = createMemo(() => row.fmt(r()[row.key]))
                    const display = createMemo(() => `${valueStr()} ${row.unit}`)
                    return (
                      <div class="flex items-center gap-3 border-t border-border/50 px-4 py-3 text-sm first:border-t-0">
                        <span class="w-32 shrink-0 text-muted-foreground">{row.label}</span>
                        <span class="hidden font-mono text-xs text-muted-foreground sm:inline">{row.formula}</span>
                        <span class="flex-1 text-right font-mono tabular-nums text-base font-semibold break-words">
                          {display()}
                        </span>
                        <CopyButton value={() => display()} />
                      </div>
                    )
                  }}
                </For>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  )
}
