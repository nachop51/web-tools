import { createMemo, createSignal, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarChip, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { applyTrimOps, type TrimOptions } from '~/lib/utils/strings/trim'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

type LineEnding = 'none' | 'lf' | 'crlf' | 'cr'

const lineEndingOptions: { value: LineEnding; label: string }[] = [
  { value: 'none', label: 'Keep' },
  { value: 'lf', label: 'LF' },
  { value: 'crlf', label: 'CRLF' },
  { value: 'cr', label: 'CR' },
]

export default function TrimClean() {
  setToolPageMeta('strings', 'trim')
  const [params, setParams] = useSearchParams<{ t?: string }>()
  const [input, setInputSignal] = createSignal(params.t ?? '')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }

  const [opts, setOpts] = createStore<TrimOptions>({
    trimEdges: true,
    collapseSpaces: false,
    trimLines: false,
    removeBlank: false,
    lineEndings: 'none',
    dedupe: false,
  })

  const output = createMemo(() => applyTrimOps(input(), opts))

  const linesRemoved = createMemo(() => {
    const inLines = input() === '' ? 0 : input().split('\n').length
    const outLines = output() === '' ? 0 : output().split('\n').length
    return Math.max(0, inLines - outLines)
  })

  const charsSaved = createMemo(() => Math.max(0, input().length - output().length))

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Trim & clean"
        description="Trim whitespace, collapse spaces, normalize line endings, and deduplicate lines."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <div class="flex flex-col gap-3">
          <ToolToolbar>
            <ToolbarSegmented<LineEnding>
              label="Line endings"
              value={opts.lineEndings ?? 'none'}
              onChange={(v) => setOpts('lineEndings', v)}
              options={lineEndingOptions}
            />
          </ToolToolbar>
          <ToolToolbar>
            <ToolbarChip checked={!!opts.trimEdges} onChange={(v) => setOpts('trimEdges', v)}>
              Trim edges
            </ToolbarChip>
            <ToolbarChip checked={!!opts.collapseSpaces} onChange={(v) => setOpts('collapseSpaces', v)}>
              Collapse spaces
            </ToolbarChip>
            <ToolbarChip checked={!!opts.trimLines} onChange={(v) => setOpts('trimLines', v)}>
              Trim each line
            </ToolbarChip>
            <ToolbarChip checked={!!opts.removeBlank} onChange={(v) => setOpts('removeBlank', v)}>
              Remove blank lines
            </ToolbarChip>
            <ToolbarChip checked={!!opts.dedupe} onChange={(v) => setOpts('dedupe', v)}>
              Deduplicate
            </ToolbarChip>
          </ToolToolbar>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>
            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea
                ref={inputRef}
                class="min-h-[16rem] font-mono text-sm resize-y"
                placeholder="Paste text here…"
              />
            </TextField>
          </section>

          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
            </div>
            <div class="relative">
              <Show
                when={output()}
                fallback={
                  <div class="flex min-h-[16rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Result will appear here
                  </div>
                }
              >
                <div class="anim-fade-up min-h-[16rem] whitespace-pre-wrap rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed break-words">
                  {output()}
                </div>
                <CopyButton value={() => output()} class="absolute right-2 top-2" />
              </Show>
            </div>
            <p class="mt-3 text-xs text-muted-foreground">
              {linesRemoved()} lines removed · {charsSaved()} chars saved
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
