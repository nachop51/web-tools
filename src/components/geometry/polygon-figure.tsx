import { createMemo } from 'solid-js'
import { ShapeCanvas, FigureLabel, type Bounds } from '~/components/geometry/shape-canvas'
import type { PolygonProperties } from '~/lib/utils/geometry/regular-polygon'

/**
 * Regular polygon, drawn to scale, with apothem (inward, dashed) and
 * circumradius (outward to a vertex, dashed) lines and a side highlighted.
 */
export function PolygonFigure(props: { data: PolygonProperties }) {
  const points = createMemo(() => {
    const { sides, circumradius } = props.data
    // Orient with one vertex at top. For odd n, gives a flat-bottom look only sometimes;
    // we'll just use angle = π/2 - π/n offset so the polygon "stands" pleasantly.
    const r = circumradius
    const offset = Math.PI / 2 - Math.PI / sides
    const arr: Array<{ x: number; y: number }> = []
    for (let i = 0; i < sides; i++) {
      const theta = offset + (2 * Math.PI * i) / sides
      arr.push({ x: r * Math.cos(theta), y: r * Math.sin(theta) })
    }
    return arr
  })

  const bounds = createMemo<Bounds>(() => {
    const r = props.data.circumradius
    return { minX: -r, maxX: r, minY: -r, maxY: r }
  })

  const fontSize = createMemo(() => {
    const b = bounds()
    return Math.max(b.maxX - b.minX, b.maxY - b.minY) * 0.045
  })

  const fmt = (n: number) => parseFloat(n.toPrecision(5)).toString()

  return (
    <ShapeCanvas bounds={bounds()} label={`Regular ${props.data.name.toLowerCase()}`}>
      {(() => {
        const fs = fontSize()
        const pts = points()
        const polyStr = pts.map((p) => `${p.x},${p.y}`).join(' ')
        // Pick first edge for the apothem demo
        const v0 = pts[0]
        const v1 = pts[1]
        const mid = { x: (v0.x + v1.x) / 2, y: (v0.y + v1.y) / 2 }

        return (
          <>
            {/* Polygon */}
            <polygon
              points={polyStr}
              class="fill-violet/10 stroke-violet"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            />

            {/* Highlight first side */}
            <line
              x1={v0.x}
              y1={v0.y}
              x2={v1.x}
              y2={v1.y}
              class="stroke-violet"
              stroke-width="3"
              vector-effect="non-scaling-stroke"
            />

            {/* Apothem (center to midpoint of edge) */}
            <line
              x1={0}
              y1={0}
              x2={mid.x}
              y2={mid.y}
              class="stroke-violet/70"
              stroke-width="1.5"
              stroke-dasharray="4 3"
              vector-effect="non-scaling-stroke"
            />

            {/* Circumradius (center to vertex) */}
            <line
              x1={0}
              y1={0}
              x2={v0.x}
              y2={v0.y}
              class="stroke-foreground/40"
              stroke-width="1"
              stroke-dasharray="3 3"
              vector-effect="non-scaling-stroke"
            />

            {/* Center dot */}
            <circle cx={0} cy={0} r={fontSize() * 0.15} class="fill-foreground" />

            {/* Vertex dot */}
            <circle cx={v0.x} cy={v0.y} r={fontSize() * 0.15} class="fill-violet" />

            {/* Labels */}
            <FigureLabel
              x={mid.x * 0.45}
              y={mid.y * 0.45}
              text={`a = ${fmt(props.data.apothem)}`}
              variant="violet"
              fontSize={fs * 0.85}
              weight="semibold"
            />
            <FigureLabel
              x={v0.x * 0.55}
              y={v0.y * 0.55 + fs * 0.4}
              text={`R = ${fmt(props.data.circumradius)}`}
              variant="foreground"
              fontSize={fs * 0.85}
            />
            <FigureLabel
              x={mid.x + (mid.x === 0 ? fs : Math.sign(mid.x) * fs * 1.2)}
              y={mid.y + (mid.y === 0 ? -fs : Math.sign(mid.y) * fs * 1.2)}
              text={`s = ${fmt(props.data.side)}`}
              variant="muted"
              fontSize={fs * 0.85}
            />
          </>
        )
      })()}
    </ShapeCanvas>
  )
}
