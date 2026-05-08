import { createSignal, For, onMount, Show } from 'solid-js'
import { TbOutlineCheck, TbOutlineChevronDown, TbOutlineCopy } from 'solid-icons/tb'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { cn } from '~/lib/utils'

export type CopyFormatId =
  | 'newline'
  | 'comma'
  | 'space'
  | 'tab'
  | 'js-array'
  | 'c-array'
  | 'sql-in'

type Format = {
  id: CopyFormatId
  label: string
  hint: string
  format: (values: unknown[]) => string
}

const ALL_FORMATS: Format[] = [
  { id: 'newline', label: 'Newline', hint: 'a\\nb\\nc', format: (v) => v.join('\n') },
  { id: 'comma', label: 'Comma', hint: 'a, b, c', format: (v) => v.join(', ') },
  { id: 'space', label: 'Space', hint: 'a b c', format: (v) => v.join(' ') },
  { id: 'tab', label: 'Tab', hint: 'a\\tb\\tc', format: (v) => v.join('\t') },
  { id: 'js-array', label: 'JS / Python array', hint: '[a, b, c]', format: (v) => `[${v.join(', ')}]` },
  { id: 'c-array', label: 'C / Java array', hint: '{a, b, c}', format: (v) => `{${v.join(', ')}}` },
  { id: 'sql-in', label: 'SQL IN', hint: '(a, b, c)', format: (v) => `(${v.join(', ')})` },
]

type CopyArrayButtonProps = {
  values: () => unknown[]
  disabled?: boolean
  class?: string
  formats?: CopyFormatId[]
  defaultFormat?: CopyFormatId
  storageKey?: string
}

const STORAGE_PREFIX = 'copy-array-format:'

export function CopyArrayButton(props: CopyArrayButtonProps) {
  const formats = () =>
    props.formats ? ALL_FORMATS.filter((f) => props.formats!.includes(f.id)) : ALL_FORMATS

  const [lastFormat, setLastFormat] = createSignal<CopyFormatId>(props.defaultFormat ?? 'newline')
  const [copied, setCopied] = createSignal(false)
  const [open, setOpen] = createSignal(false)

  onMount(() => {
    if (!props.storageKey) return
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + props.storageKey)
      if (stored && formats().some((f) => f.id === stored)) {
        setLastFormat(stored as CopyFormatId)
      }
    } catch {
      // localStorage unavailable
    }
  })

  function persistFormat(id: CopyFormatId) {
    setLastFormat(id)
    if (!props.storageKey) return
    try {
      localStorage.setItem(STORAGE_PREFIX + props.storageKey, id)
    } catch {
      // localStorage unavailable
    }
  }

  async function copyWithFormat(id: CopyFormatId) {
    const fmt = formats().find((f) => f.id === id) ?? formats()[0]
    const text = fmt.format(props.values())
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // clipboard unavailable in non-secure contexts
    }
  }

  async function handleQuickCopy() {
    await copyWithFormat(lastFormat())
  }

  async function handleSelectFormat(id: CopyFormatId) {
    persistFormat(id)
    setOpen(false)
    await copyWithFormat(id)
  }

  return (
    <div class={cn('inline-flex isolate', props.class)}>
      <button
        type="button"
        onClick={handleQuickCopy}
        disabled={props.disabled}
        title={`Copy as ${formats().find((f) => f.id === lastFormat())?.label ?? lastFormat()}`}
        class={cn(
          'inline-flex items-center gap-1.5 rounded-l-md border border-r-0 border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-[color,border-color,box-shadow] duration-150 ease-out cursor-pointer',
          'hover:border-violet/60 hover:text-violet hover:shadow-sm',
          'focus-visible:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-muted-foreground disabled:hover:shadow-none',
          copied() && 'anim-copy-pulse border-violet/60 text-violet'
        )}
      >
        <Show
          when={copied()}
          fallback={
            <>
              <TbOutlineCopy size={12} />
              Copy
            </>
          }
        >
          <TbOutlineCheck size={12} /> Copied
        </Show>
      </button>
      <Popover open={open()} onOpenChange={setOpen} placement="bottom-end">
        <PopoverTrigger
          disabled={props.disabled}
          aria-label="Choose copy format"
          class={cn(
            'inline-flex items-center justify-center rounded-r-md border border-border bg-background px-1.5 py-1 text-muted-foreground transition-[color,border-color] duration-150 cursor-pointer',
            'hover:border-violet/60 hover:text-violet',
            'focus-visible:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            copied() && 'border-violet/60 text-violet',
            'data-[expanded]:border-violet/60 data-[expanded]:text-violet'
          )}
        >
          <TbOutlineChevronDown size={12} />
        </PopoverTrigger>
        <PopoverContent class="w-56 p-1">
          <div class="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Copy as
          </div>
          <For each={formats()}>
            {(f) => (
              <button
                type="button"
                onClick={() => handleSelectFormat(f.id)}
                class={cn(
                  'group flex w-full items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-xs cursor-pointer transition-colors',
                  'hover:bg-violet/10 hover:text-violet',
                  'focus-visible:outline-none focus-visible:bg-violet/10 focus-visible:text-violet',
                  lastFormat() === f.id && 'text-violet'
                )}
              >
                <span class="font-medium">{f.label}</span>
                <span class="font-mono text-[10px] text-muted-foreground/80 group-hover:text-violet/70">
                  {f.hint}
                </span>
              </button>
            )}
          </For>
        </PopoverContent>
      </Popover>
    </div>
  )
}
