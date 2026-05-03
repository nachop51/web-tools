import { A } from '@solidjs/router'
import { Dynamic } from 'solid-js/web'
import { TbOutlineArrowRight } from 'solid-icons/tb'
import type { Component } from 'solid-js'
import type { Tool } from '~/lib/tools/registry'
import { cn } from '~/lib/utils'

type ToolCardProps = {
  tool: Tool
  icon: Component<{ size?: number; class?: string }>
  class?: string
}

export function ToolCard(props: ToolCardProps) {
  return (
    <A href={props.tool.href} class={cn('group block', props.class)}>
      <div
        class={cn(
          'relative flex items-center gap-4 overflow-hidden rounded-md border border-border bg-card p-4',
          'transition-[border-color,background-color,transform] duration-150 ease-out',
          'hover:border-violet/50 hover:bg-violet-muted/40'
        )}
      >
        {/* Left rail accent */}
        <span
          aria-hidden
          class="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-violet transition-transform duration-200 ease-out group-hover:scale-y-100"
        />

        <div
          class={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground',
            'transition-colors duration-150 ease-out',
            'group-hover:border-violet/50 group-hover:bg-violet/5 group-hover:text-violet'
          )}
        >
          <Dynamic component={props.icon} size={17} />
        </div>

        <div class="min-w-0 flex-1">
          <p class="font-mono text-sm font-medium tracking-tight transition-colors duration-150 group-hover:text-foreground">
            {props.tool.name}
          </p>
          <p class="mt-0.5 truncate text-xs text-muted-foreground">{props.tool.description}</p>
        </div>

        <TbOutlineArrowRight
          size={14}
          class="shrink-0 text-border transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-violet"
        />
      </div>
    </A>
  )
}
