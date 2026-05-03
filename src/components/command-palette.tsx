import { useNavigate } from '@solidjs/router'
import { TbOutlineArrowRight, TbOutlineCornerDownLeft } from 'solid-icons/tb'
import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js'

import { Dialog, DialogContent } from '~/components/ui/dialog'
import { Listbox, ListboxItem, ListboxItemDescription, ListboxItemLabel } from '~/components/ui/listbox'
import { TextField, TextFieldInput } from '~/components/ui/text-field'
import { paletteOpen, setPaletteOpen } from '~/lib/search/palette-state'
import { parseQuery, type ParsedQuery } from '~/lib/search/parse-query'
import { pushRecent, getRecentEntries } from '~/lib/search/recents'
import { type IndexedEntry, searchEntries } from '~/lib/search/search-index'

type Row = {
  id: string
  kind: 'tool' | 'category' | 'unit-shortcut'
  name: string
  description: string
  href: string
  categoryName: string
}

function entryToRow(e: IndexedEntry): Row {
  return {
    id: e.id,
    kind: e.kind,
    name: e.name,
    description: e.description,
    href: e.href,
    categoryName: e.categoryName,
  }
}

function unitShortcutRow(parsed: ParsedQuery): Row | null {
  if (parsed.kind !== 'unit') return null
  const { entry, toEntry } = parsed
  const fromShort = entry.unitLabel.match(/\(([^)]+)\)/)?.[1] ?? entry.unitKey
  const toShort = toEntry?.unitLabel.match(/\(([^)]+)\)/)?.[1] ?? toEntry?.unitKey
  const params = new URLSearchParams()
  params.set('from', entry.unitKey)
  if (toEntry) params.set('to', toEntry.unitKey)
  return {
    id: `unit-shortcut:${entry.category}:${entry.unitKey}:${toEntry?.unitKey ?? ''}`,
    kind: 'unit-shortcut',
    name: toShort ? `Convert ${fromShort} → ${toShort}` : `Open ${entry.category} converter at ${fromShort}`,
    description: entry.unitLabel + (toEntry ? `  →  ${toEntry.unitLabel}` : ''),
    href: `${entry.routeHref}?${params.toString()}`,
    categoryName: 'Shortcut',
  }
}

export function CommandPalette() {
  const navigate = useNavigate()
  const [query, setQuery] = createSignal('')
  const [activeIndex, setActiveIndex] = createSignal(0)
  let inputRef: HTMLInputElement | undefined
  let listRef: HTMLUListElement | undefined

  const parsed = createMemo<ParsedQuery>(() => parseQuery(query()))

  const rows = createMemo<Row[]>(() => {
    const trimmed = query().trim()
    const shortcut = unitShortcutRow(parsed())

    if (!trimmed) {
      const recent = getRecentEntries()
      const recentIds = new Set(recent.map((e) => e.id))
      const rest = searchEntries('').filter((e) => !recentIds.has(e.id))
      return [...recent, ...rest].map(entryToRow)
    }

    const hits = searchEntries(trimmed).map(entryToRow)
    return shortcut ? [shortcut, ...hits] : hits
  })

  createEffect(() => {
    rows()
    setActiveIndex(0)
  })

  createEffect(() => {
    if (!paletteOpen()) {
      setQuery('')
      setActiveIndex(0)
    }
  })

  createEffect(() => {
    if (paletteOpen() && inputRef) {
      queueMicrotask(() => inputRef?.focus())
    }
  })

  createEffect(() => {
    const i = activeIndex()
    if (!listRef) return
    const el = listRef.querySelector<HTMLLIElement>(`[data-row-index="${i}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  })

  function navigateTo(row: Row | undefined) {
    if (!row) return
    setPaletteOpen(false)
    if (row.kind !== 'unit-shortcut') pushRecent(row.id)
    navigate(row.href)
  }

  function handleKeyDown(e: KeyboardEvent) {
    const list = rows()
    if (list.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % list.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + list.length) % list.length)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(list.length - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      navigateTo(list[activeIndex()])
    }
  }

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    onCleanup(() => window.removeEventListener('keydown', onKey))
  })

  return (
    <Dialog open={paletteOpen()} onOpenChange={setPaletteOpen}>
      <DialogContent class="max-w-xl p-0 gap-0 overflow-hidden">
        <TextField value={query()} onChange={(v: string) => setQuery(v)} class="border-b border-border">
          <TextFieldInput
            ref={inputRef}
            type="search"
            placeholder="Search tools, or try 'mb to gb'…"
            autocomplete="off"
            spellcheck={false}
            class="h-12 w-full rounded-none border-0 bg-transparent px-4 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={handleKeyDown}
            aria-activedescendant={`palette-row-${activeIndex()}`}
            aria-controls="palette-listbox"
            aria-autocomplete="list"
          />
        </TextField>

        <Show
          when={rows().length > 0}
          fallback={<div class="px-4 py-8 text-center text-sm text-muted-foreground">No results.</div>}
        >
          <Listbox ref={listRef} id="palette-listbox" class="max-h-80 overflow-y-auto p-1.5">
            <For each={rows()}>
              {(row, i) => (
                <ListboxItem
                  id={`palette-row-${i()}`}
                  data-row-index={i()}
                  selected={i() === activeIndex()}
                  onMouseEnter={() => setActiveIndex(i())}
                  onPointerDown={(e: PointerEvent) => {
                    e.preventDefault()
                    navigateTo(row)
                  }}
                  class={
                    row.kind === 'unit-shortcut'
                      ? 'bg-violet-muted text-violet ring-1 ring-violet/30 data-[selected]:bg-violet/15'
                      : undefined
                  }
                >
                  <div class="flex min-w-0 flex-1 items-center gap-3">
                    <Show when={row.kind === 'unit-shortcut'}>
                      <TbOutlineArrowRight size={16} class="shrink-0" />
                    </Show>
                    <div class="flex min-w-0 flex-col">
                      <ListboxItemLabel>{row.name}</ListboxItemLabel>
                      <Show when={row.description}>
                        <ListboxItemDescription>{row.description}</ListboxItemDescription>
                      </Show>
                    </div>
                  </div>
                  <span class="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {row.categoryName}
                  </span>
                </ListboxItem>
              )}
            </For>
          </Listbox>
        </Show>

        <div class="flex items-center gap-3 border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <span class="flex items-center gap-1">
            <kbd class="rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">↑↓</kbd>
            navigate
          </span>
          <span class="flex items-center gap-1">
            <kbd class="rounded border border-border bg-background px-1 py-0.5">
              <TbOutlineCornerDownLeft size={10} />
            </kbd>
            open
          </span>
          <span class="flex items-center gap-1">
            <kbd class="rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">esc</kbd>
            close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
