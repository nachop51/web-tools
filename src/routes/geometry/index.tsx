import { For, Show } from 'solid-js'
import {
  TbOutlineHexagon,
  TbOutlineCircle,
  TbOutlineRectangle,
  TbOutlineTriangle,
  TbOutlineSquareRoot,
  TbOutlineSquare,
  TbOutlineAngle,
  TbOutlineBottle,
  TbOutlineMathSin,
  TbOutlineMathCos,
  TbOutlineSphere,
  TbOutlineCylinder,
  TbOutlinePolygon,
  TbOutlineMapPin,
  TbOutlineFunction,
  TbOutlineVector,
  TbOutlineLasso,
  TbOutlineShape,
} from 'solid-icons/tb'
import { Breadcrumb } from '~/components/breadcrumb'
import { ToolCard } from '~/components/tool-card'
import { categoryById, toolsByCategory } from '~/lib/tools/registry'
import { setPageMeta, getCategoryMeta, getCategoryIndexSchema } from '~/lib/seo'

const toolIcons = {
  circle: TbOutlineCircle,
  rectangle: TbOutlineRectangle,
  triangle: TbOutlineTriangle,
  pythagorean: TbOutlineSquareRoot,
  area: TbOutlineSquare,
  angle: TbOutlineAngle,
  volume: TbOutlineBottle,
  'trig-calculator': TbOutlineMathSin,
  'unit-circle': TbOutlineMathCos,
  sphere: TbOutlineSphere,
  cylinder: TbOutlineCylinder,
  'regular-polygon': TbOutlinePolygon,
  'distance-midpoint': TbOutlineMapPin,
  'slope-line': TbOutlineFunction,
  'vector-calc': TbOutlineVector,
  shoelace: TbOutlineLasso,
  ellipse: TbOutlineCircle,
  quadrilateral: TbOutlineShape,
}

export default function GeometryIndex() {
  const category = categoryById('geometry')!
  const tools = toolsByCategory('geometry')
  const categoryMeta = getCategoryMeta(category)
  setPageMeta({
    title: categoryMeta.title,
    description: categoryMeta.description,
    canonical: categoryMeta.canonical,
    schema: getCategoryIndexSchema(category, tools),
  })

  return (
    <main class="w-full py-10">
      <Breadcrumb />

      <header class="anim-fade-up mb-8 flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-md border border-violet/40 bg-violet/5 text-violet">
          <TbOutlineHexagon size={18} />
        </div>
        <div>
          <h1 class="font-mono text-2xl font-semibold tracking-tight">{category.name}</h1>
          <p class="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </header>

      <Show when={tools.length > 0} fallback={<p class="text-sm text-muted-foreground">Tools coming soon.</p>}>
        <div class="grid gap-2 sm:grid-cols-2">
          <For each={tools}>
            {(tool, i) => (
              <ToolCard
                tool={tool}
                index={i()}
                icon={toolIcons[tool.slug as keyof typeof toolIcons] ?? TbOutlineHexagon}
              />
            )}
          </For>
        </div>
      </Show>
    </main>
  )
}
