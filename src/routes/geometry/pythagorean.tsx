import { createMemo, For, Show, onMount } from 'solid-js'
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
import { solveRightTriangle, type RightTriangleSolveFor, type RightTriangleResult } from '~/lib/utils/geometry/triangle'
import { setToolPageMeta } from '~/lib/seo'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  return parseFloat(n.toPrecision(10)).toString()
}

type SolveOption = {
  value: RightTriangleSolveFor
  label: string
  label1: string
  label2: string
  placeholder1: string
  placeholder2: string
}

const solveOptions: SolveOption[] = [
  {
    value: 'c',
    label: 'Find c (hypotenuse)',
    label1: 'Leg a',
    label2: 'Leg b',
    placeholder1: 'Enter a',
    placeholder2: 'Enter b',
  },
  {
    value: 'a',
    label: 'Find a (leg)',
    label1: 'Leg b',
    label2: 'Hypotenuse c',
    placeholder1: 'Enter b',
    placeholder2: 'Enter c',
  },
  {
    value: 'b',
    label: 'Find b (leg)',
    label1: 'Leg a',
    label2: 'Hypotenuse c',
    placeholder1: 'Enter a',
    placeholder2: 'Enter c',
  },
]

const segmentedOptions = solveOptions.map((o) => ({
  value: o.value,
  label: o.label,
}))

function buildEquation(solve: RightTriangleSolveFor, data: RightTriangleResult): string {
  const aVal = fmt(data.a)
  const bVal = fmt(data.b)
  const cVal = fmt(data.c)
  const aDisp = solve === 'a' ? '?' : aVal
  const bDisp = solve === 'b' ? '?' : bVal
  const cDisp = solve === 'c' ? '?' : cVal
  return `${aDisp}² + ${bDisp}² = ${cDisp}²`
}

function getMissingLabel(solve: RightTriangleSolveFor): string {
  if (solve === 'c') return 'c (hypotenuse)'
  if (solve === 'a') return 'a (leg)'
  return 'b (leg)'
}

function getMissingValue(solve: RightTriangleSolveFor, data: RightTriangleResult): string {
  if (solve === 'c') return fmt(data.c)
  if (solve === 'a') return fmt(data.a)
  return fmt(data.b)
}

type ExtraRow = { label: string; value: () => string }

function PyResult(props: { solve: RightTriangleSolveFor; data: RightTriangleResult }) {
  const equation = createMemo(() => buildEquation(props.solve, props.data))
  const missingLabel = createMemo(() => getMissingLabel(props.solve))
  const missingValue = createMemo(() => getMissingValue(props.solve, props.data))

  const extras: ExtraRow[] = [
    { label: 'Angle A', value: () => `${fmt(props.data.angleA)}°` },
    { label: 'Angle B', value: () => `${fmt(props.data.angleB)}°` },
    { label: 'Area', value: () => fmt(props.data.area) },
  ]

  return (
    <div class="anim-stagger flex flex-col gap-4">
      {/* Equation display */}
      <div class="anim-fade-up rounded-md border border-border bg-muted/30 px-4 py-3 text-center font-mono text-base">
        {equation()}
      </div>

      {/* Missing side highlight */}
      <div class="anim-fade-up relative">
        <div class="mb-2 flex items-baseline justify-between gap-2">
          <span class="text-xs font-medium text-muted-foreground">Solved for {missingLabel()}</span>
        </div>
        <div class="min-h-[5rem] rounded-md border border-violet/40 bg-violet/10 p-4 pr-14 font-mono text-2xl font-bold tracking-tight text-violet break-words">
          {missingValue()}
        </div>
        <CopyButton value={missingValue} class="absolute right-2 top-7" />
      </div>

      {/* Extras */}
      <div class="grid gap-3 sm:grid-cols-3">
        <For each={extras}>
          {(row) => (
            <div class="anim-fade-up relative">
              <div class="mb-2 flex items-baseline justify-between gap-2">
                <span class="text-xs font-medium text-muted-foreground">{row.label}</span>
              </div>
              <div class="min-h-[4rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-base font-semibold tracking-tight break-words">
                {row.value()}
              </div>
              <CopyButton value={row.value} class="absolute right-2 top-7" />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

export default function PythagoreanTheorem() {
  setToolPageMeta('geometry', 'pythagorean')
  const [searchParams, setSearchParams] = useSearchParams<{
    solve?: string
    v1?: string
    v2?: string
  }>()

  const solve = createMemo<RightTriangleSolveFor>(() => {
    const s = searchParams.solve
    if (s === 'a' || s === 'b' || s === 'c') return s
    return 'c'
  })

  const v1Raw = createMemo(() => searchParams.v1 ?? '')
  const v2Raw = createMemo(() => searchParams.v2 ?? '')

  const result = createMemo<RightTriangleResult | null>(() => {
    const v1 = parseFloat(v1Raw())
    const v2 = parseFloat(v2Raw())
    if (!isFinite(v1) || !isFinite(v2) || v1Raw().trim() === '' || v2Raw().trim() === '') return null
    if (v1 <= 0 || v2 <= 0) return null
    try {
      return solveRightTriangle(solve(), v1, v2)
    } catch {
      return null
    }
  })

  const errorMsg = createMemo<string | null>(() => {
    const v1 = parseFloat(v1Raw())
    const v2 = parseFloat(v2Raw())
    if (!isFinite(v1) || !isFinite(v2) || v1Raw().trim() === '' || v2Raw().trim() === '') return null
    if (v1 <= 0 || v2 <= 0) return null
    try {
      solveRightTriangle(solve(), v1, v2)
      return null
    } catch (e) {
      return (e as Error).message
    }
  })

  const option = createMemo(() => solveOptions.find((o) => o.value === solve())!)

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Pythagorean theorem"
        description="Solve for any side of a right triangle using a² + b² = c²."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Solve for"
            value={solve() || undefined}
            onChange={(v) => setSearchParams({ solve: v, v1: '', v2: '' }, { replace: true })}
            options={segmentedOptions}
          />
          <div class="ml-auto" />
          <span class="font-mono text-xs text-muted-foreground">a² + b² = c²</span>
        </ToolToolbar>

        {/* Inputs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Known sides</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <NumberField
              value={v1Raw() || undefined}
              onChange={(v) => setSearchParams({ v1: v }, { replace: true })}
              minValue={0}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>{option().label1}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder={option().placeholder1} class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField
              value={v2Raw() || undefined}
              onChange={(v) => setSearchParams({ v2: v }, { replace: true })}
              minValue={0}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>{option().label2}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder={option().placeholder2} class="h-12 font-mono text-base" />
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

          <Show when={errorMsg()}>
            {(err) => (
              <div class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {err()}
              </div>
            )}
          </Show>

          <Show
            when={result()}
            fallback={
              <Show when={!errorMsg()}>
                <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Enter both known values to solve
                </div>
              </Show>
            }
          >
            {(res) => <PyResult solve={solve()} data={res()} />}
          </Show>
        </section>
      </div>
    </main>
  )
}
