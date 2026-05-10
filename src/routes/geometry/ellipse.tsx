import { createMemo, For, Show, onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { ellipse, type EllipseResult } from '~/lib/utils/geometry/ellipse'
import { setToolPageMeta } from '~/lib/seo'
import { EllipseFigure } from '~/components/geometry/ellipse-figure'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

type Row = { label: string; formula: string; value: (e: EllipseResult) => string }

const rows: Row[] = [
  { label: 'Area', formula: 'πab', value: (e) => fmt(e.area) },
  { label: 'Perimeter', formula: 'Ramanujan ≈', value: (e) => fmt(e.perimeter) },
  { label: 'Eccentricity', formula: 'e = c/a', value: (e) => fmt(e.eccentricity) },
  { label: 'Focal distance', formula: 'c = √(a²−b²)', value: (e) => fmt(e.c) },
  { label: 'Focus 1', formula: '(−c, 0)', value: (e) => `(${fmt(e.focus1.x)}, ${fmt(e.focus1.y)})` },
  { label: 'Focus 2', formula: '(c, 0)', value: (e) => `(${fmt(e.focus2.x)}, ${fmt(e.focus2.y)})` },
  { label: 'Latus rectum', formula: '2b²/a', value: (e) => fmt(e.latusRectum) },
  { label: 'Aspect ratio', formula: 'a / b', value: (e) => fmt(e.aspectRatio) },
]

export default function EllipseCalculator() {
  setToolPageMeta('geometry', 'ellipse')
  const [searchParams, setSearchParams] = useSearchParams<{ a?: string; b?: string }>()

  const aRaw = createMemo(() => searchParams.a ?? '')
  const bRaw = createMemo(() => searchParams.b ?? '')

  const result = createMemo<EllipseResult | null>(() => {
    const a = parseFloat(aRaw())
    const b = parseFloat(bRaw())
    if (!isFinite(a) || !isFinite(b) || aRaw().trim() === '' || bRaw().trim() === '') return null
    if (a <= 0 || b <= 0) return null
    try {
      return ellipse(a, b)
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
        category="geometry"
        name="Ellipse calculator"
        description="Compute area, perimeter, eccentricity, foci, and more from the semi-axes."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Semi-axes</h2>
            </div>
            <Show when={result()?.swapped}>
              <span class="rounded-md border border-violet/40 bg-violet/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet">
                a, b swapped (a ≥ b)
              </span>
            </Show>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <NumberField
              value={aRaw() || undefined}
              onChange={(v) => setSearchParams({ a: v }, { replace: true })}
              minValue={0}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>Semi-major axis a</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="Enter a" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField
              value={bRaw() || undefined}
              onChange={(v) => setSearchParams({ b: v }, { replace: true })}
              minValue={0}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>Semi-minor axis b</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="Enter b" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        <Show when={result()}>
          {(res) => (
            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Figure</h2>
              </div>
              <div class="anim-fade-in">
                <EllipseFigure data={res()} />
              </div>
            </section>
          )}
        </Show>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Results</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter both semi-axes to see properties
              </div>
            }
          >
            {(res) => (
              <div class="anim-fade-in overflow-hidden rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Formula</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead class="w-16 text-right">Copy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <For each={rows}>
                      {(row) => {
                        const v = () => row.value(res())
                        return (
                          <TableRow>
                            <TableCell class="font-sans font-medium">{row.label}</TableCell>
                            <TableCell class="text-muted-foreground">{row.formula}</TableCell>
                            <TableCell class="font-semibold">{v()}</TableCell>
                            <TableCell class="text-right">
                              <CopyButton value={v} />
                            </TableCell>
                          </TableRow>
                        )
                      }}
                    </For>
                  </TableBody>
                </Table>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  )
}
