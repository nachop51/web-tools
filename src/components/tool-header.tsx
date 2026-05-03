import { Show } from 'solid-js'
import { Breadcrumb } from '~/components/breadcrumb'

type ToolHeaderProps = {
  name: string
  description?: string
  category?: string
}

export function ToolHeader(props: ToolHeaderProps) {
  return (
    <header class="anim-fade-up mb-8 border-b border-border pb-6">
      <Breadcrumb />
      <div class="flex items-baseline gap-3">
        <span aria-hidden class="h-6 w-1 rounded-full bg-violet" />
        <h1 class="font-mono text-2xl font-semibold tracking-tight">{props.name}</h1>
      </div>
      <Show when={props.description}>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground">{props.description}</p>
      </Show>
    </header>
  )
}
