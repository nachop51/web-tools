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
import { circleFrom, circleInputs, type CircleInput } from '~/lib/utils/geometry/circle'
import { setToolPageMeta } from '~/lib/seo'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  return parseFloat(n.toPrecision(10)).toString()
}

const modeOptions: { value: CircleInput; label: string }[] = [
  { value: 'radius', label: 'Radius' },
  { value: 'diameter', label: 'Diameter' },
  { value: 'circumference', label: 'Circumference' },
  { value: 'area', label: 'Area' },
]

type ResultRow = {
  label: string
  formula: string
  value: () => string
}

export default function CircleCalculator() {
  setToolPageMeta('geometry', 'circle')
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string
    v?: string
  }>()

  const mode = createMemo<CircleInput>(() => {
    const m = searchParams.mode
    if (m === 'radius' || m === 'diameter' || m === 'circumference' || m === 'area') return m
    return 'radius'
  })

  const raw = createMemo(() => searchParams.v ?? '')

  const result = createMemo(() => {
    const v = parseFloat(raw())
    if (!isFinite(v) || raw().trim() === '' || v < 0) return null
    return circleFrom(mode(), v)
  })

  const inputLabel = createMemo(() => circleInputs.find((c) => c.id === mode())!)
  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  const rows: ResultRow[] = [
    { label: 'Radius', formula: 'r', value: () => fmt(result()?.radius ?? NaN) },
    { label: 'Diameter', formula: 'd = 2r', value: () => fmt(result()?.diameter ?? NaN) },
    { label: 'Circumference', formula: 'C = 2πr', value: () => fmt(result()?.circumference ?? NaN) },
    { label: 'Area', formula: 'A = πr²', value: () => fmt(result()?.area ?? NaN) },
  ]

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Circle calculator"
        description="Find radius, diameter, circumference, and area from any one property."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Known value"
            value={mode() || undefined}
            onChange={(v) => setSearchParams({ mode: v, v: '' }, { replace: true })}
            options={modeOptions}
          />
        </ToolToolbar>

        {/* Input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <NumberField
            value={raw() || undefined}
            onChange={(v) => setSearchParams({ v }, { replace: true })}
            minValue={0}
            format={false}
            class="flex flex-col gap-1.5"
          >
            <NumberFieldLabel>{inputLabel().label}</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput ref={inputRef} placeholder="Enter value" class="h-12 font-mono text-base" />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>
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
                Enter a value to see all four properties
              </div>
            }
          >
            <div class="anim-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <For each={rows}>
                {(row) => (
                  <div class="anim-fade-up relative">
                    <div class="mb-2 flex items-baseline justify-between gap-2">
                      <span class="text-xs font-medium text-muted-foreground">{row.label}</span>
                      <span class="font-mono text-[10px] text-muted-foreground/70">{row.formula}</span>
                    </div>
                    <div class="min-h-[5rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-xl font-semibold tracking-tight break-words">
                      {row.value()}
                    </div>
                    <CopyButton value={row.value} class="absolute right-2 top-7" />
                  </div>
                )}
              </For>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
