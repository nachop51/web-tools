export type Vertex = { x: number; y: number }

export interface ShoelaceResult {
  signedArea: number // positive = CCW, negative = CW
  area: number
  perimeter: number
  centroid: Vertex
  bbox: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number }
  orientation: 'ccw' | 'cw' | 'degenerate'
  count: number
}

export function shoelace(vertices: Vertex[]): ShoelaceResult | null {
  if (vertices.length < 3) return null

  let signed = 0
  let perimeter = 0
  let cx = 0
  let cy = 0

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i]
    const b = vertices[(i + 1) % vertices.length]
    const cross = a.x * b.y - b.x * a.y
    signed += cross
    cx += (a.x + b.x) * cross
    cy += (a.y + b.y) * cross
    perimeter += Math.hypot(b.x - a.x, b.y - a.y)
    if (a.x < minX) minX = a.x
    if (a.x > maxX) maxX = a.x
    if (a.y < minY) minY = a.y
    if (a.y > maxY) maxY = a.y
  }

  signed /= 2
  const area = Math.abs(signed)

  let centroid: Vertex
  if (Math.abs(signed) < 1e-12) {
    // Degenerate polygon — fall back to vertex average
    let sx = 0
    let sy = 0
    for (const v of vertices) {
      sx += v.x
      sy += v.y
    }
    centroid = { x: sx / vertices.length, y: sy / vertices.length }
  } else {
    centroid = { x: cx / (6 * signed), y: cy / (6 * signed) }
  }

  const orientation: ShoelaceResult['orientation'] = signed > 1e-12 ? 'ccw' : signed < -1e-12 ? 'cw' : 'degenerate'

  return {
    signedArea: signed,
    area,
    perimeter,
    centroid,
    bbox: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
    orientation,
    count: vertices.length,
  }
}

export function parseVertices(text: string): { vertices: Vertex[]; bad: number[] } {
  const lines = text.split(/\r?\n/)
  const vertices: Vertex[] = []
  const bad: number[] = []
  lines.forEach((raw, idx) => {
    const line = raw.trim()
    if (!line) return
    // accept "x, y" | "x y" | "x; y" | "(x, y)"
    const cleaned = line.replace(/[()]/g, '').trim()
    const parts = cleaned.split(/[\s,;]+/).filter(Boolean)
    if (parts.length !== 2) {
      bad.push(idx + 1)
      return
    }
    const x = parseFloat(parts[0])
    const y = parseFloat(parts[1])
    if (!isFinite(x) || !isFinite(y)) {
      bad.push(idx + 1)
      return
    }
    vertices.push({ x, y })
  })
  return { vertices, bad }
}
