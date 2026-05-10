import { createMemo, createSignal, For, Show, onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { parseVertices, shoelace } from '~/lib/utils/geometry/shoelace'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

const DEFAULT_TEXT = '0, 0\n4, 0\n4, 3\n0, 3'

export default function ShoelaceTool() {
  setToolPageMeta('geometry', 'shoelace')
  const [searchParams, setSearchParams] = useSearchParams<{ t?: string }>()

  const initial = (searchParams.t as string | undefined) ?? DEFAULT_TEXT
  const [text, setTextSignal] = createSignal(initial)

  function setText(v: string) {
    setTextSignal(v)
    setSearchParams({ t: urlText(v) }, { replace: true })
  }

  const parsed = createMemo(() => parseVertices(text()))
  const result = createMemo(() => shoelace(parsed().vertices))

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  // SVG preview viewBox
  const viewBox = createMemo(() => {
    const r = result()
    if (!r) return null
    const pad = Math.max(r.bbox.width, r.bbox.height) * 0.1 || 1
    const x = r.bbox.minX - pad
    const y = r.bbox.minY - pad
    const w = r.bbox.width + pad * 2 || 1
    const h = r.bbox.height + pad * 2 || 1
    return { x, y, w, h }
  })

  const polygonPoints = createMemo(() => {
    const verts = parsed().vertices
    if (verts.length < 3) return ''
    return verts.map((v) => `${v.x},${-v.y}`).join(' ')
  })

  const rows = createMemo(() => {
    const r = result()
    if (!r) return []
    return [
      { label: 'Signed area', value: fmt(r.signedArea), hint: r.orientation === 'ccw' ? '+ counter-clockwise' : r.orientation === 'cw' ? '− clockwise' : 'degenerate' },
      { label: 'Area', value: fmt(r.area) },
      { label: 'Perimeter', value: fmt(r.perimeter) },
      { label: 'Centroid', value: `(${fmt(r.centroid.x)}, ${fmt(r.centroid.y)})` },
      {
        label: 'Bounding box',
        value: `[${fmt(r.bbox.minX)}, ${fmt(r.bbox.minY)}] → [${fmt(r.bbox.maxX)}, ${fmt(r.bbox.maxY)}]`,
      },
      { label: 'Width × Height', value: `${fmt(r.bbox.width)} × ${fmt(r.bbox.height)}` },
      { label: 'Vertices', value: String(r.count) },
    ]
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Polygon area (shoelace)"
        description="Compute area, centroid, perimeter, and orientation of any simple polygon from its vertices."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <div class="grid gap-6 md:grid-cols-2">
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Vertices</h2>
              </div>
              <span class="text-xs text-muted-foreground">one per line — "x, y" or "x y"</span>
            </div>

            <TextField value={text()} onChange={setText} class="flex flex-col gap-2">
              <TextFieldTextArea
                ref={inputRef}
                rows={10}
                class="min-h-[14rem] font-mono text-sm resize-y"
                placeholder={'0, 0\n4, 0\n4, 3\n0, 3'}
              />
            </TextField>

            <Show when={parsed().bad.length > 0}>
              <div class="anim-fade-in mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Could not parse line{parsed().bad.length === 1 ? '' : 's'} {parsed().bad.join(', ')}
              </div>
            </Show>

            <div class="mt-4 overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-12">#</TableHead>
                    <TableHead>x</TableHead>
                    <TableHead>y</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <For
                    each={parsed().vertices}
                    fallback={
                      <TableRow>
                        <TableCell colspan={3} class="text-center text-muted-foreground">
                          No vertices yet
                        </TableCell>
                      </TableRow>
                    }
                  >
                    {(v, i) => (
                      <TableRow>
                        <TableCell class="text-muted-foreground">{i() + 1}</TableCell>
                        <TableCell>{fmt(v.x)}</TableCell>
                        <TableCell>{fmt(v.y)}</TableCell>
                      </TableRow>
                    )}
                  </For>
                </TableBody>
              </Table>
            </div>
          </section>

          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preview</h2>
            </div>

            <Show
              when={result() && viewBox()}
              fallback={
                <div class="flex min-h-[14rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Need at least 3 vertices for a polygon
                </div>
              }
            >
              {(_) => {
                const vb = viewBox()!
                const r = result()!
                return (
                  <div class="anim-fade-in flex h-[14rem] items-center justify-center rounded-md border border-border bg-background/40 p-2">
                    <svg
                      viewBox={`${vb.x} ${-vb.y - vb.h} ${vb.w} ${vb.h}`}
                      class="h-full w-full"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <polygon
                        points={polygonPoints()}
                        class="fill-violet/20 stroke-violet stroke-[0.5%]"
                        vector-effect="non-scaling-stroke"
                      />
                      <For each={parsed().vertices}>
                        {(v) => (
                          <circle cx={v.x} cy={-v.y} r={Math.max(vb.w, vb.h) * 0.012} class="fill-violet" />
                        )}
                      </For>
                      <circle
                        cx={r.centroid.x}
                        cy={-r.centroid.y}
                        r={Math.max(vb.w, vb.h) * 0.018}
                        class="fill-foreground"
                      />
                    </svg>
                  </div>
                )
              }}
            </Show>
          </section>
        </div>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Results</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter at least 3 vertices to compute
              </div>
            }
          >
            <div class="anim-fade-in overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead class="w-16 text-right">Copy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <For each={rows()}>
                    {(row) => (
                      <TableRow>
                        <TableCell class="font-sans font-medium">{row.label}</TableCell>
                        <TableCell class="font-semibold">{row.value}</TableCell>
                        <TableCell class="text-muted-foreground">{row.hint ?? ''}</TableCell>
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
