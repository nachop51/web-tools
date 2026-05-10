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
import {
  kite,
  parallelogram,
  rhombus,
  trapezoid,
  type QuadResult,
  type QuadShape,
} from '~/lib/utils/geometry/quadrilateral'
import { setToolPageMeta } from '~/lib/seo'

function fmt(n: number | null): string {
  if (n === null) return '—'
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

const shapeOptions: { value: QuadShape; label: string }[] = [
  { value: 'parallelogram', label: 'Parallelogram' },
  { value: 'rhombus', label: 'Rhombus' },
  { value: 'trapezoid', label: 'Trapezoid' },
  { value: 'kite', label: 'Kite' },
]

export default function QuadrilateralCalculator() {
  setToolPageMeta('geometry', 'quadrilateral')
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string
    base?: string
    height?: string
    side?: string
    angle?: string
    p?: string
    q?: string
    a?: string
    b?: string
    legL?: string
    legR?: string
    sShort?: string
    sLong?: string
  }>()

  const mode = createMemo<QuadShape>(() => {
    const m = searchParams.mode
    if (m === 'rhombus' || m === 'trapezoid' || m === 'kite') return m
    return 'parallelogram'
  })

  const get = (k: keyof typeof searchParams) => createMemo(() => (searchParams[k] as string | undefined) ?? '')
  const num = (s: string) => (s.trim() === '' ? NaN : parseFloat(s))

  const base = get('base')
  const height = get('height')
  const side = get('side')
  const angle = get('angle')
  const p = get('p')
  const q = get('q')
  const aTop = get('a')
  const bBot = get('b')
  const legL = get('legL')
  const legR = get('legR')
  const sShort = get('sShort')
  const sLong = get('sLong')

  const result = createMemo<QuadResult | null>(() => {
    switch (mode()) {
      case 'parallelogram': {
        const b = num(base())
        const h = num(height())
        const s = num(side())
        const a = num(angle())
        if ([b, h, s, a].some((v) => !isFinite(v))) return null
        if (b <= 0 || h <= 0 || s <= 0 || a <= 0 || a >= 180) return null
        return parallelogram(b, h, s, a)
      }
      case 'rhombus': {
        const s = num(side())
        const pp = num(p())
        const qq = num(q())
        if ([s, pp, qq].some((v) => !isFinite(v))) return null
        if (s <= 0 || pp <= 0 || qq <= 0) return null
        return rhombus(s, pp, qq)
      }
      case 'trapezoid': {
        const aT = num(aTop())
        const bB = num(bBot())
        const h = num(height())
        if ([aT, bB, h].some((v) => !isFinite(v))) return null
        if (aT <= 0 || bB <= 0 || h <= 0) return null
        const lL = num(legL())
        const lR = num(legR())
        const lLeft = isFinite(lL) && lL > 0 ? lL : undefined
        const lRight = isFinite(lR) && lR > 0 ? lR : undefined
        return trapezoid(aT, bB, h, lLeft, lRight)
      }
      case 'kite': {
        const pp = num(p())
        const qq = num(q())
        if (!isFinite(pp) || !isFinite(qq) || pp <= 0 || qq <= 0) return null
        const sS = num(sShort())
        const sL = num(sLong())
        const sShortV = isFinite(sS) && sS > 0 ? sS : undefined
        const sLongV = isFinite(sL) && sL > 0 ? sL : undefined
        return kite(pp, qq, sShortV, sLongV)
      }
    }
  })

  let firstRef: HTMLInputElement | undefined

  onMount(() => {
    firstRef?.focus()
  })

  function field(
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
        minValue={0}
        format={false}
        class="flex flex-col gap-1.5"
      >
        <NumberFieldLabel>{label}</NumberFieldLabel>
        <NumberFieldGroup>
          <NumberFieldInput
            ref={isFirst ? firstRef : undefined}
            placeholder={placeholder}
            class="h-11 font-mono text-sm"
          />
          <NumberFieldIncrementTrigger />
          <NumberFieldDecrementTrigger />
        </NumberFieldGroup>
      </NumberField>
    )
  }

  const rows = createMemo(() => {
    const r = result()
    if (!r) return []
    switch (r.shape) {
      case 'parallelogram':
        return [
          { label: 'Area', value: fmt(r.area) },
          { label: 'Perimeter', value: fmt(r.perimeter) },
          { label: 'Diagonal (short)', value: fmt(r.diagonalShort) },
          { label: 'Diagonal (long)', value: fmt(r.diagonalLong) },
          { label: 'Base × Height', value: `${fmt(r.base)} × ${fmt(r.height)}` },
        ]
      case 'rhombus':
        return [
          { label: 'Area', value: fmt(r.area) },
          { label: 'Perimeter', value: fmt(r.perimeter) },
          { label: 'Acute interior angle', value: `${fmt(r.angleDeg)}°` },
          { label: 'Diagonal p', value: fmt(r.diagonalP) },
          { label: 'Diagonal q', value: fmt(r.diagonalQ) },
        ]
      case 'trapezoid':
        return [
          { label: 'Area', value: fmt(r.area) },
          { label: 'Perimeter', value: fmt(r.perimeter) },
          { label: 'Midsegment', value: fmt(r.midsegment) },
          { label: 'Top side a', value: fmt(r.a) },
          { label: 'Bottom side b', value: fmt(r.b) },
          { label: 'Height', value: fmt(r.height) },
        ]
      case 'kite':
        return [
          { label: 'Area', value: fmt(r.area) },
          { label: 'Perimeter', value: fmt(r.perimeter) },
          { label: 'Diagonal p', value: fmt(r.diagonalP) },
          { label: 'Diagonal q', value: fmt(r.diagonalQ) },
        ]
    }
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Quadrilateral"
        description="Compute area, perimeter, and diagonals of parallelograms, rhombuses, trapezoids, and kites."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Shape"
            value={mode() || undefined}
            onChange={(v) =>
              setSearchParams(
                {
                  mode: v,
                  base: '',
                  height: '',
                  side: '',
                  angle: '',
                  p: '',
                  q: '',
                  a: '',
                  b: '',
                  legL: '',
                  legR: '',
                  sShort: '',
                  sLong: '',
                },
                { replace: true }
              )
            }
            options={shapeOptions}
          />
        </ToolToolbar>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Inputs</h2>
          </div>

          <Show when={mode() === 'parallelogram'}>
            <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {field(base, 'base', 'Base b', '4', true)}
              {field(height, 'height', 'Height h', '3')}
              {field(side, 'side', 'Side s', '5')}
              {field(angle, 'angle', 'Angle θ (°)', '60')}
            </div>
          </Show>

          <Show when={mode() === 'rhombus'}>
            <div class="grid gap-4 sm:grid-cols-3">
              {field(side, 'side', 'Side s', '5', true)}
              {field(p, 'p', 'Diagonal p', '6')}
              {field(q, 'q', 'Diagonal q', '8')}
            </div>
          </Show>

          <Show when={mode() === 'trapezoid'}>
            <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {field(aTop, 'a', 'Top side a', '3', true)}
              {field(bBot, 'b', 'Bottom side b', '5')}
              {field(height, 'height', 'Height h', '4')}
              {field(legL, 'legL', 'Left leg (optional)', '')}
              {field(legR, 'legR', 'Right leg (optional)', '')}
            </div>
          </Show>

          <Show when={mode() === 'kite'}>
            <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {field(p, 'p', 'Diagonal p', '6', true)}
              {field(q, 'q', 'Diagonal q', '8')}
              {field(sShort, 'sShort', 'Short side (optional)', '')}
              {field(sLong, 'sLong', 'Long side (optional)', '')}
            </div>
          </Show>
        </section>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Results</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Fill in the required dimensions to compute properties
              </div>
            }
          >
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
