import { For, Show } from 'solid-js'
import {
  TbOutlineHash,
  TbOutlineArrowsHorizontal,
  TbOutlineArticle,
  TbOutlineTextSize,
  TbOutlineDice,
  TbOutlineDecimal,
  TbOutlinePercentage,
  TbOutlineFunction,
  TbOutlineDivide,
  TbOutlineEqual,
  TbOutlineMath,
  TbOutlineSuperscript,
  TbOutlineAtom,
  TbOutlineSlash,
} from 'solid-icons/tb'
import type { Component } from 'solid-js'
import { Breadcrumb } from '~/components/breadcrumb'
import { ToolCard } from '~/components/tool-card'
import { categoryById, toolsByCategory } from '~/lib/tools/registry'
import { setPageMeta, getCategoryMeta, getCategoryIndexSchema } from '~/lib/seo'

const toolIcons = {
  'base-converter': TbOutlineArrowsHorizontal,
  roman: TbOutlineArticle,
  'to-words': TbOutlineTextSize,
  'random-number': TbOutlineDice,
  'decimal-precision': TbOutlineDecimal,
  percentage: TbOutlinePercentage,
  'gcf-lcm': TbOutlineFunction,
  fractions: TbOutlineDivide,
  ratio: TbOutlineEqual,
  factorial: TbOutlineMath,
  quadratic: TbOutlineSuperscript,
  'scientific-notation': TbOutlineAtom,
  modulo: TbOutlineSlash,
}

export default function NumbersIndex() {
  const category = categoryById('numbers')!
  const tools = toolsByCategory('numbers')

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
          <TbOutlineHash size={18} />
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
                icon={toolIcons[tool.slug as keyof typeof toolIcons] ?? TbOutlineArrowsHorizontal}
              />
            )}
          </For>
        </div>
      </Show>
    </main>
  )
}
