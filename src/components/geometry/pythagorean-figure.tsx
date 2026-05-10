import { createMemo } from 'solid-js'
import { ShapeCanvas, FigureLabel, type Bounds } from '~/components/geometry/shape-canvas'
import type { RightTriangleResult } from '~/lib/utils/geometry/triangle'

/**
 * Visual proof of the Pythagorean theorem: right triangle with a square
 * drawn on each side. Square areas correspond to a², b², c².
 */
export function PythagoreanFigure(props: { data: RightTriangleResult }) {
  const params = createMemo(() => {
    const a0 = props.data.a
    const b0 = props.data.b
    const longest = Math.max(a0, b0, 1)
    // Normalize so the longer leg is 6 user units; figures of any input size look the same.
    const k = 6 / longest
    const a = a0 * k
    const b = b0 * k
    return { a, b }
  })

  const bounds = createMemo<Bounds>(() => {
    const { a, b } = params()
    const len = Math.hypot(b, a)
    const nx = a / len
    const ny = b / len
    // c-square outermost corners
    const sq4 = { x: b + nx * b, y: ny * b }
    const sq5 = { x: nx * a, y: a + ny * a }
    const xs = [-a, 0, b, sq4.x, sq5.x]
    const ys = [-b, 0, a, sq4.y, sq5.y]
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    }
  })

  const fontSize = createMemo(() => {
    const b = bounds()
    const span = Math.max(b.maxX - b.minX, b.maxY - b.minY)
    return span * 0.04 // 4% of span
  })

  const fmt = (n: number) => parseFloat(n.toPrecision(6)).toString()

  return (
    <ShapeCanvas bounds={bounds()} label="Pythagorean theorem visual proof">
      {(() => {
        const { a, b } = params()
        const sqA = `0,0 0,${a} ${-a},${a} ${-a},0`
        const sqB = `0,0 ${b},0 ${b},${-b} 0,${-b}`
        const len = Math.hypot(b, a)
        const nx = a / len
        const ny = b / len
        const cP1 = { x: b, y: 0 }
        const cP2 = { x: 0, y: a }
        const cP3 = { x: nx * a, y: a + ny * a }
        const cP4 = { x: b + nx * b, y: ny * b }
        const sqC = `${cP1.x},${cP1.y} ${cP2.x},${cP2.y} ${cP3.x},${cP3.y} ${cP4.x},${cP4.y}`
        const fs = fontSize()

        // Right-angle marker dimensions
        const ra = Math.min(b, a) * 0.12

        return (
          <>
            {/* a² square */}
            <polygon points={sqA} class="fill-violet/10 stroke-violet/40" stroke-width="1" vector-effect="non-scaling-stroke" />
            <FigureLabel
              x={-a / 2}
              y={a / 2}
              text={`a² = ${fmt(props.data.a * props.data.a)}`}
              variant="muted"
              fontSize={fs}
            />

            {/* b² square */}
            <polygon points={sqB} class="fill-violet/10 stroke-violet/40" stroke-width="1" vector-effect="non-scaling-stroke" />
            <FigureLabel
              x={b / 2}
              y={-b / 2}
              text={`b² = ${fmt(props.data.b * props.data.b)}`}
              variant="muted"
              fontSize={fs}
            />

            {/* c² square */}
            <polygon points={sqC} class="fill-violet/20 stroke-violet" stroke-width="1.5" vector-effect="non-scaling-stroke" />
            <FigureLabel
              x={(cP1.x + cP3.x) / 2}
              y={(cP1.y + cP3.y) / 2}
              text={`c² = ${fmt(props.data.c * props.data.c)}`}
              variant="violet"
              fontSize={fs}
              weight="semibold"
            />

            {/* Triangle on top */}
            <polygon
              points={`0,0 ${b},0 0,${a}`}
              class="fill-card stroke-violet"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            />

            {/* Right-angle marker */}
            <polygon
              points={`0,0 ${ra},0 ${ra},${ra} 0,${ra}`}
              class="fill-none stroke-violet"
              stroke-width="1"
              vector-effect="non-scaling-stroke"
            />
          </>
        )
      })()}
    </ShapeCanvas>
  )
}
