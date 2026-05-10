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
import { distance2D, distance3D } from '~/lib/utils/geometry/distance'
import { setToolPageMeta } from '~/lib/seo'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

type DimMode = '2d' | '3d'
const dimOptions: { value: DimMode; label: string }[] = [
  { value: '2d', label: '2D' },
  { value: '3d', label: '3D' },
]

export default function DistanceMidpoint() {
  setToolPageMeta('geometry', 'distance-midpoint')
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string
    ax?: string
    ay?: string
    az?: string
    bx?: string
    by?: string
    bz?: string
  }>()

  const mode = createMemo<DimMode>(() => (searchParams.mode === '3d' ? '3d' : '2d'))

  const get = (k: 'ax' | 'ay' | 'az' | 'bx' | 'by' | 'bz') => createMemo(() => searchParams[k] ?? '')
  const ax = get('ax')
  const ay = get('ay')
  const az = get('az')
  const bx = get('bx')
  const by = get('by')
  const bz = get('bz')

  const result = createMemo(() => {
    const num = (s: string) => (s.trim() === '' ? NaN : parseFloat(s))
    const axN = num(ax())
    const ayN = num(ay())
    const bxN = num(bx())
    const byN = num(by())
    if ([axN, ayN, bxN, byN].some((v) => !isFinite(v))) return null

    if (mode() === '3d') {
      const azN = num(az())
      const bzN = num(bz())
      if ([azN, bzN].some((v) => !isFinite(v))) return null
      const r = distance3D({ x: axN, y: ayN, z: azN }, { x: bxN, y: byN, z: bzN })
      return { dim: 3 as const, r }
    }
    const r = distance2D({ x: axN, y: ayN }, { x: bxN, y: byN })
    return { dim: 2 as const, r }
  })

  let firstRef: HTMLInputElement | undefined

  onMount(() => {
    firstRef?.focus()
  })

  function pointInputs(prefix: 'a' | 'b', label: string, focusFirst: boolean = false) {
    const xKey = `${prefix}x` as const
    const yKey = `${prefix}y` as const
    const zKey = `${prefix}z` as const
    const xVal = prefix === 'a' ? ax : bx
    const yVal = prefix === 'a' ? ay : by
    const zVal = prefix === 'a' ? az : bz
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
            value={xVal() || undefined}
            onChange={(v) => setSearchParams({ [xKey]: v }, { replace: true })}
            format={false}
            class="flex flex-col gap-1.5"
          >
            <NumberFieldLabel>x</NumberFieldLabel>
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
            value={yVal() || undefined}
            onChange={(v) => setSearchParams({ [yKey]: v }, { replace: true })}
            format={false}
            class="flex flex-col gap-1.5"
          >
            <NumberFieldLabel>y</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput placeholder="0" class="h-10 font-mono text-sm" />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>

          <Show when={mode() === '3d'}>
            <NumberField
              value={zVal() || undefined}
              onChange={(v) => setSearchParams({ [zKey]: v }, { replace: true })}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>z</NumberFieldLabel>
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
    const data = result()
    if (!data) return []
    const r = data.r
    const isThreeD = data.dim === 3
    const mid = `(${fmt(r.midpoint.x)}, ${fmt(r.midpoint.y)}${isThreeD ? `, ${fmt((r.midpoint as { z: number }).z)}` : ''})`
    const base = [
      { label: 'Euclidean distance', value: fmt(r.distance) },
      { label: 'Midpoint', value: mid },
      { label: 'Manhattan distance', value: fmt(r.manhattan) },
      { label: 'Δx', value: fmt(r.dx) },
      { label: 'Δy', value: fmt(r.dy) },
    ]
    if (isThreeD) {
      base.push({ label: 'Δz', value: fmt((r as { dz: number }).dz) })
    }
    return base
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Distance & midpoint"
        description="Distance, midpoint, and Manhattan distance between two points in 2D or 3D."
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
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Points</h2>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            {pointInputs('a', 'Point A', true)}
            {pointInputs('b', 'Point B')}
          </div>
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
                Enter both points to see results
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
