import { createMemo } from 'solid-js'
import { ShapeCanvas, Axes, FigureLabel, type Bounds } from '~/components/geometry/shape-canvas'
import type { LineResult } from '~/lib/utils/geometry/slope'

/**
 * Coordinate-plane figure for the slope/line tool.
 * - Auto-fits bounds to include both intercepts (or the reference point + slope triangle).
 * - Draws the line, x and y intercepts, and a rise/run slope triangle.
 */
export function SlopeFigure(props: { data: LineResult }) {
  const bounds = createMemo<Bounds>(() => {
    const r = props.data
    if (r.vertical) {
      const x = r.x0
      // Vertical line: show ±5 around x
      return { minX: x - 5, maxX: x + 5, minY: -5, maxY: 5 }
    }
    // Collect interesting x's: 0, x-intercept, reference x; y's similarly
    const xs = [0, r.x0]
    const ys = [0, r.y0, r.yIntercept]
    if (!r.horizontal && isFinite(r.xIntercept)) xs.push(r.xIntercept)
    // Ensure non-degenerate range
    let minX = Math.min(...xs)
    let maxX = Math.max(...xs)
    let minY = Math.min(...ys)
    let maxY = Math.max(...ys)
    // Pad
    const padX = Math.max((maxX - minX) * 0.5, 3)
    const padY = Math.max((maxY - minY) * 0.5, 3)
    minX -= padX
    maxX += padX
    minY -= padY
    maxY += padY
    // Force square aspect
    const w = maxX - minX
    const h = maxY - minY
    if (w > h) {
      const d = (w - h) / 2
      minY -= d
      maxY += d
    } else {
      const d = (h - w) / 2
      minX -= d
      maxX += d
    }
    return { minX, maxX, minY, maxY }
  })

  const fontSize = createMemo(() => {
    const b = bounds()
    return Math.max(b.maxX - b.minX, b.maxY - b.minY) * 0.035
  })

  const fmt = (n: number) => parseFloat(n.toPrecision(6)).toString()

  return (
    <ShapeCanvas bounds={bounds()} label="Line on a coordinate plane">
      <Axes bounds={bounds()} showGrid />
      {(() => {
        const r = props.data
        const b = bounds()
        const fs = fontSize()
        const span = Math.max(b.maxX - b.minX, b.maxY - b.minY)
        const dotR = span * 0.012

        if (r.vertical) {
          return (
            <>
              <line
                x1={r.x0}
                y1={b.minY}
                x2={r.x0}
                y2={b.maxY}
                class="stroke-violet"
                stroke-width="2"
                vector-effect="non-scaling-stroke"
              />
              <circle cx={r.x0} cy={0} r={dotR * 1.5} class="fill-violet" />
              <FigureLabel
                x={r.x0 + span * 0.04}
                y={span * 0.04}
                text={`x = ${fmt(r.x0)}`}
                variant="violet"
                fontSize={fs}
                align="left"
                weight="semibold"
              />
            </>
          )
        }

        // Compute line endpoints clipped to bounds
        const m = r.slope
        const yAtMin = m * b.minX + r.yIntercept
        const yAtMax = m * b.maxX + r.yIntercept
        const x1 = b.minX
        const y1 = yAtMin
        const x2 = b.maxX
        const y2 = yAtMax

        // Slope triangle (rise/run): show 1 unit of run from x=0 (or close)
        const runStartX = 0
        const runEndX = 1
        const runY = r.yIntercept
        const riseEndY = m * runEndX + r.yIntercept

        return (
          <>
            {/* Line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              class="stroke-violet"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            />

            {/* Slope triangle (only when slope is finite & non-zero) */}
            {!r.horizontal && (
              <>
                <line
                  x1={runStartX}
                  y1={runY}
                  x2={runEndX}
                  y2={runY}
                  class="stroke-violet/60"
                  stroke-width="1.5"
                  stroke-dasharray="3 3"
                  vector-effect="non-scaling-stroke"
                />
                <line
                  x1={runEndX}
                  y1={runY}
                  x2={runEndX}
                  y2={riseEndY}
                  class="stroke-violet/60"
                  stroke-width="1.5"
                  stroke-dasharray="3 3"
                  vector-effect="non-scaling-stroke"
                />
                <FigureLabel
                  x={(runStartX + runEndX) / 2}
                  y={runY - fs * 0.7}
                  text="run = 1"
                  variant="muted"
                  fontSize={fs * 0.85}
                />
                <FigureLabel
                  x={runEndX + span * 0.015}
                  y={(runY + riseEndY) / 2}
                  text={`rise = ${fmt(m)}`}
                  variant="muted"
                  fontSize={fs * 0.85}
                  align="left"
                />
              </>
            )}

            {/* y-intercept */}
            {isFinite(r.yIntercept) && (
              <>
                <circle cx={0} cy={r.yIntercept} r={dotR} class="fill-violet" />
                <FigureLabel
                  x={span * 0.025}
                  y={r.yIntercept + span * 0.025}
                  text={`(0, ${fmt(r.yIntercept)})`}
                  variant="violet"
                  fontSize={fs}
                  align="left"
                  weight="semibold"
                />
              </>
            )}

            {/* x-intercept (only if distinct from y-intercept and finite) */}
            {!r.horizontal && isFinite(r.xIntercept) && Math.abs(r.xIntercept) > 1e-9 && (
              <>
                <circle cx={r.xIntercept} cy={0} r={dotR} class="fill-violet" />
                <FigureLabel
                  x={r.xIntercept + span * 0.025}
                  y={-span * 0.04}
                  text={`(${fmt(r.xIntercept)}, 0)`}
                  variant="violet"
                  fontSize={fs}
                  align="left"
                  weight="semibold"
                />
              </>
            )}
          </>
        )
      })()}
    </ShapeCanvas>
  )
}
