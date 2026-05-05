import { createMemo, For, Show, onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { rectangle } from '~/lib/utils/geometry/rectangle'
import { setToolPageMeta } from '~/lib/seo'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  return parseFloat(n.toPrecision(10)).toString()
}

type ResultRow = {
  label: string
  formula: string
  value: () => string
}

export default function RectangleCalculator() {
  setToolPageMeta('geometry', 'rectangle')
  const [searchParams, setSearchParams] = useSearchParams<{
    w?: string
    h?: string
  }>()

  const wRaw = createMemo(() => searchParams.w ?? '')
  const hRaw = createMemo(() => searchParams.h ?? '')

  const result = createMemo(() => {
    const w = parseFloat(wRaw())
    const h = parseFloat(hRaw())
    if (!isFinite(w) || !isFinite(h) || wRaw().trim() === '' || hRaw().trim() === '') return null
    if (w <= 0 || h <= 0) return null
    return rectangle(w, h)
  })

  const hasResult = createMemo(() => result() !== null)
  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  const rows: ResultRow[] = [
    { label: 'Area', formula: 'A = w × h', value: () => fmt(result()?.area ?? NaN) },
    { label: 'Perimeter', formula: 'P = 2(w + h)', value: () => fmt(result()?.perimeter ?? NaN) },
    { label: 'Diagonal', formula: 'd = √(w² + h²)', value: () => fmt(result()?.diagonal ?? NaN) },
  ]

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Rectangle calculator"
        description="Calculate area, perimeter, and diagonal of a rectangle or square."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Dimensions input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Dimensions</h2>
            </div>
            <Show when={result()?.isSquare}>
              <span class="rounded-md border border-violet/40 bg-violet/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet">
                Square
              </span>
            </Show>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <NumberField
              value={wRaw() || undefined}
              onChange={(v) => setSearchParams({ w: v }, { replace: true })}
              minValue={0}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>Width</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="Enter width" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField
              value={hRaw() || undefined}
              onChange={(v) => setSearchParams({ h: v }, { replace: true })}
              minValue={0}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>Height</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="Enter height" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* Results */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Results</h2>
          </div>

          <Show
            when={hasResult()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter width and height to see results
              </div>
            }
          >
            <div class="anim-stagger grid gap-3 sm:grid-cols-3">
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
