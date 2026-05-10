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
import { solveSolid, type SolidResult, type SolidShape } from '~/lib/utils/geometry/cylinder'
import { setToolPageMeta } from '~/lib/seo'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

const shapeOptions: { value: SolidShape; label: string }[] = [
  { value: 'cylinder', label: 'Cylinder' },
  { value: 'cone', label: 'Cone' },
  { value: 'frustum', label: 'Frustum' },
]

type Row = { label: string; value: (r: SolidResult) => string; show?: (r: SolidResult) => boolean }

const rows: Row[] = [
  { label: 'Volume', value: (r) => fmt(r.volume) },
  { label: 'Lateral surface area', value: (r) => fmt(r.lateralArea) },
  { label: 'Total surface area', value: (r) => fmt(r.totalArea) },
  { label: 'Slant height', value: (r) => fmt(r.slantHeight ?? NaN), show: (r) => r.slantHeight !== null },
]

export default function CylinderCalculator() {
  setToolPageMeta('geometry', 'cylinder')
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string
    r?: string
    r1?: string
    r2?: string
    h?: string
  }>()

  const mode = createMemo<SolidShape>(() => {
    const m = searchParams.mode
    if (m === 'cone' || m === 'frustum') return m
    return 'cylinder'
  })

  const rRaw = createMemo(() => searchParams.r ?? '')
  const r1Raw = createMemo(() => searchParams.r1 ?? '')
  const r2Raw = createMemo(() => searchParams.r2 ?? '')
  const hRaw = createMemo(() => searchParams.h ?? '')

  const result = createMemo<SolidResult | null>(() => {
    const h = parseFloat(hRaw())
    if (!isFinite(h) || hRaw().trim() === '' || h < 0) return null

    if (mode() === 'frustum') {
      const r1 = parseFloat(r1Raw())
      const r2 = parseFloat(r2Raw())
      if (!isFinite(r1) || !isFinite(r2) || r1Raw().trim() === '' || r2Raw().trim() === '') return null
      if (r1 < 0 || r2 < 0) return null
      return solveSolid('frustum', { r1, r2, h })
    }

    const r = parseFloat(rRaw())
    if (!isFinite(r) || rRaw().trim() === '' || r < 0) return null
    return solveSolid(mode(), { r, h })
  })

  let firstInputRef: HTMLInputElement | undefined

  onMount(() => {
    firstInputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Cylinder, cone & frustum"
        description="Solve volume, lateral surface, and total surface for a cylinder, cone, or truncated cone."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Shape"
            value={mode() || undefined}
            onChange={(v) => setSearchParams({ mode: v, r: '', r1: '', r2: '', h: '' }, { replace: true })}
            options={shapeOptions}
          />
        </ToolToolbar>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Dimensions</h2>
          </div>

          <Show when={mode() !== 'frustum'}>
            <div class="grid gap-4 sm:grid-cols-2">
              <NumberField
                value={rRaw() || undefined}
                onChange={(v) => setSearchParams({ r: v }, { replace: true })}
                minValue={0}
                format={false}
                class="flex flex-col gap-1.5"
              >
                <NumberFieldLabel>Radius (r)</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput ref={firstInputRef} placeholder="Enter radius" class="h-12 font-mono text-base" />
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
                <NumberFieldLabel>Height (h)</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter height" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </Show>

          <Show when={mode() === 'frustum'}>
            <div class="grid gap-4 sm:grid-cols-3">
              <NumberField
                value={r1Raw() || undefined}
                onChange={(v) => setSearchParams({ r1: v }, { replace: true })}
                minValue={0}
                format={false}
                class="flex flex-col gap-1.5"
              >
                <NumberFieldLabel>Bottom radius (r₁)</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput ref={firstInputRef} placeholder="Enter r₁" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>

              <NumberField
                value={r2Raw() || undefined}
                onChange={(v) => setSearchParams({ r2: v }, { replace: true })}
                minValue={0}
                format={false}
                class="flex flex-col gap-1.5"
              >
                <NumberFieldLabel>Top radius (r₂)</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter r₂" class="h-12 font-mono text-base" />
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
                <NumberFieldLabel>Height (h)</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter height" class="h-12 font-mono text-base" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
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
                Enter dimensions to compute properties
              </div>
            }
          >
            {(res) => (
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
                    <For each={rows.filter((r) => !r.show || r.show(res()))}>
                      {(row) => {
                        const v = () => row.value(res())
                        return (
                          <TableRow>
                            <TableCell class="font-sans font-medium">{row.label}</TableCell>
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
