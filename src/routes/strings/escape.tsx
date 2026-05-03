import { useSearchParams } from '@solidjs/router'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from '~/components/ui/text-field'
import { escapeString, unescapeString, type EscapeMode } from '~/lib/utils/strings/escape'
import { setToolPageMeta } from '~/lib/seo'

type Dir = 'escape' | 'unescape'

const formatLabels: Record<EscapeMode, string> = {
  js: 'JS',
  json: 'JSON',
  regex: 'Regex',
  csv: 'CSV',
  sql: 'SQL',
}

const formatValues: EscapeMode[] = ['js', 'json', 'regex', 'csv', 'sql']

const dirs: { value: Dir; label: string }[] = [
  { value: 'escape', label: 'Escape' },
  { value: 'unescape', label: 'Unescape' },
]

export default function EscapeTool() {
  setToolPageMeta('strings', 'escape')
  const [params, setParams] = useSearchParams<{ mode?: string; dir?: string }>()

  const [input, setInput] = createSignal('')
  const [error, setError] = createSignal<string | null>(null)

  const mode = createMemo<EscapeMode>(() => {
    const p = params.mode
    if (p && formatValues.includes(p as EscapeMode)) return p as EscapeMode
    return 'js'
  })

  const dir = createMemo<Dir>(() => {
    const p = params.dir
    return p === 'unescape' ? 'unescape' : 'escape'
  })

  const output = createMemo(() => {
    if (!input()) return ''
    try {
      return dir() === 'escape' ? escapeString(input(), mode()) : unescapeString(input(), mode())
    } catch {
      return ''
    }
  })

  createEffect(() => {
    if (!input()) {
      setError(null)
      return
    }
    try {
      dir() === 'escape' ? escapeString(input(), mode()) : unescapeString(input(), mode())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input')
    }
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Escape / unescape"
        description="Escape or unescape strings for JS, JSON, regex, CSV, and SQL."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Format</span>
          <Select<EscapeMode>
            value={mode()}
            onChange={(v) => v && setParams({ mode: v })}
            options={formatValues}
            itemComponent={(props) => <SelectItem item={props.item}>{formatLabels[props.item.rawValue]}</SelectItem>}
          >
            <SelectTrigger aria-label="Escape format" class="h-8 w-32 text-sm">
              <SelectValue<EscapeMode>>{(state) => formatLabels[state.selectedOption()]}</SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
          <div class="ml-auto" />
          <ToolbarSegmented label="Direction" value={dir()} onChange={(v) => setParams({ dir: v })} options={dirs} />
        </ToolToolbar>

        <div class="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>

            <TextField value={input()} onChange={setInput} validationState={error() ? 'invalid' : 'valid'}>
              <TextFieldTextArea autofocus placeholder="Enter text…" class="min-h-[10rem] resize-y font-mono text-sm" />
              <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
            </TextField>
          </section>

          {/* Output */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
            </div>

            <div class="relative">
              <Show
                when={output()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Result will appear here
                  </div>
                }
              >
                <div class="anim-fade-up min-h-[8.25rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {output()}
                </div>
                <CopyButton value={() => output()} class="absolute right-2 top-2" />
              </Show>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
