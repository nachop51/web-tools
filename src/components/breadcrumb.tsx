import { A, useLocation } from '@solidjs/router'
import { For, Show } from 'solid-js'
import { TbOutlineChevronRight } from 'solid-icons/tb'
import { categories, tools, type CategoryId } from '~/lib/tools/registry'

type Crumb = { name: string; href?: string }

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split('/').filter(Boolean)
  const crumbs: Crumb[] = [{ name: 'Home', href: '/' }]

  if (parts.length === 0) return crumbs

  const categoryId = parts[0] as CategoryId
  const category = categories.find((c) => c.id === categoryId)
  if (!category) return crumbs

  if (parts.length === 1) {
    crumbs.push({ name: category.name })
    return crumbs
  }

  crumbs.push({ name: category.name, href: category.href })

  const slug = parts[1]
  const tool = tools.find((t) => t.slug === slug && t.category === categoryId)
  if (tool) crumbs.push({ name: tool.name })

  return crumbs
}

export function Breadcrumb() {
  const location = useLocation()

  return (
    <nav
      aria-label="Breadcrumb"
      class="anim-fade-in mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
    >
      <For each={buildCrumbs(location.pathname)}>
        {(crumb, i) => (
          <>
            <Show when={i() > 0}>
              <TbOutlineChevronRight size={10} class="shrink-0 opacity-40" />
            </Show>
            <Show when={crumb.href} fallback={<span class="font-medium text-foreground">{crumb.name}</span>}>
              <A href={crumb.href!} class="transition-colors duration-150 hover:text-violet">
                {crumb.name}
              </A>
            </Show>
          </>
        )}
      </For>
    </nav>
  )
}
