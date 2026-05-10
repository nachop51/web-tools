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
import { vector2D, vector3D, type Vec2, type Vec3 } from '~/lib/utils/geometry/vector'
import { setToolPageMeta } from '~/lib/seo'
import { VectorFigure } from '~/components/geometry/vector-figure'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

function fmtVec(v: number[] | null): string {
  if (!v) return '-'
  return `(${v.map(fmt).join(', ')})`
}

type DimMode = '2d' | '3d'
const dimOptions: { value: DimMode; label: string }[] = [
  { value: '2d', label: '2D' },
  { value: '3d', label: '3D' },
]

export default function VectorCalc() {
  setToolPageMeta('geometry', 'vector-calc')
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string
    a1?: string
    a2?: string
    a3?: string
    b1?: string
    b2?: string
    b3?: string
  }>()

  const mode = createMemo<DimMode>(() => (searchParams.mode === '3d' ? '3d' : '2d'))

  const get = (k: 'a1' | 'a2' | 'a3' | 'b1' | 'b2' | 'b3') => createMemo(() => searchParams[k] ?? '')
  const a1 = get('a1')
  const a2 = get('a2')
  const a3 = get('a3')
  const b1 = get('b1')
  const b2 = get('b2')
  const b3 = get('b3')

  const result = createMemo(() => {
    const num = (s: string) => (s.trim() === '' ? NaN : parseFloat(s))
    const a1n = num(a1())
    const a2n = num(a2())
    const b1n = num(b1())
    const b2n = num(b2())
    if ([a1n, a2n, b1n, b2n].some((v) => !isFinite(v))) return null

    if (mode() === '3d') {
      const a3n = num(a3())
      const b3n = num(b3())
      if ([a3n, b3n].some((v) => !isFinite(v))) return null
      return { dim: 3 as const, data: vector3D([a1n, a2n, a3n] as Vec3, [b1n, b2n, b3n] as Vec3) }
    }
    return { dim: 2 as const, data: vector2D([a1n, a2n] as Vec2, [b1n, b2n] as Vec2) }
  })

  let firstRef: HTMLInputElement | undefined

  onMount(() => {
    firstRef?.focus()
  })

  function vecInputs(prefix: 'a' | 'b', label: string, focusFirst = false) {
    const k1 = `${prefix}1` as const
    const k2 = `${prefix}2` as const
    const k3 = `${prefix}3` as const
    const v1 = prefix === 'a' ? a1 : b1
    const v2 = prefix === 'a' ? a2 : b2
    const v3 = prefix === 'a' ? a3 : b3
    return (
      <div class="flex flex-col gap-3 rounded-md border border-border bg-background/50 p-4">
        <div class="flex items-center gap-2">
          <span aria-hidden class="size-1.5 rounded-full bg-violet" />
          <span class="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <NumberField
            value={v1() || undefined}
            onChange={(v) => setSearchParams({ [k1]: v }, { replace: true })}
            format={false}
            class="flex flex-col gap-1.5"
          >
            <NumberFieldLabel>{prefix}₁</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput
                ref={focusFirst ? firstRef : undefined}
                placeholder="0"
                class="h-10 font-mono text-sm"
              />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>

          <NumberField
            value={v2() || undefined}
            onChange={(v) => setSearchParams({ [k2]: v }, { replace: true })}
            format={false}
            class="flex flex-col gap-1.5"
          >
            <NumberFieldLabel>{prefix}₂</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput placeholder="0" class="h-10 font-mono text-sm" />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>

          <Show when={mode() === '3d'}>
            <NumberField
              value={v3() || undefined}
              onChange={(v) => setSearchParams({ [k3]: v }, { replace: true })}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>{prefix}₃</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="0" class="h-10 font-mono text-sm" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </Show>
        </div>
      </div>
    )
  }

  const rows = createMemo(() => {
    const r = result()
    if (!r) return []
    const d = r.data
    const isThreeD = r.dim === 3
    const crossLabel = isThreeD ? 'A × B' : 'A × B (z-component)'
    const crossVal = isThreeD ? fmtVec(d.cross as number[]) : fmt(d.cross as number)
    return [
      { label: '|A| (magnitude)', value: fmt(d.magA) },
      { label: '|B| (magnitude)', value: fmt(d.magB) },
      { label: 'A + B', value: fmtVec(d.sum as number[]) },
      { label: 'A − B', value: fmtVec(d.diff as number[]) },
      { label: 'A · B (dot product)', value: fmt(d.dot) },
      { label: crossLabel, value: crossVal },
      {
        label: 'Angle between',
        value: isFinite(d.angleDeg) ? `${fmt(d.angleDeg)}° (${fmt(d.angleRad)} rad)` : '-',
      },
      { label: 'proj_B(A)', value: fmtVec(d.projection as number[] | null) },
      { label: 'Â (unit A)', value: fmtVec(d.unitA as number[] | null) },
      { label: 'B̂ (unit B)', value: fmtVec(d.unitB as number[] | null) },
    ]
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Vector calculator"
        description="Magnitude, sum, dot, cross, angle, and projection between two vectors in 2D or 3D."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Dimensions"
            value={mode() || undefined}
            onChange={(v) => setSearchParams({ mode: v }, { replace: true })}
            options={dimOptions}
          />
        </ToolToolbar>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Vectors</h2>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            {vecInputs('a', 'Vector A', true)}
            {vecInputs('b', 'Vector B')}
          </div>
        </section>

        <Show when={result()}>
          {(res) => {
            const r = res()
            const data = r.data
            const a: [number, number] = [parseFloat(a1()), parseFloat(a2())]
            const b: [number, number] = [parseFloat(b1()), parseFloat(b2())]
            const sum: [number, number] = [(data.sum as number[])[0], (data.sum as number[])[1]]
            const proj = data.projection
              ? ([(data.projection as number[])[0], (data.projection as number[])[1]] as [number, number])
              : null
            return (
              <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
                <div class="mb-4 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span aria-hidden class="size-2 rounded-full bg-violet" />
                    <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Figure</h2>
                  </div>
                  <Show when={r.dim === 3}>
                    <span class="text-xs text-muted-foreground">x–y projection (3D mode)</span>
                  </Show>
                </div>
                <div class="anim-fade-in">
                  <VectorFigure a={a} b={b} sum={sum} projection={proj} />
                </div>
              </section>
            )
          }}
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
                Enter both vectors to see all operations
              </div>
            }
          >
            <div class="anim-fade-in overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation</TableHead>
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
