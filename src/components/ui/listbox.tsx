import type { ComponentProps, ParentComponent } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '~/lib/utils'

const Listbox: ParentComponent<ComponentProps<'ul'>> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <ul role="listbox" class={cn('m-0 list-none p-1', local.class)} {...others}>
      {local.children}
    </ul>
  )
}

type ListboxItemProps = ComponentProps<'li'> & { selected?: boolean }

const ListboxItem: ParentComponent<ListboxItemProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children', 'selected'])
  return (
    <li
      role="option"
      aria-selected={local.selected ? 'true' : 'false'}
      data-selected={local.selected ? '' : undefined}
      class={cn(
        'relative flex w-full cursor-pointer select-none items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none transition-colors',
        local.selected && 'bg-violet/10 text-violet',
        local.class
      )}
      {...others}
    >
      {local.children}
    </li>
  )
}

const ListboxItemLabel: ParentComponent<ComponentProps<'div'>> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <div class={cn('text-sm font-medium leading-tight', local.class)} {...others}>
      {local.children}
    </div>
  )
}

const ListboxItemDescription: ParentComponent<ComponentProps<'div'>> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <div class={cn('line-clamp-1 text-xs text-muted-foreground', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export { Listbox, ListboxItem, ListboxItemLabel, ListboxItemDescription }
