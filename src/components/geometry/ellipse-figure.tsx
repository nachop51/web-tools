import { createMemo } from 'solid-js'
import { ShapeCanvas, FigureLabel, type Bounds } from '~/components/geometry/shape-canvas'
import type { EllipseResult } from '~/lib/utils/geometry/ellipse'

/**
 * Ellipse with foci marked, dashed semi-major/semi-minor lines, and dashed
 * focal lines from a sample point on the rim (illustrating the constant
 * sum-of-distances property).
 */
export function EllipseFigure(props: { data: EllipseResult }) {
  const bounds = createMemo<Bounds>(() => {
    const a = props.data.a
    const b = props.data.b
    const span = a * 1.25
    return { minX: -span, maxX: span, minY: -span, maxY: span }
  })

  const fontSize = createMemo(() => {
    const b = bounds()
    return Math.max(b.maxX - b.minX, b.maxY - b.minY) * 0.04
  })

  const fmt = (n: number) => parseFloat(n.toPrecision(5)).toString()

  // Sample point on the rim (top of ellipse rotated slightly so focal lines look interesting)
  const samplePoint = createMemo(() => {
    const t = Math.PI * 0.7 // arbitrary angle
    return { x: props.data.a * Math.cos(t), y: props.data.b * Math.sin(t) }
  })

  return (
    <ShapeCanvas bounds={bounds()} label="Ellipse with foci and semi-axes">
      {(() => {
        const fs = fontSize()
        const a = props.data.a
        const b = props.data.b
        const c = props.data.c
        const sp = samplePoint()

        return (
          <>
            {/* Bounding axes (faint) */}
            <line
              x1={-a}
              y1={0}
              x2={a}
              y2={0}
              class="stroke-border"
              stroke-width="1"
              vector-effect="non-scaling-stroke"
            />
            <line
              x1={0}
              y1={-b}
              x2={0}
              y2={b}
              class="stroke-border"
              stroke-width="1"
              vector-effect="non-scaling-stroke"
            />

            {/* Ellipse */}
            <ellipse
              cx={0}
              cy={0}
              rx={a}
              ry={b}
              class="fill-violet/10 stroke-violet"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            />

            {/* Semi-major (dashed, violet) */}
            <line
              x1={0}
              y1={0}
              x2={a}
              y2={0}
              class="stroke-violet/70"
              stroke-width="1.5"
              stroke-dasharray="4 3"
              vector-effect="non-scaling-stroke"
            />
            <FigureLabel
              x={a / 2}
              y={-fs * 0.8}
              text={`a = ${fmt(a)}`}
              variant="violet"
              fontSize={fs * 0.85}
              weight="semibold"
            />

            {/* Semi-minor (dashed, foreground) */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={b}
              class="stroke-foreground/60"
              stroke-width="1.5"
              stroke-dasharray="4 3"
              vector-effect="non-scaling-stroke"
            />
            <FigureLabel
              x={fs * 0.6}
              y={b / 2}
              text={`b = ${fmt(b)}`}
              variant="foreground"
              fontSize={fs * 0.85}
              weight="semibold"
              align="left"
            />

            {/* Focal lines (dashed, muted) */}
            <line
              x1={-c}
              y1={0}
              x2={sp.x}
              y2={sp.y}
              class="stroke-muted-foreground/50"
              stroke-width="1"
              stroke-dasharray="3 3"
              vector-effect="non-scaling-stroke"
            />
            <line
              x1={c}
              y1={0}
              x2={sp.x}
              y2={sp.y}
              class="stroke-muted-foreground/50"
              stroke-width="1"
              stroke-dasharray="3 3"
              vector-effect="non-scaling-stroke"
            />

            {/* Foci dots */}
            <circle cx={-c} cy={0} r={fs * 0.2} class="fill-violet" />
            <circle cx={c} cy={0} r={fs * 0.2} class="fill-violet" />
            <FigureLabel
              x={-c}
              y={-fs * 1.0}
              text="F₁"
              variant="violet"
              fontSize={fs * 0.85}
              weight="semibold"
            />
            <FigureLabel
              x={c}
              y={-fs * 1.0}
              text="F₂"
              variant="violet"
              fontSize={fs * 0.85}
              weight="semibold"
            />

            {/* Sample point */}
            <circle cx={sp.x} cy={sp.y} r={fs * 0.18} class="fill-foreground" />

            {/* Eccentricity readout */}
            <FigureLabel
              x={0}
              y={-b - fs * 1.5}
              text={`e = ${fmt(props.data.eccentricity)}, c = ${fmt(c)}`}
              variant="muted"
              fontSize={fs * 0.85}
            />
          </>
        )
      })()}
    </ShapeCanvas>
  )
}
