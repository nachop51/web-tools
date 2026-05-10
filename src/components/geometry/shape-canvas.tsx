import { createMemo, type JSX } from 'solid-js'
import { cn } from '~/lib/utils'

export type Bounds = { minX: number; maxX: number; minY: number; maxY: number }

type ShapeCanvasProps = {
  bounds: Bounds
  /** Padding inside the viewBox in user units. Default 10% of max span. */
  pad?: number
  /** Optional aria-label for the figure. */
  label?: string
  class?: string
  children: JSX.Element
}

/**
 * SVG primitive for geometry figures.
 *
 * - Y is flipped so up is positive (math convention). Children write y in
 *   "math" coordinates; the wrapper handles the flip via a single scale(1,-1).
 * - Strokes inside should use vector-effect="non-scaling-stroke" so the line
 *   width stays 1px regardless of bounds size.
 * - Auto-fits a square aspect-ratio container (max 420px wide).
 */
export function ShapeCanvas(props: ShapeCanvasProps) {
  const view = createMemo(() => {
    const b = props.bounds
    const w = Math.max(b.maxX - b.minX, 0.0001)
    const h = Math.max(b.maxY - b.minY, 0.0001)
    const span = Math.max(w, h)
    const pad = props.pad ?? span * 0.12
    const cx = (b.minX + b.maxX) / 2
    const cy = (b.minY + b.maxY) / 2
    const size = span + pad * 2
    const x = cx - size / 2
    const y = cy - size / 2
    return { x, y, size }
  })

  return (
    <svg
      viewBox={`${view().x} ${-view().y - view().size} ${view().size} ${view().size}`}
      class={cn('mx-auto block aspect-square w-full max-w-[420px] select-none', props.class)}
      role="img"
      aria-label={props.label}
    >
      {/* Children write math coordinates (y up); we flip the y axis so SVG
          renders them correctly. */}
      <g transform="scale(1 -1)">{props.children}</g>
    </svg>
  )
}

type AxesProps = {
  bounds: Bounds
  showGrid?: boolean
  step?: number
}

/** Cartesian axes (x, y) crossing at origin within the given bounds. */
export function Axes(props: AxesProps) {
  const grid = createMemo(() => {
    if (!props.showGrid) return [] as Array<{ x?: number; y?: number }>
    const span = Math.max(props.bounds.maxX - props.bounds.minX, props.bounds.maxY - props.bounds.minY)
    const step = props.step ?? niceStep(span / 8)
    const lines: Array<{ x?: number; y?: number }> = []
    const sx = Math.ceil(props.bounds.minX / step) * step
    for (let x = sx; x <= props.bounds.maxX; x += step) lines.push({ x })
    const sy = Math.ceil(props.bounds.minY / step) * step
    for (let y = sy; y <= props.bounds.maxY; y += step) lines.push({ y })
    return lines
  })

  return (
    <>
      {/* grid */}
      {props.showGrid &&
        grid().map((g) => {
          if (g.x !== undefined) {
            return (
              <line
                x1={g.x}
                y1={props.bounds.minY}
                x2={g.x}
                y2={props.bounds.maxY}
                class="stroke-muted-foreground/15"
                stroke-width="0.5"
                vector-effect="non-scaling-stroke"
              />
            )
          }
          return (
            <line
              x1={props.bounds.minX}
              y1={g.y}
              x2={props.bounds.maxX}
              y2={g.y}
              class="stroke-muted-foreground/15"
              stroke-width="0.5"
              vector-effect="non-scaling-stroke"
            />
          )
        })}
      {/* x axis */}
      <line
        x1={props.bounds.minX}
        y1={0}
        x2={props.bounds.maxX}
        y2={0}
        class="stroke-border"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      {/* y axis */}
      <line
        x1={0}
        y1={props.bounds.minY}
        x2={0}
        y2={props.bounds.maxY}
        class="stroke-border"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
    </>
  )
}

/**
 * Text label that lives inside the math-coordinate space, but renders upright
 * (the parent has scale(1,-1); we re-flip the text node so it isn't mirrored).
 *
 * `align`: anchor relative to (x, y) in math coords.
 *
 * `fontSize` is in user units. Since figures auto-fit to viewBox bounds, choose
 * a value relative to the figure scale (typical: 4–6% of the bounds span).
 */
export function FigureLabel(props: {
  x: number
  y: number
  text: string
  align?: 'center' | 'left' | 'right'
  variant?: 'muted' | 'violet' | 'foreground'
  fontSize: number
  weight?: 'normal' | 'semibold' | 'bold'
}) {
  const anchor = () => (props.align === 'left' ? 'start' : props.align === 'right' ? 'end' : 'middle')
  const fillCls = () =>
    props.variant === 'violet'
      ? 'fill-violet'
      : props.variant === 'foreground'
        ? 'fill-foreground'
        : 'fill-muted-foreground'
  const weightAttr = () =>
    props.weight === 'bold' ? '700' : props.weight === 'semibold' ? '600' : '400'
  return (
    <g transform={`translate(${props.x} ${props.y}) scale(1 -1)`}>
      <text
        text-anchor={anchor()}
        dominant-baseline="middle"
        font-size={props.fontSize}
        font-weight={weightAttr()}
        class={cn('font-mono', fillCls())}
      >
        {props.text}
      </text>
    </g>
  )
}

/**
 * An arrow from (x1,y1) to (x2,y2). For vectors / dimension arrows.
 */
export function Arrow(props: {
  x1: number
  y1: number
  x2: number
  y2: number
  variant?: 'primary' | 'muted' | 'a' | 'b' | 'sum'
  width?: number
  dashed?: boolean
}) {
  const stroke = () => {
    switch (props.variant) {
      case 'a':
        return 'stroke-violet'
      case 'b':
        return 'stroke-foreground'
      case 'sum':
        return 'stroke-violet/60'
      case 'muted':
        return 'stroke-muted-foreground'
      default:
        return 'stroke-violet'
    }
  }
  const fill = () => {
    switch (props.variant) {
      case 'a':
        return 'fill-violet'
      case 'b':
        return 'fill-foreground'
      case 'sum':
        return 'fill-violet/60'
      case 'muted':
        return 'fill-muted-foreground'
      default:
        return 'fill-violet'
    }
  }
  // arrowhead as a small triangle at (x2,y2)
  const angle = createMemo(() => Math.atan2(props.y2 - props.y1, props.x2 - props.x1))
  const headLen = createMemo(() => {
    const len = Math.hypot(props.x2 - props.x1, props.y2 - props.y1)
    return Math.min(len * 0.18, 0.6)
  })
  const headW = createMemo(() => headLen() * 0.55)
  const tip = createMemo(() => ({ x: props.x2, y: props.y2 }))
  const base = createMemo(() => ({
    x: props.x2 - Math.cos(angle()) * headLen(),
    y: props.y2 - Math.sin(angle()) * headLen(),
  }))
  const left = createMemo(() => ({
    x: base().x - Math.sin(angle()) * headW(),
    y: base().y + Math.cos(angle()) * headW(),
  }))
  const right = createMemo(() => ({
    x: base().x + Math.sin(angle()) * headW(),
    y: base().y - Math.cos(angle()) * headW(),
  }))

  return (
    <>
      <line
        x1={props.x1}
        y1={props.y1}
        x2={base().x}
        y2={base().y}
        class={stroke()}
        stroke-width={props.width ?? 1.5}
        stroke-linecap="round"
        stroke-dasharray={props.dashed ? '4 3' : undefined}
        vector-effect="non-scaling-stroke"
      />
      <polygon
        points={`${tip().x},${tip().y} ${left().x},${left().y} ${right().x},${right().y}`}
        class={fill()}
      />
    </>
  )
}

function niceStep(approx: number): number {
  if (approx <= 0) return 1
  const exp = Math.floor(Math.log10(approx))
  const f = approx / Math.pow(10, exp)
  let nice: number
  if (f < 1.5) nice = 1
  else if (f < 3) nice = 2
  else if (f < 7) nice = 5
  else nice = 10
  return nice * Math.pow(10, exp)
}
