import { For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'

type Option<T> = { value: T; label: string }

type Props<T extends string | number> = {
  value: T
  onChange: (v: T) => void
  options: Option<T>[]
  label?: string
  labelPosition?: 'side' | 'top'
  size?: 'sm' | 'md'
  class?: string
}

export function SegmentedControl<T extends string | number>(props: Props<T>) {
  let containerRef: HTMLDivElement | undefined
  const btnRefs: HTMLButtonElement[] = []

  const [hoverIdx, setHoverIdx] = createSignal<number | null>(null)
  const [activePos, setActivePos] = createSignal({ x: 0, w: 0 })
  const [hoverPos, setHoverPos] = createSignal({ x: 0, w: 0 })
  const [ready, setReady] = createSignal(false)

  const activeIdx = createMemo(() => {
    const i = props.options.findIndex((o) => o.value === props.value)
    return i === -1 ? 0 : i
  })

  function measure(idx: number) {
    const btn = btnRefs[idx]
    if (!btn) return null
    return { x: btn.offsetLeft, w: btn.offsetWidth }
  }

  function syncActive() {
    const m = measure(activeIdx())
    if (m) setActivePos(m)
  }

  function syncHover() {
    const i = hoverIdx()
    if (i === null) return
    const m = measure(i)
    if (m) setHoverPos(m)
  }

  createEffect(() => {
    activeIdx()
    props.options.length
    syncActive()
  })

  createEffect(() => {
    hoverIdx()
    syncHover()
  })

  onMount(() => {
    syncActive()
    const m = measure(activeIdx())
    if (m) setHoverPos(m)
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
    if (containerRef) {
      const ro = new ResizeObserver(() => {
        syncActive()
        syncHover()
      })
      ro.observe(containerRef)
      onCleanup(() => ro.disconnect())
    }
  })

  const sizeClass = () => (props.size === 'md' ? 'h-10 text-sm' : 'h-8 text-sm')
  const isTop = () => props.labelPosition === 'top'

  return (
    <div
      class={cn(
        !props.label && 'contents',
        props.label && (isTop() ? 'flex flex-col items-start' : 'flex items-center gap-2')
      )}
    >
      <Show when={props.label}>
        <Show
          when={isTop()}
          fallback={
            <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{props.label}</span>
          }
        >
          <Label size="xs" class="uppercase tracking-wider text-muted-foreground">
            {props.label}
          </Label>
        </Show>
      </Show>
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label={props.label}
        onMouseLeave={() => setHoverIdx(null)}
        class={cn(
          'relative inline-flex items-stretch self-start border border-border bg-background p-0.5',
          sizeClass(),
          props.class
        )}
      >
        <span
          aria-hidden
          class={cn(
            'pointer-events-none absolute top-0.5 bottom-0.5 z-0 bg-violet shadow-sm',
            ready() && 'transition-[left,width] duration-300 ease-out'
          )}
          style={{
            left: `${activePos().x}px`,
            width: `${activePos().w}px`,
          }}
        />
        <span
          aria-hidden
          class={cn(
            'pointer-events-none absolute top-0.5 bottom-0.5 z-0 bg-violet/10',
            ready() && 'transition-[left,width,opacity] duration-200 ease-out',
            hoverIdx() !== null && hoverIdx() !== activeIdx() ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            left: `${hoverPos().x}px`,
            width: `${hoverPos().w}px`,
          }}
        />
        <For each={props.options}>
          {(opt, i) => (
            <button
              ref={(el) => (btnRefs[i()] = el)}
              type="button"
              role="radio"
              aria-checked={props.value === opt.value}
              onMouseEnter={() => setHoverIdx(i())}
              onClick={() => props.onChange(opt.value)}
              class={cn(
                'relative z-10 inline-flex items-center justify-center px-3 cursor-pointer transition-[color,transform] duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                'active:scale-[0.97]',
                props.value === opt.value ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          )}
        </For>
      </div>
    </div>
  )
}
