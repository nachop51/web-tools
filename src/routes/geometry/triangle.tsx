import { createMemo, createSignal, For, Show, onMount } from 'solid-js'
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
import { setToolPageMeta } from '~/lib/seo'
import {
  solveRightTriangle,
  triangleFromSSS,
  type RightTriangleSolveFor,
  type RightTriangleResult,
  type TriangleResult,
} from '~/lib/utils/geometry/triangle'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

type TabMode = 'right' | 'sss'

const tabs: { id: TabMode; label: string }[] = [
  { id: 'right', label: 'Right triangle' },
  { id: 'sss', label: 'All sides (SSS)' },
]

const tabOptions = tabs.map((t) => ({ value: t.id, label: t.label }))

type SolveOption = {
  value: RightTriangleSolveFor
  label: string
  label1: string
  label2: string
}

const solveOptions: SolveOption[] = [
  { value: 'c', label: 'Find hypotenuse (c)', label1: 'Leg a', label2: 'Leg b' },
  { value: 'a', label: 'Find leg (a)', label1: 'Leg b', label2: 'Hypotenuse c' },
  { value: 'b', label: 'Find leg (b)', label1: 'Leg a', label2: 'Hypotenuse c' },
]

const solveSegmentedOptions = solveOptions.map((o) => ({
  value: o.value,
  label: o.label,
}))

type Row = { label: string; value: () => string }

function ResultGrid(props: { rows: Row[] }) {
  return (
    <div class="anim-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <For each={props.rows}>
        {(row) => (
          <div class="anim-fade-up relative">
            <div class="mb-2 flex items-baseline justify-between gap-2">
              <span class="text-xs font-medium text-muted-foreground">{row.label}</span>
            </div>
            <div class="min-h-[4.5rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-base font-semibold tracking-tight break-words">
              {row.value()}
            </div>
            <CopyButton value={row.value} class="absolute right-2 top-7" />
          </div>
        )}
      </For>
    </div>
  )
}

function rightRows(d: RightTriangleResult): Row[] {
  return [
    { label: 'Leg a', value: () => fmt(d.a) },
    { label: 'Leg b', value: () => fmt(d.b) },
    { label: 'Hypotenuse c', value: () => fmt(d.c) },
    { label: 'Angle A', value: () => `${fmt(d.angleA)}°` },
    { label: 'Angle B', value: () => `${fmt(d.angleB)}°` },
    { label: 'Area', value: () => fmt(d.area) },
    { label: 'Perimeter', value: () => fmt(d.perimeter) },
  ]
}

function sssRows(d: TriangleResult): Row[] {
  return [
    { label: 'Angle A', value: () => `${fmt(d.angleA)}°` },
    { label: 'Angle B', value: () => `${fmt(d.angleB)}°` },
    { label: 'Angle C', value: () => `${fmt(d.angleC)}°` },
    { label: 'Area', value: () => fmt(d.area) },
    { label: 'Perimeter', value: () => fmt(d.perimeter) },
  ]
}

export default function TriangleCalculator() {
  setToolPageMeta('geometry', 'triangle')
  const [searchParams, setSearchParams] = useSearchParams<{
    tab?: string
    solve?: string
    v1?: string
    v2?: string
    a?: string
    b?: string
    c?: string
  }>()

  const tab = createMemo<TabMode>(() => {
    const t = searchParams.tab
    return t === 'sss' ? 'sss' : 'right'
  })

  const solve = createMemo<RightTriangleSolveFor>(() => {
    const s = searchParams.solve
    if (s === 'a' || s === 'b' || s === 'c') return s
    return 'c'
  })

  const [v1Raw, setV1Raw] = createSignal(searchParams.v1 ?? '')
  const [v2Raw, setV2Raw] = createSignal(searchParams.v2 ?? '')
  const [aRaw, setARaw] = createSignal(searchParams.a ?? '')
  const [bRaw, setBRaw] = createSignal(searchParams.b ?? '')
  const [cRaw, setCRaw] = createSignal(searchParams.c ?? '')

  const rightOk = createMemo<{ data: RightTriangleResult } | null>(() => {
    if (tab() !== 'right') return null
    const v1 = parseFloat(v1Raw())
    const v2 = parseFloat(v2Raw())
    if (!isFinite(v1) || !isFinite(v2) || v1Raw().trim() === '' || v2Raw().trim() === '') return null
    if (v1 <= 0 || v2 <= 0) return null
    try {
      return { data: solveRightTriangle(solve(), v1, v2) }
    } catch {
      return null
    }
  })

  const rightError = createMemo<string | null>(() => {
    if (tab() !== 'right') return null
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

  const sssResult = createMemo<TriangleResult | null>(() => {
    if (tab() !== 'sss') return null
    const a = parseFloat(aRaw())
    const b = parseFloat(bRaw())
    const c = parseFloat(cRaw())
    if (!isFinite(a) || !isFinite(b) || !isFinite(c)) return null
    if (aRaw().trim() === '' || bRaw().trim() === '' || cRaw().trim() === '') return null
    if (a <= 0 || b <= 0 || c <= 0) return null
    return triangleFromSSS(a, b, c)
  })

  const sssValid = createMemo(() => sssResult()?.valid ?? false)

  const option = createMemo(() => solveOptions.find((o) => o.value === solve())!)

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Triangle calculator"
        description="Solve right triangles and general triangles from sides and angles."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Type"
            value={tab() || undefined}
            onChange={(v) => setSearchParams({ tab: v, v1: '', v2: '', a: '', b: '', c: '' }, { replace: true })}
            options={tabOptions}
          />
          <Show when={tab() === 'right'}>
            <ToolbarSegmented
              label="Solve for"
              value={solve() || undefined}
              onChange={(v) => setSearchParams({ solve: v, v1: '', v2: '' }, { replace: true })}
              options={solveSegmentedOptions}
            />
          </Show>
        </ToolToolbar>

        {/* Inputs */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Known values</h2>
          </div>

          <Show when={tab() === 'right'}>
            <div class="grid gap-4 sm:grid-cols-2">
              <NumberField
                value={v1Raw() || undefined}
                onChange={(v) => {
                  setV1Raw(v)
                  setSearchParams({ v1: v }, { replace: true })
                }}
                minValue={0}
                format={false}
                class="flex flex-col gap-1.5"
              >
                <NumberFieldLabel>{option().label1}</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput ref={inputRef} placeholder="Enter value" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>

              <NumberField
                value={v2Raw() || undefined}
                onChange={(v) => {
                  setV2Raw(v)
                  setSearchParams({ v2: v }, { replace: true })
                }}
                minValue={0}
                format={false}
                class="flex flex-col gap-1.5"
              >
                <NumberFieldLabel>{option().label2}</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter value" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </Show>

          <Show when={tab() === 'sss'}>
            <div class="grid gap-4 sm:grid-cols-3">
              <NumberField
                value={aRaw() || undefined}
                onChange={(v) => {
                  setARaw(v)
                  setSearchParams({ a: v }, { replace: true })
                }}
                minValue={0}
                format={false}
                class="flex flex-col gap-1.5"
              >
                <NumberFieldLabel>Side a</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput ref={inputRef} placeholder="Enter side a" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>

              <NumberField
                value={bRaw() || undefined}
                onChange={(v) => {
                  setBRaw(v)
                  setSearchParams({ b: v }, { replace: true })
                }}
                minValue={0}
                format={false}
                class="flex flex-col gap-1.5"
              >
                <NumberFieldLabel>Side b</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter side b" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>

              <NumberField
                value={cRaw() || undefined}
                onChange={(v) => {
                  setCRaw(v)
                  setSearchParams({ c: v }, { replace: true })
                }}
                minValue={0}
                format={false}
                class="flex flex-col gap-1.5"
              >
                <NumberFieldLabel>Side c</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter side c" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </Show>
        </section>

        {/* Results */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Results</h2>
          </div>

          {/* Right triangle results */}
          <Show when={tab() === 'right'}>
            <Show when={rightError()}>
              {(err) => (
                <div class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {err()}
                </div>
              )}
            </Show>
            <Show
              when={rightOk()}
              fallback={
                <Show when={!rightError()}>
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Enter both values to see results
                  </div>
                </Show>
              }
            >
              {(res) => <ResultGrid rows={rightRows(res().data)} />}
            </Show>
          </Show>

          {/* SSS results */}
          <Show when={tab() === 'sss'}>
            <Show when={sssResult() && !sssValid()}>
              <div class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Not a valid triangle. The sum of any two sides must be greater than the third.
              </div>
            </Show>
            <Show
              when={sssResult() && sssValid()}
              fallback={
                <Show when={!sssResult()}>
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Enter all three sides to see results
                  </div>
                </Show>
              }
            >
              <ResultGrid rows={sssRows(sssResult()!)} />
            </Show>
          </Show>
        </section>
      </div>
    </main>
  )
}
