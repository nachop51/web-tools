import { createSignal, Show, type JSX } from 'solid-js'
import { TbOutlineCheck, TbOutlineCopy } from 'solid-icons/tb'
import { cn } from '~/lib/utils'

type CopyButtonProps = {
  value: string | (() => string)
  class?: string
  children?: JSX.Element
  disabled?: boolean
}

export function CopyButton(props: CopyButtonProps) {
  const [copied, setCopied] = createSignal(false)

  async function handleCopy() {
    const text = typeof props.value === 'function' ? props.value() : props.value
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // clipboard unavailable in non-secure contexts
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={props.disabled}
      class={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-[color,border-color,box-shadow] duration-150 ease-out cursor-pointer',
        'hover:border-violet/60 hover:text-violet hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-muted-foreground disabled:hover:shadow-none',
        copied() && 'anim-copy-pulse border-violet/60 text-violet',
        props.class
      )}
    >
      <Show
        when={copied()}
        fallback={
          <>
            <TbOutlineCopy size={12} class="transition-transform duration-150" />
            {props.children ?? 'Copy'}
          </>
        }
      >
        <TbOutlineCheck size={12} /> Copied
      </Show>
    </button>
  )
}
