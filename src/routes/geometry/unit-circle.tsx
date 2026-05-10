import { createMemo, createSignal, For, Show, onMount, onCleanup } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { unitCirclePoints, findPoint, type UnitCirclePoint } from '~/lib/utils/geometry/unit-circle'
import { setToolPageMeta } from '~/lib/seo'

const SVG = 480
const R = 180
const CENTER = SVG / 2
const SNAP_DEG = 3 // snap to standard angle when within 3°

function fmtDecimal(n: number): string {
  if (!isFinite(n)) return '±∞'
  if (n === 0) return '0'
  return parseFloat(n.toPrecision(8)).toString()
}

function quadrantLabel(q: number): string {
  if (q === 0) return 'on axis'
  return `Quadrant ${q}`
}

function quadrantOf(deg: number): 0 | 1 | 2 | 3 | 4 {
  const d = ((deg % 360) + 360) % 360
  if (d === 0 || d === 90 || d === 180 || d === 270) return 0
  if (d < 90) return 1
  if (d < 180) return 2
  if (d < 270) return 3
  return 4
}

function nearestStandard(deg: number): UnitCirclePoint | null {
  let best: UnitCirclePoint | null = null
  let bestDist = Infinity
  const norm = ((deg % 360) + 360) % 360
  for (const p of unitCirclePoints) {
    const d = Math.min(Math.abs(p.deg - norm), 360 - Math.abs(p.deg - norm))
    if (d < bestDist) {
      bestDist = d
      best = p
    }
  }
  return best
}

type Resolved =
  | { kind: 'standard'; point: UnitCirclePoint; deg: number }
  | { kind: 'free'; deg: number; rad: number; cos: number; sin: number; tan: number; quadrant: 0 | 1 | 2 | 3 | 4; nearest: UnitCirclePoint | null }

function resolveAngle(deg: number): Resolved {
  const norm = ((deg % 360) + 360) % 360
  const near = nearestStandard(norm)
  if (near) {
    const d = Math.min(Math.abs(near.deg - norm), 360 - Math.abs(near.deg - norm))
    if (d <= SNAP_DEG) return { kind: 'standard', point: near, deg: near.deg }
  }
  const rad = (norm * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const tan = Math.cos(rad) === 0 ? Infinity : Math.tan(rad)
  return {
    kind: 'free',
    deg: norm,
    rad,
    cos: Math.abs(cos) < 1e-12 ? 0 : cos,
    sin: Math.abs(sin) < 1e-12 ? 0 : sin,
    tan: Math.abs(tan) < 1e-12 ? 0 : tan,
    quadrant: quadrantOf(norm),
    nearest: near,
  }
}

export default function UnitCircle() {
  setToolPageMeta('geometry', 'unit-circle')
  const [searchParams, setSearchParams] = useSearchParams<{ angle?: string }>()

  let svgRef: SVGSVGElement | undefined

  const angle = createMemo<number>(() => {
    const raw = searchParams.angle
    if (raw === undefined || raw === '') return 30
    const v = parseFloat(raw)
    if (!Number.isFinite(v)) return 30
    return ((v % 360) + 360) % 360
  })

  const resolved = createMemo<Resolved>(() => resolveAngle(angle()))

  function setAngle(deg: number) {
    const norm = ((deg % 360) + 360) % 360
    // Round to one decimal in URL to keep it tidy
    const display = Math.abs(norm - Math.round(norm)) < 1e-9 ? String(Math.round(norm)) : norm.toFixed(1)
    setSearchParams({ angle: display }, { replace: true })
  }

  function angleFromPointer(clientX: number, clientY: number): number | null {
    if (!svgRef) return null
    const pt = svgRef.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svgRef.getScreenCTM()
    if (!ctm) return null
    const local = pt.matrixTransform(ctm.inverse())
    const dx = local.x - CENTER
    const dy = CENTER - local.y // flip y so up is positive
    if (dx === 0 && dy === 0) return null
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI
    if (deg < 0) deg += 360
    // snap if close to standard
    const near = nearestStandard(deg)
    if (near) {
      const d = Math.min(Math.abs(near.deg - deg), 360 - Math.abs(near.deg - deg))
      if (d <= SNAP_DEG) return near.deg
    }
    return deg
  }

  const [dragging, setDragging] = createSignal(false)

  function applyPointer(e: PointerEvent) {
    const deg = angleFromPointer(e.clientX, e.clientY)
    if (deg === null) return
    setAngle(deg)
  }

  function onPointerDown(e: PointerEvent) {
    e.preventDefault()
    setDragging(true)
    applyPointer(e)
    svgRef?.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging()) return
    applyPointer(e)
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragging()) return
    setDragging(false)
    try {
      svgRef?.releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    const step = e.shiftKey ? 1 : 5
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      setAngle(angle() - step)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      setAngle(angle() + step)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setAngle(0)
    }
  }

  onMount(() => {
    if (!searchParams.angle) setAngle(30)
  })

  onCleanup(() => setDragging(false))

  // Indicator point on the rim
  const handle = createMemo(() => {
    const deg = angle()
    const rad = (deg * Math.PI) / 180
    return {
      x: CENTER + R * Math.cos(rad),
      y: CENTER - R * Math.sin(rad),
    }
  })

  // Selected fields for the table
  const display = createMemo(() => {
    const r = resolved()
    if (r.kind === 'standard') {
      const p = r.point
      return {
        deg: p.deg,
        radLabel: p.radLabel,
        rad: (p.deg * Math.PI) / 180,
        cos: p.cos,
        sin: p.sin,
        tan: p.tan,
        cosExact: p.cosExact,
        sinExact: p.sinExact,
        tanExact: p.tanExact,
        quadrant: p.quadrant,
        snapped: true as const,
      }
    }
    return {
      deg: r.deg,
      radLabel: null,
      rad: r.rad,
      cos: r.cos,
      sin: r.sin,
      tan: r.tan,
      cosExact: null,
      sinExact: null,
      tanExact: null,
      quadrant: r.quadrant,
      snapped: false as const,
    }
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Unit circle"
        description="Click or drag anywhere on the circle. Snaps to standard angles within 3°; shows live decimals otherwise."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <div class="grid gap-6 lg:grid-cols-[auto,1fr]">
          {/* SVG */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Click or drag
                </h2>
              </div>
              <span class="text-xs text-muted-foreground">← → adjust · ⇧ for fine</span>
            </div>

            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG} ${SVG}`}
              width={SVG}
              height={SVG}
              class="mx-auto block max-w-full touch-none select-none cursor-crosshair"
              role="slider"
              tabindex="0"
              aria-label="Unit circle angle picker"
              aria-valuemin="0"
              aria-valuemax="360"
              aria-valuenow={Math.round(angle())}
              aria-valuetext={`${angle().toFixed(1)} degrees`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
            >
              {/* generous transparent hit area for clicking off the rim too */}
              <rect x="0" y="0" width={SVG} height={SVG} class="fill-transparent" />

              {/* axes */}
              <line
                x1={CENTER - R - 30}
                y1={CENTER}
                x2={CENTER + R + 30}
                y2={CENTER}
                class="stroke-border"
                stroke-width="1"
              />
              <line
                x1={CENTER}
                y1={CENTER - R - 30}
                x2={CENTER}
                y2={CENTER + R + 30}
                class="stroke-border"
                stroke-width="1"
              />

              {/* circle */}
              <circle cx={CENTER} cy={CENTER} r={R} class="fill-none stroke-violet/40" stroke-width="1.5" />

              {/* axis labels */}
              <text x={CENTER + R + 18} y={CENTER + 4} class="fill-muted-foreground font-mono text-[11px]">
                x
              </text>
              <text x={CENTER + 6} y={CENTER - R - 16} class="fill-muted-foreground font-mono text-[11px]">
                y
              </text>

              {/* standard-angle reference dots & labels */}
              <For each={unitCirclePoints}>
                {(p) => {
                  const x = CENTER + R * p.cos
                  const y = CENTER - R * p.sin
                  const labelR = R + 26
                  const lx = CENTER + labelR * p.cos
                  const ly = CENTER - labelR * p.sin
                  const isActive = createMemo(
                    () => display().snapped && display().deg === p.deg
                  )
                  return (
                    <>
                      <circle
                        cx={x}
                        cy={y}
                        r={isActive() ? 5 : 3}
                        class={
                          isActive()
                            ? 'fill-violet stroke-violet pointer-events-none'
                            : 'fill-background stroke-violet/60 pointer-events-none'
                        }
                        stroke-width="1.5"
                      />
                      <text
                        x={lx}
                        y={ly + 4}
                        text-anchor="middle"
                        class={
                          isActive()
                            ? 'fill-violet font-mono text-[11px] font-semibold pointer-events-none'
                            : 'fill-muted-foreground font-mono text-[11px] pointer-events-none'
                        }
                      >
                        {p.deg}°
                      </text>
                    </>
                  )
                }}
              </For>

              {/* radial line + drag handle (always visible, follows the angle) */}
              <line
                x1={CENTER}
                y1={CENTER}
                x2={handle().x}
                y2={handle().y}
                class="stroke-violet pointer-events-none"
                stroke-width="2"
              />
              {/* projected (cos, sin) guide lines */}
              <line
                x1={handle().x}
                y1={handle().y}
                x2={handle().x}
                y2={CENTER}
                class="stroke-violet/30 pointer-events-none"
                stroke-width="1"
                stroke-dasharray="3 3"
              />
              <line
                x1={handle().x}
                y1={handle().y}
                x2={CENTER}
                y2={handle().y}
                class="stroke-violet/30 pointer-events-none"
                stroke-width="1"
                stroke-dasharray="3 3"
              />
              <circle
                cx={handle().x}
                cy={handle().y}
                r={dragging() ? 11 : 9}
                class="fill-violet stroke-background pointer-events-none transition-[r] duration-100"
                stroke-width="3"
              />
            </svg>
          </section>

          {/* Selected info */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Selected angle</h2>
            </div>

            {(() => {
              const d = display()
              const degLabel = d.snapped
                ? `${d.deg}°`
                : `${parseFloat(d.deg.toFixed(2))}°`
              const radSecondary = d.snapped ? d.radLabel : `${parseFloat(d.rad.toFixed(4))} rad`
              const coordExact = d.snapped ? `(${d.cosExact}, ${d.sinExact})` : null
              const coordDec = `(${fmtDecimal(d.cos)}, ${fmtDecimal(d.sin)})`
              return (
                <div class="flex flex-col gap-4">
                  <div class="anim-fade-in flex flex-wrap items-baseline gap-3">
                    <span class="font-mono text-5xl font-bold tracking-tight text-violet tabular-nums">
                      {degLabel}
                    </span>
                    <span class="font-mono text-xl text-muted-foreground">/ {radSecondary}</span>
                    <span class="ml-auto rounded-md border border-violet/40 bg-violet/10 px-2 py-1 text-xs font-medium text-violet">
                      {quadrantLabel(d.quadrant)}
                    </span>
                  </div>

                  <Show when={!d.snapped}>
                    <p class="text-xs text-muted-foreground">
                      Free angle — release within 3° of a standard angle to snap.
                    </p>
                  </Show>

                  <div class="overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Exact</TableHead>
                          <TableHead>Decimal</TableHead>
                          <TableHead class="w-16 text-right">Copy</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell class="font-sans font-medium">(cos θ, sin θ)</TableCell>
                          <TableCell class="font-semibold">
                            <Show when={coordExact} fallback={<span class="text-muted-foreground">—</span>}>
                              {coordExact}
                            </Show>
                          </TableCell>
                          <TableCell class="tabular-nums">{coordDec}</TableCell>
                          <TableCell class="text-right">
                            <CopyButton value={coordDec} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell class="font-sans font-medium">cos θ</TableCell>
                          <TableCell class="font-semibold">
                            <Show when={d.cosExact} fallback={<span class="text-muted-foreground">—</span>}>
                              {d.cosExact}
                            </Show>
                          </TableCell>
                          <TableCell class="tabular-nums">{fmtDecimal(d.cos)}</TableCell>
                          <TableCell class="text-right">
                            <CopyButton value={fmtDecimal(d.cos)} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell class="font-sans font-medium">sin θ</TableCell>
                          <TableCell class="font-semibold">
                            <Show when={d.sinExact} fallback={<span class="text-muted-foreground">—</span>}>
                              {d.sinExact}
                            </Show>
                          </TableCell>
                          <TableCell class="tabular-nums">{fmtDecimal(d.sin)}</TableCell>
                          <TableCell class="text-right">
                            <CopyButton value={fmtDecimal(d.sin)} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell class="font-sans font-medium">tan θ</TableCell>
                          <TableCell class="font-semibold">
                            <Show when={d.tanExact} fallback={<span class="text-muted-foreground">—</span>}>
                              {d.tanExact}
                            </Show>
                          </TableCell>
                          <TableCell class="tabular-nums">{fmtDecimal(d.tan)}</TableCell>
                          <TableCell class="text-right">
                            <CopyButton value={fmtDecimal(d.tan)} />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )
            })()}
          </section>
        </div>
      </div>
    </main>
  )
}
