import { For, Show, type JSX } from 'solid-js'
import { TbOutlineCheck } from 'solid-icons/tb'
import { cn } from '~/lib/utils'

type ToolToolbarProps = {
  children: JSX.Element
  class?: string
}

export function ToolToolbar(props: ToolToolbarProps) {
  return <div class={cn('mb-3 flex flex-wrap items-center gap-3 px-1', props.class)}>{props.children}</div>
}

type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type ToolbarSegmentedProps<T extends string> = {
  label: string
  value: T
  onChange: (v: T) => void
  options: SegmentedOption<T>[]
}

export function ToolbarSegmented<T extends string>(props: ToolbarSegmentedProps<T>) {
  return (
    <Show when={props.options.length >= 2}>
      <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <div
        role="radiogroup"
        aria-label={props.label}
        class="inline-flex rounded-md border border-border bg-background p-0.5"
      >
        <For each={props.options}>
          {(opt) => (
            <button
              type="button"
              role="radio"
              aria-checked={props.value === opt.value}
              onClick={() => props.onChange(opt.value)}
              class={cn(
                'px-3 py-1 text-sm transition-colors cursor-pointer',
                props.value === opt.value
                  ? 'bg-violet text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-violet/5'
              )}
            >
              {opt.label}
            </button>
          )}
        </For>
      </div>
    </Show>
  )
}

type ToolbarChipProps = {
  checked: boolean
  onChange: (v: boolean) => void
  children: JSX.Element
}

export function ToolbarChip(props: ToolbarChipProps) {
  return (
    <label
      class={cn(
        'anim-fade-in group inline-flex cursor-pointer select-none items-center gap-2 border px-2.5 py-1 text-xs font-medium transition-colors',
        props.checked
          ? 'border-violet bg-violet/5 text-violet'
          : 'border-input bg-background text-foreground/80 hover:border-violet/60 hover:text-foreground hover:bg-violet/5'
      )}
    >
      <input
        type="checkbox"
        class="sr-only"
        checked={props.checked}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
      />
      <span
        aria-hidden
        class={cn(
          'flex size-3.5 items-center justify-center border transition-colors',
          props.checked
            ? 'border-violet bg-violet text-white'
            : 'border-foreground/30 bg-background group-hover:border-violet/60'
        )}
      >
        <Show when={props.checked}>
          <TbOutlineCheck size={10} stroke-width="3" />
        </Show>
      </span>
      {props.children}
    </label>
  )
}
