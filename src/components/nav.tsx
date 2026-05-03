import { A, useLocation } from '@solidjs/router'
import { createEffect, createSignal, For, onMount, Show } from 'solid-js'
import {
  TbOutlineCode,
  TbOutlineSun,
  TbOutlineMoon,
  TbOutlineMenu2,
  TbOutlineX,
  TbOutlineHash,
  TbOutlineRuler,
  TbOutlineLetterCase,
  TbOutlineLock,
  TbOutlineCalendar,
  TbOutlineTerminal,
  TbOutlinePalette,
  TbOutlineBolt,
  TbOutlineCalculator,
  TbOutlineCurrencyDollar,
  TbOutlineHexagon,
  TbOutlineSearch,
  TbOutlineDots,
} from 'solid-icons/tb'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { togglePalette } from '~/lib/search/palette-state'
import { categories, type Category, type CategoryId } from '~/lib/tools/registry'

const categoryIcons: Record<CategoryId, (props: { size?: number; class?: string }) => any> = {
  numbers: TbOutlineHash,
  units: TbOutlineRuler,
  strings: TbOutlineLetterCase,
  encoding: TbOutlineLock,
  datetime: TbOutlineCalendar,
  code: TbOutlineTerminal,
  color: TbOutlinePalette,
  electrical: TbOutlineBolt,
  math: TbOutlineCalculator,
  finance: TbOutlineCurrencyDollar,
  geometry: TbOutlineHexagon,
}

const inlineIds: CategoryId[] = ['numbers', 'units', 'strings', 'encoding', 'datetime', 'code', 'color']
const moreIds: CategoryId[] = ['math', 'electrical', 'finance', 'geometry']
const byId = (id: CategoryId): Category => categories.find((c) => c.id === id)!
const inlineCategories = inlineIds.map(byId)
const moreCategories = moreIds.map(byId)

export default function Nav() {
  const [dark, setDark] = createSignal(true)
  const [menuOpen, setMenuOpen] = createSignal(false)
  const [moreOpen, setMoreOpen] = createSignal(false)
  const location = useLocation()

  onMount(() => {
    setDark(document.documentElement.classList.contains('dark'))
  })

  createEffect(() => {
    location.pathname
    setMenuOpen(false)
    setMoreOpen(false)
  })

  const toggleTheme = () => {
    const next = !dark()
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const isMoreActive = () => moreCategories.some((c) => location.pathname.startsWith(c.href))

  return (
    <nav class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div class="mx-auto flex h-12 max-w-5xl items-center gap-4 px-4">
        <A href="/" class="group flex shrink-0 items-center gap-2 font-mono text-sm font-semibold tracking-tight">
          <span class="relative inline-flex size-6 items-center justify-center">
            <span
              aria-hidden
              class="absolute inset-0 rounded-md bg-violet/0 transition-colors duration-150 group-hover:bg-violet/10"
            />
            <TbOutlineCode
              size={15}
              class="relative text-foreground transition-colors duration-150 group-hover:text-violet"
            />
          </span>
          <span class="transition-colors duration-150 group-hover:text-violet">web-tools</span>
        </A>

        {/* Desktop icon nav (hidden on mobile) */}
        <ul class="hidden flex-1 items-center gap-0.5 xl:flex">
          <For each={inlineCategories}>
            {(c) => {
              const Icon = categoryIcons[c.id]
              return (
                <li>
                  <A
                    href={c.href}
                    title={c.name}
                    aria-label={c.name}
                    class="group flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                    activeClass="!bg-violet/10 !text-violet"
                  >
                    <Icon size={16} />
                  </A>
                </li>
              )
            }}
          </For>
          <li>
            <Popover open={moreOpen()} onOpenChange={setMoreOpen} placement="bottom-start">
              <PopoverTrigger
                aria-label="More categories"
                class="group inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground data-[expanded]:bg-muted data-[expanded]:text-foreground"
                classList={{ '!bg-violet/10 !text-violet': isMoreActive() }}
              >
                <TbOutlineDots size={16} />
              </PopoverTrigger>
              <PopoverContent class="w-52 p-1.5">
                <ul class="grid gap-0.5">
                  <For each={moreCategories}>
                    {(c) => {
                      const Icon = categoryIcons[c.id]
                      return (
                        <li>
                          <A
                            href={c.href}
                            class="group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-muted"
                            activeClass="active bg-violet/10"
                          >
                            <span class="flex size-6 shrink-0 items-center justify-center text-muted-foreground transition-colors duration-150 group-hover:text-violet [.active_&]:text-violet">
                              <Icon size={14} />
                            </span>
                            <span class="text-sm text-muted-foreground transition-colors duration-150 group-hover:text-foreground [.active_&]:text-foreground">
                              {c.name}
                            </span>
                          </A>
                        </li>
                      )
                    }}
                  </For>
                </ul>
              </PopoverContent>
            </Popover>
          </li>
        </ul>

        {/* Right side controls */}
        <div class="ml-auto flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            class="hidden h-8 gap-2 px-2.5 font-normal text-muted-foreground sm:inline-flex"
            onClick={togglePalette}
            aria-label="Open command palette"
          >
            <TbOutlineSearch size={14} />
            <span class="hidden text-xs md:inline">Search…</span>
            <kbd class="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono leading-none md:inline">
              ⌘K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="size-8 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
            onClick={togglePalette}
            aria-label="Open command palette"
          >
            <TbOutlineSearch size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={toggleTheme}
            aria-label={dark() ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Show when={dark()} fallback={<TbOutlineMoon size={16} />}>
              <TbOutlineSun size={16} />
            </Show>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            class="size-8 text-muted-foreground hover:bg-muted hover:text-foreground xl:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen() ? 'Close menu' : 'Open menu'}
          >
            <Show when={menuOpen()} fallback={<TbOutlineMenu2 size={16} />}>
              <TbOutlineX size={16} />
            </Show>
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <Show when={menuOpen()}>
        <div class="anim-fade-up border-t border-border bg-background/95 backdrop-blur-md xl:hidden">
          <ul class="mx-auto grid max-w-5xl grid-cols-2 gap-2 p-4 sm:grid-cols-3">
            <For each={categories}>
              {(c) => {
                const Icon = categoryIcons[c.id]
                return (
                  <li>
                    <A
                      href={c.href}
                      class="group flex items-center gap-3 rounded-lg p-3 transition-colors duration-150 hover:bg-muted"
                      activeClass="active bg-violet-muted"
                    >
                      <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors duration-150 group-hover:text-violet [.active_&]:bg-violet/10 [.active_&]:text-violet">
                        <Icon size={16} />
                      </span>
                      <span class="text-sm font-medium text-muted-foreground transition-colors duration-150 group-hover:text-foreground [.active_&]:text-foreground">
                        {c.name}
                      </span>
                    </A>
                  </li>
                )
              }}
            </For>
          </ul>
        </div>
      </Show>
    </nav>
  )
}
