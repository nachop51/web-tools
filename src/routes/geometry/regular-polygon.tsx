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
  regularPolygon,
  type PolygonInput,
  type PolygonProperties,
} from '~/lib/utils/geometry/regular-polygon'
import { setToolPageMeta } from '~/lib/seo'
import { PolygonFigure } from '~/components/geometry/polygon-figure'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

const inputOptions: { value: PolygonInput; label: string }[] = [
  { value: 'side', label: 'Side length' },
  { value: 'apothem', label: 'Apothem' },
  { value: 'circumradius', label: 'Circumradius' },
]

type Row = { label: string; value: (p: PolygonProperties) => string }

const rows: Row[] = [
  { label: 'Side length', value: (p) => fmt(p.side) },
  { label: 'Apothem (inradius)', value: (p) => fmt(p.apothem) },
  { label: 'Circumradius', value: (p) => fmt(p.circumradius) },
  { label: 'Perimeter', value: (p) => fmt(p.perimeter) },
  { label: 'Area', value: (p) => fmt(p.area) },
  { label: 'Interior angle', value: (p) => `${fmt(p.interiorAngle)}°` },
  { label: 'Central angle', value: (p) => `${fmt(p.centralAngle)}°` },
  { label: 'Sum of interior angles', value: (p) => `${fmt(p.interiorAngleSum)}°` },
]

export default function RegularPolygonCalculator() {
  setToolPageMeta('geometry', 'regular-polygon')
  const [searchParams, setSearchParams] = useSearchParams<{ n?: string; mode?: string; v?: string }>()

  const n = createMemo(() => {
    const raw = searchParams.n ?? '6'
    const parsed = parseInt(raw, 10)
    if (!Number.isFinite(parsed)) return 6
    return parsed
  })

  const mode = createMemo<PolygonInput>(() => {
    const m = searchParams.mode
    if (m === 'apothem' || m === 'circumradius') return m
    return 'side'
  })

  const raw = createMemo(() => searchParams.v ?? '')

  const result = createMemo<PolygonProperties | null>(() => {
    const v = parseFloat(raw())
    if (!isFinite(v) || raw().trim() === '' || v <= 0) return null
    if (n() < 3) return null
    try {
      return regularPolygon(n(), mode(), v)
    } catch {
      return null
    }
  })

  let nRef: HTMLInputElement | undefined

  onMount(() => {
    nRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Regular polygon"
        description="Compute every property of a regular n-gon from any one length: side, apothem, or circumradius."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Known"
            value={mode() || undefined}
            onChange={(v) => setSearchParams({ mode: v, v: '' }, { replace: true })}
            options={inputOptions}
          />
          <div class="ml-auto" />
          <Show when={result()}>
            <span class="rounded-md border border-violet/40 bg-violet/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet">
              {result()!.name}
            </span>
          </Show>
        </ToolToolbar>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Inputs</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <NumberField
              value={String(n())}
              onChange={(v) => setSearchParams({ n: v }, { replace: true })}
              minValue={3}
              maxValue={1000}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>Number of sides (n ≥ 3)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={nRef} placeholder="6" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField
              value={raw() || undefined}
              onChange={(v) => setSearchParams({ v }, { replace: true })}
              minValue={0}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>{inputOptions.find((o) => o.value === mode())!.label}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="Enter value" class="h-12 font-mono text-base" />
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
                <PolygonFigure data={res()} />
              </div>
            </section>
          )}
        </Show>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Properties</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter the number of sides and a length to see properties
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
                    <For each={rows}>
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
