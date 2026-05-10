import { createMemo } from 'solid-js'
import { ShapeCanvas, Axes, Arrow, FigureLabel, type Bounds } from '~/components/geometry/shape-canvas'

/**
 * 2D vector figure: A and B as arrows from origin, plus their sum and the
 * projection of A onto B. (3D mode falls back to showing the x/y projection.)
 */
export function VectorFigure(props: {
  a: [number, number]
  b: [number, number]
  sum: [number, number]
  projection: [number, number] | null
}) {
  const bounds = createMemo<Bounds>(() => {
    const xs = [0, props.a[0], props.b[0], props.sum[0]]
    const ys = [0, props.a[1], props.b[1], props.sum[1]]
    if (props.projection) {
      xs.push(props.projection[0])
      ys.push(props.projection[1])
    }
    let minX = Math.min(...xs)
    let maxX = Math.max(...xs)
    let minY = Math.min(...ys)
    let maxY = Math.max(...ys)
    const padX = Math.max((maxX - minX) * 0.25, 1)
    const padY = Math.max((maxY - minY) * 0.25, 1)
    minX -= padX
    maxX += padX
    minY -= padY
    maxY += padY
    // Square aspect
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

  const fmt = (n: number) => parseFloat(n.toPrecision(4)).toString()

  return (
    <ShapeCanvas bounds={bounds()} label="Vectors A and B with their sum and projection">
      <Axes bounds={bounds()} showGrid />
      {(() => {
        const fs = fontSize()
        const a = props.a
        const b = props.b
        const sum = props.sum

        // Parallelogram completion lines (dashed): from a to sum, and from b to sum.
        return (
          <>
            {/* Parallelogram dashed lines */}
            <line
              x1={a[0]}
              y1={a[1]}
              x2={sum[0]}
              y2={sum[1]}
              class="stroke-violet/30"
              stroke-width="1"
              stroke-dasharray="4 3"
              vector-effect="non-scaling-stroke"
            />
            <line
              x1={b[0]}
              y1={b[1]}
              x2={sum[0]}
              y2={sum[1]}
              class="stroke-foreground/30"
              stroke-width="1"
              stroke-dasharray="4 3"
              vector-effect="non-scaling-stroke"
            />

            {/* Sum vector */}
            <Arrow x1={0} y1={0} x2={sum[0]} y2={sum[1]} variant="sum" width={1.5} />
            <FigureLabel
              x={sum[0] / 2 + fontSize() * 0.6}
              y={sum[1] / 2 + fontSize() * 0.6}
              text={`A+B = (${fmt(sum[0])}, ${fmt(sum[1])})`}
              variant="muted"
              fontSize={fs * 0.85}
              align="left"
            />

            {/* Projection of A onto B (dashed, secondary) */}
            {props.projection && (
              <>
                <line
                  x1={a[0]}
                  y1={a[1]}
                  x2={props.projection[0]}
                  y2={props.projection[1]}
                  class="stroke-muted-foreground/40"
                  stroke-width="1"
                  stroke-dasharray="2 2"
                  vector-effect="non-scaling-stroke"
                />
                <Arrow
                  x1={0}
                  y1={0}
                  x2={props.projection[0]}
                  y2={props.projection[1]}
                  variant="muted"
                  dashed
                />
              </>
            )}

            {/* Vector A (primary, violet) */}
            <Arrow x1={0} y1={0} x2={a[0]} y2={a[1]} variant="a" width={2} />
            <FigureLabel
              x={a[0] + fs * 0.4}
              y={a[1] + fs * 0.4}
              text={`A (${fmt(a[0])}, ${fmt(a[1])})`}
              variant="violet"
              fontSize={fs}
              align="left"
              weight="semibold"
            />

            {/* Vector B (secondary, foreground) */}
            <Arrow x1={0} y1={0} x2={b[0]} y2={b[1]} variant="b" width={2} />
            <FigureLabel
              x={b[0] + fs * 0.4}
              y={b[1] - fs * 0.6}
              text={`B (${fmt(b[0])}, ${fmt(b[1])})`}
              variant="foreground"
              fontSize={fs}
              align="left"
              weight="semibold"
            />
          </>
        )
      })()}
    </ShapeCanvas>
  )
}
