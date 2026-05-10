import { createMemo, For, Show, onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { lineFromPointSlope, lineFromTwoPoints, type LineResult } from '~/lib/utils/geometry/slope'
import { setToolPageMeta } from '~/lib/seo'
import { SlopeFigure } from '~/components/geometry/slope-figure'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

type SlopeMode = 'two-points' | 'point-slope'

const modeOptions: { value: SlopeMode; label: string }[] = [
  { value: 'two-points', label: 'Two points' },
  { value: 'point-slope', label: 'Point + slope' },
]

export default function SlopeLine() {
  setToolPageMeta('geometry', 'slope-line')
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string
    x1?: string
    y1?: string
    x2?: string
    y2?: string
    px?: string
    py?: string
    m?: string
  }>()

  const mode = createMemo<SlopeMode>(() =>
    searchParams.mode === 'point-slope' ? 'point-slope' : 'two-points'
  )

  const x1 = createMemo(() => searchParams.x1 ?? '')
  const y1 = createMemo(() => searchParams.y1 ?? '')
  const x2 = createMemo(() => searchParams.x2 ?? '')
  const y2 = createMemo(() => searchParams.y2 ?? '')
  const px = createMemo(() => searchParams.px ?? '')
  const py = createMemo(() => searchParams.py ?? '')
  const m = createMemo(() => searchParams.m ?? '')

  const result = createMemo<LineResult | null>(() => {
    const num = (s: string) => (s.trim() === '' ? NaN : parseFloat(s))
    if (mode() === 'two-points') {
      const a = num(x1())
      const b = num(y1())
      const c = num(x2())
      const d = num(y2())
      if ([a, b, c, d].some((v) => !isFinite(v))) return null
      return lineFromTwoPoints(a, b, c, d)
    } else {
      const a = num(px())
      const b = num(py())
      const s = num(m())
      if ([a, b, s].some((v) => !isFinite(v))) return null
      return lineFromPointSlope(a, b, s)
    }
  })

  let firstRef: HTMLInputElement | undefined

  onMount(() => {
    firstRef?.focus()
  })

  const rows = createMemo(() => {
    const r = result()
    if (!r) return []
    const slopeStr = r.vertical ? 'undefined' : fmt(r.slope)
    const yIntStr = r.vertical ? 'none' : fmt(r.yIntercept)
    const xIntStr = r.horizontal && Math.abs(r.yIntercept) > 1e-12 ? 'none' : fmt(r.xIntercept)
    return [
      { label: 'Slope (m)', value: slopeStr },
      { label: 'y-intercept (b)', value: yIntStr },
      { label: 'x-intercept', value: xIntStr },
      { label: 'Slope-intercept form', value: r.slopeIntercept },
      { label: 'Point-slope form', value: r.pointSlope },
      { label: 'Standard form', value: r.standardForm },
      { label: 'Inclination angle', value: `${fmt(r.inclinationDeg)}° (${fmt(r.inclinationRad)} rad)` },
    ]
  })

  function numField(
    valGetter: () => string,
    key: string,
    label: string,
    placeholder: string,
    isFirst = false
  ) {
    return (
      <NumberField
        value={valGetter() || undefined}
        onChange={(v) => setSearchParams({ [key]: v }, { replace: true })}
        format={false}
        class="flex flex-col gap-1.5"
      >
        <NumberFieldLabel>{label}</NumberFieldLabel>
        <NumberFieldGroup>
          <NumberFieldInput
            ref={isFirst ? firstRef : undefined}
            placeholder={placeholder}
            class="h-10 font-mono text-sm"
          />
          <NumberFieldIncrementTrigger />
          <NumberFieldDecrementTrigger />
        </NumberFieldGroup>
      </NumberField>
    )
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Slope & line"
        description="Get the equation, intercepts, and inclination of a line from two points or a point + slope."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Given"
            value={mode() || undefined}
            onChange={(v) => setSearchParams({ mode: v }, { replace: true })}
            options={modeOptions}
          />
        </ToolToolbar>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Inputs</h2>
          </div>

          <Show when={mode() === 'two-points'}>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-3 rounded-md border border-border bg-background/50 p-4">
                <span class="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Point 1
                </span>
                <div class="grid gap-3 sm:grid-cols-2">
                  {numField(x1, 'x1', 'x₁', '0', true)}
                  {numField(y1, 'y1', 'y₁', '0')}
                </div>
              </div>
              <div class="flex flex-col gap-3 rounded-md border border-border bg-background/50 p-4">
                <span class="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Point 2
                </span>
                <div class="grid gap-3 sm:grid-cols-2">
                  {numField(x2, 'x2', 'x₂', '0')}
                  {numField(y2, 'y2', 'y₂', '0')}
                </div>
              </div>
            </div>
          </Show>

          <Show when={mode() === 'point-slope'}>
            <div class="grid gap-4 sm:grid-cols-3">
              {numField(px, 'px', 'Point x', '0', true)}
              {numField(py, 'py', 'Point y', '0')}
              {numField(m, 'm', 'Slope m', '1')}
            </div>
          </Show>
        </section>

        <Show when={result()}>
          {(res) => (
            <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
              <div class="mb-4 flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Figure</h2>
              </div>
              <div class="anim-fade-in">
                <SlopeFigure data={res()} />
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
                Fill all fields to see the line equation
              </div>
            }
          >
            <Show when={result()?.vertical}>
              <div class="anim-fade-in mb-3 rounded-md border border-violet/30 bg-violet/10 px-4 py-2.5 text-sm text-violet">
                Vertical line — slope is undefined.
              </div>
            </Show>
            <div class="anim-fade-in overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead class="w-16 text-right">Copy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <For each={rows()}>
                    {(row) => (
                      <TableRow>
                        <TableCell class="font-sans font-medium">{row.label}</TableCell>
                        <TableCell class="font-semibold">{row.value}</TableCell>
                        <TableCell class="text-right">
                          <CopyButton value={row.value} />
                        </TableCell>
                      </TableRow>
                    )}
                  </For>
                </TableBody>
              </Table>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
